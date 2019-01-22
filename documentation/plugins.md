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

* [unexpected-check](https://unexpected.js.org/unexpected-check/): Property
  based testing using unexpected.
* [unexpected-color](https://unexpected.js.org/unexpected-color/): Assertions for
  strings representing colors.
* [unexpected-couchdb](https://github.com/alexjeffburke/unexpected-couchdb/):
  Run your tests against a mock CouchDB server initialized to a given state.
* [unexpected-date](https://sushantdhiman.com/projects/unexpected-date/): Date/time assertions on Date object.
* [unexpected-dom](https://unexpected.js.org/unexpected-dom/): Assertions for
  XML/HTML DOM and HTML/XML strings. Works in the browser and in node.js via
  [jsdom](https://github.com/tmpvar/jsdom).
* [unexpected-exif](https://unexpected.js.org/unexpected-exif/): Assertions for
  EXIF data of images (node.js only).
* [unexpected-events](https://github.com/alexjeffburke/unexpected-events/):
  Assertions for unit testing EventEmitters.
* [unexpected-eventemitter](https://github.com/boneskull/unexpected-eventemitter/):
  Alternative assertions for unit testing EventEmitters.
* [unexpected-express](https://github.com/unexpectedjs/unexpected-express/): Express
  app/middleware assertions with a declarative syntax.
* [unexpected-http](https://github.com/unexpectedjs/unexpected-http/): Assertions for
  testing local or remote HTTP servers.
  Browser-compatible via browserify (experimental).
* [unexpected-image](https://unexpected.js.org/unexpected-image/): Assertions for
  image metadata (node.js only).
* [unexpected-knockout](https://unexpected.js.org/unexpected-knockout/): Add support
  for [Knockout.js](https://knockoutjs.com/) observables.
* [unexpected-messy](https://unexpected.js.org/unexpected-messy/): Assertions for
  HTTP messages (requests and responses) and mails (rfc2822). Browser-compatible.
* [unexpected-mitm](https://unexpected.js.org/unexpected-mitm/): Mock out HTTP
  and make assertions about the HTTP traffic that goes on while executing other
  assertions. Based on the [mitm](https://github.com/moll/node-mitm/) module.
  Only works with node.js and io.js.
* [unexpected-moment](https://unexpected.js.org/unexpected-moment/):
  Assertions for testing [moment.js](https://momentjs.com/) instances.
* [unexpected-preact](https://bruderstein.github.io/unexpected-preact/): Assertions for preact.js
* [unexpected-react](https://bruderstein.github.io/unexpected-react): Assertions for React.js. Assert using JSX.
* [unexpected-reaction](https://unexpected.js.org/unexpected-reaction/): An Unexpected plugin to make React testing with [unexpected-dom](https://munter.github.io/unexpected-dom/) more convenient.
* [unexpected-resemble](https://unexpected.js.org/unexpected-resemble/): Image resemblance
  assertions based on [resemble.js](https://rsmbl.github.io/Resemble.js/). Works in
  both node.js and the browser.
* [unexpected-set](https://unexpected.js.org/unexpected-set/): Add support for [Set](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Set) instances.
* [unexpected-sinon](https://unexpected.js.org/unexpected-sinon/): Add support for
  [sinon](https://sinonjs.org/) spies.
* [unexpected-stream](https://unexpected.js.org/unexpected-stream/): Assertions for
  node.js streams.
* [unexpected-webdriver](https://github.com/fgnass/unexpected-webdriver): Assertions for Selenium WebDriver.
* [unexpected-generator](https://github.com/gertsonderby/unexpected-generator): Assertions for ES2015 generators and iterators.

## Installation

The recommended way to get plugins is installing them via npm:

```
$ npm install unexpected-dom
```

And then in your test suite:

<!-- unexpected-markdown evaluate:false -->
<!-- eslint-disable import/no-extraneous-dependencies -->
```js
var expect = require('unexpected')
  .clone()
  .use(require('unexpected-dom'));
```

For plugins that work in the browser, you'll either need to add an extra `<script>`, or
use browserify or a script loader instead of the Common.js `require` in the above example.
Please consult the documentation for each individual plugin.

## Mixing plugins

All of these plugins should be able coexist in the same Unexpected instance and
compose well together. For instance, you can grab a few and assert that an express
app serves an HTML response body that contains a yellow `<div>`:

<!-- unexpected-markdown evaluate:false -->
<!-- eslint-disable import/no-extraneous-dependencies -->
```js
var expect = require('unexpected')
  .clone()
  .use(require('unexpected-express'))
  .use(require('unexpected-dom'))
  .use(require('unexpected-color'));

var app = require('express')().get('/myPage', function(req, res, next) {
  res.send('<html><body><div style="color: #ff0">Hey!</div></body></html>');
});

it('should deliver something pretty', function() {
  return expect(app, 'to yield exchange', {
    request: 'GET /myPage',
    response: {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: expect.it(
        'when parsed as HTML',
        'queried for first',
        'div',
        'to satisfy',
        {
          attributes: {
            style: {
              color: expect.it('to be colored', 'yellow')
            }
          }
        }
      )
    }
  });
});
```

Or you could assert that a node.js readable stream outputs an image that's at most
10% different from a reference image:

<!-- unexpected-markdown evaluate:false -->
<!-- eslint-disable import/no-extraneous-dependencies -->
```js
var expect = require('unexpected')
  .clone()
  .use(require('unexpected-stream'))
  .use(require('unexpected-image'))
  .use(require('unexpected-resemble'));

it('should spew out the expected image', function() {
  var myStream = require('fs').createReadStream('foo.png');

  return expect(
    myStream,
    'to yield output satisfying',
    expect
      .it('to resemble', 'bar.png', {
        mismatchPercentage: expect.it('to be less than', 10)
      })
      .and('to have metadata satisfying', {
        format: 'PNG'
      })
  );
});
```
