Asserts the presence of a list of keys.

<!-- evaluate -->
```javascript
expect({ a: 'a', b: 'b', c: 'c' }, 'to have keys', 'a', 'c');
expect({ a: 'a', b: 'b', c: 'c' }, 'to have keys', ['a', 'c']);
```
<!-- /evaluate -->

Using the `only` flag you can assert that the object only have the
specified keys.

<!-- evaluate -->
```javascript
expect({ a: 'a', b: 'b', c: 'c' }, 'to only have keys', ['a', 'c', 'b']);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect({ a: 'a', b: 'b', c: 'c' }, 'to have keys', 'c', 'd');
```

```
expected { a: 'a', b: 'b', c: 'c' } to have keys 'c', 'd'
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect({ a: 'a', b: 'b', c: 'c' }, 'not to have keys', 'd', 'e');
expect(Object.create({ a: 'a', b: 'b', c: 'c' }), 'not to have keys', 'a', 'b');
```
<!-- /evaluate -->

Using the `only` flag you can assert that the object not only have the
specified keys.

<!-- evaluate -->
```javascript
expect({ a: 'a', b: 'b', c: 'c' }, 'to not only have keys', 'a', 'b');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect({ a: 'a', b: 'b', c: 'c' }, 'to not only have keys', 'a', 'b', 'c');
```

```
expected { a: 'a', b: 'b', c: 'c' } to not only have keys 'a', 'b', 'c'
```
<!-- /evaluate -->
