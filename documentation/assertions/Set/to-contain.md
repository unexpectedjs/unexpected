Asserts that a Set instance contains a given element.

```js
expect(new Set([1, 2, 3]), 'to contain', 3);
```

You get a diff when the assertion fails:

```js
expect(new Set([1, 2, 3]), 'to contain', 4);
```

```output
expected new Set([ 1, 2, 3 ]) to contain 4

new Set([
  1,
  2,
  3
  // missing 4
])
```

The assertion can be negated using the `not` flag:

```js
expect(new Set([1, 2, 3]), 'not to contain', 4);
```

```js
expect(new Set([1, 2, 3]), 'not to contain', 3);
```

```output
expected new Set([ 1, 2, 3 ]) not to contain 3

new Set([
  1,
  2,
  3 // should be removed
])
```
