Asserts that an object contains at least one value that satisfies a given
value, function or other assertion.

Note that this assertion fails if passed an empty object as the subject.

```javascript
expect(
    { foo: { a: 1 }, bar: { b: 2 }, baz: { c: 3 }, qux: { d: 4} },
    'to have a value satisfying',
    { a: 1 }
);

expect(
    { foo: 0, bar: 1, baz: 2, qux: 3 },
    'to have a value satisfying',
    function (value, index) {
        expect(value, 'to be a number');
    }
);

expect(
    { foo: 0, bar: 1, baz: 2, qux: 3 },
    'to have a value satisfying',
    'to be a number'
);
```

The expected value will be matched against the value with
[to satisfy](/assertions/any/to-satisfy/) semantics, so you can pass any of the
values supported by `to satisfy`. To use strict `to satisfy` semantics, you can
use the "exhaustively" flag:

```javascript
expect({ foo: { a: 1, b: 2 } }, 'to have a value satisfying', { a: 1 });
```

```javascript
expect({ foo: { a: 1, b: 2 } }, 'to have a value exhaustively satisfying', { a: 1 });
```

```output
expected { foo: { a: 1, b: 2 } } to have a value exhaustively satisfying { a: 1 }
```

In case of a failing expectation you get the following output:

```javascript
expect(
    { foo: [10, 11, 12], bar: [14, 15, 16], baz: [17, 18, 19] },
    'to have a value satisfying',
    'to have items satisfying',
    expect.it('to be a number').and('to be below', 8)
);
```

```output
expected { foo: [ 10, 11, 12 ], bar: [ 14, 15, 16 ], baz: [ 17, 18, 19 ] } to have a value satisfying
to have items satisfying expect.it('to be a number')
        .and('to be below', 8)
```

This assertion can be negated using the `not` flag:

```javascript
expect({ foo: { a: 1, b: 2 } }, 'not to have a value satisfying', { a: 1 });
```

```output
expected { foo: { a: 1, b: 2 } } not to have a value satisfying { a: 1 }

{
  foo: { a: 1, b: 2 } // should be removed
}
```
