'use strict';

var LB = require('os').EOL;
var minify = require('../lib');
var errorLib = require('../lib/error');
var PEC = errorLib.parsingErrorCode;

describe("Quoted Identifier / Positive", function () {

    it("must handle empty content correctly", function () {
        expect(minify('""')).toBe('""');
        expect(minify('" "')).toBe('" "');
        expect(minify('"   "')).toBe('"   "');
    });

    it("must provide correct spacing", function () {
        expect(minify(' "" ')).toBe('""');
        expect(minify('"text"')).toBe('"text"');
        expect(minify('"  text  "')).toBe('"  text  "');
        expect(minify('text""')).toBe('text""');
        expect(minify('text ""')).toBe('text ""');
        expect(minify(' first   ""   second ')).toBe('first "" second');
    });

    it("must allow single-quotes inside", function () {
        expect(minify('"\'some\'text\'"')).toBe('"\'some\'text\'"');
    })
});

describe("Quoted Identifier / Negative", function () {

    function getError(sql) {
        try {
            minify(sql);
        } catch (e) {
            return e;
        }
    }

    it("must report unclosed quotes", function () {
        var e = getError('"');
        expect(e instanceof errorLib.SQLParsingError);
        expect(e.code).toBe(PEC.unclosedQI);
        expect(e.position).toEqual({
            line: 1,
            column: 1
        });
    });

    it("must report multi-line quoted identifiers", function () {
        var e = getError('"' + LB + '"');
        expect(e instanceof errorLib.SQLParsingError);
        expect(e.code).toBe(PEC.multiLineQI);
        expect(e.position).toEqual({
            line: 1,
            column: 1
        });
    });
});
