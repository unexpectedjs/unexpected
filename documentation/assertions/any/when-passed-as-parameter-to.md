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
expected [ 1 ] when passed as parameters to
function increment(n) {
    return n + 1;
} to equal 3
  expected 2 to equal 3
```

This assertion delegates to the
[when passed as parameters to](/assertions/array/when-passed-as-parameters-to/)
assertion and also supports the `async` and `constructor` flags.
