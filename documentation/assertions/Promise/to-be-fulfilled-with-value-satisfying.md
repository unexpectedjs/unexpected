Asserts that a promise is fulfilled with a specific value:

```js#async:true
var promiseThatWillBeFulfilledWithAValue = new Promise(function(
  resolve,
  reject
) {
  setTimeout(function() {
    resolve({
      foo: 'bar'
    });
  }, 1);
});

return expect(
  promiseThatWillBeFulfilledWithAValue,
  'to be fulfilled with value satisfying',
  { foo: 'bar' }
);
```

The expected value will be matched against the value with
[to satisfy](../../any/to-satisfy/) semantics, so you can pass any of the
values supported by `to satisfy`:

```js#async:true
return expect(
  Promise.resolve('abc'),
  'to be fulfilled with value satisfying',
  /b/
);
```

You get a nice diff if the assertion fails:

```js#async:true
return expect(
  Promise.resolve('abc'),
  'to be fulfilled with value satisfying',
  'def'
);
```

```output
expected Promise to be fulfilled with value satisfying 'def'
  expected 'abc' to equal 'def'

  -abc
  +def
```

You can use the `exhaustively` flag to use strict
[to satisfy](../../any/to-satisfy/) semantics:

```js#async:true
return expect(
  Promise.resolve({
    foo: 'foo',
    bar: 'bar'
  }),
  'to be fulfilled with value exhaustively satisfying',
  {
    foo: 'foo'
  }
);
```

```output
expected Promise to be fulfilled with value exhaustively satisfying { foo: 'foo' }
  expected { foo: 'foo', bar: 'bar' } to exhaustively satisfy { foo: 'foo' }

  {
    foo: 'foo',
    bar: 'bar' // should be removed
  }
```
