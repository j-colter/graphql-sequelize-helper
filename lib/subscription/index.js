'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _subscriptions = require('./subscriptions');

Object.defineProperty(exports, 'getSubscriptions', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_subscriptions).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }