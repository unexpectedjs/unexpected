Asserts that a number is greater than another number using the `>`
operator.


<!-- evaluate -->
```javascript
expect(3, 'to be greater than', 2);
expect(1, 'to be above', 0);
expect(4, 'to be >', 3);
expect(4, '>', 3);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(2, 'to be greater than', 2);
```

```
expected 2 to be greater than 2
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect(2, 'not to be greater than', 2);
expect(0, 'not to be above', 1);
expect(3, 'not to be >', 4);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(3, 'not to be greater than', 2);
```

```
expected 3 not to be greater than 2
```
<!-- /evaluate -->
