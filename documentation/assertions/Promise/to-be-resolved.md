Asserts that a promise is resolved.

```javascript#async:true
var promiseThatWillBeResolved = expect.promise(function (resolve, reject) {
    setTimeout(resolve, 1);
});

return expect(promiseThatWillBeResolved, 'to be resolved');
```

If the promise is rejected, the assertion will fail with the following output:

```javascript#async:true
var rejectedPromise = expect.promise(function (resolve, reject) {
    setTimeout(function () {
        reject(new Error('argh'));
    }, 1);
});

return expect(rejectedPromise, 'to be resolved');
```

```output
expected Promise (rejected) to be resolved
```

You can assert the promise is resolved with a specific value by
passing a second parameter:

```javascript
var promiseThatWillBeResolvedWithAValue = expect.promise(function (resolve, reject) {
    setTimeout(function () {
        resolve('abc');
    }, 1);
});
```

```javascript#async:true
return expect(promiseThatWillBeResolvedWithAValue, 'to be resolved with', 'def');
```

The expected value will be matched against the value with
[to satisfy](/assertions/any/to-satisfy/) semantics, so you can also pass a string,
a regular expression, a function, or an object:


```javascript#async:true
return expect(promiseThatWillBeResolvedWithAValue, 'to be resolved with', /b/);
```

You get a nice diff if the assertion fails:

```javascript#async:true
return expect(promiseThatWillBeResolvedWithAValue, 'to be resolved with', 'def');
```

```output
expected Promise (resolved) => 'abc' to be resolved with 'def'
  expected 'abc' to equal 'def'

  -def
  +abc
```
