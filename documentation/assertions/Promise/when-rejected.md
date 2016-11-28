Wait for a promise to be rejected, then delegate the reason to another assertion.

```javascript#async:true
var rejectedPromise = new Promise(function (resolve, reject) {
    setTimeout(function () {
        reject(new Error('argh'));
    }, 1);
});

return expect(rejectedPromise, 'when rejected', 'to equal', new Error('argh'));
```

It works with any assertion or `expect.it` construct:

```javascript#async:true
return expect(Promise.reject(new Error('argh')), 'when rejected', expect.it('to have message', 'argh'));
```

If the response is fulfilled, the assertion fails with the following output:

```javascript#async:true
return expect(Promise.resolve(123), 'when rejected', 'to have message', 'argh');
```

```output
expected Promise (fulfilled) => 123 when rejected to have message 'argh'
  Promise (fulfilled) => 123 unexpectedly fulfilled with 123
```
