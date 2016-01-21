'use strict';

var LB = require('os').EOL;
var parser = require('../lib/parser');

describe("EOL", function () {

    it("must detect empty text correctly", function () {
        expect(parser.getEOL("")).toBe(LB);
        expect(parser.getEOL(" ")).toBe(LB);
    });

    it("must detect Unix correctly", function () {
        expect(parser.getEOL("\n")).toBe("\n");
        expect(parser.getEOL("\r\n\n\n")).toBe("\n");
    });

    it("must detect Windows correctly", function () {
        expect(parser.getEOL("\r\n")).toBe("\r\n");
        expect(parser.getEOL("\r\n\n\r\n")).toBe("\r\n");
    });
});
