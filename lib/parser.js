'use strict';

var os = require('os');
var errorLib = require('./error');
var PEC = errorLib.parsingErrorCode;

///////////////////////////////////////////
// Parses and minifies a PostgreSQL script.
function minify(sql) {

    if (typeof sql !== 'string') {
        throw new TypeError("Input SQL must be a text string.");
    }

    if (!sql.length) {
        return '';
    }

    var idx = 0, // current index
        result = '', // resulting sql
        len = sql.length, // sql length
        EOL = getEOL(sql), // End-Of-Line
        regLB = new RegExp(EOL, 'g'),
        space = false;

    do {
        var s = sql[idx], // current symbol;
            s1 = idx < len - 1 ? sql[idx + 1] : ''; // next symbol;

        if (isGap(s)) {
            while (++idx < len && isGap(sql[idx]));
            if (idx < len) {
                space = true;
            }
            idx--;
            continue;
        }

        if (s === '-' && s1 === '-') {
            var lb = sql.indexOf(EOL, idx + 2);
            if (lb < 0) {
                break;
            }
            idx = lb - 1;
            continue;
        }

        if (s === '/' && s1 === '*') {
            var end = sql.indexOf('*/', idx + 2);
            if (end < 0) {
                throwError(PEC.unclosedMLC, "Unclosed multi-line comment.");
            }
            idx = end + 1;
            continue;
        }

        if (s === '\'') {
            var closeIdx = idx;
            do {
                closeIdx = sql.indexOf('\'', closeIdx + 1);
                if (closeIdx > 0) {
                    var step = closeIdx;
                    while (++step < len && sql[step] === '\'');
                    if ((step - closeIdx) % 2) {
                        closeIdx = step - 1;
                        break;
                    }
                    closeIdx = step === len ? -1 : step;
                }
            } while (closeIdx > 0);
            if (closeIdx < 0) {
                throwError(PEC.unclosedText, "Unclosed text block.");
            }
            result += sql.substr(idx, closeIdx - idx + 1).replace(regLB, '\\n');
            idx = closeIdx;
            continue;
        }

        if (space) {
            if (result.length) {
                result += ' ';
            }
            space = false;
        }

        result += s;

    } while (++idx < len);

    return result;

    function throwError(code, error) {
        var position = getIndexPos(sql, idx, EOL);
        throw new errorLib.SQLParsingError(code, error, position);
    }
}

//////////////////////////////////////
// Returns the End-Of-Line from text.
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
// Returns {line, column} of an index within the text.
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

////////////////////////////////////
// Identifies a gap / empty symbol.
function isGap(s) {
    return s === ' ' || s === '\t' || s === '\r' || s === '\n';
}

module.exports = {
    minify: minify,
    getEOL: getEOL,
    getIndexPos: getIndexPos
};
