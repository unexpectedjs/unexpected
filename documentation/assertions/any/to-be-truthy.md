Asserts that the value is _truthy_.

```js
expect(1, 'to be truthy');
expect(true, 'to be truthy');
expect({}, 'to be truthy');
expect('foo', 'to be truthy');
expect(/foo/, 'to be truthy');
```

In case of a failing expectation you get the following output:

```js
expect('', 'to be truthy');
```

```output
expected '' to be truthy
```

This assertion can be negated using the `not` flag:

```js
expect(0, 'not to be truthy');
expect(false, 'not to be truthy');
expect('', 'not to be truthy');
expect(undefined, 'not to be truthy');
expect(null, 'not to be truthy');
```

In case of a failing expectation you get the following output:

```js
expect({}, 'not to be truthy');
```

```output
expected {} not to be truthy
```
