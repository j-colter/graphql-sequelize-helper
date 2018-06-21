'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

import { connectionArgs } from 'graphql-relay';

exports.EdgeType = exports.ConnectionType = undefined;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ConnectionType = exports.ConnectionType = function ConnectionType(nodeType) {
  _classCallCheck(this, ConnectionType);

  this.nodeType = nodeType;
};

var EdgeType = exports.EdgeType = function EdgeType(nodeType) {
  _classCallCheck(this, EdgeType);

  this.nodeType = nodeType;
};

const args = connectionArgs

exports.default = {

  ConnectionType: ConnectionType,

  EdgeType: EdgeType,

  args,

  /**
   * Reference to relay ConnectionType with specify node
   */
  connectionType: function connectionType(nodeType) {
    return new this.ConnectionType(nodeType);
  },

  /**
   * Reference to Relay EdgeType with specify node
   */
  edgeType: function edgeType(nodeType) {
    return new this.EdgeType(nodeType);
  },
};
