'use strict';

var LB = require('os').EOL;
var utils = require('../lib/utils');

describe('getEOL', function () {

    it('must detect empty text correctly', function () {
        expect(utils.getEOL('')).toBe(LB);
        expect(utils.getEOL(' ')).toBe(LB);
    });

    it('must detect Unix correctly', function () {
        expect(utils.getEOL('\n')).toBe('\n');
        expect(utils.getEOL('\r\n\n\n')).toBe('\n');
    });

    it('must detect Windows correctly', function () {
        expect(utils.getEOL('\r\n')).toBe('\r\n');
        expect(utils.getEOL('\r\n\n\r\n')).toBe('\r\n');
    });
});

describe('getIndexPos', function () {

    function pos(text, idx) {
        return utils.getIndexPos(text, idx, '\r\n');
    }

    it('must work from the start', function () {
        expect(pos('123\r\n456', 0)).toEqual({
            line: 1,
            column: 1
        });
    });

    it('must work from the start', function () {
        expect(pos('123456', 3)).toEqual({
            line: 1,
            column: 4
        });
    });

    it('must work from the start', function () {
        expect(pos('123456', 5)).toEqual({
            line: 1,
            column: 6
        });
    });

    it('step over lines correctly', function () {
        expect(pos('123\r\n456', 5)).toEqual({
            line: 2,
            column: 1
        });
    });

    it('must step over line breaks', function () {
        expect(pos('123\r\n', 3)).toEqual({
            line: 1,
            column: 4
        });
    });

});
