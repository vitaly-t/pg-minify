'use strict';

var parser = require('./parser');
var error = require('./error');

parser.minify.SQLParsingError = error;

module.exports = parser.minify;
