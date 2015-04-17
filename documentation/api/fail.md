## expect.fail(...)

Explicitly forces failure.

```js
expect.fail();
```

```output
Explicit failure
```

```js
expect.fail('Custom failure message');
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

In case you want to rethrow an error, you should always use
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

If you want to build an error containing a diff you can call
`expect.fail` with a error definition.

```js
expect.fail({
  message: function (output) {
    'You have been a very bad boy!'.split(/ /).forEach(function (word, index) {
      if (index > 0) { output.sp(); }
      var style = index % 2 === 0 ? 'jsPrimitive' : 'jsString';
      output[style](word);
    });
  },
  diff: function (output, diff, inspect, equal) {
    return diff('You have been a very bad boy!', 'You have been a very mad boy!')
  }
});
```

```output
You have been a very bad boy!

-You have been a very bad boy!
+You have been a very mad boy!
```

The message can be either a `string` a
[magicpen](https://github.com/sunesimonsen/magicpen) instance or a
function that will recieve a
[magicpen](https://github.com/sunesimonsen/magicpen) instance.

If you are using the default error mode, you don't have to specify the
error message as it is just thrown away.

The diff is a method that will create a custom diff lazily. To get a
better understanding of the diff method see the [type](/api/addType)
documentation.
