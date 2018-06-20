import _ from 'lodash'
import * as graphql from 'graphql'
import camelcase from 'camelcase'

import _type from '../type'
import { StringHelper } from "../utils/index"
import { toAttributesFields } from '../transformer'

// TODO: 操作符 and or，关联model查询
const options = [
  'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'in'
]

const generateAttributes = (model) => {
  const findFields = {}
  const attributes = _.assign(toAttributesFields(model, {
    allowNull: true,
    exclude: ['id']
  }), {
    id: { type: _type.GraphQLScalarTypes.globalIdInputType(model.name) }
  })

  _.forOwn(attributes, (value, key) => {
    findFields[key] = value
    options.map(oKey => {
      switch (oKey) {
        case 'in':
          value = {
            type: new graphql.GraphQLList(value.type)
          }
          break
        default:
          break
      }
      findFields[`${key}_${oKey}`] = value
    })
  })
  return findFields
}

/**
 * model的所有字段自动生成相应的查询操作
 * @param model
 * @return {{type: GraphQLInputObjectType}}
 */
const toWhereFields = (model) => {
  // const attributes = model.rawAttributes
  const findFields = {}
  _.assign(findFields, generateAttributes(model))

  const include = {}
  _.forOwn(model.associations, (value, key) => {
    if (value.associationType === 'HasMany') {
      const { target } = value
      const targetFields = generateAttributes(target)
      include[target.name] = {
        type: new graphql.GraphQLInputObjectType({
          name: StringHelper.toInitialUpperCase(camelcase(`${model.name}_${key}_Condition`)),
          fields: targetFields
        })
      }
    }
  })
  // 关联查询
  if (!_.isEmpty(include)) {
    _.assign(findFields, {
      include: {
          type: new graphql.GraphQLInputObjectType({
          name: `${model.name}Include`,
          fields: include
        })
      }
    })
  }

  return {
    type: new graphql.GraphQLInputObjectType({
      name: `${model.name}Condition`,
      fields: findFields
    })
  }
}

/**
 * 单个条件的映射
 * @param value eg: "%bob%"
 * @param name eg: "username_like"
 * @return {username: {like: "%bob%"}}
 */
const fieldToWhere = (value, name) => {
  const nameArr = name.split('_')
  const word = nameArr[nameArr.length - 1]
  const op = options.indexOf(word) === -1 ? '' : word
  name = op ? name.replace(`_${op}`, '') : name

  value = op ? { [op]: value } : value

  return {
    [name]: value
  }
}

/**
 * where条件重组
 * @param value eg: {username_like: "%bob%"}
 * @return eg: {username: {like: "%bob%"}}
 */
const generateWhere = (value) => {
  const returnValue = {}
  _.forOwn(value, (field, fieldName) => {
    if (fieldName === 'include') {
      _.forOwn(field, (includeField, includeName) => {
        const includeFields = {
          [includeName]: generateWhere(includeField)
        }

        // TODO: 更深层次的关联查询
        returnValue.include = {
          ...returnValue.include,
          ...includeFields
        }
      })
    } else {
      _.assign(returnValue, fieldToWhere(field, fieldName))
    }
  })

  return returnValue
}

export default {
  toWhereFields,
  generateWhere
}
