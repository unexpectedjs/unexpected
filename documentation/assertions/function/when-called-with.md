Apply the subject function to an array of parameters, then delegate the return value to another assertion.

```js
function add(a, b) {
    return a + b;
}

expect(add, 'when called with', [1, 2], 'to equal', 3);
```

In case of a failing expectation you get the following output:

```js
expect(add, 'when called with', [1, 2], 'to equal', 9);
```

```output
expected function add(a, b) { return a + b; } when called with 1, 2 to equal 9
  expected 3 to equal 9
```

If you don't provide an assertion to delegate to, the returned value will be
provided as the fulfillment value of the promise:

```js#async
return expect(add, 'called with', [1, 2]).then(function (result) {
    expect(result, 'to equal', 3);
});
```

When this assertion in used together with [to satisfy](/assertions/any/to-satisfy)
we make sure that `this` is bound correctly:

```js
function Greeter(prefix) {
    this.prefix = prefix;
}

Greeter.prototype.greet = function (name) {
    return this.prefix + name;
};

var helloGreeter = new Greeter('Hello, ')

expect(helloGreeter, 'to satisfy', {
    greet: expect.it(
      'when called with', ['John Doe'],
      'to equal', 'Hello, John Doe'
    )
});
```
