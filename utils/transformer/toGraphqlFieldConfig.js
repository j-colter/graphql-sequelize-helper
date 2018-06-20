'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _graphql = require('graphql');

var graphql = _interopRequireWildcard(_graphql);

var _type = require('../type');

var _type2 = _interopRequireDefault(_type);

var _StringHelper = require('../utils/StringHelper');

var _StringHelper2 = _interopRequireDefault(_StringHelper);

var _Connection = require('../Connection');

var _Connection2 = _interopRequireDefault(_Connection);

var _ModelRef = require('../ModelRef');

var _ModelRef2 = _interopRequireDefault(_ModelRef);

var _toGraphQLInputFieldMap = require('./toGraphQLInputFieldMap');

var _toGraphQLInputFieldMap2 = _interopRequireDefault(_toGraphQLInputFieldMap);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var toGraphQLFieldConfig = function toGraphQLFieldConfig(name, postfix, fieldType, context, modelTypes) {
  var interfaces = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

  var typeName = function typeName(path) {
    return path.replace(/\.\$type/g, '').replace(/\[\d*\]/g, '').split('.').map(function (v) {
      return _StringHelper2.default.toInitialUpperCase(v);
    }).join('');
  };

  if (graphql.isOutputType(fieldType)) {
    return { type: fieldType };
  }
  if (fieldType instanceof _type2.default.ScalarFieldType) {
    return { type: fieldType.graphQLOutputType };
  }
  switch (fieldType) {
    case String:
      return { type: graphql.GraphQLString };
    case Number:
      return { type: graphql.GraphQLFloat };
    case Boolean:
      return { type: graphql.GraphQLBoolean };
    case Date:
      return { type: _type2.default.GraphQLScalarTypes.Date };
    case JSON:
      return { type: _type2.default.GraphQLScalarTypes.Json };
  }

  if (_lodash2.default.isArray(fieldType)) {
    return {
      type: new graphql.GraphQLList(toGraphQLFieldConfig(name, postfix, fieldType[0], context, modelTypes).type)
    }
  }

  if (fieldType instanceof _ModelRef2.default) {
    return {
      type: modelTypes[fieldType.name]
    }
  }

  if (fieldType instanceof _Connection2.default.ConnectionType) {
    return {
      type: modelTypes[`${fieldType.nodeType.name}Connection`].connectionType
    };
  }

  if (fieldType instanceof _Connection2.default.EdgeType) {
    return {
      type: modelTypes[`${fieldType.nodeType.name}Connection`].edgeType
    };
  }

  if (fieldType instanceof Object) {
    if (fieldType['$type']) {
      var result = toGraphQLFieldConfig(name, postfix, fieldType['$type'], context);
      if (fieldType['enumValues']) {
        var values = {};
        fieldType['enumValues'].forEach(function (t) {
          values[t] = { value: t };
        });
        result.type = new graphql.GraphQLEnumType({
          name: typeName(name) + postfix,
          values: values
        });
      }
      if (fieldType['required'] && !(result.type instanceof graphql.GraphQLNonNull)) {
        result.type = new graphql.GraphQLNonNull(result.type);
      }
      if (fieldType['resolve']) {
        result['resolve'] = context.wrapFieldResolve({
          name: name.split('.').slice(-1)[0],
          path: name,
          $type: result.type,
          resolve: fieldType['resolve']
        });
      }
      if (fieldType['args']) {
        result['args'] = (0, _toGraphQLInputFieldMap2.default)(typeName(name), fieldType['args']);
      }
      result.description = fieldType['description'];
      return result;
    } else {
      return {
        type: new graphql.GraphQLObjectType({
          name: typeName(name) + postfix,
          fields: () => {
            const fields = {}
            _lodash2.default.forOwn(fieldType, function (value, key) {
              if (value['$type'] && value['hidden']) {} else {
                fields[key] = toGraphQLFieldConfig(name + postfix + '.' + key, '', value, context);
              }
            })
            return fields
          }
        })
      }
    }
  }
  throw new Error('Unsupported type: ' + fieldType);
};

exports.default = toGraphQLFieldConfig;
