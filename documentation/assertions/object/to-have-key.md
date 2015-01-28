Asserts the presence of a key.

Alias for [to be have keys](/assertions/object/to-have-keys).

<!-- evaluate -->
```javascript
expect({ a: 'a', b: 'b', c: 'c' }, 'to have key', 'a');
```
<!-- /evaluate -->

Using the `only` flag you can assert that the object only have the
specified key.

<!-- evaluate -->
```javascript
expect({ a: 'a' }, 'to only have key', 'a');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect({ a: 'a', b: 'b' }, 'to have key', 'c');
```

```
expected { a: 'a', b: 'b' } to have key 'c'
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect({ a: 'a', b: 'b' }, 'not to have key', 'c');
expect(Object.create({ a: 'a', b: 'b' }), 'not to have key', 'a');
```
<!-- /evaluate -->

Using the `only` flag you can assert that the object not only have the
specified key.

<!-- evaluate -->
```javascript
expect({ a: 'a', b: 'b' }, 'to not only have key', 'a');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect({ a: 'a', b: 'b' }, 'to not have key', 'a');
```

```
expected { a: 'a', b: 'b' } to not have key 'a'
```
<!-- /evaluate -->
