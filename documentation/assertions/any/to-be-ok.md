Asserts that the value is _truthy_.

Alias for [to be truthy](/assertions/any/to-be-truthy).

<!-- evaluate -->
```javascript
expect(1, 'to be ok');
expect(true, 'to be ok');
expect({}, 'to be ok');
expect('foo', 'to be ok');
expect(/foo/, 'to be ok');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('', 'to be ok');
```

```
expected '' to be ok
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect(0, 'not to be ok');
expect(false, 'not to be ok');
expect('', 'not to be ok');
expect(undefined, 'not to be ok');
expect(null, 'not to be ok');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect({}, 'not to be ok');
```

```
expected {} not to be ok
```
<!-- /evaluate -->
