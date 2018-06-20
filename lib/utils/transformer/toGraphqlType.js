'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _toGraphqlFieldConfig = require('./toGraphqlFieldConfig');

var _toGraphqlFieldConfig2 = _interopRequireDefault(_toGraphqlFieldConfig);

var _toGraphQLInputFieldMap = require('./toGraphQLInputFieldMap');

var _toGraphQLInputFieldMap2 = _interopRequireDefault(_toGraphQLInputFieldMap);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (_ref2) {
  var obj = _ref2.obj,
      modelTypes = _ref2.modelTypes,
      _ref2$useRoot = _ref2.useRoot,
      useRoot = _ref2$useRoot === undefined ? false : _ref2$useRoot;

  var result = {};
  _lodash2.default.forOwn(obj, function (value, key) {
    var type = value.type,
        args = value.args;

    value.name = key;
    value.args = (0, _toGraphQLInputFieldMap2.default)(key, args);
    value.type = (0, _toGraphqlFieldConfig2.default)(key, '', value.$type, null, modelTypes).type;
    result[key] = (0, _extends3.default)({}, value, {
      resolve: function resolve(_, _ref, context, info) {
        // modelTypes塞入context, connection查询使用
        context.modelTypes = modelTypes;
        return useRoot ? value.resolve(_, _ref, context, info) : value.resolve(_ref, context, info);
      }
    });
  });
  return result;
};