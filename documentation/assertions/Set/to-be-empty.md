Asserts that a Set is empty.

```js
expect(new Set(), 'to be empty');
```

In the case of a failing expectation you get the following output:

```js
expect(new Set([1, 2, 3]), 'to be empty');
```

```output
expected new Set([ 1, 2, 3 ]) to be empty
```

The assertion can be negated using the `not` flag:

```js
expect(new Set([1, 2, 3]), 'not to be empty');
```

And with a failing expectation:

```js
expect(new Set(), 'not to be empty');
```

```output
expected new Set([]) not to be empty
```
