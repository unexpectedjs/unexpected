Sort the subject array by a compare function that defines the sort order then
delegate the return value to another assertion.

```js
expect([2, 1, 3], 'when sorted by', function (a, b) {
    return a - b;
}, 'to equal', [1, 2, 3]);
```

In case of a failing expectation you get the following output:

```js
expect([2, 1, 3], 'when sorted by', function (a, b) {
    return a - b;
}, 'to equal', [3, 2, 1]);
```

```output
expected [ 2, 1, 3 ]
when sorted by function (a, b) { return a - b; } to equal [ 3, 2, 1 ]

[
┌───> 
│ ┌─>
│ │   1,
│ └── 2, // should be moved
└──── 3 // should be moved
]
```
