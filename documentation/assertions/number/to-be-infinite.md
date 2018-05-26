Asserts that a number is infinite.

```js
expect(Infinity, 'to be infinite');
expect(-Infinity, 'to be infinite');
```

In case of a failing expectation you get the following output:

```js
expect(123, 'to be infinite');
```

```output
expected 123 to be infinite
```

This assertion can be negated using the `not` flag:

```js
expect(123, 'not to be infinite');
```

In case of a failing expectation you get the following output:

```js
expect(Infinity, 'not to be infinite');
```

```output
expected Infinity not to be infinite
```
