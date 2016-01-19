'use strict';

var parsingErrorCode = {
    unclosedMLC: 1, // Unclosed multi-line comment.
    unclosedText: 2 // Unclosed text block.
};

function SQLParsingError(code, error, position) {
    var temp = Error.apply(this, arguments);
    temp.name = this.name = 'SQLParsingError';
    this.stack = temp.stack;
    this.code = code;
    this.error = error;
    this.position = position;
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
