Asserts that a number is greater than another number using the `>`
operator.


```javascript
expect(3, 'to be greater than', 2);
expect(1, 'to be above', 0);
expect(4, 'to be >', 3);
expect(4, '>', 3);
```

In case of a failing expectation you get the following output:

```javascript
expect(2, 'to be greater than', 2);
```

```output
expected 2 to be greater than 2
```

This assertion can be negated using the `not` flag:

```javascript
expect(2, 'not to be greater than', 2);
expect(0, 'not to be above', 1);
expect(3, 'not to be >', 4);
```

In case of a failing expectation you get the following output:

```javascript
expect(3, 'not to be greater than', 2);
```

```output
expected 3 not to be greater than 2
```
