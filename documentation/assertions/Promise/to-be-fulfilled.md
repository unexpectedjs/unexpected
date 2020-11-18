Asserts that a promise is fulfilled.

<!-- unexpected-markdown async:true -->

```js
const promiseThatWillBeFulfilled = new Promise(function (resolve, reject) {
  setTimeout(resolve, 1);
});

return expect(promiseThatWillBeFulfilled, 'to be fulfilled');
```

If the promise is rejected, the assertion will fail with the following output:

<!-- unexpected-markdown async:true -->

```js
const rejectedPromise = new Promise(function (resolve, reject) {
  setTimeout(function () {
    reject(new Error('argh'));
  }, 1);
});

return expect(rejectedPromise, 'to be fulfilled');
```

```output
expected Promise to be fulfilled
  Promise unexpectedly rejected with Error('argh')
```
