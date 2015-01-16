Asserts that an array has the specified length.

<!-- evaluate -->
```javascript
expect([1,2,3], 'to have length', 3);
((function () {
  expect(arguments, 'to have length', 3);
})(1,2,3));
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect([1,2,3], 'to have length', 4);
```

```
expected [ 1, 2, 3 ] to have length 4
  expected 3 to be 4
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect([1,2,3], 'not to have length', 4);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect([1,2,3], 'not to have length', 3);
```

```
expected [ 1, 2, 3 ] not to have length 3
```
<!-- /evaluate -->
