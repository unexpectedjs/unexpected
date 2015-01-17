Asserts that a number is infinite.

<!-- evaluate -->
```javascript
expect(Infinity, 'to be infinite');
expect(-Infinity, 'to be infinite');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(123, 'to be infinite');
```

```
expected 123 to be infinite
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect(123, 'not to be infinite');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(Infinity, 'not to be infinite');
```

```
expected Infinity not to be infinite
```
<!-- /evaluate -->
