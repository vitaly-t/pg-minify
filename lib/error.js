'use strict';

var EOL = require('os').EOL;

var parsingErrorCode = {
    unclosedMLC: 0, // Unclosed multi-line comment.
    unclosedText: 1, // Unclosed text block.
    unclosedQI: 2, // Unclosed quoted identifier.
    multiLineQI: 3 // Multi-line quoted identifiers are not supported.
};

Object.freeze(parsingErrorCode);

var errorMessages = [
    {name: "unclosedMLC", message: "Unclosed multi-line comment."},
    {name: "unclosedText", message: "Unclosed text block."},
    {name: "unclosedQI", message: "Unclosed quoted identifier."},
    {name: "multiLineQI", message: "Multi-line quoted identifiers are not supported."}
];

function SQLParsingError(code, position) {
    var temp = Error.apply(this, arguments);
    temp.name = this.name = 'SQLParsingError';
    this.stack = temp.stack;
    this.code = code; // One of parsingErrorCode values;
    this.position = position; // Error position in the text: {line, column}
    this.message = "Error parsing SQL at {line:" + position.line + ",col:" + position.column + "}: " + errorMessages[code].message;
}

SQLParsingError.prototype = Object.create(Error.prototype, {
    constructor: {
        value: SQLParsingError,
        writable: true,
        configurable: true
    }
});

SQLParsingError.prototype.toString = function () {
    var lines = [
        'SQLParsingError {',
        '    code: parsingErrorCode.' + errorMessages[this.code].name,
        '    message: "' + errorMessages[this.code].message + '"',
        '    position: {line: ' + this.position.line + ", col: " + this.position.column + '}',
        '}'
    ];
    return lines.join(EOL);
};

SQLParsingError.prototype.inspect = function () {
    return this.toString();
};

module.exports = {
    SQLParsingError: SQLParsingError,
    parsingErrorCode: parsingErrorCode
};
