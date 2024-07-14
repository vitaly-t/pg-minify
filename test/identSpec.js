const {EOL} = require('os');
const minify = require('../lib');
const {SQLParsingError, parsingErrorCode} = require('../lib/error');

const PEC = parsingErrorCode;

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
        expect(e instanceof SQLParsingError);
        expect(e.code).toBe(PEC.unclosedQI);
        expect(e.position).toEqual({
            line: 1,
            column: 1
        });
    });

    it('must report multi-line quoted identifiers', () => {
        const e = getError(`"${EOL}"`);
        expect(e instanceof SQLParsingError);
        expect(e.code).toBe(PEC.multiLineQI);
        expect(e.position).toEqual({
            line: 1,
            column: 1
        });
    });
});
