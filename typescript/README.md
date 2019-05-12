## TypeScript for pg-minify

Complete TypeScript 3.x declarations for the [pg-minify] module.

### Inclusion

Typescript should be able to pick up the definitions without any manual configuration.

### Usage

```ts
import minify from 'pg-minify';

const sql = 'SELECT 1; -- comments';

minify(sql); //=> SELECT 1;
```

[pg-minify]:https://github.com/vitaly-t/pg-minify
