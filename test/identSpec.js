'use strict';

const LB = require('os').EOL;
const minify = require('../lib');
const errorLib = require('../lib/error');
const PEC = errorLib.parsingErrorCode;

describe('Quoted Identifier / Positive', () => {

    it('must handle empty content correctly', () => {
        expect(minify('""')).toBe('""');
        expect(minify('" "')).toBe('" "');
        expect(minify('"   "')).toBe('"   "');
    });

    it('must provide correct spacing', () => {
        expect(minify(' "" ')).toBe('""');
        expect(minify('"text"')).toBe('"text"');
        expect(minify('"  text  "')).toBe('"  text  "');
        expect(minify('text""')).toBe('text""');
        expect(minify('text ""')).toBe('text ""');
        expect(minify(' first   ""   second ')).toBe('first "" second');
    });

    it('must allow single-quotes inside', () => {
        expect(minify('"\'some\'text\'"')).toBe('"\'some\'text\'"');
    });
});

describe('Quoted Identifier / Negative', () => {

    function getError(sql) {
        try {
            minify(sql);
        } catch (e) {
            return e;
        }
    }

    it('must report unclosed quotes', () => {
        const e = getError('"');
        expect(e instanceof errorLib.SQLParsingError);
        expect(e.code).toBe(PEC.unclosedQI);
        expect(e.position).toEqual({
            line: 1,
            column: 1
        });
    });

    it('must report multi-line quoted identifiers', () => {
        const e = getError('"' + LB + '"');
        expect(e instanceof errorLib.SQLParsingError);
        expect(e.code).toBe(PEC.multiLineQI);
        expect(e.position).toEqual({
            line: 1,
            column: 1
        });
    });
});
