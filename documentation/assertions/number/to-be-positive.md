Asserts that the number is positive.

<!-- evaluate -->
```javascript
expect(42, 'to be positive');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(0, 'to be positive');
```

```
expected 0 to be positive
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect(0, 'not to be positive');
expect(-42, 'not to be positive');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(1, 'not to be positive');
```

```
expected 1 not to be positive
```
<!-- /evaluate -->
