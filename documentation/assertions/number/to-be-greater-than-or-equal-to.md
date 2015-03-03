Asserts that a number is greater than or equal to another number using
the `>=` operator.


```javascript
expect(3, 'to be greater than or equal to', 3);
expect(4, 'to be >=', 3);
expect(4, '>=', 4);
```

In case of a failing expectation you get the following output:

```javascript
expect(1, 'to be greater than or equal to', 2);
```

```output
expected 1 to be greater than or equal to 2
```

This assertion can be negated using the `not` flag:

```javascript
expect(1, 'not to be greater than or equal to', 2);
expect(3, 'not to be >=', 4);
```

In case of a failing expectation you get the following output:

```javascript
expect(2, 'not to be greater than or equal to', 2);
```

```output
expected 2 not to be greater than or equal to 2
```
