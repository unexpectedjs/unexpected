Asserts that the number is negative.

```js
expect(-42, 'to be negative');
```

In case of a failing expectation you get the following output:

```js
expect(0, 'to be negative');
```

```output
expected 0 to be negative
```

This assertion can be negated using the `not` flag:

```js
expect(0, 'not to be negative');
expect(42, 'not to be negative');
```

In case of a failing expectation you get the following output:

```js
expect(-1, 'not to be negative');
```

```output
expected -1 not to be negative
```
