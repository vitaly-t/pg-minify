'use strict';

var LB = require('os').EOL;
var lib = require('../lib');

var compressors = '.,;:()[]=<>+-*/|!?@#';

function minify(sql) {
    return lib(sql, {compress: true});
}

describe("Compress", function () {

    describe("with compressors", function () {
        it("must remove all gaps", function () {
            expect(minify(' ' + compressors.split('').join(' ') + ' ')).toBe(compressors);
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

    describe("for multi-line text", function () {
        it("must preserve the prefix space", function () {
            expect(minify("select '\nvalue'", {compress: true})).toBe("select E'\\nvalue'");
        });
        it("must not add a space to an empty string", function () {
            expect(minify("'\nvalue'", {compress: true})).toBe("E'\\nvalue'");
        });
        it("must not add a space after special symbols", function () {
            for (var i = 0; i < compressors.length; i++) {
                var c = compressors[i];
                expect(minify(c + "'\nvalue'", {compress: true})).toBe(c + "E'\\nvalue'");
            }
        });
    });

});
