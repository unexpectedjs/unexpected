Asserts that all values of a map satisfies a given function.

Notice this assertion fails when given an empty object.

Aliases: `to be an object whose values satisfy`, `to be a hash whose values satisfy`.

```javascript
expect({ foo: 0, bar: 1, baz: 2, qux: 3 },
       'to be a map whose values satisfy', function (value, index) {
    expect(value, 'to be a number');
});

expect({ foo: 0, bar: 1, baz: 2, qux: 3 },
       'to be a hash whose values satisfy',
       'to be a number');
```

In case of a failing expectation you get the following output:

```javascript
expect({ foo: [0, 1, 2], bar: [4, 5, 6], baz: [7, 8, 9] },
       'to be a map whose values satisfy',
       'to be an array whose items satisfy',
       expect.it('to be a number').and('to be below', 8));
```

```output
failed expectation in { foo: [ 0, 1, 2 ], bar: [ 4, 5, 6 ], baz: [ 7, 8, 9 ] }:
  baz: failed expectation in [ 7, 8, 9 ]:
         1: ✓ expected 8 to be a number and
            ⨯ expected 8 to be below 8
         2: ✓ expected 9 to be a number and
            ⨯ expected 9 to be below 8
```
