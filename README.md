pg-minify
=========

[![Build Status](https://travis-ci.org/vitaly-t/pg-minify.svg?branch=master)](https://travis-ci.org/vitaly-t/pg-minify)
[![Coverage Status](https://coveralls.io/repos/vitaly-t/pg-minify/badge.svg?branch=master)](https://coveralls.io/r/vitaly-t/pg-minify?branch=master)

Minifies a PostgreSQL script into a single line: 

1. Removes both `/*multi-line*/` and `--single-line` comments
2. Concatenates multi-line strings into a single line with `\n`
3. Removes redundant line gaps: line breaks, tabs and spaces
4. Flattens the resulting script into a single line


It also provides basic parsing and error reporting for invalid SQL.

## Installing

```
$ npm install pg-minify
```

## Testing

First, clone the repository and install DEV dependencies.

```
$ npm test
```

Testing with coverage:
```
$ npm run coverage
```

## Usage

```js
var minify = require('pg-minify');

var sql = "SELECT 1; -- comments";

minify(sql); //=> SELECT 1;
```

#### Error Handling

[SQLParsingError] is thrown on failed SQL parsing:

```js
try {
    minify("SELECT '1");
} catch (error) {
    // error is minify.SQLParsingError instance
    // error.message:
    // Error parsing SQL at {line:1,col:8}: Unclosed text block.
}
```

## API

### minify(sql, [options]) ⇒ String

Minifies SQL into a single line, according to the `options`.

##### options.compress ⇒ Boolean

Compresses / uglifies the SQL to its bare minimum, by removing all unnecessary spaces.

* `false (default)` - keep minimum spaces, for easier read
* `true` - remove all unnecessary spaces 

## License

Copyright © 2016 [Vitaly Tomilov](https://github.com/vitaly-t);
Released under the MIT license.

[SQLParsingError]:https://github.com/vitaly-t/pg-minify/blob/master/lib/error.js#L12
