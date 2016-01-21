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

        if (s === '"') {
            var closeIdx = sql.indexOf('"', idx + 1);
            if (closeIdx < 0) {
                throwError(PEC.unclosedQI, "Unclosed quoted identifier.");
            }
            var text = sql.substr(idx, closeIdx - idx + 1);
            if (text.indexOf(EOL) > 0) {
                throwError(PEC.multiLineQI, "Multi-line quoted identifiers are not supported.");
            }
            addSpace();
            result += text;
            idx = closeIdx;
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
            addSpace();
            var text = sql.substr(idx, closeIdx - idx + 1);
            var hasLB = text.indexOf(EOL) > 0;
            if (hasLB) {
                text = text.split(EOL).map(function (m) {
                    return m.replace(/^\s+|\s+$/g, '');
                }).join('\\n');
            }
            var hasTabs = text.indexOf('\t') > 0;
            if (hasLB || hasTabs) {
                var prev = idx ? sql[idx - 1] : '';
                if (prev !== 'E' && prev !== 'e') {
                    result += 'E';
                }
                if (hasTabs) {
                    text = text.replace(/\t/g, '\\t');
                }
            }

            result += text;
            idx = closeIdx;
            continue;
        }

        addSpace();
        result += s;

    } while (++idx < len);

    return result;

    function addSpace() {
        if (space) {
            if (result.length) {
                result += ' ';
            }
            space = false;
        }
    }

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
    var lineIdx = 0, colIdx = index, pos = 0;
    do {
        pos = text.indexOf(eol, pos);
        if (pos == -1 || index < pos + eol.length) {
            break;
        }
        lineIdx++;
        pos += eol.length;
        colIdx = index - pos;
    } while (pos < index);
    return {
        line: lineIdx + 1,
        column: colIdx + 1
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
