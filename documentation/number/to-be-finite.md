Asserts that a value is finite.

<!-- evaluate -->
```javascript
expect(123, 'to be finite');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(Infinity, 'to be finite');
```

```
expected Infinity to be finite
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect(Infinity, 'not to be finite');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(123, 'not to be finite');
```

```
expected 123 not to be finite
```
<!-- /evaluate -->
