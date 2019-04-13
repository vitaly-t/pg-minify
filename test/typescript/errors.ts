import * as minify from '../../typescript/pg-minify';

try {
    minify('select \'* from table; --comment');
} catch (error) {
    const e = <minify.SQLParsingError>error;
    console.log(e.position.line);
}
