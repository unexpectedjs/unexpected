Asserts that an array (or array-like object) has the specified length.

```javascript
expect([1,2,3], 'to have length', 3);
```

In case of a failing expectation you get the following output:

```javascript
expect([1,2,3], 'to have length', 4);
```

```output
expected [ 1, 2, 3 ] to have length 4
  expected 3 to be 4
```

This assertion can be negated using the `not` flag:

```javascript
expect([1,2,3], 'not to have length', 4);
```

In case of a failing expectation you get the following output:

```javascript
expect([1,2,3], 'not to have length', 3);
```

```output
expected [ 1, 2, 3 ] not to have length 3
```
