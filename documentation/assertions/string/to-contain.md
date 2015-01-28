Asserts a string contains one or more substrings.

<!-- evaluate -->
```javascript
expect('Hello beautiful world!', 'to contain', 'beautiful');
expect('Hello beautiful world!', 'to contain', 'Hello', 'world');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('Hello world!', 'to contain', 'beautiful');
```

```
expected 'Hello world!' to contain 'beautiful'
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect('Hello world!', 'not to contain', 'beautiful', 'ugly');
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect('Hello beautiful world!', 'not to contain', 'beautiful', 'ugly');
```

```
expected 'Hello beautiful world!' not to contain 'beautiful', 'ugly'

Hello beautiful world!
```
<!-- /evaluate -->
