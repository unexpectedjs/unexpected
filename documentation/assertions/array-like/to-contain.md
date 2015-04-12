Asserts an array (or array-like object) contains one or more items.

```javascript
expect([0, 1, 2], 'to contain', 1);
expect([ { name: 'John Doe' }, { name: 'Jane Doe' } ], 'to contain', { name: 'Jane Doe' });
expect([0, 1, 2], 'to contain', 0, 2);
```

In case of a failing expectation you get the following output:

```javascript
expect([ { name: 'John Doe' }, { name: 'Jane Doe' } ], 'to contain', { name: 'Jonnie Doe' });
```


```output
expected [ { name: 'John Doe' }, { name: 'Jane Doe' } ] to contain { name: 'Jonnie Doe' }
```

This assertion can be negated using the `not` flag:

```javascript
expect([ { name: 'John Doe' }, { name: 'Jane Doe' } ], 'not to contain', { name: 'Jonnie Doe' });
```

In case of a failing expectation you get the following output:

```javascript
expect([ { name: 'John Doe' }, { name: 'Jane Doe' } ], 'not to contain', { name: 'Jane Doe' });
```

```output
expected [ { name: 'John Doe' }, { name: 'Jane Doe' } ] not to contain { name: 'Jane Doe' }

[
  { name: 'John Doe' },
  { name: 'Jane Doe' } // should be removed
]
```
