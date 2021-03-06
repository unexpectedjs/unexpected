Asserts that a string is greater than or equal to another string using
the `>=` operator.

```js
expect('b', 'to be greater than or equal to', 'b');
```

In case of a failing expectation you get the following output:

```js
expect('a', 'to be greater than or equal to', 'b');
```

```output
expected 'a' to be greater than or equal to 'b'
```

This assertion can be negated using the `not` flag:

```js
expect('a', 'not to be greater than or equal to', 'b');
```

In case of a failing expectation you get the following output:

```js
expect('a', 'not to be greater than or equal to', 'a');
```

```output
expected 'a' not to be greater than or equal to 'a'
```
