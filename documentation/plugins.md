---
title: Plugins
template: default.ejs
theme: light
repository: https://github.com/unexpectedjs/unexpected
---

# Plugins

Unexpected is designed to be highly extensible with new data types, assertions,
output styles and themes.

Here's a partial list of plugins for Unexpected:

* [unexpected-color](http://unexpected.js.org/unexpected-color/): Assertions for
  strings representing colors.
* [unexpected-couchdb](https://github.com/alexjeffburke/unexpected-couchdb/):
  Run your tests against a mock CouchDB server initialized to a given state.
* [unexpected-dom](https://github.com/munter/unexpected-dom/): Assertions for
  XML/HTML DOM and HTML/XML strings. Works in the browser and in node.js via
* [unexpected-exif](http://unexpected.js.org/unexpected-exif/): Assertions for
  EXIF data of images (node.js only).
* [unexpected-express](https://github.com/unexpectedjs/unexpected-express/): Express
  app/middleware assertions with a declarative syntax.
* [unexpected-http](https://github.com/unexpectedjs/unexpected-http/): Assertions for
  testing local or remote HTTP servers.
  Browser-compatible via browserify (experimental).
* [unexpected-image](http://unexpected.js.org/unexpected-image/): Assertions for
  image metadata (node.js only).
* [unexpected-knockout](http://unexpected.js.org/unexpected-knockout/): Add support
  for [Knockout.js](http://knockoutjs.com/) observables.
* [unexpected-messy](http://unexpected.js.org/unexpected-messy/): Assertions for
  HTTP messages (requests and responses) and mails (rfc2822). Browser-compatible.
* [unexpected-mitm](https://github.com/unexpectedjs/unexpected-mitm/): Mock out HTTP
  and make assertions about the HTTP traffic that goes on while executing other
  assertions. Based on the [mitm](https://github.com/moll/node-mitm/) module.
  Only works with node.js and io.js.
* [unexpected-react-shallow](http://github.com/bruderstein/unexpected-react-shallow/): Assertions for the [React.js shallow renderer](http://facebook.github.io/react/docs/test-utils.html#shallow-rendering). Assert using JSX.
* [unexpected-resemble](http://unexpected.js.org/unexpected-resemble/): Image resemblance
  assertions based on [resemble.js](http://huddle.github.io/Resemble.js/). Works in
  both node.js and the browser.
* [unexpected-sinon](http://unexpected.js.org/unexpected-sinon/): Add support for
  [sinon](http://sinonjs.org/) spies.
  [jsdom](https://github.com/tmpvar/jsdom/).
* [unexpected-stream](http://unexpected.js.org/unexpected-stream/): Assertions for
  node.js streams.


## Installation

The recommended way to get plugins is installing them via npm:

```
$ npm install unexpected-dom
```

And then in your test suite:

```js#evaluate:false
var expect = require('unexpected').clone()
    .use(require('unexpected-dom'));
```

For plugins that work in the browser, you'll either need to add an extra `<script>`, or
use browserify or a script loader instead of the Common.js `require` in the above example.
Please consult the documentation for each individual plugin.


## Caveats with plugins that depend on other plugins

The unexpected-express, unexpected-mitm, and unexpected-http plugins all depend
on unexpected-messy being available. If you use more than one of these in the same
test suite, it's important that only one version of unexpected-messy is installed.

All three plugins list `unexpected-messy` under both `peerDependencies` and `dependencies`
in their package.json. This strategy is carefully thought out to be forward compatible
with how `peerDependencies` work with npm 3. Unfortunately, users of npm 1 and 2 will
sometimes be in for a bit of a rough ride.

Unexpected's [use method](/api/use/) will throw an error if you install two different
versions of unexpected-messy, so there's a stop gap that prevents `expect` from
ending up in a broken state. Still, recovering from that error condition or an
`EPEERINVALID` error can be tricky. We recommend trying the following:

1. Upgrade to `npm 3`, then remove the `node_modules` folder and run a fresh `npm install`.
2. If you're stuck on a previous npm version, you should still try to remove `node_modules`
   and run a fresh `npm install`.
3. If that doesn't work, upgrade unexpected and the plugins you're using to the newest
   versions at once. The newest versions should be using the same version of
   unexpected-messy, which will resolve the problem in most cases.


## Mixing plugins

All of these plugins should be able coexist in the same Unexpected instance and
compose well together. For instance, you can grab a few and assert that an express
app serves an HTML response body that contains a yellow `<div>`:

```js#evaluate:false
var expect = require('unexpected').clone()
    .use(require('unexpected-express'))
    .use(require('unexpected-dom'))
    .use(require('unexpected-color'));

var app = require('express')()
    .get('/myPage', function (req, res, next) {
        res.send('<html><body><div style="color: #ff0">Hey!</div></body></html>');
    });

it('should deliver something pretty', function () {
    return expect(app, 'to yield exchange', {
        request: 'GET /myPage',
        response: {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
            body: expect.it('when parsed as HTML', 'queried for first', 'div', 'to satisfy', {
                attributes: {
                    style: {
                        color: expect.it('to be colored', 'yellow')
                    }
                }
            })
        }
    });
});
```

Or you could assert that a node.js readable stream outputs an image that's at most
10% different from a reference image:

```js#evaluate:false
var expect = require('unexpected').clone()
    .use(require('unexpected-stream'))
    .use(require('unexpected-image'))
    .use(require('unexpected-resemble'));

it('should spew out the expected image', function () {
    var myStream = require('fs').createReadStream('foo.png');

    return expect(
        myStream,
        'to yield output satisfying',
        expect.it('to resemble', 'bar.png', {
            mismatchPercentage: expect.it('to be less than', 10)
        }).and('to have metadata satisfying', {
            format: 'PNG'
        })
    );
});
```
