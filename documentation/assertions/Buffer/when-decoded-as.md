Decode a Buffer, then delegate the return value to another assertion. Supports
[the standard node.js Buffer encodings](https://nodejs.org/api/buffer.html#buffer_buffer).

```js#skipBrowser:true
expect(new Buffer([0xe2, 0x98, 0xba]), 'when decoded as', 'utf-8', 'to equal', '☺');
```

In case of a failing expectation you get the following output:

```js#skipBrowser:true
expect(new Buffer([0xe2, 0x98, 0xba]), 'when decoded as', 'utf-8', 'to equal', 'happy face');
```

```output
expected Buffer([0xE2, 0x98, 0xBA]) when decoded as 'utf-8' to equal 'happy face'

-☺
+happy face
```