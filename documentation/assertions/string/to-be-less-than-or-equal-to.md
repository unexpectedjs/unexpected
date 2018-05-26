Asserts that a string is less than or equal to another string using
the `<=` operator.

```js
expect('b', 'to be less than or equal to', 'b');
```

In case of a failing expectation you get the following output:

```js
expect('b', 'to be less than or equal to', 'a');
```

```output
expected 'b' to be less than or equal to 'a'
```

This assertion can be negated using the `not` flag:

```js
expect('b', 'not to be less than or equal to', 'a');
```

In case of a failing expectation you get the following output:

```js
expect('a', 'not to be less than or equal to', 'a');
```

```output
expected 'a' not to be less than or equal to 'a'
```
