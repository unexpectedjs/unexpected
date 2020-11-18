# expect.addStyle(...)

Install a single [MagicPen](https://github.com/sunesimonsen/magicpen) style into the
`expect` instance, so that it's used when rendering error messages and diffs.

Proxies through to [magicPen.addStyle](https://github.com/sunesimonsen/magicpen#addstylestyle-handler).
See the documentation there.

Example:

```js
expect.addStyle('jsString', function (text, rainbowColors) {
  rainbowColors = rainbowColors || [
    'gray',
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
  ];
  for (let i = 0; i < text.length; i += 1) {
    const color = rainbowColors[i % rainbowColors.length];
    this.text(text[i], color);
  }
});

expect('foobar', 'to equal', 'foo bar');
```

```output
expected 'foobar' to equal 'foo bar'

-foobar
+foo bar
```
