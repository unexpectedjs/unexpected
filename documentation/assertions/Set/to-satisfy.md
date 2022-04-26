Asserts that a Set instance has at least one element satisfying each given
spec.

```js
expect(
  new Set([1, 2, 3]),
  'to satisfy',
  new Set([
    1,
    expect.it('to be less than or equal to', 1),
    expect.it('to be greater than', 10),
  ])
);
```

```output
expected new Set([ 1, 2, 3 ]) to satisfy
new Set([
  1,
  expect.it('to be less than or equal to', 1),
  expect.it('to be greater than', 10)
])

new Set([
  1,
  2, // should be removed
  3 // should be removed
  // missing: should be greater than 10
])
```

The exact number of elements in a Set must always be matched. However, nested
objects are, be default, compared using "satisfy" semantics which allow missing
properties. In order to enforce that all properties are present, the `exhaustively`
flag can be used:

```js
expect(
  new Set([1, { foo: true, bar: false }]),
  'to exhaustively satisfy',
  new Set([1, { foo: true }])
);
```

```output
expected new Set([ 1, { foo: true, bar: false } ])
to exhaustively satisfy new Set([ 1, { foo: true } ])

new Set([
  1,
  { foo: true, bar: false } // should be removed
  // missing { foo: true }
])
```
