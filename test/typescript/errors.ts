import {SQLParsingError} from '../../typescript/pg-minify';
import minify from '../../typescript/pg-minify';

try {
    minify(`select '* from table; --comment`);
} catch (error) {
    const a = <minify.SQLParsingError>error;
    console.log(a.position.line);

    let b: SQLParsingError = <SQLParsingError>{};
    const bb = b.position.column;
    console.log(bb);
}
