'use strict';

var parsingErrorCode = {
    unclosedMLC: 1, // Unclosed multi-line comment.
    unclosedText: 2, // Unclosed text block.
    unclosedQI: 3, // Unclosed quoted identifier.
    multiLineQI: 4 // Multi-line quoted identifiers are not supported.
};

Object.freeze(parsingErrorCode);

function SQLParsingError(code, error, position) {
    var temp = Error.apply(this, arguments);
    temp.name = this.name = 'SQLParsingError';
    this.stack = temp.stack;
    this.code = code; // One of parsingErrorCode values;
    this.error = error; // The main error message text;
    this.position = position; // Error position in the text: {line, column}
    this.message = "Error parsing SQL at {line:" + position.line + ",col:" + position.column + "}: " + error;
}

SQLParsingError.prototype = Object.create(Error.prototype, {
    constructor: {
        value: SQLParsingError,
        writable: true,
        configurable: true
    }
});

module.exports = {
    SQLParsingError: SQLParsingError,
    parsingErrorCode: parsingErrorCode
};
