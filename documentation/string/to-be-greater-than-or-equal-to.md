Asserts that a string is greater than or equal to another string using
the `>=` operator.


<!-- evaluate -->
```javascript
expect('b', 'to be greater than or equal to', 'b');
expect('c', 'to be >=', 'b');
expect('c', '>=', 'c');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect(1, 'to be greater than or equal to', 'a');
```

```
expected 1 to be greater than or equal to 'a'
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect('a', 'not to be greater than or equal to', 'b');
expect('b', 'not to be >=', 'c');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('a', 'not to be greater than or equal to', 'a');
```

```
expected 'a' not to be greater than or equal to 'a'
```
<!-- /evaluate -->
