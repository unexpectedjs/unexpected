Asserts that the value is _falsy_.

```js
expect(0, 'to be falsy');
expect(false, 'to be falsy');
expect('', 'to be falsy');
expect(undefined, 'to be falsy');
expect(null, 'to be falsy');
```

In case of a failing expectation you get the following output:

```js
expect({}, 'to be falsy');
```

```output
expected {} to be falsy
```

This assertion can be negated using the `not` flag:

```js
expect(1, 'not to be falsy');
expect(true, 'not to be falsy');
expect({}, 'not to be falsy');
expect('foo', 'not to be falsy');
expect(/foo/, 'not to be falsy');
```

In case of a failing expectation you get the following output:

```js
expect('', 'not to be falsy');
```

```output
expected '' not to be falsy
```
