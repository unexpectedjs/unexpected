---
title: to be non-empty
---
Asserts that an array (or array-like object) is empty.

Aliases: `not to be empty`

```javascript
expect([1, 2, 3], 'to be non-empty');
```

In case of a failing expectation you get the following output:

```javascript
expect([], 'to be non-empty');
```

```output
expected [] to be non-empty
```
