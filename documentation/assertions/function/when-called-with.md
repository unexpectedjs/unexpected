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
expected function add(a, b) { return a + b; } when called with [ 1, 2 ] to equal 9
  expected 3 to equal 9
```

If you don't provide an assertion to delegate to, the return value will be provided
as the fulfillment value of the promise:

```js
return expect(add, 'called with', [1, 2]).then(function (result) {
    expect(result, 'to equal', 3);
});
```
