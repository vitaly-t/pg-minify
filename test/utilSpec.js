'use strict';

const LB = require('os').EOL;
const utils = require('../lib/utils');

describe('getEOL', () => {

    it('must detect empty text correctly', () => {
        expect(utils.getEOL('')).toBe(LB);
        expect(utils.getEOL(' ')).toBe(LB);
    });

    it('must detect Unix correctly', () => {
        expect(utils.getEOL('\n')).toBe('\n');
        expect(utils.getEOL('\r\n\n\n')).toBe('\n');
    });

    it('must detect Windows correctly', () => {
        expect(utils.getEOL('\r\n')).toBe('\r\n');
        expect(utils.getEOL('\r\n\n\r\n')).toBe('\r\n');
    });
});

describe('getIndexPos', () => {

    function pos(text, idx) {
        return utils.getIndexPos(text, idx, '\r\n');
    }

    it('must work from the start', () => {
        expect(pos('123\r\n456', 0)).toEqual({
            line: 1,
            column: 1
        });
    });

    it('must work from the start', () => {
        expect(pos('123456', 3)).toEqual({
            line: 1,
            column: 4
        });
    });

    it('must work from the start', () => {
        expect(pos('123456', 5)).toEqual({
            line: 1,
            column: 6
        });
    });

    it('step over lines correctly', () => {
        expect(pos('123\r\n456', 5)).toEqual({
            line: 2,
            column: 1
        });
    });

    it('must step over line breaks', () => {
        expect(pos('123\r\n', 3)).toEqual({
            line: 1,
            column: 4
        });
    });

});
