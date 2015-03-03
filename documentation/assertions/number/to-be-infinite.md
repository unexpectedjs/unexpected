Asserts that a number is infinite.

```javascript
expect(Infinity, 'to be infinite');
expect(-Infinity, 'to be infinite');
```

In case of a failing expectation you get the following output:

```javascript
expect(123, 'to be infinite');
```

```output
expected 123 to be infinite
```

This assertion can be negated using the `not` flag:

```javascript
expect(123, 'not to be infinite');
```

In case of a failing expectation you get the following output:

```javascript
expect(Infinity, 'not to be infinite');
```

```output
expected Infinity not to be infinite
```
