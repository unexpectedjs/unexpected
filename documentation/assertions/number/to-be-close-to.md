Asserts that the difference between two numbers is less than a given epsilon.
Epsilon defaults to `1e-9` if omitted.

```javascript
expect(1.5, 'to be close to', 1.500001, 1e-5);
expect(1.5, 'to be close to', 1.5000000001)
```

In case of a failing expectation you get the following output:

```javascript
expect(1.5, 'to be close to', 1.50001, 1e-5);
```

```output
expected 1.5 to be close to 1.50001 (epsilon: 1e-5)
```

This assertion can be negated using the `not` flag:

```javascript
expect(1.5, 'not to be close to', 1.499, 1e-4);
```

In case of a failing expectation you get the following output:

```javascript
expect(1.5, 'not to be close to', 1.5000000001)
```

```output
expected 1.5 not to be close to 1.5000000001 (epsilon: 1e-9)
```
