Asserts that a node.js-style asynchronous function taking a single callback
will call it.

```javascript#async:true
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

```javascript#async:true
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
[to call the callback without](/assertions/function/to-call-the-callback-without-error/)
assertion.

If you want the parameters passed to the callback to be the subject of further assertions,
you might be able to use the
[when passed as parameters to](/assertions/array/when-passed-as-parameters-to/) assertion.

