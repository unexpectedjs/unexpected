Asserts that a number is greater than or equal to another number using
the `>=` operator.

```js
expect(3, 'to be greater than or equal to', 3);
```

In case of a failing expectation you get the following output:

```js
expect(1, 'to be greater than or equal to', 2);
```

```output
expected 1 to be greater than or equal to 2
```

This assertion can be negated using the `not` flag:

```js
expect(1, 'not to be greater than or equal to', 2);
```

In case of a failing expectation you get the following output:

```js
expect(2, 'not to be greater than or equal to', 2);
```

```output
expected 2 not to be greater than or equal to 2
```
