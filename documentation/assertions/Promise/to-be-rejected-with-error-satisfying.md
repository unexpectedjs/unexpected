You can assert the promise is rejected with a specific reason (error) by
passing a second parameter:

```javascript#async:true
var promiseThatWillBeRejectedWithAReason = expect.promise(function (resolve, reject) {
    setTimeout(function () {
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
[to satisfy](/assertions/any/to-satisfy/) semantics, so you can also pass a string,
a regular expression, a function, or an object:


```javascript#async:true
var promiseThatWillBeRejectedWithAReason = expect.promise(function (resolve, reject) {
    setTimeout(function () {
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

```javascript#async:true
var promiseThatWillBeRejectedWithAReason = expect.promise(function (resolve, reject) {
    setTimeout(function () {
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
expected Promise (rejected) => Error('Oh dear')
to be rejected with error satisfying Error('bugger')
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

```javascript#async:true
var error = new Error('Oh dear');
error.data = { foo: 'bar' };
return expect(
    expect.promise.reject(error),
    'to be rejected with error exhaustively satisfying',
    new Error('Oh dear')
);
```

```output
expected Promise (rejected) => Error({ message: 'Oh dear', data: { foo: 'bar' } })
to be rejected with error exhaustively satisfying Error('Oh dear')
  expected Error({ message: 'Oh dear', data: { foo: 'bar' } })
  to exhaustively satisfy Error('Oh dear')

  Error({
    message: 'Oh dear',
    data: { foo: 'bar' } // should be removed
  })
```
