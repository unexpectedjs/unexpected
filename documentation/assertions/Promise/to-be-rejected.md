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
