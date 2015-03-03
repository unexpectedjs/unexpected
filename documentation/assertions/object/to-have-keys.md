Asserts the presence of a list of keys.

```javascript
expect({ a: 'a', b: 'b', c: 'c' }, 'to have keys', 'a', 'c');
expect({ a: 'a', b: 'b', c: 'c' }, 'to have keys', ['a', 'c']);
```

Using the `only` flag you can assert that the object only have the
specified keys.

```javascript
expect({ a: 'a', b: 'b', c: 'c' }, 'to only have keys', ['a', 'c', 'b']);
```

In case of a failing expectation you get the following output:

```javascript
expect({ a: 'a', b: 'b', c: 'c' }, 'to have keys', 'c', 'd');
```

```output
expected { a: 'a', b: 'b', c: 'c' } to have keys 'c', 'd'
```

This assertion can be negated using the `not` flag:

```javascript
expect({ a: 'a', b: 'b', c: 'c' }, 'not to have keys', 'd', 'e');
expect(Object.create({ a: 'a', b: 'b', c: 'c' }), 'not to have keys', 'a', 'b');
```

Using the `only` flag you can assert that the object not only have the
specified keys.

```javascript
expect({ a: 'a', b: 'b', c: 'c' }, 'to not only have keys', 'a', 'b');
```

In case of a failing expectation you get the following output:

```javascript
expect({ a: 'a', b: 'b', c: 'c' }, 'to not only have keys', 'a', 'b', 'c');
```

```output
expected { a: 'a', b: 'b', c: 'c' } to not only have keys 'a', 'b', 'c'
```
