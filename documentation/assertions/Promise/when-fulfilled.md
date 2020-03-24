Wait for a promise to be fulfilled, then delegate the value to another assertion.

<!-- unexpected-markdown async:true -->

```js
var fulfilledPromise = new Promise(function (resolve, reject) {
  setTimeout(function () {
    resolve(123);
  }, 1);
});

return expect(fulfilledPromise, 'when fulfilled', 'to equal', 123);
```

It works with any assertion or `expect.it` construct:

<!-- unexpected-markdown async:true -->

```js
return expect(
  Promise.resolve(123),
  'when fulfilled',
  expect.it('to be greater than', 100)
);
```

If the response is rejected, the assertion fails with the following output:

<!-- unexpected-markdown async:true -->

```js
var rejectedPromise = new Promise(function (resolve, reject) {
  setTimeout(function () {
    reject(new Error('argh'));
  }, 1);
});

return expect(rejectedPromise, 'when fulfilled', 'to equal', 123);
```

```output
expected Promise when fulfilled to equal 123
  Promise unexpectedly rejected with Error('argh')
```
