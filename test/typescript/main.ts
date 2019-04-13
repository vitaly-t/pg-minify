import * as minify from '../../typescript/pg-minify';

const s1 = minify('select * from table; --comment');
const s2 = minify('select * from table; --comment', {});
const s3 = minify('select * from table; --comment', {compress: true});

const options: minify.minifyOptions = {compress: true};
const s4 = minify('select * from table; --comment', options);
