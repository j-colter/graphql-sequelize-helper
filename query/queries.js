import _ from 'lodash'
import { GraphQLString, GraphQLList } from 'graphql'

import { utils } from '../utils'
import _type from '../type'
import { attributesToFindOptions } from './index'
import { toGraphqlType } from '../transformer'

export default ({
                  model,
                  modelTypes,
                  schemaConfig
                }) => {
  const tableName = utils.getTableName(model)
  const modelType = modelTypes[tableName]
  const modelConfig = utils.getModelGrapqhQLConfig(model)
  const result = {}
  let graphqlObj

  const nameResolver = utils.getQueryName
  const descriptionResolver = utils.getQueryDescription

  // query all
  const findFields = attributesToFindOptions.toWhereFields(model)
  if (modelConfig.crud.read.all) {
    const connectionName = utils.connectionName(model)
    const connection = modelTypes[connectionName]
    graphqlObj = modelConfig.crud.read.all({
      name: nameResolver(model, 'read', 'all'),
      description: descriptionResolver(model, 'read', 'all'),
      type: connection.connectionType,
      args: _.assign({}, {
        ...connection.connectionArgs,
        condition: findFields,
        groupBy: {
          type: new GraphQLList(GraphQLString)
        },
      }),
      resolve: connection.resolve
    })
    result[graphqlObj.name] = graphqlObj
  }
  // query one
  if (modelConfig.crud.read.one) {
    graphqlObj = modelConfig.crud.read.one({
      name: nameResolver(model, 'read', 'one'),
      description: descriptionResolver(model, 'read', 'one'),
      type: modelType,
      args: {
        id: { type: _type.GraphQLScalarTypes.globalIdInputType(model.name) }
      },
      resolve: schemaConfig.resolver(model)
    })
    result[graphqlObj.name] = graphqlObj
  }

  // 自定义查询
  const queries = _.get(modelConfig, 'queries', null)
  if (queries) {
    _.assign(result, toGraphqlType({obj: queries, modelTypes}))
  }

  return result
}
