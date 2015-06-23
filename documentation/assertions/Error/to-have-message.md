Asserts that an Error instance has a given message:

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
