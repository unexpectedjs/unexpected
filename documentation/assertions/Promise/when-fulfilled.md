Wait for a promise to be fulfilled, then delegate the value to another assertion.

```javascript
var fulfilledPromise = expect.promise(function (resolve, reject) {
    setTimeout(function () {
        resolve(123);
    });
});
```

```javascript#async:true
return expect(fulfilledPromise, 'when fulfilled', 'to equal', 123);
```

It works with any assertion or `expect.it` construct:

```javascript#async:true
return expect(fulfilledPromise, 'when fulfilled', expect.it('to be greater than', 100));
```

If the response is rejected, the assertion fails with the following output:

```javascript#async:true
var rejectedPromise = expect.promise(function (resolve, reject) {
    setTimeout(function () {
        reject(new Error('argh'));
    });
});

return expect(rejectedPromise, 'when fulfilled', 'to equal', 123);
```

```output
expected Promise (rejected) => Error('argh') when fulfilled to equal 123
  Promise (rejected) => Error('argh') unexpectedly rejected with Error('argh')
```
