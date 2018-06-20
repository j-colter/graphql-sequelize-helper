'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('../utils');

var _transformer = require('../transformer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (_ref) {
  var model = _ref.model,
      modelTypes = _ref.modelTypes;

  var modelConfig = _utils.utils.getModelGrapqhQLConfig(model);
  var result = {};

  var subscriptions = _lodash2.default.get(modelConfig, 'subscriptions', null);
  if (subscriptions) {
    _lodash2.default.assign(result, (0, _transformer.toGraphqlType)({ obj: subscriptions, modelTypes: modelTypes, useRoot: true }));
  }
  return result;
};