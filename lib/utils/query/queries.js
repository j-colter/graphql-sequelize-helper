'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _graphql = require('graphql');

var _utils = require('../utils');

var _type2 = require('../type');

var _type3 = _interopRequireDefault(_type2);

var _index = require('./index');

var _transformer = require('../transformer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (_ref) {
  var model = _ref.model,
      modelTypes = _ref.modelTypes,
      schemaConfig = _ref.schemaConfig;

  var tableName = _utils.utils.getTableName(model);
  var modelType = modelTypes[tableName];
  var modelConfig = _utils.utils.getModelGrapqhQLConfig(model);
  var result = {};
  var graphqlObj = void 0;

  var nameResolver = _utils.utils.getQueryName;
  var descriptionResolver = _utils.utils.getQueryDescription;

  // query all
  var findFields = _index.attributesToFindOptions.toWhereFields(model);
  if (modelConfig.crud.read.all) {
    var connectionName = _utils.utils.connectionName(model);
    var connection = modelTypes[connectionName];
    graphqlObj = modelConfig.crud.read.all({
      name: nameResolver(model, 'read', 'all'),
      description: descriptionResolver(model, 'read', 'all'),
      type: connection.connectionType,
      args: _lodash2.default.assign({}, (0, _extends3.default)({}, connection.connectionArgs, {
        condition: findFields,
        groupBy: {
          type: new _graphql.GraphQLList(_graphql.GraphQLString)
        }
      })),
      resolve: connection.resolve
    });
    result[graphqlObj.name] = graphqlObj;
  }
  // query one
  if (modelConfig.crud.read.one) {
    graphqlObj = modelConfig.crud.read.one({
      name: nameResolver(model, 'read', 'one'),
      description: descriptionResolver(model, 'read', 'one'),
      type: modelType,
      args: {
        id: { type: _type3.default.GraphQLScalarTypes.globalIdInputType(model.name) }
      },
      resolve: schemaConfig.resolver(model)
    });
    result[graphqlObj.name] = graphqlObj;
  }

  // 自定义查询
  var queries = _lodash2.default.get(modelConfig, 'queries', null);
  if (queries) {
    _lodash2.default.assign(result, (0, _transformer.toGraphqlType)({ obj: queries, modelTypes: modelTypes }));
  }

  return result;
};