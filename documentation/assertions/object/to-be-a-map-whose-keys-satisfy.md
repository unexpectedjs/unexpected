Asserts that all keys of a map satisfies a given function.

Notice this assertion fails when given an empty object.

Aliases: `to be an object whose properties satisfy`, `to be a hash whose keys satisfy`.

```javascript
expect({ foo: 0, bar: 1, baz: 2, qux: 3 },
       'to be a map whose keys satisfy', function (key, value) {
    expect(key, 'to match', /^[a-z]{3}$/);
});

expect({ foo: 0, bar: 1, baz: 2, qux: 3 },
       'to be a map whose keys satisfy',
       'to match', /^[a-z]{3}$/);
```

In case of a failing expectation you get the following output:

```javascript
expect({ foo: 0, bar: 1, baz: 2, qux: 3, quux: 4 },
       'to be a map whose keys satisfy',
       'to match', /^[a-z]{3}$/);
```

```output
failed expectation on keys foo, bar, baz, qux, quux:
  quux: expected 'quux' to match /^[a-z]{3}$/
```
