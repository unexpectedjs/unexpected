Asserts that all keys of a map satisfies a given function.

Aliases: `to be an object whose properties satisfy`, `to be a hash whose keys satisfy`.

```javascript
expect({ foo: 0, bar: 1, baz: 2, qux: 3 },
       'to be a map whose keys satisfy', function (key, value) {
    expect(key, 'to match', /^[a-z]{3}$/);
});

expect({ foo: 0, bar: 1, baz: 2, qux: 3 },
       'to be a map whose keys satisfy',
       'to match', /^[a-z]{3}$/);

expect(['foo', 'bar', 'baz', 'qux'],
       'to be a non-empty hash whose keys satisfy',
       'to match', /^\d+$/);
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

You can use the `non-empty` flag to assert that the object is
non-empty.

```
expect(['foo', 'bar', 'baz', 'qux'],
       'to be a non-empty object whose properties satisfy',
       'to match', /^\d+$/);
```
