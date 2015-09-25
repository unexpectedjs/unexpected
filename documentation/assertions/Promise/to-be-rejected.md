Asserts that a promise is rejected.

```javascript#async:true
var promiseThatWillBeRejected = expect.promise(function (resolve, reject) {
    setTimeout(reject, 1);
});

return expect(promiseThatWillBeRejected, 'to be rejected');
```

If the promise is fulfilled, the assertion will fail with the following output:

```javascript#async:true
var fulfilledPromise = expect.promise(function (resolve, reject) {
    setTimeout(resolve, 1);
});

return expect(fulfilledPromise, 'to be rejected');
```

```output
expected Promise (fulfilled) to be rejected
  Promise (fulfilled) unexpectedly fulfilled
```

You can assert the promise is rejected with a specific reason (error) by
passing a second parameter:

```javascript
var promiseThatWillBeRejectedWithAReason = expect.promise(function (resolve, reject) {
    setTimeout(function () {
        reject(new Error('Oh dear'));
    }, 10);
});
```

```javascript#async:true
return expect(promiseThatWillBeRejectedWithAReason, 'to be rejected with', new Error('Oh dear'));
```

The expected reason will be matched against the rejection reason with
[to satisfy](/assertions/any/to-satisfy/) semantics, so you can also pass a string,
a regular expression, a function, or an object:


```javascript#async:true
return expect(promiseThatWillBeRejectedWithAReason, 'to be rejected with', /dear/);
```

You get a nice diff if the assertion fails:

```javascript#async:true
return expect(promiseThatWillBeRejectedWithAReason, 'to be rejected with', new Error('bugger'));
```

```output
expected Promise (rejected) => Error('Oh dear') to be rejected with Error('bugger')
  expected Error('Oh dear') to satisfy Error('bugger')

  Error({
    message: 'Oh dear' // should equal 'bugger'
                       // -Oh dear
                       // +bugger
  })
```
