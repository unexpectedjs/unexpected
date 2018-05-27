Asserts that a number is less than or equal to another number using
the `<=` operator.

```js
expect(3, 'to be less than or equal to', 3);
```

In case of a failing expectation you get the following output:

```js
expect(2, 'to be less than or equal to', 1);
```

```output
expected 2 to be less than or equal to 1
```

This assertion can be negated using the `not` flag:

```js
expect(2, 'not to be less than or equal to', 1);
```

In case of a failing expectation you get the following output:

```js
expect(2, 'not to be less than or equal to', 2);
```

```output
expected 2 not to be less than or equal to 2
```
