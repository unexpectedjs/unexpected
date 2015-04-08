Apply a function to the subject array, then delegate the return value to another assertion.

```javascript
function add(a, b) {
    return a + b;
}

expect([1, 2], 'when passed as parameters to', add, 'to equal', 3);
```

In case of a failing expectation you get the following output:

```javascript
expect([1, 2], 'when passed as parameters to', add, 'to equal', 9);
```

```output
expected [ 1, 2 ] when passed as parameters to
function add(a, b) {
    return a + b;
} to equal 9
  expected 3 to equal 9
```
