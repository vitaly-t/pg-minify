'use strict';

var minify = require('../lib');

describe("Protocol", function () {

    it("must have a function at the root", function () {
        expect(minify instanceof Function).toBe(true);
    });

    it("must expose SQLParsingError type from the root", function () {
        expect(minify.SQLParsingError instanceof Function).toBe(true);
    });

    it("must expose parsingErrorCode enum from the root", function () {
        expect(minify.parsingErrorCode && typeof minify.parsingErrorCode === 'object').toBeTruthy();
        expect(minify.parsingErrorCode.unclosedMLC).toBe(0);
        expect(minify.parsingErrorCode.unclosedText).toBe(1);
        expect(minify.parsingErrorCode.unclosedQI).toBe(2);
        expect(minify.parsingErrorCode.multiLineQI).toBe(3);
    });
    
});
