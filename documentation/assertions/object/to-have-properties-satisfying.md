Asserts that all properties with defined values satisfy a given assertion.

```js
expect(
  { foo: 0, bar: 1, baz: 2, qux: 3 },
  'to have properties satisfying',
  expect.it(function(key) {
    expect(key, 'to match', /^[a-z]{3}$/);
  })
);

expect(
  { foo: 0, bar: 1, baz: 2, qux: 3 },
  'to have properties satisfying',
  'to match',
  /^[a-z]{3}$/
);
```

In case of a failing expectation you get the following output:

```js
expect(
  { foo: 0, bar: 1, baz: 2, qux: 3, quux: 4 },
  'to have properties satisfying',
  'to match',
  /^[a-z]{3}$/
);
```

```output
expected { foo: 0, bar: 1, baz: 2, qux: 3, quux: 4 }
to have properties satisfying to match /^[a-z]{3}$/

[
  'foo',
  'bar',
  'baz',
  'qux',
  'quux' // should match /^[a-z]{3}$/
]
```
