Asserts that the function throws an instance of a specific constructor.

```javascript
function willThrow() {
  throw new SyntaxError('The error message');
}
expect(willThrow, 'to throw a', SyntaxError);
```

In case of a failing expectation you get the following output:

```javascript
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

```javascript
function willNotThrow() {}

expect(willNotThrow, 'to throw a', RangeError);
```

```output
expected function willNotThrow() {} to throw a RangeError
```
