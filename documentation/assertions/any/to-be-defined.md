Asserts that the value is defined.

```javascript
expect('Hello world!', 'to be defined');
expect({ foo: { bar: 'baz' } }, 'to be defined');
```

In case of a failing expectation you get the following output:

```javascript
expect(undefined, 'to be defined');
```

```output
expected undefined to be defined
```
