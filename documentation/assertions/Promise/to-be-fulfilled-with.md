Asserts that a promise is fulfilled with a specific value:

```js#async:true
var promiseThatWillBeFulfilledWithAValue = new Promise(function(
  resolve,
  reject
) {
  setTimeout(function() {
    resolve('abc');
  }, 1);
});

return expect(
  promiseThatWillBeFulfilledWithAValue,
  'to be fulfilled with',
  'abc'
);
```

The expected value will be matched against the value with
[to satisfy](/assertions/any/to-satisfy/) semantics, so you can pass any of the
values supported by `to satisfy`:

```js#async:true
return expect(Promise.resolve('abc'), 'to be fulfilled with', /b/);
```

You get a nice diff if the assertion fails:

```js#async:true
return expect(Promise.resolve('abc'), 'to be fulfilled with', 'def');
```

```output
expected Promise to be fulfilled with 'def'
  expected 'abc' to equal 'def'

  -abc
  +def
```
