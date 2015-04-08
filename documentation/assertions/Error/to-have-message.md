Asserts that an Error instance has a given message:

```javascript
expect(new Error('foobar'), 'to have message', 'foobar');
```

In case of a failing expectation you get the following output:

```javascript
expect(new Error('foobar'), 'to have message', 'barfoo');
```

```output
expected Error({ message: 'foobar' }) to have message 'barfoo'
  expected 'foobar' to satisfy 'barfoo'

  -foobar
  +barfoo
```
