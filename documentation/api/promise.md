### expect.promise(promiseBody)

This method is used inside [addAssertion](/api/addAssertion) to create
a promise from the given body function.

Signature:

```js#evaluate:false
expect.promise(function () { ... });
expect.promise(function (run) { ... });
expect.promise(function (resolve, reject) { ... });
```

When the promise body takes no arguments, the body will be executed.
If the body throws an exception a rejected promise will be returned.
If the body returns a promise that will be returned by the method;
otherwise a resolve promise will be returned. You can use the method
the following way:

```js#evaluate:false
var promises = items.map(function (item) {
  return expect.promise(function () {
    expect(item, 'to be a number');
  });
});
```

When the promise body takes one argument it will be executed and given a
wrapper function that should be used to wrap asynchronous callbacks:

```js#evaluate:false
expect.promise(function (run) {
  backend.loadData(run(function (err, data) {
    expect(err, 'to be falsy');
    expect(data, 'not to equal', {});
  }));
});
```

If an exception is throw from within the `run`-wrapper the created
promise will be rejected with the error.

Notice you can call the run wrapper as many times as you want as long
as it is within the current tick, the promise will wait for all the
wrapper functions to finish before the promise will be rejected or
resolved.

When the promise body takes two arguments, it is just an alias for:

```js#evaluate:false
new Promise(function (resolve, reject) { ... })
```
