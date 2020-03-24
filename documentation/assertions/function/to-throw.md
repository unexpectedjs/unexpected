Asserts that the function throws an error when called.

```js
function somethingThatThrows() {
  throw new Error('The error message');
}

expect(function () {
  somethingThatThrows();
}, 'to throw');
```

In case of a failing expectation you get the following output:

```js
function willNotThrow() {
  // ...
}

expect(function () {
  willNotThrow();
}, 'to throw');
```

```output
expected function () { willNotThrow(); } to throw
  did not throw
```

Used with arrow functions this assertion is very elegant, and there
are a couple of functionally equaivalent aliases provided to allow
test suites using it be more explicit.

```js
expect(() => somethingThatThrows(), 'to throw');

// aliases
expect(() => somethingThatThrows(), 'to throw error');
expect(() => somethingThatThrows(), 'to throw exception');
```

If you provide a string as the second parameter, it will be used to
assert the thrown error has that message.

```js
expect(
  function () {
    throw new Error('The error message');
  },
  'to throw',
  'The error message'
);
```

In case of a failing expectation you get the following output:

```js
expect(
  function () {
    throw new Error('The error message!');
  },
  'to throw',
  'The error message'
);
```

```output
expected
function () {
  throw new Error('The error message!');
}
to throw 'The error message'
  expected Error('The error message!') to satisfy 'The error message'

  -The error message!
  +The error message
```

By providing a regular expression as the second parameter you can
assert the error message matches the given regular expression.

```js
expect(
  function () {
    throw new Error('The error message');
  },
  'to throw',
  /error message/
);
```

In case of a failing expectation you get the following output:

```js
expect(
  function () {
    throw new Error('The error message!');
  },
  'to throw',
  /catastrophic failure/
);
```

```output
expected
function () {
  throw new Error('The error message!');
}
to throw /catastrophic failure/
  expected Error('The error message!') to satisfy /catastrophic failure/
```

That can also just supply an error object to validate against:

```js
expect(
  function () {
    throw new TypeError('Invalid syntax');
  },
  'to throw',
  new TypeError('Invalid syntax')
);
```

In case of a failing expectation you get the following output:

```js
expect(
  function () {
    throw new Error('Another error');
  },
  'to throw',
  new TypeError('Invalid syntax')
);
```

```output
expected
function () {
  throw new Error('Another error');
}
to throw TypeError('Invalid syntax')
  expected Error('Another error') to satisfy TypeError('Invalid syntax')
```

```js
expect(function () {
  // Do some work that should not throw
}, 'not to throw');
```

In case of a failing expectation you get the following output:

```js
expect(function () {
  throw new Error('threw anyway');
}, 'not to throw');
```

```output
expected
function () {
  throw new Error('threw anyway');
}
not to throw
  threw: Error('threw anyway')
```

The thrown error is provided as the fulfillment value of
the returned promise, so you can do further assertions like this:

<!-- unexpected-markdown async:true -->

```js
return expect(somethingThatThrows, 'to throw').then(function (err) {
  expect(err, 'to have message', /\bmessage/);
});
```

To test functions that require input wrap the function invocation in an anonymous function:

```js
function willThrow(input) {
  if (input) throw new SyntaxError('The error message');
  return input;
}
expect(
  function () {
    willThrow('input.here');
  },
  'to throw',
  new SyntaxError('The error message')
);
```
