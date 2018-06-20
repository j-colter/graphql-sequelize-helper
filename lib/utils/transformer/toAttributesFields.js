'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _graphqlSequelize = require('graphql-sequelize');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 统一处理cache，解决重复定义enum类型bug
var cache = {};

exports.default = function (model, options) {
  _lodash2.default.assign(options, { cache: cache });
  return (0, _graphqlSequelize.attributeFields)(model, options);
};