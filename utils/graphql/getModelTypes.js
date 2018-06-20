import { GraphQLObjectType, GraphQLEnumType, GraphQLInt } from 'graphql'
import defaults from 'defaults'
import camelcase from 'camelcase'
import _ from 'lodash'

import { utils } from '../utils'
import { toAttributesFields, toGraphqlType } from '../transformer'
import { attributesToFindOptions } from "../query"

const associationFields = ({model, modelTypes}) => {
  const fields = {}
  const associations = model.associations
  for (const associationKey in associations) {
    const connectionName = utils.connectionNameForAssociation(model, associationKey)
    fields[camelcase(associationKey)] = modelTypes[connectionName]
  }
  return fields
}

// relay connection
const connectionModel = ({model, schemaConfig, modelType, connectionName}) => {
  const modelConfig = utils.getModelGrapqhQLConfig(model)
  const connectionWrapper = defaults(modelConfig.connection, {})
  connectionName = connectionName || model.name
  const connectionWrapperFunction = connectionWrapper[connectionName] || ((obj) => (obj))

  const orderBy = {}
  // console.log('attributes', _.keys(model.attributes))
  // 所有字段设置排序条件
  _.forOwn(model.rawAttributes || model.target.rawAttributes, (value, key) => {
    _.assign(orderBy, {
      [`${key}_asc`.toUpperCase()]: { value: [key, 'ASC'] },
      [`${key}_desc`.toUpperCase()]: { value: [key, 'DESC'] }
    })
  })
  // console.log('orderBy', orderBy)
  return schemaConfig.sequelizeConnection(connectionWrapperFunction({
    name: connectionName,
    nodeType: modelType,
    target: model,
    orderBy: new GraphQLEnumType({
      name: `${connectionName}OrderBy`,
      values: orderBy
    }),
    connectionFields: {
      count: {
        type: GraphQLInt,
        resolve: ({source, edges, fullCount}) => {
          return fullCount || edges.length;
        }
      }
    },
    where: function (key, value, currentWhere) {
      // 查询条件覆盖, args: { condition: { gender: 1 } }
      if (key === 'condition' && value) {
        _.assign(currentWhere, attributesToFindOptions.generateWhere(value))
      }
      // return {[key]: value};
    },
    before: (findOptions, args, context) => {
      // args的orderBy覆盖findOptions的，支持多个order by
      if (args.orderBy && args.orderBy.length > 0) {
        findOptions.order = args.orderBy
      } else {
        // 默认id降序
        findOptions.order = [ ['id', 'DESC'] ]
      }
      // 增加group by的支持
      if (args.groupBy) findOptions.group = args.groupBy

      // 获取手动添加的include args: { include: [ { model: Order, where: {} } ] }
      const include = _.get(args, 'include', [])

      // 获取graphql接口的条件
      const whereInclude = _.get(findOptions, 'where.include', {})
      if (!_.isEmpty(whereInclude)) {
        // TODO: 更深层次的关联查询
        _.forOwn(whereInclude, (value, key) => {
          const model = context.models[key]
          if (model) {
            if (!_.isEmpty(value)) {
              include.push({
                model,
                where: value
              })
            }
          }
        })
        delete findOptions.where.include
      }
      _.assign(findOptions, {include})
      return findOptions
    }
  }))
}

const generateLinks = (modelConfig, modelTypes) => {
  const returnLinks = {}
  // 自定义links
  const links = _.get(modelConfig, 'links', null)
  if (links) {
    _.assign(returnLinks, toGraphqlType({obj: links, modelTypes, useRoot: true}))
  }
  return returnLinks
}

export default ({models, schemaConfig}) => {
  const modelTypes = {}
  // setup modelTypes
  for (let modelName in models) {
    const model = models[modelName]
    const config = model.config || {}
    const modelConfig = utils.getModelGrapqhQLConfig(model)

    const modelType = new GraphQLObjectType(modelConfig.modelType({
      name: utils.getTableName(model),
      description: config.description,
      fields: () => {
        const defaultFields = toAttributesFields(model, defaults(modelConfig.fieldConfig, {
          globalId: true,
          commentToDescription: true
        }))
        const defaultAssociationFields = associationFields({model, modelTypes})
        const returnLinks = generateLinks(modelConfig, modelTypes)
        return {
          ...defaultFields,
          ...defaultAssociationFields,
          ...returnLinks
        }
      },
      interfaces: () => {
        return []
      }
    }))
    // connection
    const connectionName = utils.connectionName(model)
    modelTypes[connectionName] = connectionModel({model, schemaConfig, modelType})
    modelTypes[utils.getTableName(model)] = modelType
  }
  // setup connectionType
  // TODO: need to customize here
  for (let modelName in models) {
    const model = models[modelName]
    const modelConfig = utils.getModelGrapqhQLConfig(model)
    const connectionWrapper = defaults(modelConfig.connection, {})

    const associations = model.associations
    for (let associationKey in associations) {
      const association = associations[associationKey]
      const { associationType, target } = association
      const targetType = modelTypes[target.name]
      const connectionName = utils.connectionNameForAssociation(model, associationKey)
      const connectionWrapperFunction = connectionWrapper[connectionName] || ((obj) => (obj))
      if (associationType === 'BelongsTo') {
        modelTypes[connectionName] = connectionWrapperFunction({
          type: targetType,
          resolve: schemaConfig.resolver(association)
        })
      } else {
        const connection = connectionModel({model: association, schemaConfig, modelType: targetType, connectionName})
        modelTypes[connectionName] = {
          description: `${connectionName}...`,
          type: connection.connectionType,
          args: connection.connectionArgs,
          resolve: connection.resolve
        }
      }
    }
  }
  return modelTypes
}
