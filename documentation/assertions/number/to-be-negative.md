Asserts that the number is negative.

```javascript
expect(-42, 'to be negative');
```

In case of a failing expectation you get the following output:

```javascript
expect(0, 'to be negative');
```

```output
expected 0 to be negative
```

This assertion can be negated using the `not` flag:

```javascript
expect(0, 'not to be negative');
expect(42, 'not to be negative');
```

In case of a failing expectation you get the following output:

```javascript
expect(-1, 'not to be negative');
```

```output
expected -1 not to be negative
```
