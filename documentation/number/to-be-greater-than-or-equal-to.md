Asserts that a number is greater than or equal to another number using
the `>=` operator.


<!-- evaluate -->
```javascript
expect(3, 'to be greater than or equal to', 3);
expect(4, 'to be >=', 3);
expect(4, '>=', 4);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(1, 'to be greater than or equal to', 2);
```

```
expected 1 to be greater than or equal to 2
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect(1, 'not to be greater than or equal to', 2);
expect(3, 'not to be >=', 4);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(2, 'not to be greater than or equal to', 2);
```

```
expected 2 not to be greater than or equal to 2
```
<!-- /evaluate -->
