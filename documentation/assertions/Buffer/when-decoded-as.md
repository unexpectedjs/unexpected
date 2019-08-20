Decode a Buffer, then delegate the return value to another assertion. Supports
[the standard node.js Buffer encodings](https://nodejs.org/api/buffer.html#buffer_buffer).

<!-- unexpected-markdown skipBrowser:true -->

```js
expect(
  Buffer.from([0xe2, 0x98, 0xba]),
  'when decoded as',
  'utf-8',
  'to equal',
  '☺'
);
```

In case of a failing expectation you get the following output:

<!-- unexpected-markdown skipBrowser:true -->

```js
expect(
  Buffer.from([0xe2, 0x98, 0xba]),
  'when decoded as',
  'utf-8',
  'to equal',
  'happy face'
);
```

```output
expected Buffer.from([0xE2, 0x98, 0xBA])
when decoded as 'utf-8' to equal 'happy face'

-☺
+happy face
```

If you don't provide an assertion to delegate to, the decoded value will be provided
as the fulfillment value of the promise:

<!-- unexpected-markdown async:true, skipBrowser:true -->

```js
return expect(Buffer.from([0xe2, 0x98, 0xba]), 'decoded as', 'utf-8').then(
  function(result) {
    expect(result, 'to equal', '☺');
  }
);
```
