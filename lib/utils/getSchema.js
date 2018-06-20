'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _defaults = require('defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _graphql = require('graphql');

var _graphqlSequelize = require('graphql-sequelize');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _graphql2 = require('./graphql');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sequelizeConnection = _graphqlSequelize.relay.sequelizeConnection;

exports.default = function (sequelize, schemaConfig) {
  schemaConfig = (0, _defaults2.default)(schemaConfig, {
    models: function models(model) {
      return model;
    },
    mutations: function mutations() {},
    queries: function queries() {},
    subscriptions: function subscriptions() {},
    schema: function schema(_schema) {
      return _schema;
    },
    resolver: _graphqlSequelize.resolver,
    sequelizeConnection: sequelizeConnection
  });
  var models = sequelize.models;

  var modelTypes = schemaConfig.models((0, _graphql2.getModelTypes)({ models: models, schemaConfig: schemaConfig }));

  var queries = {};
  var mutations = {};
  var subscriptions = {};

  for (var modelName in models) {
    var model = models[modelName];
    var modelQueryAndMutation = (0, _graphql2.graphqlModel)({ model: model, modelTypes: modelTypes, schemaConfig: schemaConfig });
    for (var queryName in modelQueryAndMutation.queries) {
      queries[queryName] = modelQueryAndMutation.queries[queryName];
    }

    for (var mutationName in modelQueryAndMutation.mutations) {
      mutations[mutationName] = modelQueryAndMutation.mutations[mutationName];
    }

    for (var subscriptionName in modelQueryAndMutation.subscriptions) {
      subscriptions[subscriptionName] = modelQueryAndMutation.subscriptions[subscriptionName];
    }
  }
  var schema = {};

  if (!_lodash2.default.isEmpty(queries)) {
    var queryRoot = new _graphql.GraphQLObjectType({
      name: 'Query',
      description: 'Root query of the Schema',
      fields: function fields() {
        return (0, _extends3.default)({}, queries);
      }
    });
    schema.query = queryRoot;
  }

  if (!_lodash2.default.isEmpty(mutations)) {
    var mutationRoot = new _graphql.GraphQLObjectType({
      name: 'Mutation',
      description: 'Root mutation of the Schema',
      fields: function fields() {
        return (0, _extends3.default)({}, mutations);
      }
    });
    schema.mutation = mutationRoot;
  }

  if (!_lodash2.default.isEmpty(subscriptions)) {
    var subscriptionRoot = new _graphql.GraphQLObjectType({
      name: 'Subscription',
      description: 'Root subscription of the Schema',
      fields: function fields() {
        return (0, _extends3.default)({}, subscriptions);
      }
    });
    schema.subscription = subscriptionRoot;
  }

  return new _graphql.GraphQLSchema(schemaConfig.schema(schema));
};