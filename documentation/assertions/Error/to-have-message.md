Asserts that an Error instance the given message.

```javascript
expect(new Error('foobar'), 'to have message', 'foobar');
```

In case of a failing expectation you get the following output:

```javascript
expect(new Error('foobar'), 'to have message', 'barfoo');
```

```output
expected Error('foobar') to have message 'barfoo'
  expected 'foobar' to equal 'barfoo'

  -foobar
  +barfoo
```

The assertion uses `to satisfy` semantics, so you can also provide a regexp:

```javascript
expect(new Error('foobar'), 'to have message', /bar$/);
```
