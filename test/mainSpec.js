'use strict';

var LB = require('os').EOL;
var minify = require('../lib');
var parser = require('../lib/parser');
var errorLib = require('../lib/error');
var PEC = errorLib.parsingErrorCode;

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
        });

        it("must add a space where necessary", function () {
            expect(minify("select'\nvalue'")).toBe("select E'\\nvalue'");
        })

        it("must not add a space to an empty string", function () {
            expect(minify("'\nvalue'")).toBe("E'\\nvalue'");
        });

    });

    describe("tabs in text", function () {
        it("must be replaced", function () {
            expect(minify("\t")).toBe("");
            expect(minify("'\t'")).toBe("E'\\t'");
            expect(minify("'\\t'")).toBe("'\\t'");
            expect(minify("e' \t '")).toBe("e' \\t '");
            expect(minify("'\t first " + LB + "\t second \t" + LB + "\t third \t'")).toBe("E'\\t first\\nsecond\\nthird \\t'");
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

    function errorCode(sql) {
        try {
            minify(sql);
        } catch (e) {
            return e.code;
        }
    }

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

    describe("passing invalid 'options'", function () {
        it("must throw an error", function () {
            expect(function () {
                minify('', 123);
            }).toThrow(new TypeError("Parameter 'options' must be an object."));
        });
    });

    describe("quotes in strings", function () {

        it("must report an error", function () {
            expect(errorCode("'")).toBe(PEC.unclosedText);
            expect(errorCode("'''")).toBe(PEC.unclosedText);
            expect(errorCode("''' ")).toBe(PEC.unclosedText);
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
        it("must report an error", function () {
            expect(errorCode("/*")).toBe(PEC.unclosedMLC);
            expect(errorCode("/*text")).toBe(PEC.unclosedMLC);
        });
    });

    describe("toString + inspect", function () {
        it("must produce the same output", function () {
            var error;
            try {
                minify("'test");
            } catch (e) {
                error = e;
            }
            expect(error.toString()).toBe(error.inspect());
            expect(error.toString(1) != error.inspect()).toBe(true);
        });
    })
});
