## Plugins

Unexpected is build on an extensible core. Every assertion, type and
output style provided by the core library is implemented by extending
the core. Plugins can make use of the exact same extension methods to
provide new and exciting assertion capabilities.

### expect.installPlugin(typeDefinition)

Unexpected plugins are objects that adhere to the following interface:

Required members:

* __name__: `String` - the name of the plugin.

Optional members:

* __dependencies__: `String array` - a list of dependencies.
* __installInto__: `function(expect)` - a function that will update the given expect instance.

The name of the plugin should be the same as the NPM package name.

A plugin can require a list of other plugins to be installed prior to
installation of the plugin. If the dependency list is not fulfilled
the installation will fail. The idea is that you manage your plugin
versions using NPM. If you install a plugin that is already installed
nothing will happen.

The `installInto` function receives an instance of unexpected and uses
the `addAssertion`, `addStyle`, `installTheme` and `addType` methods
to extend the instance.

```js#evaluate:false
expect.installPlugin(require('unexpected-sinon'));
```

Notice that it is usually a good idea to [clone](../clone) the instance before
extending it.

### Example

Let's say we wanted first class support for a integer intervals and
provide as a plugin.

An interger interval is defined the following way:

```js
function IntegerInterval(from, to) {
  this.from = from;
  this.to = to;
}
```

Now we will define an example plugin that will add support for this type:

```js
expect.installPlugin({
  name: 'unexpected-integer-intervals',
  installInto: function (expect) {
      expect.addType({
        name: 'IntegerInterval',
        base: 'object',
        identify: function (value) {
          return value && value instanceof IntegerInterval;
        },
        inspect: function (value, depth, output) {
          output.text('[').jsNumber(value.from).text(',').jsNumber(value.to).text(']');
        }
      });

     expect.addAssertion('[not] to contain', function (expect, subject, value) {
       expect(value, '[not] to be within', subject.from, subject.to);
     });
  }
});
```

After installing the plugin we can use the `to contain` assertion on
`IntegerInterval` instances.

```js
expect(new IntegerInterval(7, 13), 'to contain', 9);
```

and we get improved output when the assertion fails:

```js
expect(new IntegerInterval(7, 13), 'to contain', 27);
```

```output
expected [7,13] to contain 27
```

<!-- TODO create a plugin page -->
For more inspiration you can look at the source for one of the
following plugins:

* [unexpected-knockout](https://github.com/unexpectedjs/unexpected-knockout)
* [unexpected-sinon](https://github.com/unexpectedjs/unexpected-sinon)
* [unexpected-express](https://github.com/unexpectedjs/unexpected-express)
* [unexpected-mitm](https://github.com/unexpectedjs/unexpected-mitm)
