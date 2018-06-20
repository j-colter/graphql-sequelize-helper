'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mutations = require('./mutations');

Object.defineProperty(exports, 'getMutations', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_mutations).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }