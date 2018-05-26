Asserts that a promise is rejected with a specific reason (error):

```js#async:true
var promiseThatWillBeRejectedWithAReason = new Promise(function(
  resolve,
  reject
) {
  setTimeout(function() {
    reject(new Error('Oh dear'));
  }, 10);
});

return expect(
  promiseThatWillBeRejectedWithAReason,
  'to be rejected with error satisfying',
  new Error('Oh dear')
);
```

The expected reason will be matched against the rejection reason with
[to satisfy](/assertions/any/to-satisfy/) semantics, so you can pass any of the
values supported by `to satisfy`:

```js#async:true
var promiseThatWillBeRejectedWithAReason = new Promise(function(
  resolve,
  reject
) {
  setTimeout(function() {
    reject(new Error('Oh dear'));
  }, 10);
});

return expect(
  promiseThatWillBeRejectedWithAReason,
  'to be rejected with error satisfying',
  /dear/
);
```

You get a nice diff if the assertion fails:

```js#async:true
var promiseThatWillBeRejectedWithAReason = new Promise(function(
  resolve,
  reject
) {
  setTimeout(function() {
    reject(new Error('Oh dear'));
  }, 10);
});

return expect(
  promiseThatWillBeRejectedWithAReason,
  'to be rejected with error satisfying',
  new Error('bugger')
);
```

```output
expected Promise to be rejected with error satisfying Error('bugger')
  expected Error('Oh dear') to satisfy Error('bugger')

  Error({
    message: 'Oh dear' // should equal 'bugger'
                       //
                       // -Oh dear
                       // +bugger
  })
```

You can use the `exhaustively` flag to use strict
[to satisfy](/assertions/any/to-satisfy/) semantics:

```js#async:true
var error = new Error('Oh dear');
error.data = { foo: 'bar' };
return expect(
  Promise.reject(error),
  'to be rejected with error exhaustively satisfying',
  new Error('Oh dear')
);
```

```output
expected Promise to be rejected with error exhaustively satisfying Error('Oh dear')
  expected Error({ message: 'Oh dear', data: { foo: 'bar' } })
  to exhaustively satisfy Error('Oh dear')

  Error({
    message: 'Oh dear',
    data: { foo: 'bar' } // should be removed
  })
```
