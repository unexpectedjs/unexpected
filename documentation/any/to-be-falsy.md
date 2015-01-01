Asserts that the value is _falsy_.

<!-- evaluate -->
```javascript
expect(0, 'to be falsy');
expect(false, 'to be falsy');
expect('', 'to be falsy');
expect(undefined, 'to be falsy');
expect(null, 'to be falsy');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect({}, 'to be falsy');
```

```
expected {} to be falsy
```
<!-- /evaluate -->

The assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect(1, 'not to be falsy');
expect(true, 'not to be falsy');
expect({}, 'not to be falsy');
expect('foo', 'not to be falsy');
expect(/foo/, 'not to be falsy');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('', 'not to be falsy');
```

```
expected '' not to be falsy
```
<!-- /evaluate -->
