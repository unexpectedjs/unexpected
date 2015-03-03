Asserts the presence of a key.

Alias for [to be have keys](../to-have-keys).

```javascript
expect({ a: 'a', b: 'b', c: 'c' }, 'to have key', 'a');
```

Using the `only` flag you can assert that the object only have the
specified key.

```javascript
expect({ a: 'a' }, 'to only have key', 'a');
```

In case of a failing expectation you get the following output:

```javascript
expect({ a: 'a', b: 'b' }, 'to have key', 'c');
```

```output
expected { a: 'a', b: 'b' } to have key 'c'
```

This assertion can be negated using the `not` flag:

```javascript
expect({ a: 'a', b: 'b' }, 'not to have key', 'c');
expect(Object.create({ a: 'a', b: 'b' }), 'not to have key', 'a');
```

Using the `only` flag you can assert that the object not only have the
specified key.

```javascript
expect({ a: 'a', b: 'b' }, 'to not only have key', 'a');
```

In case of a failing expectation you get the following output:

```javascript
expect({ a: 'a', b: 'b' }, 'to not have key', 'a');
```

```output
expected { a: 'a', b: 'b' } to not have key 'a'
```
