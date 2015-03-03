Asserts that the number is positive.

```javascript
expect(42, 'to be positive');
```

In case of a failing expectation you get the following output:

```javascript
expect(0, 'to be positive');
```

```output
expected 0 to be positive
```

This assertion can be negated using the `not` flag:

```javascript
expect(0, 'not to be positive');
expect(-42, 'not to be positive');
```

In case of a failing expectation you get the following output:

```javascript
expect(1, 'not to be positive');
```

```output
expected 1 not to be positive
```
