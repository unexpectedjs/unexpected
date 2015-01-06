Asserts that the value is `NaN`.

<!-- evaluate -->
```javascript
expect(NaN, 'to be NaN');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(2, 'to be NaN');
```

```
expected 2 to be NaN
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect(2, 'not to be NaN');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(NaN, 'not to be NaN');
```

```
expected NaN not to be NaN
```
<!-- /evaluate -->
