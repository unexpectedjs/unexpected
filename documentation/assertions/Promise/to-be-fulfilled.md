Asserts that a promise is fulfilled.

```javascript#async:true
var promiseThatWillBeFulfilled = expect.promise(function (resolve, reject) {
    setTimeout(resolve, 1);
});

return expect(promiseThatWillBeFulfilled, 'to be fulfilled');
```

If the promise is rejected, the assertion will fail with the following output:

```javascript#async:true
var rejectedPromise = expect.promise(function (resolve, reject) {
    setTimeout(function () {
        reject(new Error('argh'));
    }, 1);
});

return expect(rejectedPromise, 'to be fulfilled');
```

```output
expected Promise (rejected) => Error('argh') to be fulfilled
  Promise (rejected) => Error('argh') unexpectedly rejected with Error('argh')
```

You can assert the promise is fulfilled with a specific value by
passing a second parameter:

```javascript
var promiseThatWillBeFulfilledWithAValue = expect.promise(function (resolve, reject) {
    setTimeout(function () {
        resolve('abc');
    }, 1);
});
```

```javascript#async:true
return expect(promiseThatWillBeFulfilledWithAValue, 'to be fulfilled with', 'abc');
```

The expected value will be matched against the value with
[to satisfy](/assertions/any/to-satisfy/) semantics, so you can also pass a string,
a regular expression, a function, or an object:


```javascript#async:true
return expect(promiseThatWillBeFulfilledWithAValue, 'to be fulfilled with', /b/);
```

You get a nice diff if the assertion fails:

```javascript#async:true
return expect(promiseThatWillBeFulfilledWithAValue, 'to be fulfilled with', 'def');
```

```output
expected Promise (fulfilled) => 'abc' to be fulfilled with 'def'
  expected 'abc' to equal 'def'

  -abc
  +def
```
