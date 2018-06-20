'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.utils = exports.StringHelper = undefined;

var _StringHelper = require('./StringHelper');

Object.defineProperty(exports, 'StringHelper', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_StringHelper).default;
  }
});

var _utils = require('./utils');

var util = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var utils = exports.utils = util;