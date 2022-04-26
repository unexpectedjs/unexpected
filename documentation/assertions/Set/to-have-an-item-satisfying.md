Asserts that at least one item contained in a Set satisfies a given value, function or other assertion.

```js
expect(new Set([1, 2, 3]), 'to have an item satisfying', 4);
```

```output
expected new Set([ 1, 2, 3 ]) to have an item satisfying 4

new Set([
  1, // should equal 4
  2, // should equal 4
  3 // should equal 4
])
```

In order to check a property holds for at least one item, an assertion can be
passed as the argument – in this example we assert that one of the items in
the set is a number:

```js
expect(
  new Set(['a', false, []]),
  'to have an item satisfying',
  'to be a number'
);
```

```output
expected new Set([ 'a', false, [] ]) to have an item satisfying to be a number

new Set([
  'a', // should be a number
  false, // should be a number
  [] // should be a number
])
```
