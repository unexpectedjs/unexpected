Asserts that the subject equals one of the given items

```js
expect(true, 'to be one of', [true, false]);
expect(1, 'to be one of', [0, 1, 2]);
```

Aliases are provided for common types:

In case of a failing expectation you get the following output:

```js
expect(42, 'to be one of', [0, 1]);
```

```output
expected 42 to be one of [ 0, 1 ]
```

This assertion can be negated using the `not` flag:

```js
expect(true, 'not to be one of', [1, 2]);
```
