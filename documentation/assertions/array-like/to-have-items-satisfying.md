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
expected array to have items satisfying 'to have items satisfying', 'to be a number'

[
  [...],
  [
    4,
    '5', // should be a number
    '6' // should be a number
  ],
  [
    7,
    '8', // should be a number
    9
  ]
]
```

Here a another example:

```javascript
expect([0, 1, 2, 3, 4], 'to have items satisfying',
  expect.it('to be a number').and('to be positive'));
```

```output
expected [ 0, 1, 2, 3, 4 ] to have items satisfying
expect.it('to be a number')
        .and('to be positive')

[
  0, // ✓ expected 0 to be a number and
     // ⨯ expected 0 to be positive
  1,
  2,
  3,
  4
]
```
