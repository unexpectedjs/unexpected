Asserts that a number is finite.

```js
expect(123, 'to be finite');
```

In case of a failing expectation you get the following output:

```js
expect(Infinity, 'to be finite');
```

```output
expected Infinity to be finite
```

This assertion can be negated using the `not` flag:

```js
expect(Infinity, 'not to be finite');
expect(-Infinity, 'not to be finite');
```

In case of a failing expectation you get the following output:

```js
expect(123, 'not to be finite');
```

```output
expected 123 not to be finite
```
