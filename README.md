# Unexpected

Minimalistic BDD assertion toolkit inspired by
[expect.js](https://github.com/LearnBoost/expect.js)

```js
expect(window.r, 'to be', undefined);
expect({ a: 'b' }, 'to equal', { a: 'b' });
expect(5, 'to be a', 'number');
expect([], 'to be an', 'array');
expect(window, 'not to be an', Image);
```

[![Build Status](https://travis-ci.org/sunesimonsen/unexpected.png)](https://travis-ci.org/sunesimonsen/unexpected)

[Run the test in the browser](http://sunesimonsen.github.io/unexpected/test/tests.production.html)

## Features

- Fast
- Provides really nice error messages
- Helps you if you misspells assertions
- Compatible with all test frameworks.
- Node.JS ready (`require('unexpected')`).
- Single global with no prototype extensions or shims.
- Cross-browser: works on IE6+, Firefox, Safari, Chrome, Opera.

## How to use

### Node

Install it with NPM or add it to your `package.json`:

```
$ npm install unexpected
```

Then:

```js
var expect = require('unexpected');
```

### Browser

Include `unexpected.js`.

```html
<script src="unexpected.js"></script>
```

this will expose the expect function under the following namespace:

```js
var expect = weknowhow.expect;
```

### RequireJS

Include the library with RequireJS the following way:

```js
require.config({
    paths: {
        unexpected: 'path/to/unexpected'
    }
});

define(['unexpected'], function (expect) {
   // Your code
});
```

## API

### to be ok

asserts that the value is _truthy_

**ok** / **truthy** / **falsy**: asserts that the value is _truthy_ or not

```js
expect(1, 'to be ok');
expect(true, 'to be ok');
expect(true, 'not to be falsy');
expect({}, 'to be truthy');
expect(0, 'not to be ok');
expect(0, 'to be falsy');
expect(null, 'to be falsy');
expect(undefined, 'to be falsy');
```

**be**: asserts `===` equality

```js
expect(obj, 'to be', obj);
expect(obj, 'not to be', {});
expect(1, 'to be', 1);
expect(1, 'not to be', true);
expect('1', 'not to be', 1);
expect(null, 'not to be', undefined);
expect(null, 'to be null');
expect(0, 'not to be null');
expect(undefined, 'not to be null');
expect(true, 'to be true');
expect(false, 'not to be true');
expect(false, 'to be false');
expect(true, 'not to be false');
expect(undefined, 'to be undefined');
```

**equal**: asserts deep equality that works with objects

```js
expect({ a: 'b' }, 'to equal', { a: 'b' });
expect(1, 'not to equal', '1');
expect({ one: 1 }, 'not to equal', { one: '1' });
expect(null, 'not to equal', '1');
var now = new Date();
expect(now, 'to equal', now);
expect(now, 'to equal', new Date(now.getTime()));
expect({ now: now }, 'to equal', { now: now });
```

**a** / **an**: asserts `typeof` with support for `array` type and `instanceof`

```js
expect(5, 'to be a', 'number');
expect(5, 'to be a number');

expect('abc', 'to be a', 'string');
expect('abc', 'to be a string');
expect('', 'to be an empty string');
expect('abc', 'to be a non-empty string');

expect([], 'to be an', 'array');
expect([], 'to be an array');
expect([], 'to be an', Array);
expect([], 'to be an empty array');
expect([123], 'to be a non-empty array');

expect({foo: 123}, 'to be an', 'object');
expect({foo: 123}, 'to be an object');
expect({foo: 123}, 'to be a non-empty object');
expect({}, 'to be an empty object');

expect(null, 'not to be an', 'object');
expect(null, 'not to be an object');

expect(true, 'to be a', 'boolean');
expect(true, 'to be a boolean');

expect(expect, 'to be a', 'function');
expect(expect, 'to be a function');
```

**NaN**: asserts that the value is `NaN`

```js
expect(NaN, 'to be NaN');
expect({}, 'to be NaN');
expect(2, 'not to be NaN');
expect(null, 'not to be NaN');
expect(undefined, 'to be NaN');
expect("String", 'to be NaN');
```

**close to**: asserts that the difference between two numbers is <= epsilon

```js
expect(1.5, 'to be close to', 1.500001, 1e-5);
expect(1.5, 'not to be close to', 1.499, 1e-4);
```

epsilon defaults to 1e-9 if omitted:

```js
expect(1.5, 'to be close to', 1.5000000001);
```

**match**: asserts `String` regular expression match

```js
expect('test', 'to match', /.*st/);
expect('test', 'not to match', /foo/);
expect(null, 'not to match', /foo/);
```

**contain**: asserts indexOf for an array or string

```js
expect([1, 2], 'to contain', 1);
expect('hello world', 'to contain', 'world');
expect(null, 'not to contain', 'world');
```

**length**: asserts array `.length`

```js
expect([], 'to have length', 0);
expect([1,2,3], 'to have length', 3);
expect([1,2,3], 'not to have length', 4);
```

**empty**: asserts that an array is empty or not

```js
expect([], 'to be empty');
expect('', 'to be empty');
expect({}, 'to be empty');
expect({ length: 0, duck: 'typing' }, 'to be empty');
expect({ my: 'object' }, 'not to be empty');
expect([1,2,3], 'not to be empty');
```

**property**: asserts presence of an own property (and value optionally)

```js
expect([1, 2], 'to have property', 'length');
expect([1, 2], 'to have property', 'length', 2);
expect({a: 'b'}, 'to have property', 'a');
expect({a: 'b'}, 'to have property', 'a', 'b');
expect({a: 'b'}, 'to have property', 'toString');
expect({a: 'b'}, 'to have own property', 'a');
expect(Object.create({a: 'b'}), 'not to have own property', 'a');
```

**properties**: assert presence of properties in an object (and value optionally)

```js
expect({ a: 'a', b: { c: 'c' }, d: 'd' }, 'to have properties', ['a', 'b']);
expect({ a: 'a', b: { c: 'c' }, d: 'd' }, 'to have own properties', ['a', 'b']);
expect({ a: 'a', b: { c: 'c' }, d: 'd' }, 'to not have properties', ['k', 'l']);
expect({ a: 'a', b: { c: 'c' }, d: 'd' }, 'to have properties', {
    a: 'a',
    b: { c: 'c' }
});
expect([ 'a', { c: 'c' }, 'd' ], 'to have properties', {
    1: { c: 'c' }
    2: 'd',
});
```

**key** / **keys**: asserts the presence of a key. Supports the `only` modifier

```js
expect(null, 'not to have key', 'a');
expect({ a: 'b' }, 'to have key', 'a');
expect({ a: 'b' }, 'not to have key', 'b');
expect({ a: 'b', c: 'd' }, 'to not only have key', 'a');
expect({ a: 'b', c: 'd' }, 'to only have keys', 'a', 'c');
expect({ a: 'b', c: 'd' }, 'to only have keys', ['a', 'c']);
expect({ a: 'b', c: 'd', e: 'f' }, 'to not only have keys', ['a', 'c']);
```

**throw exception** / **throw error** / **throw**: asserts that the `Function` throws or not when called

```js
expect(fn, 'to throw exception');
expect(fn, 'to throw');
expect(fn, 'to throw exception', function (e) { // get the exception object
  expect(e, 'to be a', SyntaxError);
});
expect(fn, 'to throw exception', /matches the exception message/);
expect(fn, 'to throw error', 'matches the exact exception message');
expect(fn2, 'not to throw error');
```

**finite/infinite**: asserts a finite or infinite number

```js
expect(123, 'to be finite');
expect(Infinity, 'not to be finite');
expect(Infinity, 'to be infinite');
expect(false, 'not to be infinite');
```

**within**: asserts a number within a range

```js
expect(0, 'to be within', 0, 4);
expect(1, 'to be within', 0, 4);
expect(4, 'to be within', 0, 4);
expect(-1, 'not to be within', 0, 4);
expect(5, 'not to be within', 0, 4);
```

**greater than** / **above**: asserts `>`

```js
expect(3, 'to be greater than', 2);
expect(1, 'to be above', 0);
expect(4, 'to be >', 3);
expect(4, '>', 3);
```

**greater than or equal to**: asserts `>`

```js
expect(3, 'to be greater than or equal to', 2);
expect(3, 'to be >=', 3);
expect(3, '>=', 3);
```

**less than** / **below**: asserts `<`

```js
expect(0, 'to be less than', 4);
expect(0, 'to be below', 1);
expect(3, 'to be <', 4);
expect(3, '<', 4);
```

**less than or equal to**: asserts `>`

```js
expect(0, 'to be less than or equal to', 4);
expect(4, 'to be <=', 4);
expect(3, '<=', 4);
```

**positive**: assert that a number is positive

```js
expect(3, 'to be positive');
```

**negative**: assert that a number is negative

```js
expect(-1, 'to be negative');
```

**fail**: explicitly forces failure.

```js
expect.fail()
expect.fail('Custom failure message')
expect.fail('{0} was expected to be {1}', 0, 'zero');
```

**array whose items satify**: will run an assertion function for each items in an array

```js
expect([0, 1, 2, 3, 4], 'to be an array whose items satisfy', function (item, index) {
    expect(item, 'to be a number');
});

expect([0, 1, 2, 3, 4], 'to be an array whose items satisfy', 'to be a number');

expect([[1], [2]], 'to be an array whose items satisfy',
       'to be an array whose items satisfy', 'to be a number');

expect([[], []], 'to be a non-empty array whose items satisfy', function (item) {
    expect(item, 'to be an empty array');
});
```

Using this assertion result in very detailed error reporting show in the below example:

```js
expect([[0, 1, 2], [4, '5', 6], [7, 8, '9']],
       'to be an array whose items satisfy', function (arr) {
    expect(arr, 'to be an array whose items satisfy', function (item) {
        expect(item, 'to be a number');
    });
});
```

will output:

```
failed expectation in [ [ 0, 1, 2 ], [ 4, '5', 6 ], [ 7, 8, '9' ] ]:
    1: failed expectation in [ 4, '5', 6 ]:
        1: expected '5' to be a 'number'
    2: failed expectation in [ 7, 8, '9' ]:
        2: expected '9' to be a 'number'
```

**map whose keys satify**: will run an assertion function for each key in a map


```js
expect({ foo: 0, bar: 1, baz: 2, qux: 3 },
       'to be a map whose keys satisfy', function (key) {
    expect(key, 'to match', /^[a-z]{3}$/);
});

expect({ foo: 0, bar: 1, baz: 2, qux: 3 },
       'to be a map whose keys satisfy',
       'to match', /^[a-z]{3}$/);
```

Using this assertion result in very detailed error reporting show in the below example:

```js
expect({ foo: 0, bar: 1, baz: 2, qux: 3, quux: 4 },
       'to be a map whose keys satisfy', function (key) {
    expect(key, 'to have length', 3);
});
```

will output:

```
failed expectation on keys foo, bar, baz, qux, quux:
    quux: expected 'quux' to have length 3
```

**map whose values satify**: will run an assertion function for each value in a map

```js
expect({ foo: 0, bar: 1, baz: 2, qux: 3 },
       'to be a map whose values satisfy', function (value) {
    expect(value, 'to be a number');
});

expect({ foo: 0, bar: 1, baz: 2, qux: 3 },
       'to be a map whose values satisfy',
       'to be a number');
```

Using this assertion result in very detailed error reporting show in the below example:

```js
expect({ foo: [0, 1, 2], bar: [4, '5', 6], baz: [7, 8, '9'] },
       'to be a map whose values satisfy', function (arr) {
    expect(arr, 'to be an array whose items satisfy', function (item) {
        expect(item, 'to be a number');
    });
});
```

will output:

```
failed expectation in
{ foo: [ 0, 1, 2 ],
  bar: [ 4, '5', 6 ],
  baz: [ 7, 8, '9' ] }:
    bar: failed expectation in [ 4, '5', 6 ]:
        1: expected '5' to be a 'number'
    baz: failed expectation in [ 7, 8, '9' ]:
        2: expected '9' to be a 'number'
```

## Extending Unexpected with new assertions

### expect.clone()

Before extending the `expect` instance with new assertions it is
usually a good idea to clone it, so you don't change the global
instance. You do that by calling the `clone` method on `expect`.
Adding new assertions to the clone will not affect the original
instance.

### expect.addAssertion(...assertionString, handler)

Warning: if you were an early adopter and used `addAssertion` before
it was made public, the API has change slightly to allow more advanced
assertions.

New assertions can be added to Unexpected to following way.

```js
expect.addAssertion('[not] to be (sorted|ordered)', function(expect, subject, cmp) {
    expect(subject, '[not] to equal', [].concat(subject).sort(cmp));
});

```

The above assertion definition makes the following expects possible:

```js
expect([1,2,3], 'to be sorted');
expect([1,2,3], 'to be ordered');
expect([2,1,3], 'not to be sorted');
expect([2,1,3], 'not to be ordered');
expect([3,2,1], 'to be sorted', function (x, y) { return y - x; });
```

Let's dissect the different parts of the custom assertion we just
introduced.

The first parameter to `addAssertion` is a string describing the
different expectation strings this custom assertion should match. A
word in square brackets represents a flag that can either be there or
not. If the flag is present `this.flags[flag]` will contain the value
`true`. In this case `not` is a flag. When a flag it present in a
nested `expect` it will be inserted is the custom assertion has that
flag; otherwise it will be removed. Text that is in parentheses with
vertical bars between them are treated as alternative texts that can
be used. In this case you can write _ordered_ as an alternative to
_sorted_.

The last parameter to `addAssertion` is function that will be called
when `expect` is invoked with one of the expectation strings generated
from the custom assertion. When the `expect` function is called the
following way:

```js
expect(testSubject, expectationString, ...arguments);
```

The expectation string is used to identify a handler for the
expectation. The handler is then called with an instance of `expect`
that can be used inside the custom assertion, the test subject and the
rest of the arguments.

So in this case when `expect` is called the following way:

```js
expect([3,2,1], 'to be sorted', reverse);
```

The handler to our custom assertion will be called with the values
this way, where the _not_ flag in the nested expect will be removed:

```js
expect.addAssertion('[not] to be (sorted|ordered)', function(expect, [3,2,1], reverse){
    expect([3,2,1], '[not] to equal', [].concat([3,2,1]).sort(reverse));
});
```

#### Controlling the output of nested expects

When an `expect` fails inside your custom assertion the standard error
message for the custom assertion will be used. In the case of our
_sorted_ assertion the output will be something along the lines:

```
expected [ 4, 3, 1, 2 ] to be sorted
```

We can control the output of the nested expects by using the `this.errorMode`
flag.

```js
expect.addAssertion('[not] to be (sorted|ordered)', function(expect, subject, cmp) {
    this.errorMode = 'bubble';
    expect(subject, '[not] to equal', [].concat(subject).sort(cmp));
});

```

This will change the error output to:

```
expected [ 4, 3, 1, 2 ] to equal [ 1, 2, 3, 4 ]
```

If we change the error mode to _nested_, we get the following:

```
expected [ 4, 3, 1, 2 ] to be sorted
    expected [ 4, 3, 1, 2 ] to equal [ 1, 2, 3, 4 ]
```

The best resource for learning more about custom assertions is to look
at how the predefined assertions are build:

[unexpected-assertions.js](https://github.com/sunesimonsen/unexpected/blob/master/lib/unexpected-assertions.js)

### expect.installPlugin(plugin)

Unexpected plugins are just functions that uses the `addAssertion`
method to add new custom assertions to the `expect` instance.

```js
expect.installPlugin(require('unexpected-sinon'));
```

See the
[unexpected-sinon](https://github.com/sunesimonsen/unexpected-sinon)
plugin as an example on how to create a plugin.

## Print all registered assertions to the console

```js
console.log(expect.toString());
```

## Using Unexpected with a test framework

For example, if you create a test suite with
[mocha](http://github.com/visionmedia/mocha).

Let's say we wanted to test the following program:

**math.js**

```js
function add (a, b) { return a + b; };
```

Our test file would look like this:

```js
describe('test suite', function () {
  it('should expose a function', function () {
    expect(add, 'to be a', 'function');
  });

  it('should do math', function () {
    expect(add(1, 3), 'to be', 4);
  });
});
```

If a certain expectation fails, an exception will be raised which gets captured
and shown/processed by the test runner.

## Development

[Everything you need to know to contribute to unexpected.](Development.md)

## Credits

(The MIT License)

Copyright (c) 2013 Sune Simonsen &lt;sune@we-knowhow.dk&gt;

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the 'Software'), to deal in the Software without
restriction, including without limitation the rights to use, copy,
modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

### 3rd-party

Heavily borrows from [expect.js](https://github.com/LearnBoost/expect.js) by
Guillermo Rauch - MIT.
