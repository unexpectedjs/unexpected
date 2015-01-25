Asserts all items of an array satisfies a given function.

<!-- evaluate -->
```javascript
expect([0, 1, 2, 3, 4], 'to be an array whose items satisfy', function (item, index) {
    expect(item, 'to be a number');
});

expect([0, 1, 2, 3, 4], 'to be an array whose items satisfy', 'to be a number');

expect([[1], [2]], 'to be an array whose items satisfy',
       'to be an array whose items satisfy', 'to be a number');

expect([[], []], 'to be a non-empty array whose items satisfy', function (item) {
    expect(item, 'to be an empty array');
});

expect([1, 2, 3, 4], 'to be an array whose items satisfy',
  expect.it('to be a number').and('to be positive'));
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect([ [0, 1, 2], [4, '5', '6'], [7, '8', 9] ],
  'to be an array whose items satisfy',
  'to be an array whose items satisfy',
  'to be a number');
```

```
failed expectation in [ [ 0, 1, 2 ], [ 4, '5', '6' ], [ 7, '8', 9 ] ]:
  1: failed expectation in [ 4, '5', '6' ]:
       1: expected '5' to be a number
       2: expected '6' to be a number
  2: failed expectation in [ 7, '8', 9 ]:
       1: expected '8' to be a number
```
<!-- /evaluate -->

Here a another example:

<!-- evaluate -->
```javascript
expect([0, 1, 2, 3, 4], 'to be an array whose items satisfy',
  expect.it('to be a number').and('to be positive'));
```

```
failed expectation in [ 0, 1, 2, 3, 4 ]:
  0: ✓ expected 0 to be a number and
     ⨯ expected 0 to be positive
```
<!-- /evaluate -->
