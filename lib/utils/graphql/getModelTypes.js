'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _graphql = require('graphql');

var _defaults = require('defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _camelcase = require('camelcase');

var _camelcase2 = _interopRequireDefault(_camelcase);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('../utils');

var _transformer = require('../transformer');

var _query = require('../query');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var associationFields = function associationFields(_ref) {
  var model = _ref.model,
      modelTypes = _ref.modelTypes;

  var fields = {};
  var associations = model.associations;
  for (var associationKey in associations) {
    var connectionName = _utils.utils.connectionNameForAssociation(model, associationKey);
    fields[(0, _camelcase2.default)(associationKey)] = modelTypes[connectionName];
  }
  return fields;
};

// relay connection
var connectionModel = function connectionModel(_ref2) {
  var model = _ref2.model,
      schemaConfig = _ref2.schemaConfig,
      modelType = _ref2.modelType,
      connectionName = _ref2.connectionName;

  var modelConfig = _utils.utils.getModelGrapqhQLConfig(model);
  var connectionWrapper = (0, _defaults2.default)(modelConfig.connection, {});
  connectionName = connectionName || model.name;
  var connectionWrapperFunction = connectionWrapper[connectionName] || function (obj) {
    return obj;
  };

  var orderBy = {};
  // console.log('attributes', _.keys(model.attributes))
  // 所有字段设置排序条件
  _lodash2.default.forOwn(model.rawAttributes || model.target.rawAttributes, function (value, key) {
    var _$assign;

    _lodash2.default.assign(orderBy, (_$assign = {}, (0, _defineProperty3.default)(_$assign, (key + '_asc').toUpperCase(), { value: [key, 'ASC'] }), (0, _defineProperty3.default)(_$assign, (key + '_desc').toUpperCase(), { value: [key, 'DESC'] }), _$assign));
  });
  // console.log('orderBy', orderBy)
  return schemaConfig.sequelizeConnection(connectionWrapperFunction({
    name: connectionName,
    nodeType: modelType,
    target: model,
    orderBy: new _graphql.GraphQLEnumType({
      name: connectionName + 'OrderBy',
      values: orderBy
    }),
    connectionFields: {
      count: {
        type: _graphql.GraphQLInt,
        resolve: function resolve(_ref3) {
          var source = _ref3.source,
              edges = _ref3.edges,
              fullCount = _ref3.fullCount;

          return fullCount || edges.length;
        }
      }
    },
    where: function where(key, value, currentWhere) {
      // 查询条件覆盖, args: { condition: { gender: 1 } }
      if (key === 'condition' && value) {
        _lodash2.default.assign(currentWhere, _query.attributesToFindOptions.generateWhere(value));
      }
      // return {[key]: value};
    },
    before: function before(findOptions, args, context) {
      // args的orderBy覆盖findOptions的，支持多个order by
      if (args.orderBy && args.orderBy.length > 0) {
        findOptions.order = args.orderBy;
      } else {
        // 默认id降序
        findOptions.order = [['id', 'DESC']];
      }
      // 增加group by的支持
      if (args.groupBy) findOptions.group = args.groupBy;

      // 获取手动添加的include args: { include: [ { model: Order, where: {} } ] }
      var include = _lodash2.default.get(args, 'include', []);

      // 获取graphql接口的条件
      var whereInclude = _lodash2.default.get(findOptions, 'where.include', {});
      if (!_lodash2.default.isEmpty(whereInclude)) {
        // TODO: 更深层次的关联查询
        _lodash2.default.forOwn(whereInclude, function (value, key) {
          var model = context.models[key];
          if (model) {
            if (!_lodash2.default.isEmpty(value)) {
              include.push({
                model: model,
                where: value
              });
            }
          }
        });
        delete findOptions.where.include;
      }
      _lodash2.default.assign(findOptions, { include: include });
      return findOptions;
    }
  }));
};

var generateLinks = function generateLinks(modelConfig, modelTypes) {
  var returnLinks = {};
  // 自定义links
  var links = _lodash2.default.get(modelConfig, 'links', null);
  if (links) {
    _lodash2.default.assign(returnLinks, (0, _transformer.toGraphqlType)({ obj: links, modelTypes: modelTypes, useRoot: true }));
  }
  return returnLinks;
};

exports.default = function (_ref4) {
  var models = _ref4.models,
      schemaConfig = _ref4.schemaConfig;

  var modelTypes = {};
  // setup modelTypes

  var _loop = function _loop(modelName) {
    var model = models[modelName];
    var config = model.config || {};
    var modelConfig = _utils.utils.getModelGrapqhQLConfig(model);

    var modelType = new _graphql.GraphQLObjectType(modelConfig.modelType({
      name: _utils.utils.getTableName(model),
      description: config.description,
      fields: function fields() {
        var defaultFields = (0, _transformer.toAttributesFields)(model, (0, _defaults2.default)(modelConfig.fieldConfig, {
          globalId: true,
          commentToDescription: true
        }));
        var defaultAssociationFields = associationFields({ model: model, modelTypes: modelTypes });
        var returnLinks = generateLinks(modelConfig, modelTypes);
        return (0, _extends3.default)({}, defaultFields, defaultAssociationFields, returnLinks);
      },
      interfaces: function interfaces() {
        return [];
      }
    }));
    // connection
    var connectionName = _utils.utils.connectionName(model);
    modelTypes[connectionName] = connectionModel({ model: model, schemaConfig: schemaConfig, modelType: modelType });
    modelTypes[_utils.utils.getTableName(model)] = modelType;
  };

  for (var modelName in models) {
    _loop(modelName);
  }
  // setup connectionType
  // TODO: need to customize here
  for (var modelName in models) {
    var _model = models[modelName];
    var _modelConfig = _utils.utils.getModelGrapqhQLConfig(_model);
    var connectionWrapper = (0, _defaults2.default)(_modelConfig.connection, {});

    var associations = _model.associations;
    for (var associationKey in associations) {
      var association = associations[associationKey];
      var associationType = association.associationType,
          target = association.target;

      var targetType = modelTypes[target.name];
      var connectionName = _utils.utils.connectionNameForAssociation(_model, associationKey);
      var connectionWrapperFunction = connectionWrapper[connectionName] || function (obj) {
        return obj;
      };
      if (associationType === 'BelongsTo') {
        modelTypes[connectionName] = connectionWrapperFunction({
          type: targetType,
          resolve: schemaConfig.resolver(association)
        });
      } else {
        var connection = connectionModel({ model: association, schemaConfig: schemaConfig, modelType: targetType, connectionName: connectionName });
        modelTypes[connectionName] = {
          description: connectionName + '...',
          type: connection.connectionType,
          args: connection.connectionArgs,
          resolve: connection.resolve
        };
      }
    }
  }
  return modelTypes;
};