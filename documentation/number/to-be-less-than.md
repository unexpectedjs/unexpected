Asserts that a number is less than another number using the `<`
operator.


<!-- evaluate -->
```javascript
expect(2, 'to be less than', 3);
expect(0, 'to be below', 1);
expect(3, 'to be <', 4);
expect(3, '<', 4);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(2, 'to be less than', 2);
```

```
expected 2 to be less than 2
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect(2, 'not to be less than', 2);
expect(1, 'not to be below', 0);
expect(4, 'not to be <', 3);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(2, 'not to be less than', 3);
```

```
expected 2 not to be less than 3
```
<!-- /evaluate -->
