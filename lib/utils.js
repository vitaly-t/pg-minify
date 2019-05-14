'use strict';

const os = require('os');
const util = require('util');

//////////////////////////////////////
// Returns the End-Of-Line from text.
function getEOL(text) {
    const m = text.match(/\r\n|\n/g);
    const u = m ? m.filter(a => a === '\n').length : 0;
    const w = m ? m.length - u : 0;
    if (u === w) {
        return os.EOL; // use the OS default
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
