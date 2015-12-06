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
  returned promise rejected with: Error('The reject message')
```

You can pass in a function instead of the error message, and do more
assertions on the error.

```javascript#async:true
function willBeRejectedAsync() {
    return expect.promise(function (resolve, reject) {
        setTimeout(function () {
            reject(new Error('async error'));
        }, 1);
    });
}

return expect(willBeRejectedAsync, 'to error', function (e) {
    return expect(e.message, 'to equal', 'async error');
});
```

You can even do async assertions in the function that you pass in.

```javascript#async:true
var errorCount = 0;
function willBeRejectedAsync() {
    return expect.promise(function (resolve, reject) {
        setTimeout(function () {
            var error = new Error('async error');
            errorCount += 1;
            error.errorCount = errorCount;
            reject(error);
        }, 1);
    });
}

return expect(willBeRejectedAsync, 'to error', function (e) {
    return expect(willBeRejectedAsync, 'to error', function (e2) {
        return expect(e2.errorCount, 'to be greater than', e.errorCount);
    });
});
```
