Asserts that a string is within a range of strings.

<!-- evaluate -->
```javascript
expect('a', 'to be within', 'a', 'd');
expect('b', 'to be within', 'a', 'd');
expect('aabbcc', 'to be within', 'aaa', 'aaz');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('abbbcc', 'to be within', 'aaa', 'aaz');
```

```
expected 'abbbcc' to be within 'aaa'..'aaz'
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect('bar', 'not to be within', 'foo', 'baz');
expect('e', 'not to be within', 'a', 'd');
expect('abbbcc', 'not to be within', 'aaa', 'aaz');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('c', 'not to be within', 'a', 'd');
```

```
expected 'c' not to be within 'a'..'d'
```
<!-- /evaluate -->
