Asserts that a node.js-style asynchronous function taking a single callback
will call it without passing a truthy value as the first parameter.

```js#async:true
function mySuccessfulAsyncFunction(cb) {
  setTimeout(cb, 0);
}

return expect(mySuccessfulAsyncFunction, 'to call the callback without error');
```

In case of a failing expectation you get the following output:

```js#async:true
function myFailingAsyncFunction(cb) {
  setTimeout(function() {
    cb(new Error('Oh dear'));
  }, 0);
}

return expect(myFailingAsyncFunction, 'to call the callback without error');
```

```output
expected
function myFailingAsyncFunction(cb) {
  setTimeout(function () {
    cb(new Error('Oh dear'));
  }, 0);
}
to call the callback without error
  called the callback with: Error('Oh dear')
```

The parameters passed to the callback (excluding the falsy error) are also
provided as the value of the returned promise, so you can do further
assertions like this:

```js#async:true
function asyncFn(cb) {
  cb(null, 123, 456);
}

return expect(asyncFn, 'to call the callback without error').then(function(
  args
) {
  // args will be [123, 456];
});
```

Or using the Bluebird-specific `.spread` extension:

```js#async:true
return expect(asyncFn, 'to call the callback without error').spread(function(
  result1,
  result2
) {
  // result1 will be 123
  // result2 will be 456
});
```
