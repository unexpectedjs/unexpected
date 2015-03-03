Asserts that the value is _truthy_.

Alias for [to be truthy](../to-be-truthy).

```javascript
expect(1, 'to be ok');
expect(true, 'to be ok');
expect({}, 'to be ok');
expect('foo', 'to be ok');
expect(/foo/, 'to be ok');
```

In case of a failing expectation you get the following output:

```javascript
expect('', 'to be ok');
```

```output
expected '' to be ok
```

This assertion can be negated using the `not` flag:

```javascript
expect(0, 'not to be ok');
expect(false, 'not to be ok');
expect('', 'not to be ok');
expect(undefined, 'not to be ok');
expect(null, 'not to be ok');
```

In case of a failing expectation you get the following output:

```javascript
expect({}, 'not to be ok');
```

```output
expected {} not to be ok
```
