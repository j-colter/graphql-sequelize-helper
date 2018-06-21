import defaults from 'defaults'
import { GraphQLObjectType, GraphQLSchema } from 'graphql'
import { resolver, relay } from 'graphql-sequelize'
import _ from 'lodash'

import { getModelTypes, graphqlModel } from './graphql'

const { sequelizeConnection } = relay

export default (sequelize, schemaConfig) => {
  schemaConfig = defaults(schemaConfig, {
    models: (model) => (model),
    mutations: () => {},
    queries: () => {},
    subscriptions: () => {},
    schema: (schema) => (schema),
    resolver: resolver,
    sequelizeConnection: sequelizeConnection
  })
  const models = sequelize.models

  const modelTypes = schemaConfig.models(getModelTypes({models, schemaConfig}))

  const queries = {}
  const mutations = {}
  const subscriptions = {}

  for (let modelName in models) {
    const model = models[modelName]
    const modelQueryAndMutation = graphqlModel({model, modelTypes, schemaConfig})
    for (let queryName in modelQueryAndMutation.queries) {
      queries[queryName] = modelQueryAndMutation.queries[queryName]
    }

    for (let mutationName in modelQueryAndMutation.mutations) {
      mutations[mutationName] = modelQueryAndMutation.mutations[mutationName]
    }

    for (let subscriptionName in modelQueryAndMutation.subscriptions) {
      subscriptions[subscriptionName] = modelQueryAndMutation.subscriptions[subscriptionName]
    }
  }
  const schema = {}

  if (!_.isEmpty(queries)) {
    const queryRoot = new GraphQLObjectType({
      name: 'Query',
      description: 'Root query of the Schema',
      fields: () => ({
        ...queries,
        // ...schemaConfig.queries({modelTypes})
      })
    })
    schema.query = queryRoot
  }

  if (!_.isEmpty(mutations)) {
    const mutationRoot = new GraphQLObjectType({
      name: 'Mutation',
      description: 'Root mutation of the Schema',
      fields: () => {
        return {
          ...mutations,
          // ...schemaConfig.mutations({modelTypes})
        }
      }
    })
    schema.mutation = mutationRoot
  }

  if (!_.isEmpty(subscriptions)) {
    const subscriptionRoot = new GraphQLObjectType({
      name: 'Subscription',
      description: 'Root subscription of the Schema',
      fields: () => {
        return {
          ...subscriptions,
          // ...schemaConfig.subscriptions({modelTypes})
        }
      }
    })
    schema.subscription = subscriptionRoot
  }

  return new GraphQLSchema(schemaConfig.schema(schema))
}
