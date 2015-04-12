Asserts that all items of an array (or array-like object) satisfy a given assertion or function.

Alias: `to be an array whose items satisfy`.

Notice this assertion fails when given an empty array.

```javascript
expect([0, 1, 2, 3, 4], 'to have items satisfying', function (item, index) {
    expect(item, 'to be a number');
});

expect([0, 1, 2, 3, 4], 'to have items satisfying', 'to be a number');

expect([[1], [2]], 'to have items satisfying',
       'to have items satisfying', 'to be a number');

expect([1, 2, 3, 4], 'to have items satisfying',
  expect.it('to be a number').and('to be positive'));
```

In case of a failing expectation you get the following output:

```javascript
expect([ [0, 1, 2], [4, '5', '6'], [7, '8', 9] ],
  'to have items satisfying',
  'to have items satisfying',
  'to be a number');
```

```output
failed expectation in [ [ 0, 1, 2 ], [ 4, '5', '6' ], [ 7, '8', 9 ] ]:
  1: failed expectation in [ 4, '5', '6' ]:
       1: expected '5' to be a number
       2: expected '6' to be a number
  2: failed expectation in [ 7, '8', 9 ]:
       1: expected '8' to be a number
```

Here a another example:

```javascript
expect([0, 1, 2, 3, 4], 'to have items satisfying',
  expect.it('to be a number').and('to be positive'));
```

```output
failed expectation in [ 0, 1, 2, 3, 4 ]:
  0: ✓ expected 0 to be a number and
     ⨯ expected 0 to be positive
```
