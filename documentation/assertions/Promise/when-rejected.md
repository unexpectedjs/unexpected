Wait for a promise to be rejected, then delegate the reason to another assertion.

<!-- async:true -->
```js
var rejectedPromise = new Promise(function(resolve, reject) {
  setTimeout(function() {
    reject(new Error('argh'));
  }, 1);
});

return expect(rejectedPromise, 'when rejected', 'to equal', new Error('argh'));
```

It works with any assertion or `expect.it` construct:

<!-- async:true -->
```js
return expect(
  Promise.reject(new Error('argh')),
  'when rejected',
  expect.it('to have message', 'argh')
);
```

If the response is fulfilled, the assertion fails with the following output:

<!-- async:true -->
```js
return expect(Promise.resolve(123), 'when rejected', 'to have message', 'argh');
```

```output
expected Promise when rejected to have message 'argh'
  Promise unexpectedly fulfilled with 123
```
