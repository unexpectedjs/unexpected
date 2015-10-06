Apply a function to the subject, then delegate the return value to another assertion.

```js
function increment(n) {
    return n + 1;
}

expect(1, 'when passed as parameter to', increment, 'to equal', 2);
```

In case of a failing expectation you get the following output:

```js
expect(1, 'when passed as parameter to', increment, 'to equal', 3);
```

```output
expected 1
when passed as parameter to function increment(n) { return n + 1; } to equal 3
  expected 2 to equal 3
```

This assertion delegates to the
[when passed as parameters to](/assertions/array-like/when-passed-as-parameters-to/)
assertion and also supports the `async` and `constructor` flags.

If you don't provide an assertion to delegate to, the return value will be provided
as the fulfillment value of the promise:

```js
return expect(10, 'passed as parameter to', increment).then(function (result) {
    expect(result, 'to equal', 11);
});
```
