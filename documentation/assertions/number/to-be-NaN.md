Asserts that the value is `NaN`.

```javascript
expect(NaN, 'to be NaN');
```

In case of a failing expectation you get the following output:

```javascript
expect(2, 'to be NaN');
```

```output
expected 2 to be NaN
```

This assertion can be negated using the `not` flag:

```javascript
expect(2, 'not to be NaN');
```

In case of a failing expectation you get the following output:

```javascript
expect(NaN, 'not to be NaN');
```

```output
expected NaN not to be NaN
```
