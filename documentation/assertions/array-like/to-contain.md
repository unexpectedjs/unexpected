Asserts an array (or array-like object) contains one or more items.

```js
expect([0, 1, 2], 'to contain', 1);
expect([{ name: 'John Doe' }, { name: 'Jane Doe' }], 'to contain', {
  name: 'Jane Doe',
});
expect([0, 1, 2], 'to contain', 0, 2);
```

In case of a failing expectation you get the following output:

```js
expect([{ name: 'John Doe' }, { name: 'Jane Doe' }], 'to contain', {
  name: 'Jonnie Doe',
});
```

```output
expected [ { name: 'John Doe' }, { name: 'Jane Doe' } ]
to contain { name: 'Jonnie Doe' }
```

This assertion can be negated using the `not` flag:

```js
expect([{ name: 'John Doe' }, { name: 'Jane Doe' }], 'not to contain', {
  name: 'Jonnie Doe',
});
```

In case of a failing expectation you get the following output:

```js
expect([{ name: 'John Doe' }, { name: 'Jane Doe' }], 'not to contain', {
  name: 'Jane Doe',
});
```

```output
expected [ { name: 'John Doe' }, { name: 'Jane Doe' } ]
not to contain { name: 'Jane Doe' }

[
  { name: 'John Doe' },
  { name: 'Jane Doe' } // should be removed
]
```

You can use the `only` flag to indicate that you want no other items to
be in the subject.

```js
expect(
  [{ name: 'John Doe' }, { name: 'Jane Doe' }],
  'to only contain',
  { name: 'Jane Doe' },
  { name: 'John Doe' }
);
```

In case there are more items than that in your subject, you will get the
following output:

```js
expect(
  [{ name: 'Jane Doe' }, { name: 'John Doe' }],
  'to only contain',
  { name: 'Jane Doe' }
);
```

```output
expected [ { name: 'Jane Doe' }, { name: 'John Doe' } ]
to only contain { name: 'Jane Doe' }

[
  { name: 'Jane Doe' },
  { name: 'John Doe' } // should be removed
]
```
