Asserts that the value is _truthy_.

<!-- evaluate -->
```javascript
expect(1, 'to be truthy');
expect(true, 'to be truthy');
expect({}, 'to be truthy');
expect('foo', 'to be truthy');
expect(/foo/, 'to be truthy');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('', 'to be truthy');
```

```
expected '' to be truthy
```
<!-- /evaluate -->

The assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect(0, 'not to be truthy');
expect(false, 'not to be truthy');
expect('', 'not to be truthy');
expect(undefined, 'not to be truthy');
expect(null, 'not to be truthy');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect({}, 'not to be truthy');
```

```
expected {} not to be truthy
```
<!-- /evaluate -->
