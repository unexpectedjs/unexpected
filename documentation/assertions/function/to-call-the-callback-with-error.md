Asserts that a node.js-style asynchronous function taking a single callback
will call it with a truthy value as the first parameter.

```javascript
function myFailingAsyncFunction(cb) {
    setImmediate(function () {
        cb(new Error('Oh dear'));
    });
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
    setImmediate(function () {
        cb(new Error('Oh dear'));
    });
}
to call the callback with error Error('foo')
  expected Error('Oh dear') to satisfy Error('foo')

  Error({
    message: 'Oh dear' // should equal 'foo'
                       // -Oh dear
                       // +foo
  })
```
