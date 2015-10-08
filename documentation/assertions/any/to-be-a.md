Asserts that the subject is an instance of a given type.

This assertion makes use of the type system in Unexpected. That means
you can assert that a value is an instance of a type specified by
its name (as a string).

For more information abort the type system see: [Types](/api/addType/)

```javascript
expect(true, 'to be a', 'boolean');
expect(5, 'to be a', 'number');
expect('abc', 'to be a', 'string');
expect(expect, 'to be a', 'function');
expect({foo: 123}, 'to be an', 'object');
expect([123], 'to be an', 'array');
expect(/regex/, 'to be a', 'regexp');
expect(/regex/, 'to be a', 'regex');
expect(/regex/, 'to be a', 'regular expression');
expect(new Error(), 'to be an', 'Error');
```

The assertions also respect the inheritance chain:

```javascript
expect(/foo/, 'to be an', 'object');
expect(/foo/, 'to be an', 'any');
```

Aliases are provided for common types:

```javascript
expect(true, 'to be a boolean');
expect(5, 'to be a number');
expect('abc', 'to be a string');
expect(expect, 'to be a function');
expect({foo: 123}, 'to be an object');
expect([123], 'to be an array');
expect(/regex/, 'to be a regexp');
expect(/regex/, 'to be a regex');
expect(/regex/, 'to be a regular expression');
```

If you provide a constructor as the type the assertion will use `instanceof`.

```javascript
function Person(name) {
    this.name = name;
}
expect(new Person('John Doe'), 'to be a', Person);
expect(new Person('John Doe'), 'to be an', Object);
```

In case of a failing expectation you get the following output:

```javascript
expect({ 0: 'foo', 1: 'bar', 2: 'baz' }, 'to be an array');
```

```output
expected { 0: 'foo', 1: 'bar', 2: 'baz' } to be an array
```


This assertion can be negated using the `not` flag:

```javascript
expect(true, 'not to be an object');
expect('5', 'not to be a', 'number');
expect('abc', 'not to be an', Object);
```

In case of a failing expectation you get the following output:

```javascript
expect(function () { return 'wat'; }, 'not to be an', Object);
```

```output
expected function () { return 'wat'; } not to be an Object
```
