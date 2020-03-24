Asserts that a promise is fulfilled with a specific value:

<!-- unexpected-markdown async:true -->

```js
var promiseThatWillBeFulfilledWithAValue = new Promise(function (
  resolve,
  reject
) {
  setTimeout(function () {
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
[to satisfy](../../any/to-satisfy/) semantics, so you can pass any of the
values supported by `to satisfy`:

<!-- unexpected-markdown async:true -->

```js
return expect(Promise.resolve('abc'), 'to be fulfilled with', /b/);
```

You get a nice diff if the assertion fails:

<!-- unexpected-markdown async:true -->

```js
return expect(Promise.resolve('abc'), 'to be fulfilled with', 'def');
```

```output
expected Promise to be fulfilled with 'def'
  expected 'abc' to equal 'def'

  -abc
  +def
```
