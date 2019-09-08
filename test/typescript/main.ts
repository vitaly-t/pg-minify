import minify from '../../typescript/pg-minify';

const s1 = minify('select * from table1; --comment');
const s2 = minify('select * from table2; --comment', {});
const s3 = minify('select * from table3; --comment', {compress: true});

const options: minify.IMinifyOptions = {compress: true};
const s4 = minify('select * from table4; --comment', options);
