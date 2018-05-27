Asserts that the value is `null`.

```js
expect(null, 'to be null');
```

In case of a failing expectation you get the following output:

```js
expect({ foo: { bar: 'baz' } }, 'to be null');
```

```output
expected { foo: { bar: 'baz' } } to be null
```

This assertion can be negated using the `not` flag:

```js
expect({ foo: { bar: 'baz' } }, 'not to be null');
expect('Hello world!', 'not to be null');
```

In case of a failing expectation you get the following output:

```js
expect(null, 'not to be null');
```

```output
expected null not to be null
```
