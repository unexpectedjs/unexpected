Asserts that a node.js-style asynchronous function taking a single callback
will call it.

<!-- unexpected-markdown async:true -->

```js
function mySuccessfulAsyncFunction(cb) {
  setTimeout(function () {
    cb();
  });
}

return expect(mySuccessfulAsyncFunction, 'to call the callback');
```

If the callback is never called, it will hang until your test framework marks
it as timed out. So the assertion itself only ever fails if the function
throws an exception synchronously:

<!-- unexpected-markdown async:true -->

```js
function errorOut(cb) {
  throw new Error('ugh');
}
return expect(errorOut, 'to call the callback');
```

```output
ugh
```

The assertion will pass even if the function passes an error to the callback.
If you want that case to fail, look into the
[to call the callback without error](../to-call-the-callback-without-error/)
assertion.

If you want the parameters passed to the callback to be the subject of further assertions,
you might be able to use the
[when passed as parameters to](../../array-like/when-passed-as-parameters-to/) assertion.

The parameters passed to the callback are also provided as the value of the returned promise,
so you can do further assertions like this:

```js
function asyncFn(cb) {
  setTimeout(function () {
    cb(null, 'foo');
  });
}
```

<!-- unexpected-markdown async:true -->

```js
return expect(asyncFn, 'to call the callback').then(function (args) {
  // args will be [null, 'foo'];
});
```

Or using the Bluebird-specific `.spread` extension:

<!-- unexpected-markdown async:true -->

```js
return expect(asyncFn, 'to call the callback').spread(function (err, result) {
  expect(err, 'to be null');
  expect(result, 'to equal', 'foo');
});
```
