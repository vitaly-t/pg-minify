import * as minify from '../../typescript/pg-minify';

try {
    minify('select \'* from table; --comment');
} catch (error) {
    var e = <minify.SQLParsingError>error;
    console.log(e.position.line);
}
