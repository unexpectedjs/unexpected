Asserts presence of a property.

```javascript
expect([1, 2], 'to have property', 'length');
expect({ a: 'b' }, 'to have property', 'a');
expect({ a: 'b' }, 'to have property', 'toString');
```

You can provide a second parameter to assert the value of the property.

```javascript
expect([1, 2], 'to have property', 'length', 2);
expect({ a: 'b' }, 'to have property', 'a', 'b');
expect({ a: { b: 'c' } }, 'to have property', 'a', { b: 'c' });
```

Using the `own` flag, you can assert presence of an own property.

```javascript
expect({ a: 'b' }, 'to have own property', 'a');
expect({ a: 'b' }, 'to have own property', 'a', 'b');
```

In case of a failing expectation you get the following output:

```javascript
expect(Object.create({ a: 'b' }), 'to have own property', 'a');
```

```output
expected {} to have own property 'a'
```

This assertion can be negated using the `not` flag:

```javascript
expect({ a: 'b' }, 'not to have property', 'b');
expect(Object.create({ a: 'b' }), 'not to have own property', 'a');
```
