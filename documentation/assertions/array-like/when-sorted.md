Sort the subject array by the [default compare function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
then delegate the return value to another assertion.

```js
expect(['c', 'a', 'b'], 'when sorted', 'to equal', ['a', 'b', 'c']);
```

In case of a failing expectation you get the following output:

```js
expect(['c', 'a', 'b'], 'when sorted', 'to equal', ['c', 'b', 'a']);
```

```output
expected [ 'c', 'a', 'b' ] when sorted to equal [ 'c', 'b', 'a' ]

[
  'a', // should equal 'c'
       //
       // -a
       // +c
  'b',
  'c' // should equal 'a'
      //
      // -c
      // +a
]
```
