Asserts that the number is negative.

<!-- evaluate -->
```javascript
expect(-42, 'to be negative');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(0, 'to be negative');
```

```
expected 0 to be negative
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect(0, 'not to be negative');
expect(42, 'not to be negative');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(-1, 'not to be negative');
```

```
expected -1 not to be negative
```
<!-- /evaluate -->
