'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _graphql = require('graphql');

var graphql = _interopRequireWildcard(_graphql);

var _camelcase = require('camelcase');

var _camelcase2 = _interopRequireDefault(_camelcase);

var _type2 = require('../type');

var _type3 = _interopRequireDefault(_type2);

var _index = require('../utils/index');

var _transformer = require('../transformer');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: 操作符 and or，关联model查询
var options = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'in'];

var generateAttributes = function generateAttributes(model) {
  var findFields = {};
  var attributes = _lodash2.default.assign((0, _transformer.toAttributesFields)(model, {
    allowNull: true,
    exclude: ['id']
  }), {
    id: { type: _type3.default.GraphQLScalarTypes.globalIdInputType(model.name) }
  });

  _lodash2.default.forOwn(attributes, function (value, key) {
    findFields[key] = value;
    options.map(function (oKey) {
      switch (oKey) {
        case 'in':
          value = {
            type: new graphql.GraphQLList(value.type)
          };
          break;
        default:
          break;
      }
      findFields[key + '_' + oKey] = value;
    });
  });
  return findFields;
};

/**
 * model的所有字段自动生成相应的查询操作
 * @param model
 * @return {{type: GraphQLInputObjectType}}
 */
var toWhereFields = function toWhereFields(model) {
  // const attributes = model.rawAttributes
  var findFields = {};
  _lodash2.default.assign(findFields, generateAttributes(model));

  var include = {};
  _lodash2.default.forOwn(model.associations, function (value, key) {
    if (value.associationType === 'HasMany') {
      var target = value.target;

      var targetFields = generateAttributes(target);
      include[target.name] = {
        type: new graphql.GraphQLInputObjectType({
          name: _index.StringHelper.toInitialUpperCase((0, _camelcase2.default)(model.name + '_' + key + '_Condition')),
          fields: targetFields
        })
      };
    }
  });
  // 关联查询
  if (!_lodash2.default.isEmpty(include)) {
    _lodash2.default.assign(findFields, {
      include: {
        type: new graphql.GraphQLInputObjectType({
          name: model.name + 'Include',
          fields: include
        })
      }
    });
  }

  return {
    type: new graphql.GraphQLInputObjectType({
      name: model.name + 'Condition',
      fields: findFields
    })
  };
};

/**
 * 单个条件的映射
 * @param value eg: "%bob%"
 * @param name eg: "username_like"
 * @return {username: {like: "%bob%"}}
 */
var fieldToWhere = function fieldToWhere(value, name) {
  var nameArr = name.split('_');
  var word = nameArr[nameArr.length - 1];
  var op = options.indexOf(word) === -1 ? '' : word;
  name = op ? name.replace('_' + op, '') : name;

  value = op ? (0, _defineProperty3.default)({}, op, value) : value;

  return (0, _defineProperty3.default)({}, name, value);
};

/**
 * where条件重组
 * @param value eg: {username_like: "%bob%"}
 * @return eg: {username: {like: "%bob%"}}
 */
var generateWhere = function generateWhere(value) {
  var returnValue = {};
  _lodash2.default.forOwn(value, function (field, fieldName) {
    if (fieldName === 'include') {
      _lodash2.default.forOwn(field, function (includeField, includeName) {
        var includeFields = (0, _defineProperty3.default)({}, includeName, generateWhere(includeField));

        // TODO: 更深层次的关联查询
        returnValue.include = (0, _extends3.default)({}, returnValue.include, includeFields);
      });
    } else {
      _lodash2.default.assign(returnValue, fieldToWhere(field, fieldName));
    }
  });

  return returnValue;
};

exports.default = {
  toWhereFields: toWhereFields,
  generateWhere: generateWhere
};