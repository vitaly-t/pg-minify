pg-minify
=========

Minifies PostgreSQL scripts.

[![Build Status](https://travis-ci.org/vitaly-t/pg-minify.svg?branch=master)](https://travis-ci.org/vitaly-t/pg-minify)
[![Coverage Status](https://coveralls.io/repos/vitaly-t/pg-minify/badge.svg?branch=master)](https://coveralls.io/r/vitaly-t/pg-minify?branch=master)


Minifies a PostgreSQL script into a single-line SQL command: 

1. Removes both `/*multi-line*/` and `--single-line` comments
2. Concatenates multi-line strings into single-line with `\n`
3. Removes all redundant gaps: line breaks, tabs and spaces
4. Flattens the resulting script into a single line

## Installing

```
$ npm install pg-minify
```

## Testing

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

var sql = 'SELECT 1; -- comments';

minify(sql); //=> SELECT 1;
```

## License

Copyright © 2016 [Vitaly Tomilov](https://github.com/vitaly-t);
Released under the MIT license.
