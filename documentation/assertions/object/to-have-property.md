Asserts presence of a property.

<!-- evaluate -->
```javascript
expect([1, 2], 'to have property', 'length');
expect({ a: 'b' }, 'to have property', 'a');
expect({ a: 'b' }, 'to have property', 'toString');
```
<!-- /evaluate -->

You can provide a second parameter to assert the value of the property.

<!-- evaluate -->
```javascript
expect([1, 2], 'to have property', 'length', 2);
expect({ a: 'b' }, 'to have property', 'a', 'b');
expect({ a: { b: 'c' } }, 'to have property', 'a', { b: 'c' });
```
<!-- /evaluate -->

Using the `own` flag, you can assert presence of an own property.

<!-- evaluate -->
```javascript
expect({ a: 'b' }, 'to have own property', 'a');
expect({ a: 'b' }, 'to have own property', 'a', 'b');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(Object.create({ a: 'b' }), 'to have own property', 'a');
```

```
expected {} to have own property 'a'
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect({ a: 'b' }, 'not to have property', 'b');
expect(Object.create({ a: 'b' }), 'not to have own property', 'a');
```
<!-- /evaluate -->

You can provide a second parameter to assert that the value of the
property is not equal to the given value.

<!-- evaluate -->
```javascript
expect({ a: 'b' }, 'not to have property', 'a', 'foo');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect({ a: 'b' }, 'not to have property', 'a');
```

```
expected { a: 'b' } not to have property 'a'
```
<!-- /evaluate -->
