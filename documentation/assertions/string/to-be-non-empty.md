---
title: to be non-empty
---

Asserts that the string is non-empty.

Aliases: `not to be empty`.

```js
expect('Hello', 'to be non-empty');
```

In case of a failing expectation you get the following output:

```js
expect('', 'to be non-empty');
```

```output
expected '' to be non-empty
```
