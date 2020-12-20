Asserts that a Set has a certain size.

```js
expect(new Set([1, 2, 3]), 'to have size', 3);
```

In the case of a failing expectation you get the following output:

```js
expect(new Set([1, 2, 3]), 'to have size', 4);
```

```output
expected new Set([ 1, 2, 3 ]) to have size 4
```

The assertion can be negated using the `not` flag:

```js
expect(new Set([1, 2, 3]), 'not to have size', 4);
```

And with a failing expectation:

```js
expect(new Set([1, 2, 3]), 'not to have size', 3);
```

```output
expected new Set([ 1, 2, 3 ]) not to have size 3
```
