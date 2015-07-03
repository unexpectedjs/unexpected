Asserts that an Error instance has a given message:

By default the assertion tests on the text representation of the
error, but you can change that behaviour by providing the `ansi` or
`html` flag.

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

You can use the `ansi` and `html` the following way:

```js#evaluate:false
expect(err, 'to have ansi message', 'foobar');
expect(err, 'to have html message', 'foobar');
```
