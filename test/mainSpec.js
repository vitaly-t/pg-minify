'use strict';

var LB = require('os').EOL;
var minify = require('../lib');
var parser = require('../lib/parser');
var errorLib = require('../lib/error');

describe("Protocol", function () {

    it("must have a function at the root", function () {
        expect(minify instanceof Function).toBe(true);
    });

    it("must expose SQLParsingError type from the root", function () {
        expect(minify.SQLParsingError instanceof Function).toBe(true);
    });

    it("must expose parsingErrorCode enum from the root", function () {
        expect(minify.parsingErrorCode && typeof minify.parsingErrorCode === 'object').toBeTruthy();
    });

});

describe("Minify/Positive", function () {

    describe("single-line comment", function () {
        it("must return an empty string", function () {
            expect(minify("--comment")).toBe("");
            expect(minify("--comment" + LB)).toBe("");
            expect(minify(LB + "--comment")).toBe("");
        });
    });

    describe("single-line comment with a prefix", function () {
        it("must return the prefix", function () {
            expect(minify("text--comment")).toBe("text");
            expect(minify(" text --comment")).toBe("text");
            expect(minify("text" + LB + "--comment")).toBe("text");
            expect(minify(" text " + LB + "--comment")).toBe("text");
            expect(minify("text--comment" + LB)).toBe("text");
        });
    });

    describe("single-line comment with a suffix", function () {
        it("must return the suffix", function () {
            expect(minify("--comment" + LB + "text")).toBe("text");
            expect(minify("--comment" + LB + " text ")).toBe("text");
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

    describe("multi-line text", function () {
        it("must be returned with E", function () {
            expect(minify("'" + LB + "'")).toBe("E'\\n'");
            expect(minify("'" + LB + LB + "'")).toBe("E'\\n\\n'");
            expect(minify("text '" + LB + "'")).toBe("text E'\\n'");
            expect(minify("text e'" + LB + "'")).toBe("text e'\\n'");
            expect(minify("e'" + LB + "'")).toBe("e'\\n'");
            expect(minify("E'" + LB + "'")).toBe("E'\\n'");
        });

        it("must truncate text correctly", function () {
            expect(minify("' first " + LB + " last '")).toBe("E' first\\nlast '");
            expect(minify("' first " + LB + " second " + LB + " third '")).toBe("E' first\\nsecond\\nthird '");
            expect(minify("'\t first " + LB + "\t second \t" + LB + "\t third \t'")).toBe("E'\t first\\nsecond\\nthird \t'");
        });
    });

    describe("quotes in strings", function () {
        it("must be ignored", function () {
            expect(minify("text''")).toBe("text''");
            expect(minify("text ''")).toBe("text ''");
            expect(minify("''''")).toBe("''''");
            expect(minify("''''''")).toBe("''''''");
        });
    });

    describe("redundant gaps", function () {
        it("must be all replaced with a single space", function () {
            expect(minify("a  b")).toBe("a b");
            expect(minify(" a     b ")).toBe("a b");
            expect(minify("a\tb")).toBe("a b");
            expect(minify("\ta\t\tb\t")).toBe("a b");
            expect(minify("a - b")).toBe("a - b");
        });
    });

    describe("with multiple lines", function () {
        it("must be ignored", function () {
            expect(minify("--comment" + LB + LB + "text")).toBe("text");
            expect(minify("/*start" + LB + "end*/")).toBe("");
            expect(minify("/*start" + LB + "end*/text")).toBe("text");
            expect(minify("start-/*comment*/end")).toBe("start-end");
            expect(minify("start/*comment*/" + LB + "end")).toBe("start end");
            expect(minify("start/*comment*/" + LB + " end")).toBe("start end");
            expect(minify("/*comment*/end " + LB)).toBe("end");
            expect(minify("/*start" + LB + "end*/" + LB + "text")).toBe("text");
            expect(minify(" /*hello*/ " + LB + "next")).toBe("next");
        });
    });

});

describe("Minify/Negative", function () {

    describe("passing non-text", function () {
        var errMsg = "Input SQL must be a text string.";
        it("must throw an error", function () {
            expect(function () {
                minify();
            }).toThrow(new TypeError(errMsg));
            expect(function () {
                minify(123);
            }).toThrow(new TypeError(errMsg));
        });
    });

    describe("quotes in strings", function () {
        var errMsg = "Error parsing SQL at {line:1,col:1}: Unclosed text block.";

        it("must throw an error", function () {
            expect(function () {
                minify("'");
            }).toThrow(errMsg);

            expect(function () {
                minify("''' ");
            }).toThrow(errMsg);

            expect(function () {
                minify("'''");
            }).toThrow(errMsg);

            expect(function () {
                minify("'''");
            }).toThrow(new errorLib.SQLParsingError(errorLib.parsingErrorCode.unclosedText, "Unclosed text block.", {
                line: 1,
                column: 1
            }));

            expect(function () {
                minify("/*");
            }).toThrow(new errorLib.SQLParsingError(errorLib.parsingErrorCode.unclosedMLC, "Unclosed multi-line comment.", {
                line: 1,
                column: 1
            }));
        });

        it("must report positions correctly", function () {
            expect(getErrorPos("'").column).toBe(1);
            expect(getErrorPos(" '").column).toBe(2);
            expect(getErrorPos("s'").column).toBe(2);
            expect(getErrorPos("s '").column).toBe(3);
        });

        function getErrorPos(sql) {
            try {
                minify(sql);
            } catch (e) {
                return e.position;
            }
            return null;
        }
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

describe("Index Position:", function () {

    function pos(text, idx) {
        return parser.getIndexPos(text, idx, "\r\n");
    }

    it("must work from the start", function () {
        expect(pos("123\r\n456", 0)).toEqual({
            line: 1,
            column: 1
        });
    });

    it("must work from the start", function () {
        expect(pos("123456", 3)).toEqual({
            line: 1,
            column: 4
        });
    });

    it("must work from the start", function () {
        expect(pos("123456", 5)).toEqual({
            line: 1,
            column: 6
        });
    });

    it("step over lines correctly", function () {
        expect(pos("123\r\n456", 5)).toEqual({
            line: 2,
            column: 1
        });
    });

    it("must step over line breaks", function () {
        expect(pos("123\r\n", 3)).toEqual({
            line: 1,
            column: 4
        });
    });

});
