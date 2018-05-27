Asserts presence of a property.

```js
expect([1, 2], 'to have property', 'length');
expect({ a: 'b' }, 'to have property', 'a');
expect({ a: 'b' }, 'to have property', 'toString');
```

You can provide a second parameter to assert the value of the property.

```js
expect([1, 2], 'to have property', 'length', 2);
expect({ a: 'b' }, 'to have property', 'a', 'b');
expect({ a: { b: 'c' } }, 'to have property', 'a', { b: 'c' });
```

Using the `own` flag, you can assert presence of an own property.

```js
expect({ a: 'b' }, 'to have own property', 'a');
expect({ a: 'b' }, 'to have own property', 'a', 'b');
```

In case of a failing expectation you get the following output:

```js
expect(Object.create({ a: 'b' }), 'to have own property', 'a');
```

```output
expected {} to have own property 'a'
```

You can assert for property descriptors too.

```js
expect({ a: 'b' }, 'to have enumerable property', 'a');
expect({ a: 'b' }, 'to have configurable property', 'a');
expect({ a: 'b' }, 'to have writable property', 'a');
```

This assertion can be negated using the `not` flag:

```js
expect({ a: 'b' }, 'not to have property', 'b');
expect(Object.create({ a: 'b' }), 'not to have own property', 'a');
```
