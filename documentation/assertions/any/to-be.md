Asserts `===` equality.

<!-- evaluate -->
```javascript
var obj = {};
expect(obj, 'to be', obj);
expect(1, 'to be', 1);
expect(null, 'to be', null);
expect(undefined, 'to be', obj.foo);
expect(true, 'to be', !false);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('1', 'to be', 1);
```

```
expected '1' to be 1
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect({}, 'not to be', {});
expect(1, 'not to be', true);
expect('1', 'not to be', 1);
expect(null, 'not to be', undefined);
expect(0, 'not to be', 'null');
expect(undefined, 'not to be', 'null');
expect(false, 'not to be', 'true');
expect(true, 'not to be', 'false');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(1, 'not to be', 1);
```

```
expected 1 not to be 1
```
<!-- /evaluate -->
