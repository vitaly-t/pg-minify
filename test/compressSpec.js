'use strict';

var LB = require('os').EOL;
var lib = require('../lib');

function minify(sql) {
    return lib(sql, {compress: true});
}

describe("Compress", function () {

    describe("with compressors", function () {
        it("must remove all gaps", function () {
            expect(minify(" . , ; : ( ) [ ] = < > + - * / | ! ? @ # ")).toBe(".,;:()[]=<>+-*/|!?@#");
        });
    });

    describe("with single-line comment", function () {
        it("must remove all gaps", function () {
            expect(minify(" --comment  ")).toBe("");
            expect(minify(" --comment " + LB + " suffix ")).toBe("suffix");
            expect(minify(" prefix- --comment " + LB + " suffix ")).toBe("prefix-suffix");
        });
    });

    describe("with multi-line comment", function () {
        it("must remove all gaps", function () {
            expect(minify(" /*comment */ ")).toBe("");
            expect(minify(" /*comment*/ " + LB + " suffix ")).toBe("suffix");
            expect(minify(" prefix- /*comment */ " + LB + " suffix ")).toBe("prefix-suffix");
        });
    });

    describe("with a text block", function () {
        it("must remove all gaps", function () {
            expect(minify("some 'text' here")).toBe("some'text'here");
        });
    });

    describe("with a name", function () {
        it("must remove all gaps", function () {
            expect(minify('some "text" here')).toBe('some"text"here');
        });
    });

});
