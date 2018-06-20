import _ from 'lodash'
import defaults from 'defaults'
import { GraphQLNonNull, GraphQLInputObjectType, GraphQLBoolean } from 'graphql'
import { mutationWithClientMutationId } from 'graphql-relay'

import { toAttributesFields, toGraphQLFieldConfig, toGraphQLInputFieldMap } from '../transformer'
import { utils } from '../utils'
import _type from '../type'

export default ({ model, modelTypes }) => {
  const tableName = utils.getTableName(model)
  const lowerCaseTableName = utils.lcFirst(tableName)
  const modelType = modelTypes[tableName]
  const modelConfig = utils.getModelGrapqhQLConfig(model)
  const result = {}
  let graphqlObj

  const nameResolver = utils.getQueryName
  const descriptionResolver = utils.getQueryDescription

  let defaultFields = toAttributesFields(model, defaults(modelConfig.fieldConfig, {
    commentToDescription: true
  }))
  const updatedFields = toAttributesFields(model, defaults(modelConfig.fieldConfig, {
    commentToDescription: true,
    allowNull: true
  }))

  utils.removePrimaryKeyOrAutoIncrement(model, defaultFields)
  utils.removePrimaryKeyOrAutoIncrement(model, updatedFields)
  utils.convertFieldsToGlobalId(model, defaultFields)
  utils.convertFieldsToGlobalId(model, updatedFields, true)

  const valuesFieldType = new GraphQLInputObjectType({
    name: `${tableName}DefaultAddValuesInput`,
    description: 'Values to add',
    fields: defaultFields
  })
  const updatedValuesFieldType = new GraphQLInputObjectType({
    name: `${tableName}DefaultUpdateValuesInput`,
    description: 'Values to update',
    fields: updatedFields
  })

  if (modelConfig.crud.add.one) {
    graphqlObj = modelConfig.crud.add.one({
      name: nameResolver(model, 'add', 'one'),
      description: descriptionResolver(model, 'add', 'one'),
      inputFields: () => {
        return {
          values: {
            type: GraphQLNonNull(valuesFieldType)
          }
        }
      },
      outputFields: () => {
        return {
          [lowerCaseTableName]: {
            type: modelType
          }
        }
      },
      mutateAndGetPayload: async (args) => {
        const instance = await model.create(args.values)
        return {
          [lowerCaseTableName]: instance
        }
      }
    })
    result[graphqlObj.name] = mutationWithClientMutationId(graphqlObj)
  }

  const changedModel = `changed${model.name}`
  if (modelConfig.crud.update.one) {
    graphqlObj = modelConfig.crud.update.one({
      name: nameResolver(model, 'update', 'one'),
      description: descriptionResolver(model, 'update', 'one'),
      inputFields: () => {
        return {
          id: { type: GraphQLNonNull(_type.GraphQLScalarTypes.globalIdInputType(model.name)) },
          values: {
            type: updatedValuesFieldType
          }
        }
      },
      outputFields: () => {
        return {
          [changedModel]: {
            type: modelType
          }
        }
      },
      mutateAndGetPayload: async (args) => {
        let instance = await model.findById(args.id)
        await instance.update(args.values)
        return {
          [changedModel]: instance
        }
      }
    })

    result[graphqlObj.name] = mutationWithClientMutationId(graphqlObj)
  }

  if (modelConfig.crud.delete.one) {
    graphqlObj = modelConfig.crud.delete.one({
      name: nameResolver(model, 'delete', 'one'),
      description: descriptionResolver(model, 'delete', 'one'),
      inputFields: () => {
        return {
          id: { type: _type.GraphQLScalarTypes.globalIdInputType(model.name) }
        }
      },
      outputFields: () => {
        return {
          ok: {
            type: GraphQLBoolean,
            description: 'operation status'
          }
        }
      },
      mutateAndGetPayload: async (args) => {
        let instance = await model.findById(args.id)
        await instance.destroy()
        return {
          ok: true
        }
      }
    })
    result[graphqlObj.name] = mutationWithClientMutationId(graphqlObj)
  }

  // 自定义的增删改
  const mutations = _.get(modelConfig, 'mutations', null)
  if (mutations) {
    _.forOwn(mutations, (value, key) => {
      const { inputFields, outputFields } = value
      value.name = key
      value.inputFields = toGraphQLInputFieldMap(key, inputFields)
      _.forOwn(outputFields, (fValue, fKey) => {
        outputFields[fKey] = toGraphQLFieldConfig(key, '', fValue, null, modelTypes)
      })

      result[key] = mutationWithClientMutationId(value)
    })
  }

  return result
}
