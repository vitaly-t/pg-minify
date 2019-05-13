'use strict';

const os = require('os');
const util = require('util');

//////////////////////////////////////
// Returns the End-Of-Line from text.
function getEOL(text) {
    const m1 = text.match(/\r\n/g);
    const m2 = text.match(/\n/g);
    const w = m1 ? m1.length : 0;
    const u = m2 ? m2.length - w : 0;
    if (u === w) {
        return os.EOL;
    }
    return u > w ? '\n' : '\r\n';
}

///////////////////////////////////////////////////////
// Returns {line, column} of an index within the text.
function getIndexPos(text, index, eol) {
    let lineIdx = 0, colIdx = index, pos = 0;
    do {
        pos = text.indexOf(eol, pos);
        if (pos === -1 || index < pos + eol.length) {
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

///////////////////////////////////////////
// Returns a space gap for console output.
function messageGap(level) {
    return ' '.repeat(level * 4);
}

////////////////////////////////////////////////////
// Legacy type inspection, to support Node.js < 6.x
function addInspection(type, cb) {
    // istanbul ignore else;
    if (util.inspect.custom) {
        type.prototype[util.inspect.custom] = cb;
    } else {
        type.prototype.inspect = cb;
    }
}

module.exports = {
    getEOL,
    getIndexPos,
    messageGap,
    addInspection
};
