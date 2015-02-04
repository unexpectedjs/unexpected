Asserts that a number is within a range.

```javascript
expect(0, 'to be within', 0, 4);
expect(1, 'to be within', 0, 4);
expect(2.5, 'to be within', 0, 4);
expect(4, 'to be within', 0, 4);
```

In case of a failing expectation you get the following output:

```javascript
expect(-1, 'to be within', 0, 4);
```

```output
expected -1 to be within 0..4
```

This assertion can be negated using the `not` flag:

```javascript
expect(-1, 'not to be within', 0, 4);
expect(5, 'not to be within', 0, 4);
```

In case of a failing expectation you get the following output:

```javascript
expect(0, 'not to be within', 0, 4);
```

```output
expected 0 not to be within 0..4
```
