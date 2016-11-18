Asserts that a promise is fulfilled with a specific value:

```javascript#async:true
var promiseThatWillBeFulfilledWithAValue = expect.promise(function (resolve, reject) {
    setTimeout(function () {
        resolve('abc');
    }, 1);
});

return expect(promiseThatWillBeFulfilledWithAValue, 'to be fulfilled with', 'abc');
```

The expected value will be matched against the value with
[to satisfy](/assertions/any/to-satisfy/) semantics, so you can pass any of the
values supported by `to satisfy`:

```javascript#async:true
return expect(expect.promise.resolve('abc'), 'to be fulfilled with', /b/);
```

You get a nice diff if the assertion fails:

```javascript#async:true
return expect(expect.promise.resolve('abc'), 'to be fulfilled with', 'def');
```

```output
expected Promise (fulfilled) => 'abc' to be fulfilled with 'def'
  expected 'abc' to equal 'def'

  -abc
  +def
```
