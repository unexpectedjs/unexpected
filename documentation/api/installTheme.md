# expect.installTheme(...)

Install a [MagicPen](https://github.com/sunesimonsen/magicpen) theme into the expect instance,
so that it's used when rendering error messages and diffs.

Proxies through to [magicPen.installTheme](https://github.com/sunesimonsen/magicpen#installthemetheme-installthemeformat-theme-installthemeformats-theme). See the documentation there.

Example:

```js
expect.installTheme({
    styles: {
        ugliness: 'yellow',
        jsKeyword: 'ugliness'
    }
});

expect(function foo() {}, 'to throw', 'bar');
```

```output
expected function foo() {} to throw 'bar'
  expected function foo() {} to throw
    did not throw
```
