'use strict';

var LB = require('os').EOL;
var minify = require('../lib');
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

describe("Minify/Positive", function () {

    describe("single-line comment", function () {
        it("must return an empty string", function () {
            expect(minify("--comment")).toBe("");
        });
    });

    describe("single-line comment with a prefix", function () {
        it("must return the prefix", function () {
            expect(minify("text--comment")).toBe("text");
        });
    });

    describe("comments in strings", function () {
        it("must be skipped", function () {
            expect(minify("'--comment'")).toBe("'--comment'");
            expect(minify("'/*comment*/'")).toBe("'/*comment*/'");
        });
    });

    describe("empty text", function () {
        it("must be returned empty", function () {
            expect(minify("")).toBe("");
            expect(minify("''")).toBe("''");
        });
    });
    describe("quotes in strings", function () {
        it("must be ignored", function () {
            expect(minify("''''")).toBe("''''");
            expect(minify("''''''")).toBe("''''''");
        });
    });

    describe("with multiple lines", function () {
        it("must be ignored", function () {
            expect(minify("--comment" + LB + "text")).toBe("text");
            expect(minify("--comment" + LB + LB + "text")).toBe("text");
            expect(minify("/*start" + LB + "end*/")).toBe("");
            expect(minify("/*start" + LB + "end*/text")).toBe("text");
            expect(minify("start-/*comment*/end")).toBe("start-end");
            expect(minify("start/*comment*/" + LB + "end")).toBe("start end");

            expect(minify("start/*comment*/" + LB + " end")).toBe("start end");

            expect(minify("/*comment*/end " + LB)).toBe("end");
        });
    });

});

describe("Minify/Negative", function () {

    describe("quotes in strings", function () {
        var errMsg = "Error parsing SQL at {line:1,col:1}: Unclosed text block.";
        it("must throw an error", function () {
            expect(function () {
                minify("'");
            }).toThrow(errMsg);

            expect(function () {
                minify("'''");
            }).toThrow(errMsg);

            try {
                minify("'''text");
            } catch (e) {
                //expect(e.inspect()).toBe(e.message + LB + LB + e.stack);
            }
        });
    });

    describe("unclosed multi-lines", function () {
        var errMsg = "Error parsing SQL at {line:1,col:1}: Unclosed multi-line comment.";
        it("must throw an error", function () {
            expect(function () {
                minify("/*");
            }).toThrow(errMsg);

            expect(function () {
                minify("/*text");
            }).toThrow(errMsg);
        });
    });

});

describe("Index Position:", function () {

    function pos(text, idx) {
        return parser.getIndexPos(text, idx, "\r\n");
    }

    describe("", function () {
        it("", function () {
            expect(pos("123\r\n456", 0)).toEqual({
                line: 1,
                column: 1
            });
            expect(pos("123\r\n456", 5)).toEqual({
                line: 2,
                column: 1
            });
            expect(pos("123\r\n", 3)).toEqual({
                line: 1,
                column: 3
            });

        });
    });
});
