Asserts the items contained by a Set satisfy a particular list of items.

```js
expect(new Set([1, 2, 3]), 'to have items satisfying', [1, { foo: 'bar' }, 3]);
```

```output
expected new Set([ 1, 2, 3 ]) to have items satisfying [ 1, { foo: 'bar' }, 3 ]

new Set([
  1, // should equal [ 1, { foo: 'bar' }, 3 ]
  2, // should equal [ 1, { foo: 'bar' }, 3 ]
  3 // should equal [ 1, { foo: 'bar' }, 3 ]
])
```

In order to check a property holds for all the items, an assertion can be
passed as the argument – in this example we assert that all the items in
the set are numbers:

```js
expect(new Set([1, 2, []]), 'to have items satisfying', 'to be a number');
```

```output
expected new Set([ 1, 2, [] ]) to have items satisfying to be a number

new Set([
  1,
  2,
  [] // should be a number
])
```

The exact number of elements in a Set must always be matched. However, nested
objects are, be default, compared using "satisfy" semantics which allow missing
properties. In order to enforce that all properties are present, the `exhaustively`
flag can be used:

```js
expect(new Set([[{ foo: true, bar: true }], [1]]), 'to have items satisfying', [
  expect.it('to be an object'),
]);
```

```output
expected Set to have items satisfying [ expect.it('to be an object') ]

new Set([
  [ { foo: true, bar: true } ],
  [
    1 // should be an object
  ]
])
```
