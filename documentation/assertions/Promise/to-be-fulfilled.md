Asserts that a promise is fulfilled.

```javascript#async:true
var promiseThatWillBeFulfilled = new Promise(function (resolve, reject) {
    setTimeout(resolve, 1);
});

return expect(promiseThatWillBeFulfilled, 'to be fulfilled');
```

If the promise is rejected, the assertion will fail with the following output:

```javascript#async:true
var rejectedPromise = new Promise(function (resolve, reject) {
    setTimeout(function () {
        reject(new Error('argh'));
    }, 1);
});

return expect(rejectedPromise, 'to be fulfilled');
```

```output
expected Promise (rejected) => Error('argh') to be fulfilled
  Promise (rejected) => Error('argh') unexpectedly rejected with Error('argh')
```
