Asserts that an object is empty.

```javascript
expect({}, 'to be empty');
```

In case of a failing expectation you get the following output:

```javascript
expect({ a: 'a', b: 'b' }, 'to be empty');
```

```output
expected { a: 'a', b: 'b' } to be empty

{
  a: 'a', // should be removed
  b: 'b' // should be removed
}
```

This assertion can be negated using the `not` flag:

```javascript
expect({ a: 'a', b: 'b' }, 'not to be empty');
```

In case of a failing expectation you get the following output:

```javascript
expect({}, 'not to be empty');
```

```output
expected {} not to be empty
```
