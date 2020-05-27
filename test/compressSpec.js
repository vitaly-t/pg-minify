const {EOL} = require('os');
const lib = require('../lib');

const compressors = '.,;:()[]=<>+-*/|!?@#';

function minify(sql) {
    return lib(sql, {compress: true});
}

describe('Compress', () => {

    describe('with compressors', () => {
        it('must remove all gaps', () => {
            expect(minify(' ' + compressors.split('').join(' ') + ' ')).toBe(compressors);
        });
    });

    describe('with single-line comment', () => {
        it('must remove all gaps', () => {
            expect(minify(' --comment  ')).toBe('');
            expect(minify(' --comment ' + EOL + ' suffix ')).toBe('suffix');
            expect(minify(' prefix- --comment ' + EOL + ' suffix ')).toBe('prefix-suffix');
        });
    });

    describe('with multi-line comment', () => {
        it('must remove all gaps', () => {
            expect(minify(' /*comment */ ')).toBe('');
            expect(minify(' /*comment*/ ' + EOL + ' suffix ')).toBe('suffix');
            expect(minify(' prefix- /*comment */ ' + EOL + ' suffix ')).toBe('prefix-suffix');
        });
        it('must preserve the minimum gaps', () => {
            expect(minify('select /*comment */1')).toBe('select 1');
        });
    });

    describe('with a text block', () => {
        it('must remove all gaps', () => {
            expect(minify(`some 'text' here`)).toBe(`some'text'here`);
        });
    });

    describe('with a name', () => {
        it('must remove all gaps', () => {
            expect(minify('some "text" here')).toBe('some"text"here');
        });
    });

    describe('for multi-line text', () => {
        it('must preserve the prefix space', () => {
            expect(minify(`select '\nvalue'`, {compress: true})).toBe(`select E'\\nvalue'`);
        });
        it('must not add a space to an empty string', () => {
            expect(minify(`'\nvalue'`, {compress: true})).toBe(`E'\\nvalue'`);
        });
        it('must not add a space after special symbols', () => {
            for (let i = 0; i < compressors.length; i++) {
                const c = compressors[i];
                expect(minify(c + `'\nvalue'`, {compress: true})).toBe(c + `E'\\nvalue'`);
            }
        });
    });
});
