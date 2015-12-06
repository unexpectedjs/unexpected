Wait for a promise to be rejected, then delegate the reason to another assertion.

```javascript
var rejectedPromise = expect.promise(function (resolve, reject) {
    setTimeout(function () {
        reject(new Error('argh'));
    }, 1);
});

return expect(rejectedPromise, 'when rejected', 'to equal', new Error('argh'));
```

It works with any assertion or `expect.it` construct:

```javascript
return expect(expect.promise.reject('argh'), 'when rejected', expect.it('to have message', 'argh'));
```

If the response is fulfilled, the assertion fails with the following output:

```javascript
return expect(expect.promise.resolve(123), 'when rejected', 'to have message', 'argh');
```

```output
expected Promise (fulfilled) => 123 when rejected to have message 'argh'
  Promise (fulfilled) => 123 unexpectedly fulfilled with 123
```
