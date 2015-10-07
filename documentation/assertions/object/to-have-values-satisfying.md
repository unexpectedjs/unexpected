Asserts that all values of an object satisfy a given assertion or function.

Notice this assertion fails when given an empty object.

Aliases: `to be a map whose values satisfy`,
`to be an object whose values satisfy`, `to be a hash whose values satisfy`.

```javascript
expect({ foo: 0, bar: 1, baz: 2, qux: 3 },
       'to have values satisfying', function (value, index) {
    expect(value, 'to be a number');
});

expect({ foo: 0, bar: 1, baz: 2, qux: 3 },
       'to have values satisfying',
       'to be a number');
```

In case of a failing expectation you get the following output:

```javascript
expect({ foo: [0, 1, 2], bar: [4, 5, 6], baz: [7, 8, 9] },
       'to have values satisfying',
       'to have items satisfying',
       expect.it('to be a number').and('to be below', 8));
```

```output
expected object to have values satisfying
to have items satisfying expect.it('to be a number')
        .and('to be below', 8)

{
  foo: [ 0, 1, 2 ],
  bar: [ 4, 5, 6 ],
  baz: [
    7,
    8, // ✓ should be a number and
       // ⨯ should be below 8
    9 // ✓ should be a number and
      // ⨯ should be below 8
  ]
}
```
