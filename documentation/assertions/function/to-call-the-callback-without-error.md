Asserts that a node.js-style asynchronous function taking a single callback
will call it without passing a truthy value as the first parameter.

```javascript#async:true
function mySuccessfulAsyncFunction(cb) {
    setImmediate(cb);
}

return expect(mySuccessfulAsyncFunction, 'to call the callback without error');
```

In case of a failing expectation you get the following output:

```javascript#async:true
function myFailingAsyncFunction(cb) {
    setImmediate(function () {
        cb(new Error('Oh dear'));
    });
}

return expect(myFailingAsyncFunction, 'to call the callback without error');
```

```output
expected
function myFailingAsyncFunction(cb) {
    setImmediate(function () {
        cb(new Error('Oh dear'));
    });
}
to call the callback without error
  called the callback with: Error('Oh dear')
```
