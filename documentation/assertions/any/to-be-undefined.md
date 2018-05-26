Asserts that the value is `undefined`.

```js
expect(undefined, 'to be undefined');
```

In case of a failing expectation you get the following output:

```js
expect('Hello world', 'to be undefined');
```

```output
expected 'Hello world' to be undefined
```

This assertion can be negated using the `not` flag:

```js
expect('Hello world!', 'not to be undefined');
expect({ foo: { bar: 'baz' } }, 'not to be undefined');
```

In case of a failing expectation you get the following output:

```js
expect(undefined, 'not to be undefined');
```

```output
expected undefined not to be undefined
```
