Asserts that the function takes the given number of arguments.

```javascript
expect(Math.max, 'to have arity', 2);
expect('wat'.substring, 'to have arity', 2);
```

In case of a failing expectation you get the following output:

```javascript
expect(function wat(foo, bar) {
  return foo + bar;
}, 'to have arity', 3);
```

```output
expected
function wat(foo, bar) {
  return foo + bar;
}
to have arity 3
```
