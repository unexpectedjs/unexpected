Asserts that the function throws an instance of a specific constructor.

```js
function willThrow() {
  throw new SyntaxError('The error message');
}
expect(willThrow, 'to throw a', SyntaxError);
```

In case of a failing expectation you get the following output:

```js
expect(willThrow, 'to throw a', RangeError);
```

```output
expected
function willThrow() {
  throw new SyntaxError('The error message');
}
to throw a RangeError
  expected SyntaxError('The error message') to be a RangeError
```

The assertion also fails if the function doesn't throw at all:

```js
function willNotThrow() {}

expect(willNotThrow, 'to throw a', RangeError);
```

```output
expected function willNotThrow() {} to throw a RangeError
  expected function willNotThrow() {} to throw
    did not throw
```

To test functions that require input wrap the function invocation in an anonymous function:

```js
function willThrow(input) {
  if (input) throw new SyntaxError('The error message');
  return input;
}
expect(
  function() {
    willThrow('input.here');
  },
  'to throw a',
  SyntaxError
);
```
