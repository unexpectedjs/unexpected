Asserts that a string is less than or equal to another string using
the `<=` operator.


<!-- evaluate -->
```javascript
expect('b', 'to be less than or equal to', 'b');
expect('b', 'to be <=', 'c');
expect('c', '<=', 'c');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('b', 'to be less than or equal to', 'a');
```

```
expected 'b' to be less than or equal to 'a'
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect('b', 'not to be less than or equal to', 'a');
expect('c', 'not to be <=', 'b');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('a', 'not to be less than or equal to', 'a');
```

```
expected 'a' not to be less than or equal to 'a'
```
<!-- /evaluate -->
