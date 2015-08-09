# expect.use(pluginDefinition)

Unexpected is built on an extensible core. Every assertion, type and
output style provided by the core library is implemented by extending
the core. Plugins can make use of the exact same extension methods to
provide new and exciting assertion capabilities.

Unexpected plugins are functions or objects that adhere to the following interface:

Optional properties:

* __name__: `String` - the name of the plugin.
* __version__: `String` - the semver version of the plugin (string).
* __dependencies__: `String array` - a list of dependencies.

Required:

* __installInto__: `function(expect)` - a function that will update the given expect instance.

If you pass a function to `use`, it will be used as the `installInto`
function, and the name of the function will be used as the name of the plugin,
unless the function is anonymous.

The name of the plugin should be the same as the NPM package name.

A plugin can require a list of other plugins to be installed prior to
installation of the plugin. If the dependency list is not fulfilled
the installation will fail. The idea is that you manage your plugin
versions using NPM. If you install a plugin that is already installed,
nothing will happen.

The `installInto` function receives an instance of unexpected and uses
the `addAssertion`, `addStyle`, `installTheme` and `addType` methods
to extend the instance.

```js#evaluate:false
expect.use(require('unexpected-sinon'));
```

Notice that it is usually a good idea to [clone](../clone) the instance before
extending it with plugins.

## Example

Let's say we wanted first class support for a integer intervals and
provide as a plugin.

An integer interval is defined the following way:

```js
function IntegerInterval(from, to) {
  this.from = from;
  this.to = to;
}
```

Now we will define an example plugin that will add support for this type:

```js
expect.use({
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

For more inspiration you can look at the source for existing plugins.
See [the plugin page](/plugins/) for a list.
