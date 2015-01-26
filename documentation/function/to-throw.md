Asserts that the function throws an error when called.

<!-- evaluate -->
```javascript
function willThrow() {
  throw new Error('The error message');
}
expect(willThrow, 'to throw');
expect(willThrow, 'to throw error');
expect(willThrow, 'to throw exception');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(function willNotThrow() {}, 'to throw');
```

```
expected function willNotThrow() {} to throw
```
<!-- /evaluate -->

You can assert the error message is a given string if you provide a
string as the second parameter.

<!-- evaluate -->
```javascript
expect(function () {
  throw new Error('The error message');
}, 'to throw', 'The error message');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(function () {
  throw new Error('The error message!');
}, 'to throw', 'The error message');
```

```
expected
function () {
  throw new Error('The error message!');
}
to throw 'The error message'
  expected 'The error message!' to equal 'The error message'

  -The error message!
  +The error message
```
<!-- /evaluate -->

By providing a regular expression as the second parameter you can
assert the error message matches the given regular expression.

<!-- evaluate -->
```javascript
expect(function () {
  throw new Error('The error message');
}, 'to throw', /error message/);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(function () {
  throw new Error('The error message!');
}, 'to throw', /catastrophic failure/);
```

```
expected
function () {
  throw new Error('The error message!');
}
to throw /catastrophic failure/
  expected 'The error message!' to match /catastrophic failure/
```
<!-- /evaluate -->

You can also provide a function as the second parameter to do
arbitrary assertions on the error.

<!-- evaluate -->
```javascript
expect(function () {
  this.foo.bar();
}, 'to throw', function (e) {
  expect(e, 'to be a', TypeError);
});
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(function () {
  throw new Error('Another error');
}, 'to throw', function (e) {
  expect(e, 'to be a', TypeError);
});
```

```
expected Error({ message: 'Another error' }) to be a TypeError
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect(function () {
  // Do some work that should not throw
}, 'not to throw');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(function () {
  throw new Error('threw anyway');
}, 'not to throw');
```

```
expected
function () {
  throw new Error('threw anyway');
}
not to throw
  threw: Error({ message: 'threw anyway' })
```
<!-- /evaluate -->

You can also use the `not` flag in combination with matching the error
message.

<!-- evaluate -->
```javascript
expect(function () {
  throw new Error('The correct error message');
}, 'not to throw', /great success/);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(function () {
  throw new Error('The correct error message');
}, 'not to throw', /error/);
```

```
expected
function () {
  throw new Error('The correct error message');
}
not to throw /error/
  expected 'The correct error message' not to match /error/

  The correct error message
```
<!-- /evaluate -->
