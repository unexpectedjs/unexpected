Asserts an array (or array-like object) contains at least one item that satisfies
a given value, function or other assertion.

Note that this assertion fails if passed an empty array as the subject.

```javascript
expect([ { a: 1 },  { b: 2 } ], 'to have an item satisfying',  { a: 1 } );

expect([0, 1, 2, 3, 4], 'to have an item satisfying', 'to be a number');

expect([0, 1, 2, 3, 4], 'to have an item satisfying', function (item, index) {
    expect(item, 'to be a number');
});

expect(
    [[1], ['foo']],
    'to have an item satisfying',
    'to have an item satisfying',
    'to be a number'
);

expect(
    [-1, -2, 3],
    'to have an item satisfying',
    expect.it('to be a number').and('to be positive')
);
```

The expected value will be matched against the value with
[to satisfy](/assertions/any/to-satisfy/) semantics, so you can pass any of the
values supported by `to satisfy`. To use strict `to satisfy` semantics, you can
use the "exhaustively" flag:

```javascript
expect([ { a: 1, b: 2 } ], 'to have a value satisfying', { a: 1 });
```

```javascript
expect([ { a: 1, b: 2 } ], 'to have a value exhaustively satisfying', { a: 1 });
```

```output
expected [ { a: 1, b: 2 } ] to have a value exhaustively satisfying { a: 1 }
```

In case of a failing expectation you get the following output:

```javascript
expect(
    [ ['0', '1'], ['5', '6'], ['7', '8'] ],
    'to have an item satisfying',
    'to have an item satisfying',
    'to be a number'
);
```

```output
expected [ [ '0', '1' ], [ '5', '6' ], [ '7', '8' ] ]
to have an item satisfying to have an item satisfying to be a number
```

Here a another example:

```javascript
expect(
    [0, -1, -2, -3, -4],
    'to have an item satisfying',
    expect.it('to be a number').and('to be positive')
);
```

```output
expected [ 0, -1, -2, -3, -4 ] to have an item satisfying
expect.it('to be a number')
        .and('to be positive')
```
