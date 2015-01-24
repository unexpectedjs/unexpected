Asserts that a number is less than or equal to another number using
the `<=` operator.


<!-- evaluate -->
```javascript
expect(3, 'to be less than or equal to', 3);
expect(3, 'to be <=', 4);
expect(4, '<=', 4);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(2, 'to be less than or equal to', 1);
```

```
expected 2 to be less than or equal to 1
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect(2, 'not to be less than or equal to', 1);
expect(4, 'not to be <=', 3);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(2, 'not to be less than or equal to', 2);
```

```
expected 2 not to be less than or equal to 2
```
<!-- /evaluate -->
