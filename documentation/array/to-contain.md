Asserts an array contains one or more items.

<!-- evaluate -->
```javascript
expect([0, 1, 2], 'to contain', 1);
expect([ { name: 'John Doe' }, { name: 'Jane Doe' } ], 'to contain', { name: 'Jane Doe' });
expect([1, 2], 'to contain', 0, 2);
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect([ { name: 'John Doe' }, { name: 'Jane Doe' } ], 'to contain', { name: 'Jonnie Doe' });
```


```
expected [ { name: 'John Doe' }, { name: 'Jane Doe' } ] to contain { name: 'Jonnie Doe' }
```
<!-- /evaluate -->

This assertion can be negated using the `not` flag:

<!-- evaluate -->
```javascript
expect([ { name: 'John Doe' }, { name: 'Jane Doe' } ], 'not to contain', { name: 'Jonnie Doe' });
```
<!-- /evaluate -->

In case of a failing expectation you get the following output:

<!-- evaluate -->
```javascript
expect([ { name: 'John Doe' }, { name: 'Jane Doe' } ], 'not to contain', { name: 'Jane Doe' });
```

```
expected [ { name: 'John Doe' }, { name: 'Jane Doe' } ] not to contain { name: 'Jane Doe' }

[
  { name: 'John Doe' },
  { name: 'Jane Doe' } // should be removed
]
```
<!-- /evaluate -->
