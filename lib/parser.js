'use strict';

var os = require('os');
var errorLib = require('./error');
var PEC = errorLib.parsingErrorCode;

////////////////////////////////////////////////
// Parses and minifies PostgreSQL query:
// - removes all comments;
// - replaces line breaks within strings with \n
// - flattens result into a single line
function minify(sql) {

    if (!sql.length) {
        return '';
    }

    var idx = 0, // current index;
        s = '', // resulting code;
        len = sql.length, // sql length;
        emptyLine = true, // set while no symbols encountered on the current line;
        emptyLetters = '', // empty letters on a new line;
        EOL = getEOL(sql), // End-Of-Line.
        regLB = new RegExp(EOL, 'g');

    do {
        if (sql[idx] === '-' && idx < len - 1 && sql[idx + 1] === '-') {
            var lb = sql.indexOf(EOL, idx + 2);
            if (lb < 0) {
                break;
            }
            if (emptyLine) {
                emptyLetters = '';
                idx = lb + EOL.length - 1; // last symbol of the line break;
            } else {
                idx = lb - 1; // just before the line break;
            }
            continue;
        }
        if (sql[idx] === '/' && idx < len - 1 && sql[idx + 1] === '*') {
            var end = sql.indexOf('*/', idx + 2);
            if (end < 0) {
                throwError(PEC.unclosedMLC, "Unclosed multi-line comment.");
            }
            idx = end + 1;
            if (emptyLine) {
                emptyLetters = '';
            }
            var lb = sql.indexOf(EOL, idx + 1);
            if (lb > idx) {
                var gapIdx = lb - 1;
                while ((sql[gapIdx] === ' ' || sql[gapIdx] === '\t') && --gapIdx > idx);
                if (emptyLine && gapIdx === idx) {
                    idx = lb + EOL.length - 1; // last symbol of the line break;
                }
            }
            continue;
        }

        var symbol = sql[idx];
        var isSpace = symbol === ' ' || symbol === '\t';
        if (symbol === '\r' || symbol === '\n') {
            if (sql.indexOf(EOL, idx) === idx) {
                emptyLine = true;
            }
        } else {
            if (!isSpace) {
                emptyLine = false;
                s += emptyLetters;
                emptyLetters = '';
            }
        }
        if (emptyLine && isSpace) {
            emptyLetters += symbol;
        } else {
            s += symbol;
        }

        if (symbol === '\'') {
            var closeIdx = idx;
            do {
                closeIdx = sql.indexOf(symbol, closeIdx + 1);
                if (closeIdx > 0) {
                    var shIdx = closeIdx;
                    while (++shIdx < len && sql[shIdx] === '\'');
                    if ((shIdx - closeIdx) % 2) {
                        closeIdx = shIdx - 1;
                        break;
                    }
                    closeIdx = shIdx === len ? -1 : shIdx;
                }
            } while (closeIdx > 0);
            if (closeIdx < 0) {
                throwError(PEC.unclosedText, "Unclosed text block.");
            }
            s += sql.substr(idx + 1, closeIdx - idx).replace(regLB, '\\n');
            idx = closeIdx;
        }

    } while (++idx < len);

    return s
        .split(EOL)
        .map(function (line) {
            return line.replace(/^(\s)+|(\s)+$/g, '');
        })
        .filter(function (line) {
            return line.length > 0;
        }).join(' ');

    function throwError(code, error) {
        var position = getIndexPos(sql, idx, EOL);
        throw new errorLib.SQLParsingError(code, error, position);
    }
}

////////////////////////////////////////
// Automatically determines and returns
// the type of End-of-Line in the text.
function getEOL(text) {
    var idx = 0, unix = 0, windows = 0;
    while (idx < text.length) {
        idx = text.indexOf('\n', idx);
        if (idx == -1) {
            break;
        }
        if (idx > 0 && text[idx - 1] === '\r') {
            windows++;
        } else {
            unix++;
        }
        idx++;
    }
    if (unix === windows) {
        return os.EOL;
    }
    return unix > windows ? '\n' : '\r\n';
}

///////////////////////////////////////////////////////
// Returns {line, column} of the index within the text
function getIndexPos(text, index, eol) {
    var line = 1, col = 1, pos = 0;
    do {
        pos = text.indexOf(eol, pos);
        if (pos == -1) {
            break;
        }
        pos += eol.length;
        if (pos <= index) {
            line++;
        }
    } while (pos < index);
    if (index >= eol.length) {
        var lastIdx = text.lastIndexOf(eol, index - eol.length);
        if (lastIdx === -1) {
            col = index;
        } else {
            col = index - lastIdx - eol.length + 1;
        }
    } else {
        col = index + 1;
    }
    return {
        line: line,
        column: col
    };
}

module.exports = {
    minify: minify,
    getEOL: getEOL,
    getIndexPos: getIndexPos
};
