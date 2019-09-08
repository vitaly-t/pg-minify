const utils = require('../lib/utils');

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
