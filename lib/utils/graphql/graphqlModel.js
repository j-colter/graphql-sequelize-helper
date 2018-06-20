'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('../utils');

var _query = require('../query');

var _mutation = require('../mutation');

var _subscription = require('../subscription');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (_ref) {
  var model = _ref.model,
      modelTypes = _ref.modelTypes,
      schemaConfig = _ref.schemaConfig;

  var modelConfig = _utils.utils.getModelGrapqhQLConfig(model);

  var result = {
    queries: (0, _query.getQueries)({ model: model, modelTypes: modelTypes, schemaConfig: schemaConfig }),
    mutations: (0, _mutation.getMutations)({ model: model, modelTypes: modelTypes }),
    subscriptions: (0, _subscription.getSubscriptions)({ model: model, modelTypes: modelTypes })

    // 绑定静态方法和实例方法
  };var methods = _lodash2.default.get(modelConfig, 'methods', null);
  if (methods) {
    _lodash2.default.forOwn(methods, function (value, key) {
      model.prototype[key] = value;
    });
  }
  var statics = _lodash2.default.get(modelConfig, 'statics', null);
  if (statics) {
    _lodash2.default.forOwn(statics, function (value, key) {
      model[key] = value;
    });
  }

  return result;
};