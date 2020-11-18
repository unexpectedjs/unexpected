Asserts that a promise is rejected with a specific reason (error):

<!-- unexpected-markdown async:true -->

```js
const promiseThatWillBeRejectedWithAReason = new Promise(function (
  resolve,
  reject
) {
  setTimeout(function () {
    reject(new Error('Oh dear'));
  }, 10);
});

return expect(
  promiseThatWillBeRejectedWithAReason,
  'to be rejected with',
  new Error('Oh dear')
);
```

The expected reason will be matched against the rejection reason with
[to satisfy](../../any/to-satisfy/) semantics, so you can pass any of the
values supported by `to satisfy`:

<!-- unexpected-markdown async:true -->

```js
const promiseThatWillBeRejectedWithAReason = new Promise(function (
  resolve,
  reject
) {
  setTimeout(function () {
    reject(new Error('Oh dear'));
  }, 10);
});

return expect(
  promiseThatWillBeRejectedWithAReason,
  'to be rejected with',
  /dear/
);
```

You get a nice diff if the assertion fails:

<!-- unexpected-markdown async:true -->

```js
const promiseThatWillBeRejectedWithAReason = new Promise(function (
  resolve,
  reject
) {
  setTimeout(function () {
    reject(new Error('Oh dear'));
  }, 10);
});

return expect(
  promiseThatWillBeRejectedWithAReason,
  'to be rejected with',
  new Error('bugger')
);
```

```output
expected Promise to be rejected with Error('bugger')
  expected Error('Oh dear') to satisfy Error('bugger')

  Error({
    message: 'Oh dear' // should equal 'bugger'
                       //
                       // -Oh dear
                       // +bugger
  })
```
