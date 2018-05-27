Asserts that a string is greater than another string using the `>`
operator.

```js
expect('b', 'to be greater than', 'a');
expect('b', 'to be above', 'a');
```

In case of a failing expectation you get the following output:

```js
expect('a', 'to be greater than', 'a');
```

```output
expected 'a' to be greater than 'a'
```

This assertion can be negated using the `not` flag:

```js
expect('a', 'not to be greater than', 'a');
expect('a', 'not to be above', 'a');
```

In case of a failing expectation you get the following output:

```js
expect('b', 'not to be above', 'a');
```

```output
expected 'b' not to be above 'a'
```
