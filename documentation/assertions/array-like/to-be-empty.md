Asserts that an array (or array-like object) is empty.

Aliases: `to be the empty array`, `to be an empty array`

```js
expect([], 'to be empty');
```

In case of a failing expectation you get the following output:

```js
expect([1, 2, 3], 'to be empty');
```

```output
expected [ 1, 2, 3 ] to be empty
```

This assertion can be negated using the `not` flag:

```js
expect([1, 2, 3], 'not to be empty');
```

In case of a failing expectation you get the following output:

```js
expect([], 'not to be empty');
```

```output
expected [] not to be empty
```
