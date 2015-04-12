Apply a function to the subject array (or array-like object), then delegate the return value to another assertion.

```js
function add(a, b) {
    return a + b;
}

expect([1, 2], 'when passed as parameters to', add, 'to equal', 3);
```

In case of a failing expectation you get the following output:

```js
expect([1, 2], 'when passed as parameters to', add, 'to equal', 9);
```

```output
expected [ 1, 2 ] when passed as parameters to
function add(a, b) {
    return a + b;
} to equal 9
  expected 3 to equal 9
```

To call an node-style async function, use the `async` flag to automatically
add a callback to the parameter list and do further assertions on the value it
passes to the callback.

```javascript#async:true
function delayedAdd(a, b, cb) {
    setTimeout(function () {
        cb(null, a + b);
    }, 1);
}

return expect([1, 2], 'when passed as parameters to async', delayedAdd, 'to equal', 3);
```

The assertion will fail if the async function passes an error to the callback.

You can also use the `constructor` flag to create an instance of a constructor
function (using the `new` operator):

```javascript
function Foo(value) {
    this.value = value;
}

expect(123, 'when passed as parameter to constructor', Foo, 'to be a', Foo);
```