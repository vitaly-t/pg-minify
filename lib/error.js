'use strict';

const EOL = require('os').EOL;
const utils = require('./utils');

const parsingErrorCode = {
    unclosedMLC: 0, // Unclosed multi-line comment.
    unclosedText: 1, // Unclosed text block.
    unclosedQI: 2, // Unclosed quoted identifier.
    multiLineQI: 3, // Multi-line quoted identifiers are not supported.
    nestedMLC: 4 // Nested multi-line comments are not supported.
};

Object.freeze(parsingErrorCode);

const errorMessages = [
    {name: 'unclosedMLC', message: 'Unclosed multi-line comment.'},
    {name: 'unclosedText', message: 'Unclosed text block.'},
    {name: 'unclosedQI', message: 'Unclosed quoted identifier.'},
    {name: 'multiLineQI', message: 'Multi-line quoted identifiers are not supported.'},
    {name: 'nestedMLC', message: 'Nested multi-line comments are not supported.'}
];

function SQLParsingError(code, position) {
    const temp = Error.apply(this, arguments);
    temp.name = this.name = 'SQLParsingError';
    this.stack = temp.stack;
    this.code = code; // one of parsingErrorCode values;
    this.error = errorMessages[code].message;
    this.position = position; // Error position in the text: {line, column}
    this.message = 'Error parsing SQL at {line:' + position.line + ',col:' + position.column + '}: ' + this.error;
}

SQLParsingError.prototype = Object.create(Error.prototype, {
    constructor: {
        value: SQLParsingError,
        writable: true,
        configurable: true
    }
});

SQLParsingError.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    const gap = utils.messageGap(level + 1);
    const lines = [
        'SQLParsingError {',
        gap + 'code: parsingErrorCode.' + errorMessages[this.code].name,
        gap + 'error: "' + this.error + '"',
        gap + 'position: {line: ' + this.position.line + ', col: ' + this.position.column + '}',
        utils.messageGap(level) + '}'
    ];
    return lines.join(EOL);
};

SQLParsingError.prototype.inspect = function () {
    return this.toString();
};

module.exports = {
    SQLParsingError,
    parsingErrorCode
};
