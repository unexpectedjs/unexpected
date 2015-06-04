Asserts that the function throws an error, or returns a promise that
is rejected.

```javascript
function willBeRejected() {
    return expect.promise(function (resolve, reject) {
        reject(new Error('The reject message'));
    });
}
function willThrow() {
    throw new Error('The error message');
}
expect(willBeRejected, 'to error');
expect(willThrow, 'to error');
```

In case of a failing expectation you get the following output:

```javascript
function willNotBeRejected() {
    return expect.promise(function (resolve, reject) {
        resolve('Hello world');
    });
}
expect(willNotBeRejected, 'to error');
```
```output
expected
function willNotBeRejected() {
    return expect.promise(function (resolve, reject) {
        resolve('Hello world');
    });
}
to error
```

You can assert the error message is a given string if you provide a
string as the second parameter.

```javascript
expect(willBeRejected, 'to error', 'The reject message');
```

```javascript
expect(willBeRejected, 'to error', 'The error message');
```

```output
expected
function willBeRejected() {
    return expect.promise(function (resolve, reject) {
        reject(new Error('The reject message'));
    });
}
to error 'The error message'
  expected Error('The reject message') to satisfy 'The error message'

  -The reject message
  +The error message
```

By providing a regular expression as the second parameter you can
assert the error message matches the given regular expression.

```javascript
expect(willBeRejected, 'to error', /reject message/);
```

In case of a failing expectation you get the following output:

```javascript
expect(willBeRejected, 'to error', /error message/);
```

```output
expected
function willBeRejected() {
    return expect.promise(function (resolve, reject) {
        reject(new Error('The reject message'));
    });
}
to error /error message/
  expected Error('The reject message') to satisfy /error message/
```

You can also negate the check, and verify that the function will not
error out. When negating the assertion, you cannot provide a message.

```javascript
expect(willNotBeRejected, 'not to error');
```

In case of a failing expectation you get the following output:

```javascript
expect(willBeRejected, 'not to error');
```
```output
expected
function willBeRejected() {
    return expect.promise(function (resolve, reject) {
        reject(new Error('The reject message'));
    });
}
not to error
  errored with: Error('The reject message')
```
