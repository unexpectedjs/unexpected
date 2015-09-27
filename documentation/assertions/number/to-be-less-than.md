Asserts that a number is less than another number using the `<`
operator.


```javascript
expect(2, 'to be less than', 3);
expect(0, 'to be below', 1);
```

In case of a failing expectation you get the following output:

```javascript
expect(2, 'to be less than', 2);
```

```output
expected 2 to be less than 2
```

This assertion can be negated using the `not` flag:

```javascript
expect(2, 'not to be less than', 2);
expect(1, 'not to be below', 0);
```

In case of a failing expectation you get the following output:

```javascript
expect(2, 'not to be less than', 3);
```

```output
expected 2 not to be less than 3
```
