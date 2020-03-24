Call the subject function without arguments, then delegate the return value to another assertion.

```js
function giveMeFive() {
  return 5;
}

expect(giveMeFive, 'when called', 'to equal', 5);
```

In case of a failing expectation you get the following output:

```js
expect(giveMeFive, 'when called', 'to equal', 7);
```

```output
expected function giveMeFive() { return 5; } when called to equal 7
  expected 5 to equal 7
```

If you don't provide an assertion to delegate to, the return value will be provided
as the fulfillment value of the promise:

<!-- unexpected-markdown async:true -->

```js
return expect(giveMeFive, 'called').then(function (result) {
  expect(result, 'to equal', 5);
});
```

When this assertion in used together with [to satisfy](../../any/to-satisfy/)
we make sure that `this` is bound correctly:

```js
function Person(name) {
  this.name = name;
}

Person.prototype.toString = function () {
  return this.name;
};

expect(new Person('John Doe'), 'to satisfy', {
  toString: expect.it('when called to equal', 'John Doe'),
});
```
