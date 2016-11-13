/// <reference path='../../typescript/index.d.ts' />

import * as minify from 'pg-minify';

try {
    minify('select \'* from table; --comment');
} catch (error) {
    var e = <minify.SQLParsingError>error;
    console.log(e.position.line);
}
