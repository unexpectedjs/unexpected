Sort the subject array by the [default compare function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
then delegate the return value to another assertion.

```js
expect(['c', 'a', 'b'], 'when sorted', 'to equal', ['a', 'b', 'c']);
```

To sort an array of numbers, use `when sorted numerically`:

```js
expect([3, 1, 2], 'when sorted numerically', 'to equal', [1, 2, 3]);
```

In case of a failing expectation you get the following output:

```js
expect(['c', 'a', 'b'], 'when sorted', 'to equal', ['c', 'b', 'a']);
```

```output
expected [ 'c', 'a', 'b' ] when sorted to equal [ 'c', 'b', 'a' ]

[
┌───▷
│ ┌─▷
│ │   'a',
│ └── 'b', // should be moved
└──── 'c' // should be moved
]
```
