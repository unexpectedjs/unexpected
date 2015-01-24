Asserts that the function takes the given number of arguments.

<!-- evaluate -->
```javascript
expect(Math.max, 'to have arity', 2);
expect('wat'.substring, 'to have arity', 2);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(function wat(foo, bar) {
  return foo + bar;
}, 'to have arity', 3);
```

```
expected
function wat(foo, bar) {
  return foo + bar;
}
to have arity 3
```
<!-- /evaluate -->
