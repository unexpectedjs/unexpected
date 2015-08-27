Asserts that a node.js-style asynchronous function taking a single callback
will call it with a truthy value as the first parameter.

```javascript
function myFailingAsyncFunction(cb) {
    setTimeout(function () {
        cb(new Error('Oh dear'));
    }, 0);
}
```

```javascript#async:true
return expect(myFailingAsyncFunction, 'to call the callback with error');
```

You can assert the error message is a given string if you provide a
string as the second parameter.

```javascript#async:true
return expect(myFailingAsyncFunction, 'to call the callback with error', 'Oh dear');
```

A regular expression, Error instance, or an object will also work, as the
matching uses [to satisfy](/assertions/any/to-satisfy/) semantics:

```javascript#async:true
return expect(myFailingAsyncFunction, 'to call the callback with error', /dear/);
```

In case of a failing expectation you get the following output:

```javascript#async:true
return expect(myFailingAsyncFunction, 'to call the callback with error', new Error('foo'));
```

```output
expected
function myFailingAsyncFunction(cb) {
  setTimeout(function () {
    cb(new Error('Oh dear'));
  }, 0);
}
to call the callback with error Error('foo')
  expected Error('Oh dear') to satisfy Error('foo')

  Error({
    message: 'Oh dear' // should equal 'foo'
                       // -Oh dear
                       // +foo
  })
```

The error passed to the callback is also provided as the fulfillment value of
the returned promise, so you can do further assertions like this:

```javascript
function asyncFn(cb) {
    cb(new Error('yikes'));
}
```

```javascript#async:true
return expect(asyncFn, 'to call the callback with error').then(function (err) {
    // err will be new Error('yikes')
});
```
