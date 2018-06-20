'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getSchema = require('./getSchema');

var _getSchema2 = _interopRequireDefault(_getSchema);

var _graphql = require('./graphql');

var _ModelRef = require('./ModelRef');

var _ModelRef2 = _interopRequireDefault(_ModelRef);

var _Connection = require('./Connection');

var _Connection2 = _interopRequireDefault(_Connection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  getSchema: _getSchema2.default,
  getModelTypes: _graphql.getModelTypes,
  graphqlModel: _graphql.graphqlModel,
  modelRef: function modelRef(name) {
    return new _ModelRef2.default(name);
  },
  Connection: _Connection2.default
};