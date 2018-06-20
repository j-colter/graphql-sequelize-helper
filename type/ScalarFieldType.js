'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ScalarFieldType = function ScalarFieldType(config) {
  _classCallCheck(this, ScalarFieldType);

  this.name = config.name;
  this.description = config.description;
  this.graphQLInputType = config.graphQLInputType;
  this.graphQLOutputType = config.graphQLOutputType;
  this.columnType = config.columnType;
};

exports.default = ScalarFieldType;
