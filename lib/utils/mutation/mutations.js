'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _defaults = require('defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _graphql = require('graphql');

var _graphqlRelay = require('graphql-relay');

var _transformer = require('../transformer');

var _utils = require('../utils');

var _type2 = require('../type');

var _type3 = _interopRequireDefault(_type2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (_ref) {
  var model = _ref.model,
      modelTypes = _ref.modelTypes;

  var tableName = _utils.utils.getTableName(model);
  var lowerCaseTableName = _utils.utils.lcFirst(tableName);
  var modelType = modelTypes[tableName];
  var modelConfig = _utils.utils.getModelGrapqhQLConfig(model);
  var result = {};
  var graphqlObj = void 0;

  var nameResolver = _utils.utils.getQueryName;
  var descriptionResolver = _utils.utils.getQueryDescription;

  var defaultFields = (0, _transformer.toAttributesFields)(model, (0, _defaults2.default)(modelConfig.fieldConfig, {
    commentToDescription: true
  }));
  var updatedFields = (0, _transformer.toAttributesFields)(model, (0, _defaults2.default)(modelConfig.fieldConfig, {
    commentToDescription: true,
    allowNull: true
  }));

  _utils.utils.removePrimaryKeyOrAutoIncrement(model, defaultFields);
  _utils.utils.removePrimaryKeyOrAutoIncrement(model, updatedFields);
  _utils.utils.convertFieldsToGlobalId(model, defaultFields);
  _utils.utils.convertFieldsToGlobalId(model, updatedFields, true);

  var valuesFieldType = new _graphql.GraphQLInputObjectType({
    name: tableName + 'DefaultAddValuesInput',
    description: 'Values to add',
    fields: defaultFields
  });
  var updatedValuesFieldType = new _graphql.GraphQLInputObjectType({
    name: tableName + 'DefaultUpdateValuesInput',
    description: 'Values to update',
    fields: updatedFields
  });

  if (modelConfig.crud.add.one) {
    graphqlObj = modelConfig.crud.add.one({
      name: nameResolver(model, 'add', 'one'),
      description: descriptionResolver(model, 'add', 'one'),
      inputFields: function inputFields() {
        return {
          values: {
            type: (0, _graphql.GraphQLNonNull)(valuesFieldType)
          }
        };
      },
      outputFields: function outputFields() {
        return (0, _defineProperty3.default)({}, lowerCaseTableName, {
          type: modelType
        });
      },
      mutateAndGetPayload: function () {
        var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(args) {
          var instance;
          return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return model.create(args.values);

                case 2:
                  instance = _context.sent;
                  return _context.abrupt('return', (0, _defineProperty3.default)({}, lowerCaseTableName, instance));

                case 4:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, undefined);
        }));

        return function mutateAndGetPayload(_x) {
          return _ref3.apply(this, arguments);
        };
      }()
    });
    result[graphqlObj.name] = (0, _graphqlRelay.mutationWithClientMutationId)(graphqlObj);
  }

  var changedModel = 'changed' + model.name;
  if (modelConfig.crud.update.one) {
    graphqlObj = modelConfig.crud.update.one({
      name: nameResolver(model, 'update', 'one'),
      description: descriptionResolver(model, 'update', 'one'),
      inputFields: function inputFields() {
        return {
          id: { type: (0, _graphql.GraphQLNonNull)(_type3.default.GraphQLScalarTypes.globalIdInputType(model.name)) },
          values: {
            type: updatedValuesFieldType
          }
        };
      },
      outputFields: function outputFields() {
        return (0, _defineProperty3.default)({}, changedModel, {
          type: modelType
        });
      },
      mutateAndGetPayload: function () {
        var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(args) {
          var instance;
          return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return model.findById(args.id);

                case 2:
                  instance = _context2.sent;
                  _context2.next = 5;
                  return instance.update(args.values);

                case 5:
                  return _context2.abrupt('return', (0, _defineProperty3.default)({}, changedModel, instance));

                case 6:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, undefined);
        }));

        return function mutateAndGetPayload(_x2) {
          return _ref6.apply(this, arguments);
        };
      }()
    });

    result[graphqlObj.name] = (0, _graphqlRelay.mutationWithClientMutationId)(graphqlObj);
  }

  if (modelConfig.crud.delete.one) {
    graphqlObj = modelConfig.crud.delete.one({
      name: nameResolver(model, 'delete', 'one'),
      description: descriptionResolver(model, 'delete', 'one'),
      inputFields: function inputFields() {
        return {
          id: { type: _type3.default.GraphQLScalarTypes.globalIdInputType(model.name) }
        };
      },
      outputFields: function outputFields() {
        return {
          ok: {
            type: _graphql.GraphQLBoolean,
            description: 'operation status'
          }
        };
      },
      mutateAndGetPayload: function () {
        var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(args) {
          var instance;
          return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.next = 2;
                  return model.findById(args.id);

                case 2:
                  instance = _context3.sent;
                  _context3.next = 5;
                  return instance.destroy();

                case 5:
                  return _context3.abrupt('return', {
                    ok: true
                  });

                case 6:
                case 'end':
                  return _context3.stop();
              }
            }
          }, _callee3, undefined);
        }));

        return function mutateAndGetPayload(_x3) {
          return _ref8.apply(this, arguments);
        };
      }()
    });
    result[graphqlObj.name] = (0, _graphqlRelay.mutationWithClientMutationId)(graphqlObj);
  }

  // 自定义的增删改
  var mutations = _lodash2.default.get(modelConfig, 'mutations', null);
  if (mutations) {
    _lodash2.default.forOwn(mutations, function (value, key) {
      var inputFields = value.inputFields,
          outputFields = value.outputFields;

      value.name = key;
      value.inputFields = (0, _transformer.toGraphQLInputFieldMap)(key, inputFields);
      _lodash2.default.forOwn(outputFields, function (fValue, fKey) {
        outputFields[fKey] = (0, _transformer.toGraphQLFieldConfig)(key, '', fValue, null, modelTypes);
      });

      result[key] = (0, _graphqlRelay.mutationWithClientMutationId)(value);
    });
  }

  return result;
};