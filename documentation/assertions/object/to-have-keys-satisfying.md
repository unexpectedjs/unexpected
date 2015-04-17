Asserts that all keys of an object satisfy a given assertion or function.

Notice this assertion fails when given an empty object.

Aliases: `to be a map whose keys satisfy`,
`to be an object whose keys satisfy`, `to be a hash whose keys satisfy`.

```javascript
expect({ foo: 0, bar: 1, baz: 2, qux: 3 },
       'to have keys satisfying', function (key, value) {
    expect(key, 'to match', /^[a-z]{3}$/);
});

expect({ foo: 0, bar: 1, baz: 2, qux: 3 },
       'to have keys satisfying',
       'to match', /^[a-z]{3}$/);
```

In case of a failing expectation you get the following output:

```javascript
expect({ foo: 0, bar: 1, baz: 2, qux: 3, quux: 4 },
       'to have keys satisfying',
       'to match', /^[a-z]{3}$/);
```

```output
failed expectation on keys foo, bar, baz, qux, quux:
  quux: expected 'quux' to match /^[a-z]{3}$/
```
