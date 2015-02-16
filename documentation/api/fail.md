---
title: fail
---

Explicitly forces failure.

```js
expect.fail()
```

```output
Explicit failure
```

```js
expect.fail('Custom failure message')
```

```output
Custom failure message
```

```js
expect.fail('{0} was expected to be {1}', 0, 'zero');
```

```output
0 was expected to be 'zero'
```

I case you want to rethrow an error, you should always use
`expect.fail`, as it ensures that the error message will be correct
for the different error modes.

```js
var error = new Error('throw me');
expect.fail(new Error(error));
```

```output
Error: throw me
```

When you want to build a completely custom output, you can call
`expect.fail` with a callback and receive a
[magicpen](https://github.com/sunesimonsen/magicpen) instance that the
output can be written to.

```js
expect.fail(function (output) {
    'You have been a very bad boy!'.split(/ /).forEach(function (word, index) {
        if (index > 0) { output.sp(); }
        var style = index % 2 === 0 ? 'jsPrimitive' : 'jsString';
        output[style](word);
    });
});
```

```output
You have been a very bad boy!
```
