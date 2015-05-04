it.skipIf = function (condition) {
    (condition ? it.skip : it).apply(it, Array.prototype.slice.call(arguments, 1));
};

var isMochaPhantomJS = typeof mochaPhantomJS !== 'undefined';

describe.skipIf = function (condition) {
    (condition ? describe.skip : describe).apply(describe, Array.prototype.slice.call(arguments, 1));
};

function toArguments() {
    return arguments;
}

describe('unexpected', function () {
    var expect = typeof weknowhow === 'undefined' ? require('../lib/').clone() : weknowhow.expect.clone();
    var workQueue = typeof weknowhow === 'undefined' ? require('../lib/workQueue') : null;
    expect.output.preferredWidth = 80;

    var circular = {};
    circular.self = circular;

    expect.addType({
        name: 'magicpen',
        identify: function (obj) {
            return obj && obj.isMagicPen;
        },
        inspect: function (pen, depth, output) {
            return output.append(pen);
        },
        equal: function (a, b) {
            return a.toString() === b.toString() &&
                a.toString('ansi') === b.toString('ansi') &&
                a.toString('html') === b.toString('html');
        }
    }).addType({
        name: 'Promise',
        base: 'object',
        identify: function (obj) {
            return this.baseType.identify(obj) && typeof obj.then === 'function';
        }
    }).addAssertion('Promise', 'to be rejected', function (expect, subject, expectedReason) {
        return subject.then(function () {
            throw new Error('Promise unexpectedly fulfilled');
        }).caught(function (err) {
            if (typeof expectedReason !== 'undefined') {
                return expect(err._isUnexpected ? err.output.toString('text') : err.message, 'to satisfy', expectedReason);
            }
        });
    }).addAssertion('when delayed a little bit', function (expect, subject) {
        var that = this;
        return expect.promise(function (run) {
            setTimeout(run(function () {
                return that.shift(expect, subject, 0);
            }), 1);
        });
    }).addAssertion('to inspect as', function (expect, subject, value) {
        expect(expect.inspect(subject).toString(), 'to equal', value);
    });

    describe('argument validation', function () {
        it('fails when given no parameters', function () {
            expect(function () {
                expect();
            }, 'to throw', 'The expect function requires at least two parameters.');
        });

        it('fails when given only one parameter', function () {
            expect(function () {
                expect({});
            }, 'to throw', 'The expect function requires at least two parameters.');
        });

        it('fails when the second parameter is not a string', function () {
            expect(function () {
                expect({}, {});
            }, 'to throw', 'The expect function requires the second parameter to be a string.');
        });
    });

    describe('ok/truthy/falsy assertion', function () {
        it('assert that the value is truthy or not', function () {
            expect(1, 'to be ok');
            expect(true, 'to be ok');
            expect(true, 'not to be falsy');
            expect({}, 'to be truthy');
            expect(0, 'not to be ok');
            expect(0, 'to be falsy');
            expect(null, 'to be falsy');
            expect(undefined, 'to be falsy');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(0, 'to be ok');
            }, 'to throw exception', 'expected 0 to be ok');
        });

        it('throws with message when the assertion fails', function () {
            expect(function () {
                expect(4 < 4, 'to be ok', '4 < 4');
            }, "to throw exception", "expected false to be ok '4 < 4'");
        });

        it('formats Error instances correctly when an assertion fails', function () {
            expect(function () {
                var error = new Error('error message');
                error.data = 'extra';
                expect(error, 'to be a number');
            }, 'to throw', "expected Error({ message: 'error message', data: 'extra' }) to be a number");
        });

        describe('with Error instances', function () {
            it('considers Error instances with different messages to be different', function () {
                expect(function () {
                    expect(new Error('foo'), 'to equal', new Error('bar'));
                }, 'to throw exception', function (err) {
                    expect(err.output.toString(), 'to equal',
                           "expected Error({ message: 'foo' }) to equal Error({ message: 'bar' })\n" +
                           "\n" +
                           "Error({\n" +
                           "  message: 'foo' // should equal 'bar'\n" +
                           "                 // -foo\n" +
                           "                 // +bar\n" +
                           "})");
                });
            });

            it('considers Error instances with the same message but different stacks to be equal', function () {
                var err1 = new Error('foo'),
                    err2 = new Error('foo');
                expect(err1, 'to equal', err2);
            });

            it('considers Error instances with the same message and extra properties to be equal', function () {
                var err1 = new Error('foo'),
                    err2 = new Error('foo');
                err1.extra = 'foo';
                err2.extra = 'foo';
                expect(err1, 'to equal', err2);
            });

            it('considers Error instances with the same message but different extra properties to be different', function () {
                var err1 = new Error('foo'),
                    err2 = new Error('foo');
                err1.extra = 'foo';
                err2.extra = 'bar';
                expect(function () {
                    expect(err1, 'to equal', err2);
                }, 'to throw exception',
                       "expected Error({ message: 'foo', extra: 'foo' }) to equal Error({ message: 'foo', extra: 'bar' })\n" +
                       "\n" +
                       "Error({\n" +
                       "  message: 'foo',\n" +
                       "  extra: 'foo' // should equal 'bar'\n" +
                       "               // -foo\n" +
                       "               // +bar\n" +
                       "})");
            });

            it('considers Error instances with the same message and stack to be equal', function () {
                var errors = [];
                for (var i = 0 ; i < 2 ; i += 1) {
                    errors.push(new Error('foo'));
                }
                expect(errors[0], 'to equal', errors[1]);
            });

            it('ignores blacklisted properties in the diff', function () {
                var error = new Error('foo');
                error.description = 'qux';
                expect(function () {
                    expect(error, 'to satisfy', new Error('bar'));
                }, 'to throw',
                       "expected Error({ message: 'foo' }) to satisfy Error({ message: 'bar' })\n" +
                       "\n" +
                       "Error({\n" +
                       "  message: 'foo' // should equal 'bar'\n" +
                       "                 // -foo\n" +
                       "                 // +bar\n" +
                       "})");
            });
        });

        it('throws with a stack trace that has the calling function as the top frame when the assertion fails (if the environment supports it)', function () {
            if (Error.captureStackTrace || 'stack' in new Error()) {
                expect(function TheCallingFunction() {
                    expect(4 < 4, 'to be ok');
                }, 'to throw exception', function (err) {
                    expect(err.stack.split('\n')[2], 'to match', /TheCallingFunction/);
                });
            }
        });
    });

    describe('be assertion', function () {
        it('assert === equality', function () {
            var obj = {};
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
            expect(false, 'to be defined');
            expect({}, 'to be defined');
            expect('', 'to be defined');
        });

        it('NaN as equal to NaN', function () {
            expect(NaN, 'to be', NaN);
        });

        it('considers negative zero not to be zero', function () {
            expect(-0, 'not to be', 0);
        });

        it('considers negative zero to be itself', function () {
            expect(-0, 'to be', -0);
        });

        it('considers zero to be itself', function () {
            expect(0, 'to be', 0);
        });

        it.skipIf(typeof Buffer === 'undefined', 'asserts === equality for Buffers', function () {
            var buffer = new Buffer([0x45, 0x59]);
            expect(buffer, 'to be', buffer);
        });

        it.skipIf(typeof Uint8Array === 'undefined', 'asserts === equality for Uint8Array', function () {
            var uint8Array = new Uint8Array([0x45, 0x59]);
            expect(uint8Array, 'to be', uint8Array);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect('foo', 'to be', 'bar');
            }, 'to throw exception',
                   "expected 'foo' to be 'bar'\n" +
                   "\n" +
                   "-foo\n" +
                   "+bar");

            expect(function () {
                expect(true, 'not to be', true);
            }, 'to throw exception', "expected true not to be true");

            expect(function () {
                expect(undefined, 'to be defined');
            }, 'to throw exception', "expected undefined to be defined");
        });


        it('does not provide a diff when comparing against undefined', function () {
            expect(function () {
                expect('blabla', 'to be undefined');
            }, 'to throw', "expected 'blabla' to be undefined");
        });
    });

    describe('a/an assertion', function () {
        it('asserts typeof with support for array type and instanceof', function () {
            expect(5, 'to be a', 'number');
            expect(5, 'to be a number');
            expect('abc', 'to be a', 'string');
            expect('', 'to be a string');
            expect('', 'to be the empty string');
            expect('', 'to be an empty string');
            expect('abc', 'to be a non-empty string');
            expect([], 'to be an', 'array');
            expect([], 'to be an array');
            expect([], 'to be an empty array');
            expect({}, 'to be an', Object);
            expect([123], 'to be a non-empty array');
            expect([], 'to be an', 'object');
            expect([], 'to be an object');
            expect([], 'to be an', Array);
            expect(/ab/, 'to be a', RegExp);
            expect(/ab/, 'to be a regexp');
            expect(123, 'not to be a regex');
            expect(/ab/, 'to be a regex');
            expect(/ab/, 'to be a regular expression');
            expect(123, 'not to be a regular expression');
            expect(null, 'not to be an', 'object');
            expect(null, 'not to be an object');
            expect(true, 'to be a', 'boolean');
            expect(true, 'to be a boolean');
            expect(expect, 'to be a', 'function');
            expect(expect, 'to be a function');
            expect(circular, 'to be an object');
        });

        it('should support type objects', function () {
            expect('foo', 'to be a', expect.getType('string'));
        });

        it('should fail with the correct error message if the type is given as an anonymous function', function () {
            expect(function () {
                expect('foo', 'to be a', function () {});
            }, 'to throw', "expected 'foo' to be a function () {}");
        });

        it('should throw when the type is specified as undefined', function () {
            expect(function () {
                expect('foo', 'to be an', undefined);
            }, 'to throw', "The 'to be an' assertion requires either a string (type name), a type object, or function argument");
        });

        it('should throw when the type is specified as null', function () {
            expect(function () {
                expect('foo', 'to be a', null);
            }, 'to throw', "The 'to be a' assertion requires either a string (type name), a type object, or function argument");
        });

        it('should not consider a string a to be an instance of an object without a name property', function () {
            expect(function () {
                expect('foo', 'to be a', {});
            }, 'to throw', "The 'to be a' assertion requires either a string (type name), a type object, or function argument");
        });

        it('should throw when the type is specified as an object without an identify function', function () {
            expect(function () {
                expect('foo', 'to be a', { name: 'bar' });
            }, 'to throw', "The 'to be a' assertion requires either a string (type name), a type object, or function argument");
        });

        it('should throw when the type is specified as an object with an identify function, but without a name property', function () {
            expect(function () {
                expect('foo', 'to be a', { identify: function () { return true; } });
            }, 'to throw', "The 'to be a' assertion requires either a string (type name), a type object, or function argument");
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(5, 'to be an', Array);
            }, 'to throw exception', 'expected 5 to be an Array');

            expect(function () {
                expect([], 'not to be an', 'array');
            }, 'to throw exception', "expected [] not to be an array");

            expect(function () {
                expect(circular, 'not to be an object');
            }, 'to throw exception', "expected { self: [Circular] } not to be an object");
        });

        it("throws an error a diff when comparing string and not negated", function () {
            expect(function () {
                expect('foo', 'to be', 'bar');
            }, 'to throw exception', function (e) {
                expect(e.output.toString(), 'to equal',
                       "expected 'foo' to be 'bar'\n" +
                       "\n" +
                       "-foo\n" +
                       "+bar");
            });
        });

        it("throws an error without actual and expected when comparing string and negated", function () {
            expect(function () {
                expect('foo', 'not to be', 'foo');
            }, 'to throw exception', function (e) {
                expect(e, 'not to have property', 'actual');
                expect(e, 'not to have property', 'expected');
            });
        });

        it("throws an error without actual and expected when not comparing string and not negated", function () {
            expect(function () {
                expect('foo', 'to be', {});
            }, 'to throw exception', function (e) {
                expect(e, 'not to have property', 'actual');
                expect(e, 'not to have property', 'expected');
            });
        });
    });

    describe('equal assertion', function () {
        it('asserts deep equality that works with objects', function () {
            expect({ a: 'b' }, 'to equal', { a: 'b' });
            expect(1, 'not to equal', '1');
            expect({ foo: 1 }, 'not to equal', { foo: '1' });
            expect(1, 'to equal', 1);
            expect(null, 'not to equal', '1');
            var now = new Date();
            expect(now, 'to equal', now);
            expect(now, 'to equal', new Date(now.getTime()));
            expect({ now: now }, 'to equal', { now: now });
            expect(null, 'to equal', null);
            expect(null, 'not to equal', undefined);
            expect(undefined, 'to equal', undefined);
            expect(true, 'to equal', true);
            expect(false, 'to equal', false);
            expect({ a: { b: 'c' } }, 'to equal', { a: { b: 'c' } });
            expect({ a: { b: 'c' } }, 'not to equal', { a: { b: 'd' } });
            expect({}, 'to equal', { a: undefined });
            expect(/foo/, 'to equal', /foo/);
            expect(/foo/i, 'not to equal', /foo/);
            expect(/foo/gm, 'to equal', /foo/gm);
            expect(/foo/m, 'not to equal', /foo/i);
            expect(/foo/m, 'to equal', new RegExp('foo', 'm'));
            expect([], 'not to equal', 0);
            expect(new Error('foo'), 'to equal', new Error('foo'));
        });

        it('treats NaN as equal to NaN', function () {
            expect(NaN, 'to equal', NaN);
        });

        it('treats negative zero and zero as unequal', function () {
            expect(-0, 'not to equal', 0);
        });

        it('treats negative zero as equal to itself', function () {
            expect(-0, 'to equal', -0);
        });

        it('treats zero as equal to itself', function () {
            expect(0, 'to equal', 0);
        });

        it('treats an arguments object as different from an array', function () {
            expect(toArguments('foo', 'bar', 'baz'), 'not to equal', ['foo', 'bar', 'baz']);
        });

        it('array should not equal sparse array', function () {
            expect(function () {
                var sparse = [];
                sparse[1] = 2;
                expect(sparse, 'to equal', [1, 2]);
            }, 'to throw');
            expect(function () {
                var sparse = [];
                sparse[1] = 2;
                expect([1, 2], 'to equal', sparse);
            }, 'to throw');
        });

        it('should handle objects with no prototype', function () {
            expect(Object.create(null), 'to equal', Object.create(null));

            expect(function () {
                expect(Object.create(null), 'to equal', {});
            }, 'to throw',
                   "expected {} to equal {}\n" +
                   "\n" +
                   "Mismatching constructors undefined should be Object");

            expect(function () {
                expect({}, 'to equal', Object.create(null));
            }, 'to throw',
                   "expected {} to equal {}\n" +
                   "\n" +
                   "Mismatching constructors Object should be undefined");
        });

        it('should treat properties with a value of undefined as equivalent to missing properties', function () {
            expect({foo: undefined, bar: 1}, 'to equal', {bar: 1});
            expect({bar: 1}, 'to equal', {foo: undefined, bar: 1});
        });

        it.skipIf(typeof Buffer === 'undefined', 'asserts equality for Buffer instances', function () {
            expect(new Buffer([0x45, 0x59]), 'to equal', new Buffer([0x45, 0x59]));
        });

        it.skipIf(typeof Uint8Array === 'undefined', 'asserts equality for Uint8Array', function () {
            expect(new Uint8Array([0x45, 0x59]), 'to equal', new Uint8Array([0x45, 0x59]));
        });

        it('fails gracefully when comparing circular structures', function () {
            var foo = {},
                bar = {};
            foo.foo = foo;
            bar.foo = bar;
            expect(function () {
                expect(foo, 'not to equal', bar);
            }, 'to throw', 'Cannot compare circular structures');
        });

        it('fails gracefully when producing a diff based on circular structures', function () {
            var foo = { a: 'foo' };
            var bar = { a: 'bar' };
            foo.b = foo;
            bar.b = bar;
            expect(function () {
                expect(foo, 'to equal', bar);
            }, 'to throw', 'Cannot compare circular structures');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect({ a: { b: 'c'} }, 'to equal', { a: { b: 'd'} });
            }, 'to throw exception', "expected { a: { b: 'c' } } to equal { a: { b: 'd' } }\n" +
                   "\n" +
                   "{\n" +
                   "  a: {\n" +
                   "    b: 'c' // should equal 'd'\n" +
                   "           // -c\n" +
                   "           // +d\n" +
                   "  }\n" +
                   "}");

            expect(function () {
                expect({ a: 'b' }, 'not to equal', { a: 'b' });
            }, 'to throw exception', "expected { a: 'b' } not to equal { a: 'b' }");

            expect(function () {
                expect(new Error('foo'), 'to equal', new Error('bar'));
            }, 'to throw exception', "expected Error({ message: 'foo' }) to equal Error({ message: 'bar' })\n" +
                   "\n" +
                   "Error({\n" +
                   "  message: 'foo' // should equal 'bar'\n" +
                   "                 // -foo\n" +
                   "                 // +bar\n" +
                   "})");

            expect(function () {
                expect(toArguments('foo', 'bar'), 'to equal', ['foo', 'bar', 'baz']);
            }, 'to throw exception', "expected arguments( 'foo', 'bar' ) to equal [ 'foo', 'bar', 'baz' ]\n" +
                   "\n" +
                   "Mismatching constructors Object should be Array");
        });

        it("throws an error with a diff when not negated", function () {
            expect(function () {
                expect('123', 'to equal', '456');
            }, 'to throw exception',
                   "expected '123' to equal '456'\n" +
                   "\n" +
                   "-123\n" +
                   "+456");
        });

        it("throws an error without a diff when negated", function () {
            expect(function () {
                expect('123', 'not to equal', '123');
            }, 'to throw exception', "expected '123' not to equal '123'");
        });

        it("throws an error with a diff when comparing arrays and not negated", function () {
            expect(function () {
                expect([1], 'to equal', [2]);
            }, 'to throw exception', "expected [ 1 ] to equal [ 2 ]\n" +
                   "\n" +
                   "[\n" +
                   "  1 // should equal 2\n" +
                   "]");

            expect(function () {
                expect([0, { foo: 'bar' }, 1, { bar: 'bar'}, [1, 3, 2], 'bar'],
                       'to equal',
                       [0, 1, { foo: 'baz' }, 42, { qux: 'qux' }, [1, 2, 3], 'baz']);
            }, 'to throw exception',
                   "expected [ 0, { foo: 'bar' }, 1, { bar: 'bar' }, [ 1, 3, 2 ], 'bar' ]\n" +
                   "to equal [ 0, 1, { foo: 'baz' }, 42, { qux: 'qux' }, [ 1, 2, 3 ], 'baz' ]\n" +
                   "\n" +
                   "[\n" +
                   "  0,\n" +
                   "  // missing 1\n" +
                   "  {\n" +
                   "    foo: 'bar' // should equal 'baz'\n" +
                   "               // -bar\n" +
                   "               // +baz\n" +
                   "  },\n" +
                   "  1, // should be removed\n" +
                   "  // missing 42\n" +
                   "  // missing { qux: 'qux' }\n" +
                   "  { bar: 'bar' }, // should be removed\n" +
                   "  [\n" +
                   "    1,\n" +
                   "    3, // should equal 2\n" +
                   "    2 // should equal 3\n" +
                   "  ],\n" +
                   "  'bar' // should equal 'baz'\n" +
                   "        // -bar\n" +
                   "        // +baz\n" +
                   "]");
        });

        it("throws an error with a diff when comparing objects and not negated", function () {
            expect(function () {
                expect({foo: 1}, 'to equal', {foo: 2});
            }, 'to throw exception', "expected { foo: 1 } to equal { foo: 2 }\n" +
                   "\n" +
                   "{\n" +
                   "  foo: 1 // should equal 2\n" +
                   "}");
        });

        it("throws an error with a diff when comparing strings and not negated", function () {
            expect(function () {
                expect('foo', 'to equal', 'bar');
            }, 'to throw exception', "expected 'foo' to equal 'bar'\n" +
                   "\n" +
                   "-foo\n" +
                   "+bar");
        });

        it("throws an error without actual and expected comparing strings and negated", function () {
            expect(function () {
                expect('foo', 'not to equal', 'foo');
            }, 'to throw exception', function (e) {
                expect(e, 'not to have property', 'actual');
                expect(e, 'not to have property', 'expected');
            });
        });

        it("throws an error without showDiff:true when comparing an object to an array", function () {
            expect(function () {
                expect({foo: 1}, 'to equal', []);
            }, 'to throw exception', function (e) {
                expect(e.showDiff, 'not to be ok');
            });
        });

        it("throws an error without showDiff:true when negated", function () {
            expect(function () {
                expect({foo: 1}, 'not to equal', {foo: 1});
            }, 'to throw exception', function (e) {
                expect(e.showDiff, 'not to be ok');
            });
        });

        it.skipIf(typeof Buffer === 'undefined', 'produces a hex-diff in JSON when Buffers differ', function () {
            expect(function () {
                expect(
                    new Buffer('\x00\x01\x02Here is the thing I was talking about', 'utf-8'),
                    'to equal',
                    new Buffer('\x00\x01\x02Here is the thing I was quuxing about', 'utf-8')
                );
            }, 'to throw',
                   'expected Buffer([0x00, 0x01, 0x02, 0x48, 0x65, 0x72, 0x65, 0x20, 0x69, 0x73, 0x20, 0x74, 0x68, 0x65, 0x20, 0x74 /* 24 more */ ])\n' +
                   'to equal Buffer([0x00, 0x01, 0x02, 0x48, 0x65, 0x72, 0x65, 0x20, 0x69, 0x73, 0x20, 0x74, 0x68, 0x65, 0x20, 0x74 /* 24 more */ ])\n' +
                   '\n' +
                   ' 00 01 02 48 65 72 65 20 69 73 20 74 68 65 20 74  │...Here is the t│\n' +
                   '-68 69 6E 67 20 49 20 77 61 73 20 74 61 6C 6B 69  │hing I was talki│\n' +
                   '+68 69 6E 67 20 49 20 77 61 73 20 71 75 75 78 69  │hing I was quuxi│\n' +
                   ' 6E 67 20 61 62 6F 75 74                          │ng about│');
        });


        it.skipIf(typeof Buffer === 'undefined', 'regression test for infinite loop in buffer diff code', function () {
            expect(function () {
                expect(
                    new Buffer([0x63, 0x74, 0x3D, 0x54, 0x3B, 0xD4, 0x8C, 0x3B, 0x66, 0x6F, 0x6F, 0x3D, 0x62, 0x61, 0x72, 0x3B]),
                    'to equal',
                    Buffer.concat([
                        new Buffer('ct=T;;'),
                        new Buffer([0xa3, 0x3b]),
                        new Buffer(';foo=bar;')
                    ])
                );
            }, 'to throw');
        });

        it.skipIf(typeof Buffer === 'undefined', 'suppresses Buffer diff for large buffers', function () {
            expect(function () {
                var a = new Buffer(1024),
                    b = new Buffer(1024);
                a[0] = 1;
                b[0] = 2;
                expect(
                    a,
                    'to equal',
                    b
                );
            }, 'to throw', /Diff suppressed due to size > 512/);
        });

        it.skipIf(typeof Int8Array === 'undefined' || !Array.prototype.map, 'produces a hex-diff in JSON when Int8Arrays differ', function () {
            expect(function () {
                expect(
                    new Int8Array([
                        0x00, 0x01, 0x02, 0x48, 0x65, 0x72, 0x65, 0x20, 0x69, 0x73, 0x20, 0x74, 0x68, 0x65, 0x20, 0x74,
                        0x68, 0x69, 0x6E, 0x67, 0x20, 0x49, 0x20, 0x77, 0x61, 0x73, 0x20, 0x74, 0x61, 0x6C, 0x6B, 0x69,
                        0x6E, 0x67, 0x20, 0x61, 0x62, 0x6F, 0x75, 0x74
                    ]),
                    'to equal',
                    new Int8Array([
                        0x00, 0x01, 0x02, 0x48, 0x65, 0x72, 0x65, 0x20, 0x69, 0x73, 0x20, 0x74, 0x68, 0x65, 0x20, 0x74,
                        0x68, 0x69, 0x6E, 0x67, 0x20, 0x49, 0x20, 0x77, 0x61, 0x73, 0x20, 0x71, 0x75, 0x75, 0x78, 0x69,
                        0x6E, 0x67, 0x20, 0x61, 0x62, 0x6F, 0x75, 0x74
                    ])
                );
            }, 'to throw',
                   'expected Int8Array([0x00, 0x01, 0x02, 0x48, 0x65, 0x72, 0x65, 0x20, 0x69, 0x73, 0x20, 0x74, 0x68, 0x65, 0x20, 0x74 /* 24 more */ ])\n' +
                   'to equal Int8Array([0x00, 0x01, 0x02, 0x48, 0x65, 0x72, 0x65, 0x20, 0x69, 0x73, 0x20, 0x74, 0x68, 0x65, 0x20, 0x74 /* 24 more */ ])\n' +
                   '\n' +
                   ' 00 01 02 48 65 72 65 20 69 73 20 74 68 65 20 74  │...Here is the t│\n' +
                   '-68 69 6E 67 20 49 20 77 61 73 20 74 61 6C 6B 69  │hing I was talki│\n' +
                   '+68 69 6E 67 20 49 20 77 61 73 20 71 75 75 78 69  │hing I was quuxi│\n' +
                   ' 6E 67 20 61 62 6F 75 74                          │ng about│');
        });

        it.skipIf(typeof Uint8Array === 'undefined' || !Array.prototype.map, 'produces a hex-diff in JSON when Uint8Arrays differ', function () {
            expect(function () {
                expect(
                    new Uint8Array([
                        0x00, 0x01, 0x02, 0x48, 0x65, 0x72, 0x65, 0x20, 0x69, 0x73, 0x20, 0x74, 0x68, 0x65, 0x20, 0x74,
                        0x68, 0x69, 0x6E, 0x67, 0x20, 0x49, 0x20, 0x77, 0x61, 0x73, 0x20, 0x74, 0x61, 0x6C, 0x6B, 0x69,
                        0x6E, 0x67, 0x20, 0x61, 0x62, 0x6F, 0x75, 0x74
                    ]),
                    'to equal',
                    new Uint8Array([
                        0x00, 0x01, 0x02, 0x48, 0x65, 0x72, 0x65, 0x20, 0x69, 0x73, 0x20, 0x74, 0x68, 0x65, 0x20, 0x74,
                        0x68, 0x69, 0x6E, 0x67, 0x20, 0x49, 0x20, 0x77, 0x61, 0x73, 0x20, 0x71, 0x75, 0x75, 0x78, 0x69,
                        0x6E, 0x67, 0x20, 0x61, 0x62, 0x6F, 0x75, 0x74
                    ])
                );
            }, 'to throw',
                   'expected Uint8Array([0x00, 0x01, 0x02, 0x48, 0x65, 0x72, 0x65, 0x20, 0x69, 0x73, 0x20, 0x74, 0x68, 0x65, 0x20, 0x74 /* 24 more */ ])\n' +
                   'to equal Uint8Array([0x00, 0x01, 0x02, 0x48, 0x65, 0x72, 0x65, 0x20, 0x69, 0x73, 0x20, 0x74, 0x68, 0x65, 0x20, 0x74 /* 24 more */ ])\n' +
                   '\n' +
                   ' 00 01 02 48 65 72 65 20 69 73 20 74 68 65 20 74  │...Here is the t│\n' +
                   '-68 69 6E 67 20 49 20 77 61 73 20 74 61 6C 6B 69  │hing I was talki│\n' +
                   '+68 69 6E 67 20 49 20 77 61 73 20 71 75 75 78 69  │hing I was quuxi│\n' +
                   ' 6E 67 20 61 62 6F 75 74                          │ng about│');
        });

        it.skipIf(typeof Uint16Array === 'undefined', 'produces a hex-diff in JSON when Uint16Arrays differ', function () {
            expect(function () {
                expect(
                    new Uint16Array([
                        0x0001, 0x0248, 0x6572, 0x6520, 0x6973, 0x2074, 0x6865, 0x2074,
                        0x6869, 0x6E67, 0x2049, 0x2077, 0x6173, 0x2074, 0x616C, 0x6B69,
                        0x6E67, 0x2061, 0x626F, 0x7574
                    ]),
                    'to equal',
                    new Uint16Array([
                        0x0001, 0x0248, 0x6572, 0x6520, 0x6973, 0x2074, 0x6865, 0x2074,
                        0x6869, 0x6E67, 0x2049, 0x2077, 0x6173, 0x2071, 0x7575, 0x7869,
                        0x6E67, 0x2061, 0x626F, 0x7574
                    ])
                );
            }, 'to throw',
                   'expected Uint16Array([0x0001, 0x0248, 0x6572, 0x6520, 0x6973, 0x2074, 0x6865, 0x2074 /* 12 more */ ])\n' +
                   'to equal Uint16Array([0x0001, 0x0248, 0x6572, 0x6520, 0x6973, 0x2074, 0x6865, 0x2074 /* 12 more */ ])\n' +
                   '\n' +
                   ' 0001 0248 6572 6520 6973 2074 6865 2074\n' +
                   '-6869 6E67 2049 2077 6173 2074 616C 6B69\n' +
                   '+6869 6E67 2049 2077 6173 2071 7575 7869\n' +
                   ' 6E67 2061 626F 7574'
            );
        });

        it.skipIf(typeof Uint32Array === 'undefined', 'produces a hex-diff in JSON when Uint32Arrays differ', function () {
            expect(function () {
                expect(
                    new Uint32Array([
                        0x00010248, 0x65726520, 0x69732074, 0x68652074,
                        0x68696E67, 0x20492077, 0x61732074, 0x616C6B69,
                        0x6E672061, 0x626F7574
                    ]),
                    'to equal',
                    new Uint32Array([
                        0x00010248, 0x65726520, 0x69732074, 0x68652074,
                        0x68696E67, 0x20492077, 0x61732071, 0x75757869,
                        0x6E672061, 0x626F7574
                    ])
                );
            }, 'to throw',
                   'expected Uint32Array([0x00010248, 0x65726520, 0x69732074, 0x68652074 /* 6 more */ ])\n' +
                   'to equal Uint32Array([0x00010248, 0x65726520, 0x69732074, 0x68652074 /* 6 more */ ])\n' +
                   '\n' +
                   ' 00010248 65726520 69732074 68652074\n' +
                   '-68696E67 20492077 61732074 616C6B69\n' +
                   '+68696E67 20492077 61732071 75757869\n' +
                   ' 6E672061 626F7574'
            );
        });
    });

    describe('exception assertion', function () {
        var phantomJsErrorWeirdness;
        try {
            throw new Error('foo');
        } catch (e) {
            phantomJsErrorWeirdness = Object.keys(e).indexOf('sourceURL') >= 0;
        }

        it.skipIf(phantomJsErrorWeirdness, 'fails if no exception is thrown', function () {
            expect(function () {
                expect(function () {
                    // Don't throw
                }, 'to throw exception');
            }, 'to throw',
                'expected\n' +
                'function () {\n' +
                '    // Don\'t throw\n' +
                '}\n' +
                'to throw exception');

        });

        it.skipIf(phantomJsErrorWeirdness, 'fails if exception is thrown', function () {
            expect(function () {
                expect(function testFunction() {
                    throw new Error('The Error');
                }, 'not to throw');
            }, 'to throw',
                   'expected\n' +
                    'function testFunction() {\n' +
                    '    throw new Error(\'The Error\');\n' +
                    '}\n' +
                    'not to throw\n' +
                    "  threw: Error({ message: 'The Error' })");
        });

        it.skipIf(phantomJsErrorWeirdness, 'fails with the correct message when an Unexpected error is thrown', function () {
            expect(function () {
                expect(function testFunction() {
                    expect.fail(function (output) {
                        output.text('foo').block(function () {
                            this.text('bar').nl().text('baz');
                        }).text('quux');
                    });
                }, 'not to throw');
            }, 'to throw',
                   'expected\n' +
                    'function testFunction() {\n' +
                    "    expect.fail(function (output) {\n" +
                    "        output.text('foo').block(function () {\n" +
                    "            this.text('bar').nl().text('baz');\n" +
                    "        }).text('quux');\n" +
                    "    });\n" +
                    '}\n' +
                    'not to throw\n' +
                    "  threw: foobarquux\n" +
                    "            baz");
        });

        it('fails if the argument is not a function', function () {
            expect(function () {
                expect(1, 'to throw exception');
            }, 'to throw exception',
                   'expected 1 to throw exception\n' +
                   '  The assertion "to throw exception" is not defined for the type "number",\n' +
                   '  but it is defined for the type "function"');
        });

        it('given a function the function is called with the exception', function () {
            expect(function () {
                throw new SyntaxError();
            }, 'to throw exception', function (e) {
                expect(e, 'to be a', SyntaxError);
            });
        });

        it('matches the message against the given regular expression', function () {
            expect(function () {
                throw new Error('matches the exception message');
            }, 'to throw exception', /matches the exception message/);
        });

        it('does not support the not-flag in combination with an argument', function () {
            expect(function () {
                expect(function () {
                    throw new Error('matches the exception message');
                }, 'not to throw', /matches the exception message/);
            }, 'to throw', "The 'not to throw' assertion does not support arguments");
        });

        it.skipIf(phantomJsErrorWeirdness, 'provides a diff when the exception message does not match the given string', function () {
            expect(function () {
                expect(function testFunction() {
                    throw new Error('bar');
                }, 'to throw', 'foo');
            }, 'to throw exception',
                   'expected\n' +
                    'function testFunction() {\n' +
                    '    throw new Error(\'bar\');\n' +
                    '}\n' +
                    'to throw \'foo\'\n' +
                    "  expected Error({ message: 'bar' }) to satisfy 'foo'\n" +
                    '\n' +
                    '  -bar\n' +
                    '  +foo');
        });

        it('matches the error against the given error instance', function () {
            expect(function () {
                throw new Error('matches the exception message');
            }, 'to throw exception', new Error('matches the exception message'));
        });

        it.skipIf(phantomJsErrorWeirdness, 'provides a diff when the thrown error does not match the given error instance', function () {
            expect(function () {
                expect(function testFunction() {
                    throw new Error('Custom error');
                }, 'to throw exception', new Error('My error'));
            }, 'to throw',
                   'expected\n' +
                   'function testFunction() {\n' +
                   '    throw new Error(\'Custom error\');\n' +
                   '}\n' +
                   "to throw exception Error({ message: 'My error' })\n" +
                   "  expected Error({ message: 'Custom error' }) to satisfy Error({ message: 'My error' })\n" +
                   "\n" +
                   "  Error({\n" +
                   "    message: 'Custom error' // should equal 'My error'\n" +
                   "                            // -Custom error\n" +
                   "                            // +My error\n" +
                   "  })");
        });

        it('exactly matches the message against the given string', function () {
            expect(function () {
                throw new Error('matches the exception message');
            }, 'to throw exception', 'matches the exception message');
        });

        it('does not break if null is thrown', function () {
            expect(function () {
                expect(function () {
                    throw null;
                }, 'not to throw');
            }, 'to throw',
                'expected\n' +
                'function () {\n' +
                '    throw null;\n' +
                '}\n' +
                'not to throw\n' +
                '  threw: null');
        });
    });

    describe('Error type', function () {
        it('should inspect the constructor name correctly', function () {
            expect(new TypeError('foo'), 'to inspect as', "TypeError({ message: 'foo' })");
        });

        describe('to have message assertion', function () {
            describe('with an Unexpected error', function () {
                var err;
                try {
                    expect(1, 'to equal', 2);
                } catch (e) {
                    err = e;
                }
                it('should succeed', function () {
                    expect(err, 'to have message', 'expected 1 to equal 2');
                });

                it('should fail with a diff', function () {
                    expect(function () {
                        expect(err, 'to have message', 'expected 3 to equal 2');
                    }, 'to throw', function (err) {
                        var message = err.output.toString('text');
                        expect(
                            message,
                            'to contain',
                            "to have message 'expected 3 to equal 2'\n" +
                                "  expected 'expected 1 to equal 2' to satisfy 'expected 3 to equal 2'\n" +
                                "\n" +
                                "  -expected 1 to equal 2\n" +
                                "  +expected 3 to equal 2"
                        );
                        expect(message, 'to match', /^expected\sError\(\{[\s\S]*\}\)/);
                    });
                });
            });

            describe('with a non-Unexpected error', function () {
                var err = new Error('Bummer!');
                it('should succeed', function () {
                    expect(err, 'to have message', 'Bummer!');
                });

                it('should fail with a diff', function () {
                    expect(function () {
                        expect(err, 'to have message', 'Dammit!');
                    }, 'to throw',
                        "expected Error({ message: 'Bummer!' }) to have message 'Dammit!'\n" +
                        "  expected 'Bummer!' to satisfy 'Dammit!'\n" +
                        "\n" +
                        "  -Bummer!\n" +
                        "  +Dammit!"
                    );
                });
            });
        });
    });

    describe('arity assertion', function () {
        it('tests that the subject function has the given arity', function () {
            expect(function () {}, 'to have arity', 0);
            expect(function (a) {}, 'to have arity', 1);
            expect(function (a, b) {}, 'to have arity', 2);
            /*jshint evil:true*/
            expect(new Function('a', 'return 1'), 'to have arity', 1);
            /*jshint evil:false*/
        });
    });

    describe('match assertion', function () {
        it('tests that the subject matches the given regular expression', function () {
            expect('test', 'to match', /.*st/);
            expect('test', 'not to match', /foo/);
        });

        it('does not keep state between invocations', function () {
            // This tests that the assertion does not depend on the lastIndex
            // property of the regexp:
            var regExp = /a/g,
                str = 'aa';
            expect(str, 'to match', regExp);
            expect(str, 'to match', regExp);
            expect(str, 'to match', regExp);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect('test', 'to match', /foo/);
            }, 'to throw exception', "expected 'test' to match /foo/");
        });

        it('provides a diff when the not flag is set', function () {
            expect(function () {
                expect('barfooquuxfoobaz', 'not to match', /foo/);
            }, 'to throw',
                   "expected 'barfooquuxfoobaz' not to match /foo/\n" +
                   '\n' +
                   'barfooquuxfoobaz');
        });
    });

    describe('contain assertion', function () {
        it('asserts indexOf for a string', function () {
            expect('hello world', 'to contain', 'world');
        });

        it('should support searching for a non-string inside a string', function () {
            expect('hello null', 'to contain', null);
            expect('hello 123', 'to contain', 123);
            expect('hello false', 'to contain', false);
            expect('hello Infinity', 'to contain', Infinity);
        });

        it('asserts item equality for an array', function () {
            expect([1, 2], 'to contain', 1);
            expect([1, 2], 'to contain', 2, 1);
            expect([{foo: 123}], 'to contain', {foo: 123});
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(null, 'not to contain', 'world');
            }, 'to throw',
                   "expected null not to contain 'world'\n" +
                   '  The assertion "not to contain" is not defined for the type "null",\n' +
                   '  but it is defined for these types: "string", "array-like"');

            expect(function () {
                expect('hello world', 'to contain', 'foo');
            }, 'to throw exception', "expected 'hello world' to contain 'foo'");

            expect(function () {
                expect('hello world', 'to contain', 'hello', 'foo');
            }, 'to throw exception', "expected 'hello world' to contain 'hello', 'foo'");

            expect(function () {
                expect([1, 2], 'to contain', 2, 3);
            }, 'to throw exception', "expected [ 1, 2 ] to contain 2, 3");

            expect(function () {
                expect([{foo: 123}], 'to contain', {foo: 123}, {bar: 456});
            }, 'to throw exception', "expected [ { foo: 123 } ] to contain { foo: 123 }, { bar: 456 }");

            expect(function () {
                expect(1, 'to contain', 1);
            }, 'to throw exception',
                   'expected 1 to contain 1\n' +
                   '  The assertion "to contain" is not defined for the type "number",\n' +
                   '  but it is defined for these types: "string", "array-like"');
        });

        it('produces a diff when the array case fails and the not flag is on', function () {
            expect(function () {
                expect([1, 2, 3], 'not to contain', 2);
            }, 'to throw',
                'expected [ 1, 2, 3 ] not to contain 2\n' +
                '\n' +
                '[\n' +
                '  1,\n' +
                '  2, // should be removed\n' +
                '  3\n' +
                ']');
        });

        it('produces a diff when the string case fails and the not flag is on', function () {
            expect(function () {
                expect('foobarquuxfoo', 'not to contain', 'foo');
            }, 'to throw',
                "expected 'foobarquuxfoo' not to contain 'foo'\n" +
                '\n' +
                'foobarquuxfoo');
        });
    });

    describe('length assertion', function () {
        it('asserts array .length', function () {
            expect([], 'to have length', 0);
            expect([1, 2, 3], 'to have length', 3);
            expect([1, 2, 3], 'not to have length', 4);
            expect(toArguments(1,2,3,4), 'to have length', 4);
        });

        it('asserts string .length', function () {
            expect('abc', 'to have length', 3);
            expect('', 'to have length', 0);
        });

        it('assert sparse array length', function () {
            var sparse = [];
            sparse[1] = 'foo';
            expect(function () {
                expect(sparse, 'to have length', 2);
            }, 'not to throw');
        });

        it.skipIf(typeof Buffer === 'undefined', 'asserts Buffer .length', function () {
            expect(new Buffer('æ', 'utf-8'), 'to have length', 2);
            expect(new Buffer([]), 'to have length', 0);
        });

        it.skipIf(typeof Uint8Array === 'undefined', 'asserts length for Uint8Array', function () {
            expect(new Uint8Array([0x45, 0x59]), 'to have length', 2);
        });

        it.skipIf(typeof Uint16Array === 'undefined', 'asserts length for Uint16Array', function () {
            expect(new Uint16Array([0x4545, 0x5945]), 'to have length', 2);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect([1, 2], 'to have length', 3);
            }, 'to throw exception',
                   "expected [ 1, 2 ] to have length 3\n" +
                   "  expected 2 to be 3");

            expect(function () {
                expect(null, 'to have length', 4);
            }, 'to throw exception',
                   'expected null to have length 4\n' +
                   '  The assertion "to have length" is not defined for the type "null",\n' +
                   '  but it is defined for these types: "string", "array-like"');

            expect(function () {
                expect({ length: 4 }, 'to have length', 4);
            }, 'to throw exception',
                   'expected { length: 4 } to have length 4\n' +
                   '  The assertion "to have length" is not defined for the type "object",\n' +
                   '  but it is defined for these types: "string", "array-like"');
        });
    });

    describe('property assertion', function () {
        it('asserts presence of an own property (and value optionally)', function () {
            expect([1, 2], 'to have property', 'length');
            expect([1, 2], 'to have property', 'length', 2);
            expect({a: 'b'}, 'to have property', 'a');
            expect({a: 'b'}, 'to have property', 'a', 'b');
            expect({a: 'b'}, 'to have property', 'toString');
            expect({a: 'b'}, 'not to have property', 'b');
            expect({'"a"': 'b'}, 'to have own property', '"a"');
            expect(Object.create({a: 'b'}), 'not to have own property', 'a');
            expect(function () {}, 'to have property', 'toString');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect({a: 'b'}, 'to have property', 'b');
            }, 'to throw exception', "expected { a: 'b' } to have property 'b'");

            expect(function () {
                expect(null, 'to have property', 'b');
            }, 'to throw exception',
                   "expected null to have property 'b'\n" +
                   '  The assertion "to have property" is not defined for the type "null",\n' +
                   '  but it is defined for the type "object"');

            expect(function () {
                expect({a: 'b'}, 'to have property', 'a', 'c');
            }, 'to throw exception',
                   "expected { a: 'b' } to have property 'a', 'c'\n" +
                  "\n" +
                   "-b\n" +
                   "+c");

            expect(function () {
                expect({a: 'b'}, 'to have own property', 'a', 'c');
            }, 'to throw exception',
                   "expected { a: 'b' } to have own property 'a', 'c'\n" +
                  "\n" +
                   "-b\n" +
                   "+c");

            expect(function () {
                // property expectations ignores value if property
                expect(null, 'not to have property', 'a', 'b');
            }, 'to throw exception',
                   "expected null not to have property 'a', 'b'\n" +
                   '  The assertion "not to have property" is not defined for the type "null",\n' +
                   '  but it is defined for the type "object"');

            expect(function () {
                // property expectations on value expects the property to be present
                expect(null, 'not to have own property', 'a', 'b');
            }, 'to throw exception',
                   "expected null not to have own property 'a', 'b'\n" +
                   '  The assertion "not to have own property" is not defined for the type "null",\n' +
                   '  but it is defined for the type "object"');
        });

        it('does not support the not-flag in combination with a value argument', function () {
            expect(function () {
                expect({ a: 'a' }, 'not to have property', 'a', 'a');
            }, "to throw", "The 'not to have property' assertion does not with a value argument");
        });
    });

    describe('to have keys assertion', function () {
        it('should work with non-enumerable keys returned by the getKeys function of the subject type', function () {
            expect(new Error('foo'), 'to only have key', 'message');
        });
    });

    describe('properties assertion', function () {
        it('asserts presence of a list of properties', function () {
            expect({a: 'foo', b: 'bar'}, 'to have properties', ['a', 'b']);
        });

        it('asserts presence of a list of own properties', function () {
            expect({a: 'foo', b: 'bar'}, 'to have own properties', ['a', 'b']);
            expect(function () {
                var obj = Object.create({a: 'foo', b: 'bar'});
                expect(obj, 'to have properties', ['a', 'b']); // should not fail
                expect(obj, 'to have own properties', ['a', 'b']); // should fail
            }, 'to throw', "expected {} to have own properties [ 'a', 'b' ]");
        });

        it('asserts the absence of a property when the RHS object has an undefined value', function () {
            expect({}, 'to have properties', { a: undefined });
        });

        it('asserts absence of a list of properties', function () {
            expect({a: 'foo', b: 'bar'}, 'not to have properties', ['c', 'd']);
            expect(function () {
                expect({a: 'foo', b: 'bar'}, 'not to have properties', ['a', 'd']);
            }, 'to throw', "expected { a: 'foo', b: 'bar' } not to have properties [ 'a', 'd' ]");
        });

        it('asserts absence of a list of own properties', function () {
            var obj = Object.create({a: 'foo', b: 'bar'});
            expect(obj, 'to have properties', ['a', 'b']);
            expect(obj, 'not to have own properties', ['a', 'b']);
            expect(function () {
                expect({a: 'foo', b: 'bar'}, 'not to have own properties', ['a', 'b']); // should fail
            }, 'to throw', "expected { a: 'foo', b: 'bar' } not to have own properties [ 'a', 'b' ]");
        });

        it('asserts presence and values of an object of properties', function () {
            expect({a: 'foo', b: 'bar', c: 'baz', d: { qux: 'qux', quux: 'quux'}}, 'to have properties', {
                a: 'foo',
                b: 'bar',
                d: { qux: 'qux', quux: 'quux'}
            });
            expect(function () {
                expect({a: 'foo', b: 'bar'}, 'to have properties', {c: 'baz'});
            }, 'to throw', "expected { a: 'foo', b: 'bar' } to have properties { c: 'baz' }\n" +
                   "\n" +
                   "{\n" +
                   "  a: 'foo',\n" +
                   "  b: 'bar',\n" +
                   "  c: undefined // should equal 'baz'\n" +
                   "}");
            expect(function () {
                expect({a: 'foo', b: 'bar'}, 'to have properties', {b: 'baz'});
            }, 'to throw', "expected { a: 'foo', b: 'bar' } to have properties { b: 'baz' }\n" +
                   "\n" +
                   "{\n" +
                   "  a: 'foo',\n" +
                   "  b: 'bar' // should equal 'baz'\n" +
                   "           // -bar\n" +
                   "           // +baz\n" +
                   "}");
        });

        it('asserts presence and values of an object of own properties', function () {
            expect({a: 'foo', b: 'bar'}, 'to have own properties', {a: 'foo', b: 'bar'});
            expect(function () {
                var obj = Object.create({a: 'foo', b: 'bar'});
                expect(obj, 'to have properties', {a: 'foo', b: 'bar'}); // should not fail
                expect(obj, 'to have own properties', {a: 'foo', b: 'bar'}); // should fail
            }, 'to throw', "expected {} to have own properties { a: 'foo', b: 'bar' }\n" +
                   "\n" +
                   "{\n" +
                   "  a: undefined, // should equal 'foo'\n" +
                   "  b: undefined // should equal 'bar'\n" +
                   "}");

            expect(function () {
                expect({a: 'f00', b: 'bar'}, 'to have own properties', {a: 'foo', b: 'bar'}); // should fail
            }, 'to throw', "expected { a: 'f00', b: 'bar' } to have own properties { a: 'foo', b: 'bar' }\n" +
                   "\n" +
                   "{\n" +
                   "  a: 'f00', // should equal 'foo'\n" +
                   "            // -f00\n" +
                   "            // +foo\n" +
                   "  b: 'bar'\n" +
                   "}");
        });

        it('asserts absence and values of an object of own properties', function () {
            var obj = Object.create({a: 'foo', b: 'bar'});
            expect(obj, 'to have properties', {a: 'foo', b: 'bar'});
            expect(obj, 'not to have own properties', ['a', 'b']);
            expect(function () {
                expect({a: 'foo', b: 'bar'}, 'not to have own properties', ['a', 'b']); // should fail
            }, 'to throw', "expected { a: 'foo', b: 'bar' } not to have own properties [ 'a', 'b' ]");
        });

        it('includes prototype properties in the actual property (#48)', function () {
            function Foo() {}

            Foo.prototype.doSomething = function () {};

            expect(function () {
                expect(new Foo(), 'to have properties', {a: 123});
            }, 'to throw',
                   "expected Foo({}) to have properties { a: 123 }\n" +
                   "\n" +
                   "Foo({\n" +
                   "  doSomething: function () {},\n" +
                   "  a: undefined // should equal 123\n" +
                   "})");
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect({a: 'foo', b: 'bar'}, 'to have properties', ['c', 'd']);
            }, 'to throw', "expected { a: 'foo', b: 'bar' } to have properties [ 'c', 'd' ]");

            expect(function () {
                expect({a: 'foo'}, 'to have properties', {a: undefined});
            }, 'to throw', "expected { a: 'foo' } to have properties { a: undefined }\n" +
                   "\n" +
                   "{\n" +
                   "  a: 'foo' // should be undefined\n" +
                   "}");
        });

        it('throws when given invalid input', function () {
            expect(function () {
                expect({a: 'foo', b: 'bar'}, 'to have properties', 'a', 'b');
            }, 'to throw', "Assertion 'to have properties' only supports input in the form of an Array or an Object.");

            expect(function () {
                expect({a: 'foo', b: 'bar'}, 'not to have properties', {a: 'foo', b: 'bar'});
            }, 'to throw', "Assertion 'not to have properties' only supports input in the form of an Array.");
        });
    });

    describe('empty assertion', function () {
        it('asserts the array-like objects have a non-zero length', function () {
            expect([], 'to be empty');
            expect('', 'to be empty');
            expect([1, 2, 3], 'not to be empty');
            expect('foobar', 'not to be empty');
            expect([1, 2, 3], 'to be non-empty');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect([1, 2, 3], 'to be empty');
            }, 'to throw exception', "expected [ 1, 2, 3 ] to be empty");

            expect(function () {
                expect('', 'to be non-empty');
            }, 'to throw exception', "expected '' to be non-empty");

            expect(function () {
                expect(null, 'to be empty');
            }, 'to throw exception',
                   'expected null to be empty\n' +
                   '  The assertion "to be empty" is not defined for the type "null",\n' +
                   '  but it is defined for these types: "string", "array-like"');
        });
    });

    describe('key assertion', function () {
        it('asserts the presence of a key', function () {
            expect({ a: 'b' }, 'to have key', 'a');
            expect({ a: 'b' }, 'not to have key', 'b');
            expect({ a: 'b' }, 'not to have key', []);
            expect({ a: 'b', c: 'd' }, 'not to have key', 'b');
            expect({ a: 'b', c: 'd' }, 'to not only have key', 'a');
            expect({ a: 'b', c: 'd' }, 'to only have keys', 'a', 'c');
            expect({ a: 'b', c: 'd' }, 'to only have keys', ['a', 'c']);
            expect({ a: 'b', c: 'd', e: 'f' }, 'to not only have keys', ['a', 'c']);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect({ a: 'b', b: 'c' }, 'to have key', 'e');
            }, 'to throw exception', "expected { a: 'b', b: 'c' } to have key 'e'");

            expect(function () {
                expect({ a: 'b', b: 'c' }, 'to only have key', 'b');
            }, 'to throw exception', "expected { a: 'b', b: 'c' } to only have key 'b'");

            expect(function () {
                expect({ a: 'b', b: 'c' }, 'not to have key', 'b');
            }, 'to throw exception', "expected { a: 'b', b: 'c' } not to have key 'b'");

            expect(function () {
                expect({ a: 'b', c: 'd' }, 'to not only have keys', ['a', 'c']);
            }, 'to throw exception', "expected { a: 'b', c: 'd' } to not only have keys [ 'a', 'c' ]");

            expect(function () {
                expect({ a: 'b', c: 'd' }, 'to only have keys', 'a', 'd');
            }, 'to throw exception', "expected { a: 'b', c: 'd' } to only have keys 'a', 'd'");

            expect(function () {
                expect({ a: 'b', c: 'd' }, 'to not only have keys', 'a', 'c');
            }, 'to throw exception', "expected { a: 'b', c: 'd' } to not only have keys 'a', 'c'");
        });
    });

    describe('finite assertion', function () {
        it('asserts a finite number', function () {
            expect(123, 'to be finite');
            expect(0, 'to be finite');
            expect(Infinity, 'not to be finite');
            expect(-Infinity, 'not to be finite');
        });

        it('refuses to work on NaN', function () {
            expect(function () {
                expect(NaN, 'not to be finite');
            }, 'to throw',
                   'expected NaN not to be finite\n' +
                   '  The assertion "not to be finite" is not defined for the type "NaN",\n' +
                   '  but it is defined for the type "number"');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(Infinity, 'to be finite');
            }, 'to throw exception', 'expected Infinity to be finite');
        });
    });

    describe('infinite assertion', function () {
        it('asserts a infinite number', function () {
            expect(123, 'not to be infinite');
            expect(0, 'not to be infinite');
            expect(Infinity, 'to be infinite');
            expect(-Infinity, 'to be infinite');
        });

        it('refuses to work on NaN', function () {
            expect(function () {
                expect(NaN, 'not to be infinite');
            }, 'to throw',
                   'expected NaN not to be infinite\n' +
                   '  The assertion "not to be infinite" is not defined for the type "NaN",\n' +
                   '  but it is defined for the type "number"');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(123, 'to be infinite');
            }, 'to throw exception', 'expected 123 to be infinite');
        });
    });

    describe('within assertion', function () {
        it('asserts a number within a range', function () {
            expect(0, 'to be within', 0, 4);
            expect(1, 'to be within', 0, 4);
            expect(4, 'to be within', 0, 4);
            expect(-1, 'not to be within', 0, 4);
            expect(5, 'not to be within', 0, 4);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(4, 'not to be within', 0, 4);
            }, 'to throw exception', 'expected 4 not to be within 0..4');
            expect(function () {
                expect(null, 'not to be within', 0, 4);
            }, 'to throw exception',
                   'expected null not to be within 0, 4\n' +
                   '  The assertion "not to be within" is not defined for the type "null",\n' +
                   '  but it is defined for these types: "number", "string"');
        });

        it('throws with the correct error message when the end points are strings', function () {
            expect(function () {
                expect('a', 'to be within', 'c', 'd');
            }, 'to throw exception', "expected 'a' to be within 'c'..'d'");
        });
    });

    describe('less than assertion', function () {
        it('asserts <', function () {
            expect(0, 'to be less than', 4);
            expect(0, 'to be below', 1);
            expect(3, 'to be <', 4);
            expect(3, '<', 4);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(0, 'to be less than', 0);
            }, 'to throw exception', "expected 0 to be less than 0");
        });
    });

    describe('less than or equal assertion', function () {
        it('asserts <=', function () {
            expect(0, 'to be less than or equal to', 4);
            expect(4, 'to be <=', 4);
            expect(3, '<=', 4);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(0, 'to be less than or equal to', -1);
            }, 'to throw exception', "expected 0 to be less than or equal to -1");
        });
    });

    describe('greater than assertion', function () {
        it('assert >', function () {
            expect(3, 'to be greater than', 2);
            expect(1, 'to be above', 0);
            expect(4, 'to be >', 3);
            expect(4, '>', 3);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(0, 'to be greater than', 0);
            }, 'to throw exception', "expected 0 to be greater than 0");
        });

        it('refuses to compare NaN to a number', function () {
            expect(function () {
                expect(NaN, 'not to be greater than', 1);
            }, 'to throw',
                   'expected NaN not to be greater than 1\n' +
                   '  The assertion "not to be greater than" is not defined for the type "NaN",\n' +
                   '  but it is defined for these types: "number", "string"');
        });
    });

    describe('greater than or equal assertion', function () {
        it('assert >=', function () {
            expect(3, 'to be greater than or equal to', 2);
            expect(3, 'to be >=', 3);
            expect(3, '>=', 3);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(-1, 'to be greater than or equal to', 0);
            }, 'to throw exception', "expected -1 to be greater than or equal to 0");
        });
    });

    describe('positive assertion', function () {
        it('assert that a number is positive', function () {
            expect(3, 'to be positive');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(0, 'to be positive');
            }, 'to throw exception', "expected 0 to be positive");
        });
    });

    describe('negative assertion', function () {
        it('assert that a number is negative', function () {
            expect(-1, 'to be negative');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(0, 'to be negative');
            }, 'to throw exception', "expected 0 to be negative");
        });
    });

    describe('to be NaN assertion', function () {
        it('assert that the value is NaN or not', function () {
            expect(NaN, 'to be NaN');
            expect(2, 'not to be NaN');
        });

        it('fails when the assertion fails', function () {
            expect(function () {
                expect(0, 'to be NaN');
            }, 'to throw', "expected 0 to be NaN");

            expect(function () {
                expect(NaN, 'not to be NaN');
            }, 'to throw', "expected NaN not to be NaN");
        });
    });

    describe('to be close to assertion', function () {
        it('asserts that two numbers differ by at most 1e-9', function () {
            expect(1.5, 'to be close to', 1.49999999999);
            expect(1.5, 'to be close to', 1.5000000001);
            expect(1.5, 'not to be close to', 2);
        });

        it('fails when the assertion fails', function () {
            expect(function () {
                expect(1.5, 'to be close to', 1.4999);
            }, 'to throw exception', 'expected 1.5 to be close to 1.4999 (epsilon: 1e-9)');

            expect(function () {
                expect(1.5, 'to be close to', 1.5001);
            }, 'to throw exception', 'expected 1.5 to be close to 1.5001 (epsilon: 1e-9)');
        });

        it('accepts a custom epsilon', function () {
            expect(1.5, 'to be close to', 1.500001, 1e-3);

            expect(1.5, 'not to be close to', 1.51, 1e-3);

            expect(function () {
                expect(1.5, 'to be close to', 1.51, 1e-3);
            }, 'to throw exception', 'expected 1.5 to be close to 1.51 (epsilon: 1e-3)');
        });
    });

    describe('fail assertion', function () {
        it('throws an error', function () {
            expect(function () {
                expect.fail();
            }, 'to throw exception', "Explicit failure");
        });

        it('sets the error message', function () {
            var wasCaught = false;
            try {
                expect.fail('fail with error message');
            } catch (e) {
                wasCaught = true;
                expect(e.message, 'to contain', 'fail with error message');
            }
            expect(wasCaught, 'to be true');
        });

        it('throws an error with a given message', function () {
            expect(function () {
                expect.fail('fail with error message');
            }, 'to throw exception', "fail with error message");
        });

        it('supports placeholders', function () {
            expect(function () {
                expect.fail('{0} was expected to be {1}', 0, 'zero');
            }, 'to throw exception', "0 was expected to be 'zero'");

            expect(function () {
                var output = expect.output.clone().text('zero');
                expect.fail('{0} was expected to be {1}', 0, output);
            }, 'to throw exception', "0 was expected to be zero");

            expect(function () {
                expect.fail('{0} was expected to be {1}', 0);
            }, 'to throw exception', "0 was expected to be {1}");
        });

    });

    describe('to satisfy assertion', function () {
        describe('with the not flag', function () {
            it('should succeed when the assertion fails without the not flag', function () {
                expect({foo: 123}, 'not to satisfy', {foo: 456});
            });

            it('should succeed when the assertion fails without the not flag, async case', function () {
                return expect({foo: 123}, 'not to satisfy', {foo: expect.it('when delayed a little bit', 'to equal', 456)});
            });

            it('should fail when a non-Unexpected error occurs', function () {
                expect(function () {
                    expect({foo: 123}, 'not to satisfy', function () {
                        throw new Error('foo');
                    });
                }, 'to throw', 'foo');
            });

            it('should fail when the assertion succeeds', function () {
                expect(function () {
                    expect({foo: 123}, 'not to satisfy', {foo: 123});
                }, 'to throw',
                    'expected { foo: 123 } not to satisfy { foo: 123 }'
                );
            });
        });

        describe.skipIf(typeof Buffer === 'undefined', 'with a buffer instance', function () {
            describe('in an async setting', function () {
                it('should succeed', function () {
                    return expect(new Buffer([0, 1, 2]), 'to satisfy', expect.it('when delayed a little bit', 'to equal', new Buffer([0, 1, 2])));
                });

                it('should fail with a diff', function () {
                    return expect(
                        expect(new Buffer([0, 1, 2]), 'to satisfy', expect.it('when delayed a little bit', 'to equal', new Buffer([2, 1, 0]))),
                        'to be rejected',
                            "expected Buffer([0x00, 0x01, 0x02])\n" +
                            "to satisfy expect.it('when delayed a little bit', 'to equal', Buffer([0x02, 0x01, 0x00]))\n" +
                            "\n" +
                            "expected Buffer([0x00, 0x01, 0x02]) when delayed a little bit to equal Buffer([0x02, 0x01, 0x00])\n" +
                            "\n" +
                            "-00 01 02                                         │...│\n" +
                            "+02 01 00                                         │...│"
                    );
                });
            });
        });

        describe('with an array satisfied against an object with a numeric property', function () {
            it('should succeed', function () {
                expect(['aa', 'bb', 'cc'], 'to satisfy', {2: /cc/});
            });

            it('should fail', function () {
                expect(function () {
                    expect(['aa', 'bb', 'cc'], 'to satisfy', {2: /quux/});
                }, 'to throw',
                    "expected [ 'aa', 'bb', 'cc' ] to satisfy { 2: /quux/ }\n" +
                    "\n" +
                    "Array({\n" +
                    "  0: 'aa',\n" +
                    "  1: 'bb',\n" +
                    "  2: 'cc' // should match /quux/\n" +
                    "})"
                );
            });
        });

        it.skipIf(!Object.defineProperty, 'should honor the getKeys implementation of a type when building a diff', function () {
            function MyThing(a, b) {
                this.a = a;
                Object.defineProperty(this, 'b', { enumerable: false, value: b });
            }

            var clonedExpect = expect.clone().addType({
                name: 'MyThing',
                base: 'object',
                identify: function (obj) {
                    return obj instanceof MyThing;
                },
                getKeys: function () {
                    return ['a', 'b'];
                }
            });

            expect(function () {
                clonedExpect(new MyThing(123, 456), 'to exhaustively satisfy', {a: 123, b: 654});
            }, 'to throw',
                'expected MyThing({ a: 123, b: 456 }) to exhaustively satisfy { a: 123, b: 654 }\n' +
                '\n' +
                'MyThing({\n' +
                '  a: 123,\n' +
                '  b: 456 // should equal 654\n' +
                '})'
            );
        });

        describe('with the assertion flag', function () {
            it('should succeed', function () {
                expect('foo', 'to satisfy assertion', 'to equal', 'foo');
            });

            it('should fail with a diff', function () {
                expect(function () {
                    expect('foo', 'to satisfy assertion', 'to equal', 'bar');
                }, 'to throw',
                    "expected 'foo' to equal 'bar'\n" +
                    "\n" +
                    "-foo\n" +
                    "+bar"
                );
            });

            describe('and the exhaustively flag', function () {
                it('should succeed', function () {
                    expect({foo: 123}, 'to exhaustively satisfy assertion', {foo: 123});
                });

                it('should fail with a diff', function () {
                    expect(function () {
                        expect({foo: 123}, 'to exhaustively satisfy assertion', {foo: 456});
                    }, 'to throw',
                        "expected { foo: 123 } to exhaustively satisfy { foo: 456 }\n" +
                        "\n" +
                        "{\n" +
                        "  foo: 123 // should equal 456\n" +
                        "}"
                    );
                });
            });
        });

        it('forwards normal errors to the top-level', function () {
            expect(function () {
                expect({
                    foo: 'foo'
                }, 'to satisfy', function (value) {
                    throw new Error('Custom error');
                });
            }, 'to throw', 'Custom error');
        });

        it('forwards normal errors found in promise aggregate errors to the top level', function () {
            var clonedExpect = expect.clone().addAssertion('to foo', function (expect, subject) {

                var promises = [
                    clonedExpect.promise(function () {
                        clonedExpect('foo', 'to equal', 'bar');
                    }),
                    clonedExpect.promise(function () {
                        return clonedExpect.promise.any([
                            clonedExpect.promise(function () {
                                clonedExpect('foo', 'to equal', 'bar');
                            }),
                            clonedExpect.promise(function () {
                                throw new Error('wat');
                            })
                        ]);
                    })
                ];
                return expect.promise.all(promises).caught(function (err) {
                    return clonedExpect.promise.settle(promises);
                });
            });

            expect(function () {
                return clonedExpect('foo', 'to foo');
            }, 'to throw', 'wat');

        });

        describe('with a synchronous expect.it in the RHS object', function () {
            it('should support an object with a property value of expect.it', function () {
                expect({foo: 'bar'}, 'to satisfy', {
                    foo: expect.it('to be a string')
                });
            });

            it('should support passing an array value to an expect.it', function () {
                expect({foo: [123]}, 'to satisfy', {
                    foo: expect.it('to have items satisfying', 'to be a number')
                });
            });

            it('should not call functions in the LHS object', function () {
                expect({foo: function () { throw new Error('Explosion'); } }, 'to satisfy', {
                    foo: expect.it('to be a function')
                });
            });

            // This one fails on CI, but I cannot reproduce it locally
            it.skip('should succeed with an or group where the first assertion passes and the second one fails', function () {
                return expect(2, 'to satisfy', expect.it('to equal', 2).or('to equal', 1));
            });

            it('should succeed with an or group where the first one fails and the second assertion passes', function () {
                return expect(1, 'to satisfy', expect.it('to equal', 2).or('to equal', 1));
            });

            it('should succeed with an or group where both assertions pass', function () {
                return expect(1, 'to satisfy', expect.it('to equal', 2).or('to equal', 1));
            });

            it('should fail with an or group where both assertions fail', function () {
                expect(function () {
                    expect(3, 'to satisfy', expect.it('to equal', 2).or('to equal', 1));
                }, 'to throw',
                    "expected 3 to satisfy\n" +
                    "expect.it('to equal', 2)\n" +
                    "      .or('to equal', 1)\n" +
                    "\n" +
                    "⨯ expected 3 to equal 2 or\n" +
                    "⨯ expected 3 to equal 1"
                );
            });
        });

        describe('with an asynchronous expect.it in the RHS object', function () {
            it('should support an object with a property value of expect.it', function () {
                return expect({foo: 'bar'}, 'to satisfy', {
                    foo: expect.it('when delayed a little bit', 'to be a string')
                });
            });

            it('should support passing an array value to an expect.it', function () {
                return expect({foo: [123]}, 'to satisfy', {
                    foo: expect.it('when delayed a little bit', 'to have items satisfying', 'to be a number')
                });
            });

            it('should succeed with an or group where the first assertion passes and the second one fails', function () {
                return expect(2, 'to satisfy', expect.it('when delayed a little bit', 'to equal', 2).or('when delayed a little bit', 'to equal', 1));
            });

            it('should succeed with an or group where the first one fails and the second assertion passes', function () {
                return expect(1, 'to satisfy', expect.it('when delayed a little bit', 'to equal', 2).or('when delayed a little bit', 'to equal', 1));
            });

            it('should succeed with an or group where the first one fails synchronously and the second assertion passes asynchronously', function () {
                return expect(1, 'to satisfy', expect.it('to equal', 2).or('when delayed a little bit', 'to equal', 1));
            });

            it('should succeed with an or group where the first one fails asynchronously and the second assertion passes synchronously', function () {
                return expect(1, 'to satisfy', expect.it('when delayed a little bit', 'to equal', 2).or('to equal', 1));
            });

            it('should succeed with an or group where both assertions pass', function () {
                return expect(1, 'to satisfy', expect.it('when delayed a little bit', 'to equal', 2).or('when delayed a little bit', 'to equal', 1));
            });

            it('should fail with an or group where both assertions fail asynchronously', function () {
                return expect(
                    expect(3, 'to satisfy', expect.it('when delayed a little bit', 'to equal', 2).or('when delayed a little bit', 'to equal', 1)),
                    'to be rejected',
                        "expected 3 to satisfy\n" +
                        "expect.it('when delayed a little bit', 'to equal', 2)\n" +
                        "      .or('when delayed a little bit', 'to equal', 1)\n" +
                        "\n" +
                        "⨯ expected 3 when delayed a little bit to equal 2 or\n" +
                        "⨯ expected 3 when delayed a little bit to equal 1"
                );
            });

            it('should fail with an or group where the first one fails synchronously and the second one fails asynchronously', function () {
                return expect(
                    expect(3, 'to satisfy', expect.it('to equal', 2).or('when delayed a little bit', 'to equal', 1)),
                    'to be rejected',
                        "expected 3 to satisfy\n" +
                        "expect.it('to equal', 2)\n" +
                        "      .or('when delayed a little bit', 'to equal', 1)\n" +
                        "\n" +
                        "⨯ expected 3 to equal 2 or\n" +
                        "⨯ expected 3 when delayed a little bit to equal 1"
                );
            });

            it('should fail with an or group where the first one fails asynchronously and the second one fails synchronously', function () {
                return expect(
                    expect(3, 'to satisfy', expect.it('when delayed a little bit', 'to equal', 2).or('to equal', 1)),
                    'to be rejected',
                        "expected 3 to satisfy\n" +
                        "expect.it('when delayed a little bit', 'to equal', 2)\n" +
                        "      .or('to equal', 1)\n" +
                        "\n" +
                        "⨯ expected 3 when delayed a little bit to equal 2 or\n" +
                        "⨯ expected 3 to equal 1"
                );
            });
        });

        it('should support expect.it at the first level', function () {
            expect(function () {
                expect('bar', 'to satisfy', expect.it('to be a number'));
            }, 'to throw',
                   "expected 'bar' to satisfy expect.it('to be a number')\n" +
                   "\n" +
                   "expected 'bar' to be a number");
        });

        it('should support regular expressions in the RHS object', function () {
            expect({foo: 'bar'}, 'to satisfy', {
                foo: /ba/
            });

            expect(function () {
                expect({foo: 'foo'}, 'to satisfy', {
                    foo: /f00/
                });
            }, 'to throw',
                   "expected { foo: 'foo' } to satisfy { foo: /f00/ }\n" +
                   "\n" +
                   "{\n" +
                   "  foo: 'foo' // should match /f00/\n" +
                   "}");

            expect(function () {
                expect({foo: 'foo'}, 'to satisfy', {
                    foo: expect.it('not to match', /oo/)
                });
            }, 'to throw',
                   "expected { foo: 'foo' } to satisfy { foo: expect.it('not to match', /oo/) }\n" +
                   "\n" +
                   "{\n" +
                   "  foo: 'foo' // expected 'foo' not to match /oo/\n" +
                   "             //\n" +
                   "             // foo\n" +
                   "}");
        });

        it('should support expect.it in an array', function () {
            expect({foo: [123]}, 'to satisfy', {
                foo: [expect.it('to be a number')]
            });
        });

        it('should support directly naming other assertions', function () {
            expect(123, 'to satisfy assertion', 'to be a number');
        });

        it('should support delegating to itself as a weird noop', function () {
            expect(123, 'to satisfy assertion', 'to satisfy assertion', 'to satisfy assertion', 'to be a number');
        });

        it('should support a regular function in the RHS object (expected to throw an exception if the condition is not met)', function () {
            expect({foo: 123}, 'to satisfy', function (obj) {
                expect(obj.foo, 'to equal', 123);
            });
        });

        describe('on Error instances', function () {
            it('should support satisfying against an Error instance', function () {
                expect(new Error('foo'), 'to satisfy', new Error('foo'));
            });

            it('should support satisfying against an Error instance when the subject has additional properties', function () {
                var err = new Error('foo');
                err.bar = 123;
                expect(err, 'to satisfy', new Error('foo'));
            });

            it('should not consider errors with different constructors to satisfy each other, even if all properties are identical', function () {
                expect(function () {
                    expect(new Error('foo'), 'to satisfy', new TypeError('foo'));
                }, 'to throw', "expected Error({ message: 'foo' }) to satisfy TypeError({ message: 'foo' })");
            });

            it('should support satisfying against an object', function () {
                expect(new Error('foo'), 'to satisfy', { message: 'foo' });
            });

            describe('in "exhaustively" mode', function () {
                it('should succeed', function () {
                    expect(new Error('foo'), 'to exhaustively satisfy', { message: 'foo' });
                });

                it('should fail with a diff', function () {
                    var err = new Error('foo');
                    err.bar = 123;
                    expect(function () {
                        expect(err, 'to exhaustively satisfy', { message: 'foo' });
                    }, 'to throw',
                        // Would be nice to have a diff here:
                        "expected Error({ message: 'foo', bar: 123 }) to exhaustively satisfy { message: 'foo' }"
                    );
                });
            });

            it('should support satisfying against a regexp', function () {
                expect(new Error('foo'), 'to satisfy', /foo/);
            });

            describe('when satisfying against a function', function () {
                it('should succeed if the function does not throw', function () {
                    expect(new Error('foo'), 'to satisfy', function (err) {
                        expect(err, 'to be an', Error);
                    });
                });

                it('fails when the function throws', function () {
                    expect(function () {
                        expect(new Error('Custom message'), 'to satisfy', function (err) {
                            expect(err, 'to be a', TypeError);
                        });
                    }, 'to throw', "expected Error({ message: 'Custom message' }) to be a TypeError");
                });
            });
        });

        describe.skipIf(typeof Buffer === 'undefined', 'on Buffer instances', function () {
            it('should assert equality', function () {
                expect(new Buffer([1, 2, 3]), 'to satisfy', new Buffer([1, 2, 3]));
            });

            it('should fail with a binary diff when the assertion fails', function () {
                expect(function () {
                    expect(new Buffer([1, 2, 3]), 'to satisfy', new Buffer([1, 2, 4]));
                }, 'to throw',
                    'expected Buffer([0x01, 0x02, 0x03]) to satisfy Buffer([0x01, 0x02, 0x04])\n' +
                    '\n' +
                    '-01 02 03                                         │...│\n' +
                    '+01 02 04                                         │...│');
            });

            it('should fail with a binary diff when the assertion fails with the assertion flag on', function () {
                expect(function () {
                    expect(new Buffer([1, 2, 3]), 'to satisfy assertion', new Buffer([1, 2, 4]));
                }, 'to throw',
                    'expected Buffer([0x01, 0x02, 0x03]) to satisfy Buffer([0x01, 0x02, 0x04])\n' +
                    '\n' +
                    '-01 02 03                                         │...│\n' +
                    '+01 02 04                                         │...│');
            });

            describe('with expect.it', function () {
                it('should succeed', function () {
                    expect(new Buffer('bar'), 'to satisfy', expect.it('to equal', new Buffer('bar')));
                });

                it('should fail with a diff', function () {
                    expect(function () {
                        expect(new Buffer('bar'), 'to satisfy', expect.it('to equal', new Buffer('foo')));
                    }, 'to throw',
                        "expected Buffer([0x62, 0x61, 0x72]) to satisfy expect.it('to equal', Buffer([0x66, 0x6F, 0x6F]))\n" +
                        "\n" +
                        "expected Buffer([0x62, 0x61, 0x72]) to equal Buffer([0x66, 0x6F, 0x6F])\n" +
                        "\n" +
                        "-62 61 72                                         │bar│\n" +
                        "+66 6F 6F                                         │foo│"
                    );
                });
            });

            it('should satisfy a function', function () {
                expect(new Buffer('bar'), 'to satisfy', function (buffer) {
                    expect(buffer, 'to have length', 3);
                });
            });
        });

        describe('on Uint8Array instances', function () {
            it.skipIf(typeof Uint8Array === 'undefined', 'should assert equality', function () {
                expect(new Uint8Array([1, 2, 3]), 'to satisfy', new Uint8Array([1, 2, 3]));
            });

            it.skipIf(typeof Uint8Array === 'undefined', 'fail with a binary diff when the assertion fails', function () {
                expect(function () {
                    expect(new Uint8Array([1, 2, 3]), 'to satisfy', new Uint8Array([1, 2, 4]));
                }, 'to throw',
                    'expected Uint8Array([0x01, 0x02, 0x03]) to satisfy Uint8Array([0x01, 0x02, 0x04])\n' +
                    '\n' +
                    '-01 02 03                                         │...│\n' +
                    '+01 02 04                                         │...│');
            });
        });

        describe('on object with getters', function () {
            it('should satisfy on the value returned by the getter', function () {
                var subject = { nextLevel: {} };
                Object.defineProperty(subject.nextLevel, 'getMe', {
                    get: function () { return 'got me'; },
                    enumerable: false
                });

                expect(subject, 'to satisfy', {
                    nextLevel: {
                        getMe: 'got me'
                    }
                });
            });
        });

        describe('on array-like', function () {
            it('should diff correctly against an array on the right hand side', function () {
                expect(function () {
                    expect(toArguments({foo: 'foo'},2,3), 'to satisfy', [{foo: 'f00'}]);
                }, 'to throw',
                       "expected arguments( { foo: 'foo' }, 2, 3 ) to satisfy [ { foo: 'f00' } ]\n" +
                       "\n" +
                       "[\n" +
                       "  {\n" +
                       "    foo: 'foo' // should equal 'f00'\n" +
                       "               // -foo\n" +
                       "               // +f00\n" +
                       "  },\n" +
                       "  2, // should be removed\n" +
                       "  3 // should be removed\n" +
                       "]");
            });
        });

        describe('on arrays', function () {
            it('should require all indices to be present in the subject', function () {
                expect([1, 2, 3], 'to satisfy', [1, 2, 3]);
            });

            it('should produce a diff when an undefined item in the subject is found at a position outside of the value array', function () {
                expect(function () {
                    expect([ undefined ], 'to satisfy', []);
                }, 'to throw',
                    'expected [ undefined ] to satisfy []\n' +
                    '\n' +
                    '[\n' +
                    '  undefined // should be removed\n' +
                    ']'
                );
            });

            it('should produce a diff when the value has more items than the subject', function () {
                expect(function () {
                    expect([], 'to satisfy', [ undefined ]);
                }, 'to throw',
                    'expected [] to satisfy [ undefined ]\n' +
                    '\n' +
                    '[\n' +
                    '  // should satisfy undefined\n' +
                    ']'
                );
            });

            it('should fail if the value does not include all the indices of the subject', function () {
                expect(function () {
                    expect([1, 2, 3], 'to satisfy', [1, 2]);
                }, 'to throw',
                    'expected [ 1, 2, 3 ] to satisfy [ 1, 2 ]\n' +
                    '\n' +
                    '[\n' +
                    '  1,\n' +
                    '  2,\n' +
                    '  3 // should be removed\n' +
                    ']');
            });

            it('should fail if the value includes more indices than the subject', function () {
                expect(function () {
                    expect([1, 2, 3], 'to satisfy', [1, 2, 3, 4]);
                }, 'to throw',
                    'expected [ 1, 2, 3 ] to satisfy [ 1, 2, 3, 4 ]\n' +
                    '\n' +
                    '[\n' +
                    '  1,\n' +
                    '  2,\n' +
                    '  3,\n' +
                    '  // should equal 4\n' +
                    ']');
            });
        });

        it('should support a chained expect.it', function () {
            expect({foo: 123}, 'to satisfy', {
                foo: expect.it('to be a number').and('to be greater than', 10)
            });

            expect(function () {
                expect({foo: 123}, 'to satisfy', {
                    foo: expect.it('to be a number').and('to be greater than', 200)
                });
            }, 'to throw',
                   "expected { foo: 123 } to satisfy\n" +
                   "{\n" +
                   "  foo: expect.it('to be a number')\n" +
                   "               .and('to be greater than', 200)\n" +
                   "}\n" +
                   "\n" +
                   "{\n" +
                   "  foo: 123 // ✓ expected 123 to be a number and\n" +
                   "           // ⨯ expected 123 to be greater than 200\n" +
                   "}");
        });

        it('should support asserting on properties that are not defined', function () {
            expect({foo: 123}, 'to satisfy', {
                bar: expect.it('to be undefined')
            });
        });

        it('should assert missing properties with undefined in the RHS object', function () {
            expect({foo: 123}, 'to satisfy', {
                bar: undefined
            });
        });

        it('should support the exhaustively flag', function () {
            expect({foo: 123}, 'to exhaustively satisfy', {foo: 123});
        });

        it('should support delegating to itself with the exhaustively flag', function () {
            expect({foo: {bar: 123}, baz: 456}, 'to satisfy', {
                foo: expect.it('to exhaustively satisfy', {bar: 123})
            });
        });

        it('should support delegating to itself without the exhaustively flag', function () {
            expect({foo: {bar: 123, baz: 456}}, 'to exhaustively satisfy', {
                foo: expect.it('to satisfy', {bar: 123})
            });
        });

        it('should not fail when matching an object against a number', function () {
            expect({foo: {}}, 'not to satisfy', {foo: 123});
        });

        it('fails when comparing errors that do not have the same message', function () {
            expect(function () {
                expect(new Error('foo'), 'to satisfy', new Error('bar'));
            }, 'to throw exception',
                   "expected Error({ message: 'foo' }) to satisfy Error({ message: 'bar' })\n" +
                   "\n" +
                   "Error({\n" +
                   "  message: 'foo' // should equal 'bar'\n" +
                   "                 // -foo\n" +
                   "                 // +bar\n" +
                   "})");
        });

        it('fails when error message does not match given regexp', function () {
            expect(function () {
                expect(new Error('foo'), 'to satisfy', /bar/);
            }, 'to throw exception', "expected Error({ message: 'foo' }) to satisfy /bar/");
        });

        it('fails when using an unknown assertion', function () {
            expect(function () {
                expect({ bool: 'true' }, 'to satisfy', { bool: expect.it('to be true') });
            }, 'to throw exception',
                   "expected { bool: 'true' } to satisfy { bool: expect.it('to be true') }\n" +
                   "\n" +
                   "{\n" +
                   "  bool: 'true' // expected 'true' to be true\n" +
                   "               //   The assertion \"to be true\" is not defined for the type \"string\",\n" +
                   "               //   but it is defined for the type \"boolean\"\n" +
                   "}");
        });

        it('fails is error does not satisfy properties of given object', function () {
            expect(function () {
                expect(new Error('foo'), 'to satisfy', { message: 'bar' });
            }, 'to throw exception',
                   "expected Error({ message: \'foo\' }) to satisfy { message: \'bar\' }\n" +
                   "\n" +
                   "-foo\n" +
                   "+bar");
        });

        it('includes the constructor name in the diff', function () {
            function Foo(value) {
                this.value = value;
            }
            expect(function () {
                expect(new Foo('bar'), 'to satisfy', { value: 'quux' });
            }, 'to throw exception',
                   "expected Foo({ value: 'bar' }) to satisfy { value: 'quux' }\n" +
                   "\n" +
                   "Foo({\n" +
                   "  value: 'bar' // should equal 'quux'\n" +
                   '               // -bar\n' +
                   '               // +quux\n' +
                   '})');
        });

        it('collapses subtrees without conflicts', function () {
            expect(function () {
                expect({
                    pill: {
                        red: "I'll show you how deep the rabbit hole goes",
                        blue: { ignorance: { of: 'illusion' } },
                        purple: { you: 'wat there is another pill', them: 'there is always more choices' }
                    }
                }, 'to satisfy', {
                    pill: {
                        red: "I'll show you how deep the rabbit hole goes.",
                        blue: { ignorance: { of: 'illusion' } }
                    }
                });
            }, 'to throw',
                   "expected\n" +
                   "{\n" +
                   "  pill: {\n" +
                   "    red: 'I\\'ll show you how deep the rabbit hole goes',\n" +
                   "    blue: { ignorance: ... },\n" +
                   "    purple: { you: 'wat there is another pill', them: 'there is always more choices' }\n" +
                   "  }\n" +
                   "}\n" +
                   "to satisfy\n" +
                   "{\n" +
                   "  pill: {\n" +
                   "    red: 'I\\'ll show you how deep the rabbit hole goes.',\n" +
                   "    blue: { ignorance: ... }\n" +
                   "  }\n" +
                   "}\n" +
                   "\n" +
                   "{\n" +
                   "  pill: {\n" +
                   "    red: 'I\\'ll show you how deep the rabbit hole goes', // should equal 'I\\'ll show you how deep the rabbit hole goes.'\n" +
                   "                                                         // -I'll show you how deep the rabbit hole goes\n" +
                   "                                                         // +I'll show you how deep the rabbit hole goes.\n" +
                   "    blue: { ignorance: ... },\n" +
                   "    purple: { you: 'wat there is another pill', them: 'there is always more choices' }\n" +
                   "  }\n" +
                   "}");
        });

        it('indents removed objects correctly', function () {
            var str = 'abcdefghijklmnopqrstuvwxyz';
            expect(function () {
                expect({foo: {a: str, b: str, c: str, d: str, e: str}}, 'to equal', {});
            }, 'to throw',
                'expected\n' +
                '{\n' +
                '  foo: {\n' +
                "    a: 'abcdefghijklmnopqrstuvwxyz',\n" +
                "    b: 'abcdefghijklmnopqrstuvwxyz',\n" +
                "    c: 'abcdefghijklmnopqrstuvwxyz',\n" +
                "    d: 'abcdefghijklmnopqrstuvwxyz',\n" +
                "    e: 'abcdefghijklmnopqrstuvwxyz'\n" +
                '  }\n' +
                '}\n' +
                'to equal {}\n' +
                '\n' +
                '{\n' +
                '  foo: {\n' +
                "    a: 'abcdefghijklmnopqrstuvwxyz',\n" +
                "    b: 'abcdefghijklmnopqrstuvwxyz',\n" +
                "    c: 'abcdefghijklmnopqrstuvwxyz',\n" +
                "    d: 'abcdefghijklmnopqrstuvwxyz',\n" +
                "    e: 'abcdefghijklmnopqrstuvwxyz'\n" +
                '  } // should be removed\n' +
                '}');
        });

        it('indents unchanged objects correctly', function () {
            var str = 'abcdefghijklmnopqrstuvwxyz';
            expect(function () {
                expect({foo: {a: str, b: str, c: str, d: str, e: str}, bar: 1}, 'to equal', {foo: {a: str, b: str, c: str, d: str, e: str}});
            }, 'to throw',
                'expected\n' +
                '{\n' +
                '  foo: {\n' +
                "    a: 'abcdefghijklmnopqrstuvwxyz',\n" +
                "    b: 'abcdefghijklmnopqrstuvwxyz',\n" +
                "    c: 'abcdefghijklmnopqrstuvwxyz',\n" +
                "    d: 'abcdefghijklmnopqrstuvwxyz',\n" +
                "    e: 'abcdefghijklmnopqrstuvwxyz'\n" +
                '  },\n' +
                '  bar: 1\n' +
                '}\n' +
                'to equal\n' +
                '{\n' +
                '  foo: {\n' +
                "    a: 'abcdefghijklmnopqrstuvwxyz',\n" +
                "    b: 'abcdefghijklmnopqrstuvwxyz',\n" +
                "    c: 'abcdefghijklmnopqrstuvwxyz',\n" +
                "    d: 'abcdefghijklmnopqrstuvwxyz',\n" +
                "    e: 'abcdefghijklmnopqrstuvwxyz'\n" +
                '  }\n' +
                '}\n' +
                '\n' +
                '{\n' +
                '  foo: {\n' +
                "    a: 'abcdefghijklmnopqrstuvwxyz',\n" +
                "    b: 'abcdefghijklmnopqrstuvwxyz',\n" +
                "    c: 'abcdefghijklmnopqrstuvwxyz',\n" +
                "    d: 'abcdefghijklmnopqrstuvwxyz',\n" +
                "    e: 'abcdefghijklmnopqrstuvwxyz'\n" +
                '  },\n' +
                '  bar: 1 // should be removed\n' +
                '}');
        });

        describe('with a custom type', function () {
            function MysteryBox(value) {
                this.propertyName = 'prop' + Math.floor(1000 * Math.random());
                this[this.propertyName] = value;
            }
            var clonedExpect;

            beforeEach(function () {
                clonedExpect = expect.clone()
                    .addType({
                        base: 'wrapperObject',
                        name: 'mysteryBox',
                        identify: function (obj) {
                            return obj instanceof MysteryBox;
                        },
                        unwrap: function (box) {
                            return box[box.propertyName];
                        },
                        prefix: function (output) {
                            return output.text('MysteryBox(');
                        },
                        suffix: function (output) {
                            return output.text(')');
                        }
                    });
            });

            it('should inspect multiline block values in diffs correctly', function () {
                expect(function () {
                    clonedExpect.addType({
                            base: 'number',
                            name: 'numberBox',
                            identify: function (obj) {
                                return typeof obj === 'number' && obj > 0 && obj < 10;
                            },
                            inspect: function (obj, depth, output) {
                                return output.block(function () {
                                    this.text('+-+').nl()
                                      .text('|'+ obj + '|').nl()
                                      .text('|_|');
                                });
                            }
                        });
                    clonedExpect({foo: 2, bar: 'baz'}, 'to satisfy', {bar: 'quux'});
                }, 'to throw',
                    "expected\n" +
                    "{\n" +
                    "  foo:\n" +
                    "    +-+\n" +
                    "    |2|\n" +
                    "    |_|,\n" +
                    "  bar: 'baz'\n" +
                    "}\n" +
                    "to satisfy { bar: 'quux' }\n" +
                    "\n" +
                    "{\n" +
                    "  foo:\n" +
                    "    +-+\n" +
                    "    |2|\n" +
                    "    |_|,\n" +
                    "  bar: 'baz' // should equal 'quux'\n" +
                    "             // -baz\n" +
                    "             // +quux\n" +
                    "}"
                );
            });

            it('should use a "to satisfy" label when a conflict does not have a label', function () {
                expect(function () {
                    expect({foo: {bar: 123}}, 'to satisfy', {foo: {bar: /d/}});
                }, 'to throw',
                    'expected { foo: { bar: 123 } } to satisfy { foo: { bar: /d/ } }\n' +
                    '\n' +
                    '{\n' +
                    '  foo: {\n' +
                    '    bar: 123 // should satisfy /d/\n' +
                    '  }\n' +
                    '}'
                );
            });

            it('should build the correct diff when the subject and value have "diff" and "inline" keys', function () {
                expect(function () {
                    expect({diff: 123, inline: 456}, 'to satisfy', {diff: 321, inline: 654});
                }, 'to throw',
                    'expected { diff: 123, inline: 456 } to satisfy { diff: 321, inline: 654 }\n' +
                    '\n' +
                    '{\n' +
                    '  diff: 123, // should equal 321\n' +
                    '  inline: 456 // should equal 654\n' +
                    '}'
                );
            });

            it('should delegate to the "to satisfies" assertion defined for the custom type', function () {
                clonedExpect({
                    foo: new MysteryBox({ baz: 123, quux: 987 }),
                    bar: new MysteryBox(456)
                }, 'to satisfy', {
                    foo: { baz: clonedExpect.it('to be a number') },
                    bar: 456
                });
            });

            it('should preserve the "exhaustively" flag when matching inside instances of the custom type', function () {
                expect(function () {
                    clonedExpect({
                        foo: new MysteryBox({ baz: 123, quux: 987 })
                    }, 'to exhaustively satisfy', {
                        foo: { baz: clonedExpect.it('to be a number') }
                    });
                }, 'to throw',
                       "expected { foo: MysteryBox({ baz: 123, quux: 987 }) } " +
                       "to exhaustively satisfy { foo: { baz: expect.it('to be a number') } }\n" +
                       "\n" +
                       "{\n" +
                       "  foo: MysteryBox({\n" +
                       "    baz: 123,\n" +
                       "    quux: 987 // should be removed\n" +
                       "  })\n" +
                       "}");
            });

            it('should include wrapper object type information in diff', function () {
                expect(function () {
                    clonedExpect({
                        foo: new MysteryBox({ baz: 123, quux: 987 })
                    }, 'to satisfy', {
                        foo: { baz: clonedExpect.it('not to be a number') }
                    });
                }, 'to throw',
                       "expected { foo: MysteryBox({ baz: 123, quux: 987 }) } " +
                       "to satisfy { foo: { baz: expect.it('not to be a number') } }\n" +
                       "\n" +
                       "{\n" +
                       "  foo: MysteryBox({\n" +
                       "    baz: 123, // expected 123 not to be a number\n" +
                       "    quux: 987\n" +
                       "  })\n" +
                       "}");
            });

            it('should preserve the "exhaustively" flag when matching instances of the custom type against each other', function () {
                expect(function () {
                    clonedExpect({
                        foo: new MysteryBox({ baz: 123, quux: 987 })
                    }, 'to exhaustively satisfy', {
                        foo: new MysteryBox({ baz: clonedExpect.it('to be a number') })
                    });
                }, 'to throw',
                       "expected { foo: MysteryBox({ baz: 123, quux: 987 }) }\n" +
                       "to exhaustively satisfy { foo: MysteryBox({ baz: expect.it('to be a number') }) }\n" +
                       "\n" +
                       "{\n" +
                       "  foo: MysteryBox({\n" +
                       "    baz: 123,\n" +
                       "    quux: 987 // should be removed\n" +
                       "  })\n" +
                       "}");
            });

            it('should support matching against other instances of the custom type', function () {
                clonedExpect({
                    foo: new MysteryBox({ baz: 123 }),
                    bar: new MysteryBox(456)
                }, 'to satisfy', {
                    foo: new MysteryBox({ baz: clonedExpect.it('to be a number') }),
                    bar: new MysteryBox(456)
                });
            });

            it('should fail to match', function () {
                expect(function () {
                    clonedExpect({
                        foo: new MysteryBox('abc')
                    }, 'to satisfy', {
                        foo: 'def'
                    });
                }, 'to throw', "expected { foo: MysteryBox('abc') } to satisfy { foo: 'def' }\n" +
                       "\n" +
                       "{\n" +
                       "  foo: MysteryBox('abc') // should satisfy 'def'\n" +
                       "                         // -abc\n" +
                       "                         // +def\n" +
                       "}");
            });

            it('should fail to match unequal instances of the custom type', function () {
                expect(function () {
                    clonedExpect({
                        foo: new MysteryBox('abc')
                    }, 'to satisfy', {
                        foo: new MysteryBox('def')
                    });
                }, 'to throw',
                       "expected { foo: MysteryBox('abc') } to satisfy { foo: MysteryBox('def') }\n" +
                       "\n" +
                       "{\n" +
                       "  foo: MysteryBox('abc') // should equal MysteryBox('def')\n" +
                       "                         // -abc\n" +
                       "                         // +def\n" +
                       "}");
            });
        });

        it('can be negated with the "not" flag', function () {
            expect(123, 'not to satisfy assertion', 'to be a string');

            expect('foobar', 'not to satisfy', /quux/i);

            expect({foo: 123}, 'not to satisfy', {foo: expect.it('to be a string')});

            expect({foo: 123, bar: 456}, 'not to exhaustively satisfy', {foo: 123});

            expect({foo: 123}, 'not to exhaustively satisfy', {bar: undefined});
        });

        it('fails when the assertion fails', function () {
            expect(function () {
                expect(123, 'to satisfy assertion', 'to be a string');
            }, 'to throw');

            expect(function () {
                expect('foobar', 'to satisfy', /quux/i);
            }, 'to throw', "expected 'foobar' to satisfy /quux/i");

            // FIXME: Could this error message be improved?
            expect(function () {
                expect({foo: 123}, 'to satisfy', {foo: expect.it('to be a string')});
            }, 'to throw',
                "expected { foo: 123 } to satisfy { foo: expect.it('to be a string') }\n" +
                "\n" +
                "{\n" +
                "  foo: 123 // expected 123 to be a string\n" +
                "}");

            expect(function () {
                expect({foo: 123, bar: 456}, 'to exhaustively satisfy', {foo: 123});
            }, 'to throw');

            expect(function () {
                expect({foo: 123}, 'to exhaustively satisfy', {bar: undefined});
            }, 'to throw');
        });

        describe('when delegating to async assertions', function () {
            var clonedExpect = expect.clone()
                .addAssertion('to be a number after a short delay', function (expect, subject) {
                    this.errorMode = 'nested';

                    return expect.promise(function (run) {
                        setTimeout(run(function () {
                            expect(subject, 'to be a number');
                        }), 1);
                    });
                });

            it('returns a promise that is resolved if the assertion succeeds', function () {
                return clonedExpect(42, 'to satisfy', clonedExpect.it('to be a number after a short delay'));
            });

            it('returns a promise that is rejected if the assertion fails', function () {
                return expect(clonedExpect('wat', 'to satisfy', clonedExpect.it('to be a number after a short delay')),
                       'to be rejected',
                       "expected 'wat' to satisfy expect.it('to be a number after a short delay')\n" +
                       "\n" +
                       "expected 'wat' to be a number after a short delay\n" +
                       "  expected 'wat' to be a number");
            });

            describe('supports many levels of asynchronous assertions', function () {
                return expect(
                    expect('abc', 'when delayed a little bit', 'when delayed a little bit', 'to satisfy', expect.it('when delayed a little bit', 'to equal', 'def')),
                    'to be rejected',
                        "expected 'abc'\n" +
                        "when delayed a little bit when delayed a little bit 'to satisfy', expect.it('when delayed a little bit', 'to equal', 'def')\n" +
                        "\n" +
                        "expected 'abc' when delayed a little bit to equal 'def'\n" +
                        "\n" +
                        "-abc\n" +
                        "+def"
                );
            });

            it('supports and groups combined with async assertions', function () {
                return expect(
                    expect(123, 'to satisfy',
                        expect.it('when delayed a little bit', 'to equal', 456)
                            .or('when delayed a little bit', 'to be a string')
                            .and('to be greater than', 100)
                            .or('when delayed a little bit', 'to be a number')
                            .and('when delayed a little bit', 'to be within', 100, 110)
                    ),
                    'to be rejected',
                        "expected 123 to satisfy\n" +
                        "expect.it('when delayed a little bit', 'to equal', 456)\n" +
                        "      .or('when delayed a little bit', 'to be a string')\n" +
                        "        .and('to be greater than', 100)\n" +
                        "      .or('when delayed a little bit', 'to be a number')\n" +
                        "        .and('when delayed a little bit', 'to be within', 100, 110)\n" +
                        "\n" +
                        "⨯ expected 123 when delayed a little bit to equal 456\n" +
                        "or\n" +
                        "⨯ expected 123 when delayed a little bit to be a string and\n" +
                        "  expected 123 to be greater than 100\n" +
                        "or\n" +
                        "✓ expected 123 when delayed a little bit 'to be a number' and\n" +
                        "⨯ expected 123 when delayed a little bit to be within 100, 110"
                );
            });
        });
    });

    describe('to have items satisfying assertion', function () {
        it('requires a third argument', function () {
            expect(function () {
                expect([1, 2, 3], 'to have items satisfying');
            }, 'to throw', 'Assertion "to have items satisfying" expects a third argument');
        });

        it('only accepts arrays as the target object', function () {
            expect(function () {
                expect(42, 'to have items satisfying', function (item) {});
            }, 'to throw',
                   'expected 42 to have items satisfying function (item) {}\n' +
                   '  The assertion "to have items satisfying" is not defined for the type "number",\n' +
                   '  but it is defined for the type "array-like"');
        });

        it('fails if the given array is empty', function () {
            expect(function () {
                expect([], 'to have items satisfying', function (item) {
                    expect(item, 'to be a number');
                });
            }, 'to throw',
                   "expected [] to have items satisfying\n" +
                   "function (item) {\n" +
                   "    expect(item, 'to be a number');\n" +
                   "}\n" +
                   "  expected [] to be non-empty");
        });

        it('asserts that the given callback does not throw for any items in the array', function () {
            expect([0, 1, 2, 3], 'to have items satisfying', function (item, index) {
                expect(item, 'to be a number');
                expect(index, 'to be a number');
            });

            expect(['0', '1', '2', '3'], 'to have items satisfying', function (item, index) {
                expect(item, 'not to be a number');
                expect(index, 'to be a number');
            });

            expect([0, 1, 2, 3], 'to have items satisfying', 'to be a number');

            expect(['0', '1', '2', '3'], 'to have items satisfying', 'not to be a number');

            expect([[1], [2]], 'to have items satisfying', 'to have items satisfying', 'to be a number');
        });

        it('formats non-Unexpected errors correctly', function () {
            expect(function () {
                expect([[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]], 'to have items satisfying', function (item) {
                    expect.fail(function (output) {
                        output.text('foo').nl().text('bar');
                    });
                });
            }, 'to throw',
                    'failed expectation in\n' +
                    '[\n' +
                    '  [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 ]\n' +
                    ']:\n' +
                    '  0: foo\n' +
                    '     bar'
            );
        });

        it('supports legacy "to be an array whose items satisfy"', function () {
            expect(['0', '1', '2', '3'], 'to be an array whose items satisfy', 'not to be a number');
        });

        it('provides the item index to the callback function', function () {
            var arr = ['0', '1', '2', '3'];
            expect(arr, 'to have items satisfying', function (item, index) {
                expect(index, 'to be a number');
                expect(index, 'to be', parseInt(item, 10));
            });
        });

        it('fails when the assertion fails', function () {
            expect(function () {
                expect(['0', 1, '2', '3'], 'to have items satisfying', function (item) {
                    expect(item, 'not to be a number');
                });
            }, 'to throw', /expected 1 not to be a number/);

            expect(function () {
                expect(['0', 1, '2', '3'], 'to have items satisfying', 'not to be a number');
            }, 'to throw', /expected 1 not to be a number/);
        });

        it('provides a detailed report of where failures occur', function () {
            expect(function () {
                expect([0, 1, '2', 3, 4], 'to have items satisfying', function (item) {
                    expect(item, 'to be a number');
                    expect(item, 'to be less than', 4);
                });
            }, 'to throw',
                   "failed expectation in [ 0, 1, '2', 3, 4 ]:\n" +
                   "  2: expected '2' to be a number\n" +
                   "  4: expected 4 to be less than 4");
        });

        it('indents failure reports of nested assertions correctly', function () {
            expect(function () {
                expect([[0, 1, 2], [4, '5', 6], [7, 8, '9']], 'to have items satisfying', function (arr) {
                    expect(arr, 'to have items satisfying', function (item) {
                        expect(item, 'to be a number');
                    });
                });
            }, 'to throw',
                "failed expectation in [ [ 0, 1, 2 ], [ 4, '5', 6 ], [ 7, 8, '9' ] ]:\n" +
                "  1: failed expectation in [ 4, '5', 6 ]:\n" +
                "       1: expected '5' to be a number\n" +
                "  2: failed expectation in [ 7, 8, '9' ]:\n" +
                "       2: expected '9' to be a number");
        });

        describe('delegating to an async assertion', function () {
            var clonedExpect = expect.clone()
                .addAssertion('to be a number after a short delay', function (expect, subject, delay) {
                    this.errorMode = 'nested';

                    return expect.promise(function (run) {
                        setTimeout(run(function () {
                            expect(subject, 'to be a number');
                        }), 1);
                    });
                });

            it('should succeed', function () {
                return clonedExpect([1, 2, 3], 'to have items satisfying', 'to be a number after a short delay');
            });

            it('should fail with a diff', function () {
                return expect(
                    clonedExpect([0, false, 'abc'], 'to have items satisfying', 'to be a number after a short delay'),
                    'to be rejected',
                        "failed expectation in [ 0, false, 'abc' ]:\n" +
                        "  1: expected false to be a number after a short delay\n" +
                        "       expected false to be a number\n" +
                        "  2: expected 'abc' to be a number after a short delay\n" +
                        "       expected 'abc' to be a number"
                );
            });
        });
    });

    describe('to have values satisfying assertion', function () {
        it('requires a third argument', function () {
            expect(function () {
                expect([1, 2, 3], 'to have values satisfying');
            }, 'to throw', 'Assertion "to have values satisfying" expects a third argument');
        });

        it('only accepts objects and arrays as the target', function () {
            expect(function () {
                expect(42, 'to have values satisfying', function (value) {});
            }, 'to throw',
                   'expected 42 to have values satisfying function (value) {}\n' +
                   '  The assertion "to have values satisfying" is not defined for the type "number",\n' +
                   '  but it is defined for the type "object"');
        });

        it('asserts that the given callback does not throw for any values in the map', function () {
            expect({ foo: 0, bar: 1, baz: 2, qux: 3 }, 'to have values satisfying', function (value) {
                expect(value, 'to be a number');
            });

            expect({ foo: '0', bar: '1', baz: '2', qux: '3' }, 'to have values satisfying', function (value) {
                expect(value, 'not to be a number');
            });

            expect({ foo: 0, bar: 1, baz: 2, qux: 3 }, 'to have values satisfying', 'to be a number');

            expect({ foo: '0', bar: '1', baz: '2', qux: '3' }, 'to have values satisfying', 'not to be a number');
        });

        it('fails if the given object is empty', function () {
            expect(function () {
                expect({}, 'to have values satisfying', function (value) {
                    expect(value, 'to equal', '0');
                });
            }, 'to throw',
                   "expected {} to have values satisfying\n" +
                   "function (value) {\n" +
                   "    expect(value, 'to equal', '0');\n" +
                   "}\n" +
                   "  expected {} not to equal {}");
        });

        it('fails if the given array is empty', function () {
            expect(function () {
                expect([], 'to have items satisfying', function (item) {
                    expect(item, 'to be a number');
                });
            }, 'to throw',
                   "expected [] to have items satisfying\n" +
                   "function (item) {\n" +
                   "    expect(item, 'to be a number');\n" +
                   "}\n" +
                   "  expected [] to be non-empty");
        });

        it('fails if the given array is empty', function () {
            expect(function () {
                expect([], 'to have items satisfying', function (item) {
                    expect(item, 'to be a number');
                });
            }, 'to throw',
                   "expected [] to have items satisfying\n" +
                   "function (item) {\n" +
                   "    expect(item, 'to be a number');\n" +
                   "}\n" +
                   "  expected [] to be non-empty");
        });

        it('supports legacy aliases', function () {
            expect({ foo: '0' }, 'to be a map whose values satisfy', function (value) {
                expect(value, 'not to be a number');
            });

            expect({ foo: '0' }, 'to be an object whose values satisfy', function (value) {
                expect(value, 'not to be a number');
            });

            expect({ foo: '0' }, 'to be a hash whose values satisfy', function (value) {
                expect(value, 'not to be a number');
            });
        });

        it('fails when the assertion fails', function () {
            expect(function () {
                expect({ foo: '0', bar: 1, baz: '2', qux: '3' }, 'to have values satisfying', function (value) {
                    expect(value, 'not to be a number');
                });
            }, 'to throw', /expected 1 not to be a number/);
        });

        it('provides a detailed report of where failures occur', function () {
            expect(function () {
                expect({ foo: 0, bar: 1, baz: '2', qux: 3, quux: 4 }, 'to have values satisfying', function (value) {
                    expect(value, 'to be a number');
                    expect(value, 'to be less than', 4);
                });
            }, 'to throw',
                   "failed expectation in { foo: 0, bar: 1, baz: '2', qux: 3, quux: 4 }:\n" +
                   "  baz: expected '2' to be a number\n" +
                   "  quux: expected 4 to be less than 4");
        });

        it('indents failure reports of nested assertions correctly', function () {
            expect(function () {
                expect({ foo: [0, 1, 2], bar: [4, '5', 6], baz: [7, 8, '9'] }, 'to have values satisfying', function (arr) {
                    expect(arr, 'to have items satisfying', function (item) {
                        expect(item, 'to be a number');
                    });
                });
            }, 'to throw',
                "failed expectation in { foo: [ 0, 1, 2 ], bar: [ 4, '5', 6 ], baz: [ 7, 8, '9' ] }:\n" +
                "  bar: failed expectation in [ 4, '5', 6 ]:\n" +
                "         1: expected '5' to be a number\n" +
                "  baz: failed expectation in [ 7, 8, '9' ]:\n" +
                "         2: expected '9' to be a number");
        });

        describe('delegating to an async assertion', function () {
            var clonedExpect = expect.clone()
                .addAssertion('to be a number after a short delay', function (expect, subject, delay) {
                    this.errorMode = 'nested';

                    return expect.promise(function (run) {
                        setTimeout(run(function () {
                            expect(subject, 'to be a number');
                        }), 1);
                    });
                });

            it('should succeed', function () {
                return clonedExpect({0: 1, 1: 2, 2: 3}, 'to have values satisfying', 'to be a number after a short delay');
            });

            it('should fail with a diff', function () {
                return expect(
                    clonedExpect({0: 0, 1: false, 2: 'abc'}, 'to have values satisfying', 'to be a number after a short delay'),
                    'to be rejected',
                        "failed expectation in { 0: 0, 1: false, 2: 'abc' }:\n" +
                        "  1: expected false to be a number after a short delay\n" +
                        "       expected false to be a number\n" +
                        "  2: expected 'abc' to be a number after a short delay\n" +
                        "       expected 'abc' to be a number"
                );
            });
        });
    });

    describe('to have keys satisfying assertion', function () {
        it('requires a third argument', function () {
            expect(function () {
                expect([1, 2, 3], 'to have keys satisfying');
            }, 'to throw', 'Assertion "to have keys satisfying" expects a third argument');
        });

        it('only accepts objects as the target', function () {
            expect(function () {
                expect(42, 'to have keys satisfying', function (key) {});
            }, 'to throw',
                   'expected 42 to have keys satisfying function (key) {}\n' +
                   '  The assertion "to have keys satisfying" is not defined for the type "number",\n' +
                   '  but it is defined for the type "object"');
        });

        it('asserts that the given callback does not throw for any keys in the map', function () {
            expect({ foo: 0, bar: 1, baz: 2, qux: 3 }, 'to have keys satisfying', function (key) {
                expect(key, 'not to be empty');
            });

            expect({ foo: 0, bar: 1, baz: 2, qux: 3 }, 'to have keys satisfying', function (key) {
                expect(key, 'to match', /^[a-z]{3}$/);
            });

            expect({ foo: 0, bar: 1, baz: 2, qux: 3 }, 'to have keys satisfying', 'not to be empty');

            expect({ foo: 0, bar: 1, baz: 2, qux: 3 }, 'to have keys satisfying', 'to match', /^[a-z]{3}$/);
        });

        it('receives the key and the value when the third argument is a function', function () {
            expect({ foo: 123 }, 'to have keys satisfying', function (key, value) {
                expect(key, 'to equal', 'foo');
                expect(value, 'to equal', 123);
            });
        });

        it('fails if the given object is empty', function () {
            expect(function () {
                expect({}, 'to have keys satisfying', function (key) {
                    expect(key, 'to match', /^[a-z]{3}$/);
                });
            }, 'to throw',
                   "expected {} to have keys satisfying\n" +
                   "function (key) {\n" +
                   "    expect(key, 'to match', /^[a-z]{3}$/);\n" +
                   "}\n" +
                   "  expected {} not to equal {}");
        });

        it('should work with non-enumerable keys returned by the getKeys function of the subject type', function () {
            expect(function () {
                expect(new Error('foo'), 'to have keys satisfying', /bar/);
            }, 'to throw',
                "failed expectation on keys message:\n" +
                "  message: expected 'message' to satisfy /bar/"
            );
        });

        it('supports legacy aliases', function () {
            expect({ foo: '0' }, 'to be a map whose keys satisfy', function (key) {
                expect(key, 'to match', /^[a-z]{3}$/);
            });

            expect({ foo: '0' }, 'to be an object whose keys satisfy', function (key) {
                expect(key, 'to match', /^[a-z]{3}$/);
            });

            expect({ foo: '0' }, 'to be a hash whose keys satisfy', function (key) {
                expect(key, 'to match', /^[a-z]{3}$/);
            });
        });

        it('fails when the assertion fails', function () {
            expect(function () {
                expect({ foo: 0, bar: 1, Baz: 2, qux: 3 }, 'to have keys satisfying', function (key) {
                    expect(key, 'to match', /^[a-z]{3}$/);
                });
            }, 'to throw', /expected 'Baz' to match/);
        });

        it('provides a detailed report of where failures occur', function () {
            expect(function () {
                expect({ foo: 0, bar: 1, baz: 2, qux: 3, quux: 4 }, 'to have keys satisfying', function (key) {
                    expect(key, 'to have length', 3);
                });
            }, 'to throw',
                   "failed expectation on keys foo, bar, baz, qux, quux:\n" +
                   "  quux: expected 'quux' to have length 3\n" +
                   "          expected 4 to be 3");
        });

        describe('delegating to an async assertion', function () {
            var clonedExpect = expect.clone()
                .addAssertion('to be a sequence of as after a short delay', function (expect, subject, delay) {
                    this.errorMode = 'nested';

                    return expect.promise(function (run) {
                        setTimeout(run(function () {
                            expect(subject, 'to match', /^a+$/);
                        }), 1);
                    });
                });

            it('should succeed', function () {
                return clonedExpect({a: 1, aa: 2}, 'to have keys satisfying', 'to be a sequence of as after a short delay');
            });

            it('should fail with a diff', function () {
                return expect(
                    clonedExpect({a: 1, foo: 2, bar: 3}, 'to have keys satisfying', 'to be a sequence of as after a short delay'),
                    'to be rejected',
                        "failed expectation on keys a, foo, bar:\n" +
                        "  foo: expected 'foo' to be a sequence of as after a short delay\n" +
                        "         expected 'foo' to match /^a+$/\n" +
                        "  bar: expected 'bar' to be a sequence of as after a short delay\n" +
                        "         expected 'bar' to match /^a+$/"
                );
            });
        });
    });

    describe('to be a canonical object assertion', function () {
        it('asserts that an object is canonical', function () {
            expect({a: 123, b: 456}, 'to be canonical');
        });

        it('asserts that a deep object is canonical', function () {
            expect({a: 123, b: 456, c: [1, 3, 4, {a: 123, b: 456}]}, 'to be canonical');
        });

        it('works with a circular object', function () {
            var obj = {a: 123, b: {}};
            obj.b.a = obj;
            expect(obj, 'to be canonical');
        });

        it('fails when the assertion fails', function () {
            expect(function () {
                expect({b: 456, a: 123}, 'to be canonical');
            }, 'to throw exception', 'expected { b: 456, a: 123 } to be canonical');

            expect(function () {
                expect({foo: {b: 456, a: 123}}, 'to be canonical');
            }, 'to throw exception', 'expected { foo: { b: 456, a: 123 } } to be canonical');
        });
    });

    it('throws if the assertion does not exist', function () {
        expect(function () {
            expect({}, "to bee", 2);
        }, 'to throw exception', 'Unknown assertion "to bee", did you mean: "to be"');
    });

    describe('addAssertion', function () {
        it('is chainable', function () {
            expect.addAssertion('foo', function () {})
                  .addAssertion('bar', function () {});

            expect(expect.assertions.any, 'to have keys',
                   'foo',
                   'bar');
        });

        it('supports transfering flags from the custom assertion to nested expect', function () {
            var clonedExpect = expect.clone()
                .addAssertion('[not] to be sorted', function (expect, subject) {
                    expect(subject, 'to be an array');
                    expect(subject, '[not] to equal', [].concat(subject).sort());
                });

            clonedExpect([1, 2, 3], 'to be sorted');
            clonedExpect([1, 3, 2], 'not to be sorted');
            expect(function () {
                clonedExpect([1, 2, 3], 'not to be sorted');
            }, 'to throw', 'expected [ 1, 2, 3 ] not to be sorted');
        });

        it('throws when attempting to redefine an assertion', function () {
            var clonedExpect = expect.clone()
                .addAssertion('to foo', function () {});
            expect(function () {
                clonedExpect.addAssertion('to foo', function () {});
            }, 'to throw', 'Cannot redefine assertion: to foo');
        });

        it('throws when implicitly attempting to redefine an assertion', function () {
            var clonedExpect = expect.clone()
                .addAssertion('to foo [bar]', function () {});
            expect(function () {
                clonedExpect.addAssertion('to foo (bar|quux)', function () {});
            }, 'to throw', 'Cannot redefine assertion: to foo bar');
        });

        it('allows overlapping patterns within a single addAssertion call', function () {
            expect(function () {
                expect.clone().addAssertion(['to foo', 'to [really] foo'], function () {});
            }, 'not to throw');
        });

        it('does not break when declaring multiple patterns that do not have the same set of flags defined', function () {
            var clonedExpect = expect.clone()
                .addAssertion(['[not] to be foo', 'to be foo aliased without the not flag'], function (expect, subject) {
                    expect(subject, '[not] to equal', 'foo');
                });

            clonedExpect('foo', 'to be foo');
            clonedExpect('foo', 'to be foo aliased without the not flag');

            clonedExpect('bar', 'not to be foo');
            clonedExpect(function () {
                clonedExpect('bar', 'to be foo aliased without the not flag');
            }, 'to throw',
                         "expected 'bar' to be foo aliased without the not flag\n" +
                         "\n" +
                         "-bar\n" +
                         "+foo");
        });

        describe('pattern', function () {
            it("must be a string", function () {
                expect(function () {
                    expect.addAssertion(null, function () {});
                }, 'to throw', "Assertion patterns must be a non empty string");
            });

            it("must be a non empty", function () {
                expect(function () {
                    expect.addAssertion('', function () {});
                }, 'to throw', "Assertion patterns must be a non empty string");
            });

            it("can't start or end with whitespace", function () {
                expect(function () {
                    expect.addAssertion('   ', function () {});
                }, 'to throw', "Assertion patterns can't start or end with whitespace");
            });

            it("can't start with whitespace", function () {
                expect(function () {
                    expect.addAssertion(' foo', function () {});
                }, 'to throw', "Assertion patterns can't start or end with whitespace");
            });

            it("can't end with whitespace", function () {
                expect(function () {
                    expect.addAssertion('foo   ', function () {});
                }, 'to throw', "Assertion patterns can't start or end with whitespace");
            });

            it("must not contain unbalanced brackets", function () {
                expect(function () {
                    expect.addAssertion('foo [', function () {});
                }, 'to throw', "Assertion patterns must not contain unbalanced brackets: 'foo ['");

                expect(function () {
                    expect.addAssertion('foo ]', function () {});
                }, 'to throw', "Assertion patterns must not contain unbalanced brackets: 'foo ]'");
            });

            it("must not contain unbalanced parentheses", function () {
                expect(function () {
                    expect.addAssertion('foo (', function () {});
                }, 'to throw', "Assertion patterns must not contain unbalanced parentheses: 'foo ('");

                expect(function () {
                    expect.addAssertion('foo )', function () {});
                }, 'to throw', "Assertion patterns must not contain unbalanced parentheses: 'foo )'");
            });

            it("must not only contain flags", function () {
                expect(function () {
                    expect.addAssertion('[foo] [bar]', function () {});
                }, 'to throw', "Assertion patterns must not only contain flags");
            });

            describe('flags', function () {
                it("must not be empty", function () {
                    expect(function () {
                        expect.addAssertion('foo []', function () {});
                    }, 'to throw', "Assertion patterns must not contain empty flags: 'foo []'");
                });

                it("must not contain brackets", function () {
                    expect(function () {
                        expect.addAssertion('foo [[bar]', function () {});
                    }, 'to throw', "Assertion patterns must not contain flags with brackets: 'foo [[bar]'");

                    expect(function () {
                        expect.addAssertion('foo [[bar]]', function () {});
                    }, 'to throw', "Assertion patterns must not contain flags with brackets: 'foo [[bar]]'");
                });

                it("must not contain parentheses", function () {
                    expect(function () {
                        expect.addAssertion('foo [(bar]', function () {});
                    }, 'to throw', "Assertion patterns must not contain flags with parentheses: 'foo [(bar]'");

                    expect(function () {
                        expect.addAssertion('foo [bar)]', function () {});
                    }, 'to throw', "Assertion patterns must not contain flags with parentheses: 'foo [bar)]'");
                });
            });

            describe('alternations', function () {
                it('can be empty', function () {
                    var clonedExpect = expect.clone().addAssertion('to foo (|bar)', function (expect, subject) {
                        expect(subject, 'to equal', 'foo');
                    });
                    clonedExpect('foo', 'to foo');
                    clonedExpect('foo', 'to foo bar');
                });

                it("must not contain brackets", function () {
                    expect(function () {
                        expect.addAssertion('foo ([bar)', function () {});
                    }, 'to throw', "Assertion patterns must not contain alternations with brackets: 'foo ([bar)'");

                    expect(function () {
                        expect.addAssertion('foo (bar])', function () {});
                    }, 'to throw', "Assertion patterns must not contain alternations with brackets: 'foo (bar])'");
                });

                it("must not contain parentheses", function () {
                    expect(function () {
                        expect.addAssertion('foo ((bar)', function () {});
                    }, 'to throw', "Assertion patterns must not contain alternations with parentheses: 'foo ((bar)'");

                    expect(function () {
                        expect.addAssertion('foo ((bar))', function () {});
                    }, 'to throw', "Assertion patterns must not contain alternations with parentheses: 'foo ((bar))'");
                });
            });
        });

        describe('types', function () {
            function Box(value) {
                this.value = value;
            }

            it('allows specifying assertions with overlapping patterns for different types', function () {
                var clonedExpect = expect.clone();
                clonedExpect.addType({
                    name: 'box',
                    base: 'object',
                    identify: function (obj) {
                        return obj instanceof Box;
                    },
                    inspect: function (box, depth, output, inspect) {
                        output.text('[Box ').append(inspect(box.value)).text(']');
                        return output;
                    }
                }).addAssertion('box', 'to be foo', function (expect, subject) {
                    expect(subject.value, 'to be', 'foo');
                }).addAssertion('string', 'to be foo', function (expect, subject) {
                    expect(subject, 'to be', 'foo');
                }).addAssertion('to be foo', function (expect, subject) {
                    expect(String(subject), 'to equal', 'foo');
                });
                expect(clonedExpect.assertions.box['to be foo'], 'to be ok');
                expect(clonedExpect.assertions.string['to be foo'], 'to be ok');
                expect(clonedExpect.assertions.any['to be foo'], 'to be ok');
                clonedExpect('foo', 'to be foo');
                clonedExpect(new Box('foo'), 'to be foo');
                expect(function () {
                    clonedExpect('bar', 'to be foo');
                }, 'to throw',
                       "expected 'bar' to be foo\n" +
                       "\n" +
                       "-bar\n" +
                       "+foo");
                expect(function () {
                    clonedExpect(new Box('bar'), 'to be foo');
                }, 'to throw',
                       "expected [Box 'bar'] to be foo\n" +
                       "\n" +
                       "-bar\n" +
                       "+foo");
            });

            it('allows you to control the inspection depth', function () {
                var clonedExpect = expect.clone().addType({
                    name: 'box',
                    base: 'object',
                    identify: function (obj) {
                        return obj instanceof Box;
                    },
                    inspect: function (box, depth, output, inspect) {
                        output.text('[Box ').append(inspect(box.value, depth)).text(']');
                        return output;
                    }
                });

                expect(clonedExpect.inspect(new Box({ shown: { hidden: 'secret' }}), 1).toString(),
                       'to equal',
                       '[Box { shown: ... }]');
            });
        });

        describe('error modes', function () {
            var errorMode = 'default';
            var clonedExpect;

            describe('for synchronous custom assertions', function () {
                beforeEach(function () {
                    clonedExpect = expect.clone()
                        .addAssertion('[not] to be sorted', function (expect, subject) {
                            this.errorMode = errorMode;
                            expect(subject, 'to be an array');
                            expect(subject, '[not] to equal', [].concat(subject).sort());
                        });
                });

                it('errorMode=nested nest the error message of expect failures in the assertion under the assertion standard message', function () {
                    errorMode = 'nested';
                    expect(function () {
                        clonedExpect(42, 'to be sorted');
                    }, 'to throw', function (err) {
                        expect(err.output.toString(), 'to equal', 'expected 42 to be sorted\n  expected 42 to be an array');
                    });
                });

                it('errorMode=nested does not hoist the label of the leaf assertion', function () {
                    errorMode = 'nested';
                    expect(function () {
                        clonedExpect([3, 2, 1], 'to be sorted');
                    }, 'to throw', function (err) {
                        expect(err.label, 'to be undefined');
                    });
                });

                it('errorMode=bubble bubbles uses the error message of expect failures in the assertion', function () {
                    errorMode = 'bubble';
                    expect(function () {
                        clonedExpect(42, 'to be sorted');
                    }, 'to throw', 'expected 42 to be an array');
                });

                it('errorMode=bubble only includes the diff once', function () {
                    errorMode = 'bubble';
                    expect(function () {
                        clonedExpect([3, 2, 1], 'to be sorted');
                    }, 'to throw',
                           'expected [ 3, 2, 1 ] to equal [ 1, 2, 3 ]\n' +
                           '\n' +
                           '[\n' +
                           "  3, // should equal 1\n" +
                           "  2,\n" +
                           "  1 // should equal 3\n" +
                           ']');
                });

                it('errorMode=diff only includes the diff', function () {
                    errorMode = 'diff';
                    expect(function () {
                        clonedExpect([3, 2, 1], 'to be sorted');
                    }, 'to throw',
                           '[\n' +
                           "  3, // should equal 1\n" +
                           "  2,\n" +
                           "  1 // should equal 3\n" +
                           ']');
                });

                it('errorMode=default uses the standard error message of the assertion', function () {
                    errorMode = 'default';
                    expect(function () {
                        clonedExpect(42, 'to be sorted');
                    }, 'to throw', 'expected 42 to be sorted');
                });
            });

            describe('for asynchronous custom assertions', function () {
                beforeEach(function () {
                    clonedExpect = expect.clone()
                        .addAssertion('to be sorted after delay', function (expect, subject, delay, done) {
                            this.errorMode = errorMode;
                            this.args.pop(); // Don't let the function be inspected in case of failure
                            setTimeout(function () {
                                try {
                                    expect(subject, 'to be an array');
                                    expect(subject, 'to equal', [].concat(subject).sort());
                                } catch (e) {
                                    done(e);
                                }
                            }, delay);
                        })
                        .addAssertion('to be sorted after a while', function (expect, subject, done) {
                            expect(subject, 'to be sorted after delay', 10, done);
                        });
                });

                it('errorMode=nested nest the error message of expect failures in the assertion under the assertion standard message', function (done) {
                    errorMode = 'nested';
                    clonedExpect(42, 'to be sorted after delay', 1, function (err) {
                        expect(err, 'to have message', 'expected 42 to be sorted after delay 1\n  expected 42 to be an array');
                        done();
                    });
                });

                it('errorMode=bubble bubbles uses the error message of expect failures in the assertion', function (done) {
                    errorMode = 'bubble';
                    clonedExpect(42, 'to be sorted after delay', 1, function (err) {
                        expect(err, 'to have message', 'expected 42 to be an array');
                        done();
                    });
                });

                // It is very hard to get this working as we need errors thrown asynchronously
                // without a promise to be serialized so they will have a message property when
                // they get caught by window.onerror.
                it.skip('errorMode=diff only includes the diff', function (done) {
                    errorMode = 'diff';
                    clonedExpect([3, 2, 1], 'to be sorted after delay', 1, function (err) {
                        expect(err, 'to have message',
                           '[\n' +
                           "  3, // should equal 1\n" +
                           "  2,\n" +
                           "  1 // should equal 3\n" +
                           ']');
                        done();
                    });
                });

                it('errorMode=default uses the standard error message of the assertion', function (done) {
                    errorMode = 'default';
                    clonedExpect(42, 'to be sorted after delay', 1, function (err) {
                        expect(err, 'to have message', 'expected 42 to be sorted after delay 1');
                        done();
                    });
                });

                describe('nested inside another custom assertion', function () {
                    // TODO async assertions does not handle error message wrapping correctly

                    it('errorMode=nested nest the error message of expect failures in the assertion under the assertion standard message', function (done) {
                        errorMode = 'nested';
                        clonedExpect(42, 'to be sorted after delay', 1, function (err) {
                            expect(err, 'to have message', 'expected 42 to be sorted after delay 1\n  expected 42 to be an array');
                            done();
                        });
                    });

                    it('errorMode=bubble bubbles uses the error message of expect failures in the assertion', function (done) {
                        errorMode = 'bubble';
                        clonedExpect(42, 'to be sorted after delay', 1, function (err) {
                            expect(err, 'to have message', 'expected 42 to be an array');
                            done();
                        });
                    });

                    it('errorMode=default uses the standard error message of the assertion', function (done) {
                        errorMode = 'default';
                        clonedExpect(42, 'to be sorted after delay', 1, function (err) {
                            expect(err, 'to have message', 'expected 42 to be sorted after delay 1');
                            done();
                        });
                    });
                });
            });

            describe('for custom assertions that return promises', function () {
                beforeEach(function () {
                    clonedExpect = expect.clone()
                        .addAssertion('to be sorted after delay', function (expect, subject, delay, done) {
                            this.errorMode = errorMode;
                            return expect.promise(function (run) {
                                setTimeout(run(function () {
                                    expect(subject, 'to be an array');
                                    expect(subject, 'to equal', [].concat(subject).sort());
                                }), delay);
                            });
                        });
                });

                it('errorMode=nested nest the error message of expect failures in the assertion under the assertion standard message', function () {
                    errorMode = 'nested';
                    return expect(
                        clonedExpect(42, 'to be sorted after delay', 1),
                        'to be rejected',
                            'expected 42 to be sorted after delay 1\n  expected 42 to be an array'
                    );
                });

                it('errorMode=bubble bubbles uses the error message of expect failures in the assertion', function () {
                    errorMode = 'bubble';
                    return expect(
                        clonedExpect(42, 'to be sorted after delay', 1),
                        'to be rejected',
                            'expected 42 to be an array'
                    );
                });

                it('errorMode=default uses the standard error message of the assertion', function () {
                    errorMode = 'default';
                    return expect(
                        clonedExpect(42, 'to be sorted after delay', 1),
                        'to be rejected',
                            'expected 42 to be sorted after delay 1'
                    );
                });

                describe('nested inside another custom assertion', function () {
                    it('errorMode=nested nest the error message of expect failures in the assertion under the assertion standard message', function () {
                        errorMode = 'nested';
                        return expect(
                            clonedExpect(42, 'to be sorted after delay', 1),
                            'to be rejected',
                                'expected 42 to be sorted after delay 1\n  expected 42 to be an array'
                        );
                    });

                    it('errorMode=bubble bubbles uses the error message of expect failures in the assertion', function () {
                        errorMode = 'bubble';
                        return expect(
                            clonedExpect(42, 'to be sorted after delay', 1),
                            'to be rejected',
                                'expected 42 to be an array'
                        );
                    });

                    it('errorMode=diff only includes the diff', function () {
                        errorMode = 'diff';
                        return expect(
                            clonedExpect([3, 2, 1], 'to be sorted after delay', 1),
                            'to be rejected',
                                '[\n' +
                                "  3, // should equal 1\n" +
                                "  2,\n" +
                                "  1 // should equal 3\n" +
                                ']'
                        );
                    });

                    it('errorMode=default uses the standard error message of the assertion', function () {
                        errorMode = 'default';
                        return expect(
                            clonedExpect(42, 'to be sorted after delay', 1),
                            'to be rejected',
                                'expected 42 to be sorted after delay 1'
                        );
                    });
                });
            });
        });

        // I can't figure out why this doesn't work in mocha-phantomjs:
        it.skipIf(isMochaPhantomJS, 'truncates the stack when a custom assertion throws a regular assertion error', function () {
            var clonedExpect = expect.clone().addAssertion('to equal foo', function theCustomAssertion(expect, subject) {
                expect(subject, 'to equal', 'foo');
            });
            expect(function () {
                clonedExpect('bar', 'to equal foo');
            }, 'to throw', function (err) {
                expect(err.stack, 'not to contain', 'theCustomAssertion');
            });
        });

        describe('without Error.captureStackTrace', function () {
            var orig;
            before(function () {
                orig = Error.captureStackTrace;
                Error.captureStackTrace = null;
            });
            after(function () {
                Error.captureStackTrace = orig;
            });
            it('truncates the stack when a custom assertion throws a regular assertion error', function () {
                var clonedExpect = expect.clone().addAssertion('to equal foo', function theCustomAssertion(expect, subject) {
                    expect(subject, 'to equal', 'foo');
                });
                expect(function () {
                    clonedExpect('bar', 'to equal foo');
                }, 'to throw', function (err) {
                    expect(err.stack, 'not to contain', 'theCustomAssertion');
                });
            });
        });

        it('does not truncate the stack or replace the error message when the assertion function itself contains an error', function () {
            var clonedExpect = expect.clone().addAssertion('to equal foo', function theCustomAssertion(expect, subject) {
                expect(subject, 'to equal', 'foo');
                this(); // Will throw a TypeError
            });
            expect(function () {
                clonedExpect('foo', 'to equal foo');
            }, 'to throw', function (err) {
                expect(err.stack, 'to contain', 'theCustomAssertion');
                expect(err.message, 'to match', /is not a function|Function expected/);
            });
        });

        it('does not truncate the stack or replace the error message when a nested custom assertion contains an error', function () {
            var clonedExpect = expect.clone().addAssertion('to equal foo', function theCustomAssertion(expect, subject) {
                expect(subject, 'to equal', 'foo');
                this(); // Will throw a TypeError
            }).addAssertion('to foo', function (expect, subject) {
                expect(subject, 'to equal foo');
            });
            expect(function () {
                clonedExpect('foo', 'to foo');
            }, 'to throw', function (err) {
                expect(err.stack, 'not to contain', "expected 'foo' to foo");
                expect(err.message, 'not to contain', "expected 'foo' to foo");
            });
        });

        it('nested expects throws if the assertion does not exists', function () {
            var clonedExpect = expect.clone().addAssertion('to be foo', function theCustomAssertion(expect, subject) {
                expect(subject, 'to bee', 'foo');
                this(); // Will throw a TypeError
            });
            expect(function () {
                clonedExpect('foo', 'to be foo');
            }, 'to throw exception', 'Unknown assertion "to bee", did you mean: "to be"');
        });
    });

    describe('clone', function () {
        var clonedExpect;
        beforeEach(function () {
            clonedExpect = expect.clone();
            clonedExpect.addAssertion('[not] to be the answer to the Ultimate Question of Life, the Universe, and Everything', function (expect, subject) {
                expect(subject, '[not] to equal', 42);
            });
        });

        it('changes to the clone does not affect the original instance', function () {
            expect(expect.assertions, 'not to have keys',
                   'to be the answer to the Ultimate Question of Life, the Universe, and Everything',
                   'not to be the answer to the Ultimate Question of Life, the Universe, and Everything');
        });

        it('assertions can be added to the clone', function () {
            expect(clonedExpect.assertions.any, 'to have keys',
                   'to be the answer to the Ultimate Question of Life, the Universe, and Everything',
                   'not to be the answer to the Ultimate Question of Life, the Universe, and Everything');
            clonedExpect(42, 'to be the answer to the Ultimate Question of Life, the Universe, and Everything');
            clonedExpect(41, 'not to be the answer to the Ultimate Question of Life, the Universe, and Everything');

            expect(function () {
                clonedExpect(41, 'to be the answer to the Ultimate Question of Life, the Universe, and Everything');
            }, 'to throw');
        });

        describe('when the assertion does not exist', function () {
            it('it suggests a similarly named assertion', function () {
                expect(function () {
                    clonedExpect(null, "to bee", null);
                }, 'to throw', 'Unknown assertion "to bee", did you mean: "to be"');

                expect(function () {
                    clonedExpect(1, "to be the answer to the ultimate question of life, the universe, and everything");
                }, 'to throw', 'Unknown assertion "to be the answer to the ultimate question of life, the universe, and everything", did you mean: "to be the answer to the Ultimate Question of Life, the Universe, and Everything"');
            });

            describe('but exists for another type', function () {
                it('explains that in the error message', function () {
                    clonedExpect.addAssertion('array', 'to foobarquux', function (expect, subject) {
                        expect(subject, 'to equal', ['foobarquux']);
                    });
                    clonedExpect(['foobarquux'], 'to foobarquux');
                    expect(function () {
                        clonedExpect('foobarquux', 'to foobarquux');
                    }, 'to throw',
                           "expected 'foobarquux' to foobarquux\n" +
                           '  The assertion "to foobarquux" is not defined for the type "string",\n' +
                           '  but it is defined for the type "array"');
                });

                it('prefers to suggest a similarly named assertion defined for the correct type over an exact match defined for other types', function () {
                    clonedExpect.addAssertion('array', 'to foo', function (expect, subject) {
                        expect(subject, 'to equal', ['foo']);
                    }).addAssertion('string', 'to fooo', function (expect, subject) {
                        expect(subject, 'to equal', 'fooo');
                    });
                    expect(function () {
                        clonedExpect(['fooo'], 'to fooo');
                    }, 'to throw',
                           "expected [ 'fooo' ] to fooo\n" +
                           '  The assertion "to fooo" is not defined for the type "array",\n' +
                           '  but it is defined for the type "string"');
                    clonedExpect.addAssertion('null', 'to fooo', function (expect, subject) {
                        expect(subject.message, 'to equal', 'fooo');
                    });
                    expect(function () {
                        clonedExpect(['fooo'], 'to fooo');
                    }, 'to throw',
                           "expected [ 'fooo' ] to fooo\n" +
                           '  The assertion "to fooo" is not defined for the type "array",\n' +
                           '  but it is defined for these types: "null", "string"');
                });

                it('prefers to suggest a similarly named assertion for a more specific type', function () {
                    clonedExpect.addType({
                        name: 'myType',
                        baseType: 'string',
                        identify: function (obj) {
                            return (/^a/).test(obj);
                        }
                    }).addType({
                        name: 'myMoreSpecificType',
                        baseType: 'myType',
                        identify: function (obj) {
                            return (/^aa/).test(obj);
                        }
                    }).addType({
                        name: 'myMostSpecificType',
                        baseType: 'myMoreSpecificType',
                        identify: function (obj) {
                            return (/^aaa/).test(obj);
                        }
                    }).addAssertion('myType', 'to fooa', function () {
                    }).addAssertion('myMoreSpecificType', 'to foob', function () {
                    }).addAssertion('myMostSpecificType', 'to fooc', function () {});
                    expect(function () {
                        clonedExpect('a', 'to fooo');
                    }, 'to throw', 'Unknown assertion "to fooo", did you mean: "to fooa"');

                    expect(function () {
                        clonedExpect('aa', 'to fooo');
                    }, 'to throw', 'Unknown assertion "to fooo", did you mean: "to foob"');

                    expect(function () {
                        clonedExpect('aaa', 'to fooo');
                    }, 'to throw', 'Unknown assertion "to fooo", did you mean: "to fooc"');

                    expect(function () {
                        clonedExpect('aaa', 'to fooaq');
                    }, 'to throw', 'Unknown assertion "to fooaq", did you mean: "to fooc"');
                });
            });
        });

        describe('toString', function () {
            it('returns a string containing all the expanded assertions', function () {
                expect(clonedExpect.toString(), 'to contain', 'to be');
                expect(clonedExpect.toString(), 'to contain', 'not to be');
                expect(clonedExpect.toString(), 'to contain', 'to be the answer to the Ultimate Question of Life, the Universe, and Everything');
                expect(clonedExpect.toString(), 'to contain', 'not to be the answer to the Ultimate Question of Life, the Universe, and Everything');
            });
        });
    });

    describe('toString', function () {
        it('returns a string containing all the expanded assertions', function () {
            expect(expect.toString(), 'to contain', 'to be');
            expect(expect.toString(), 'to contain', 'not to be');
        });
    });

    describe('installPlugin', function () {
        var _expect = expect;
        beforeEach(function () {
            expect = _expect.clone();
        });
        it('calls the given plugin with the expect instance as the parameter', function (done) {
            var plugin = {
                name: 'test',
                installInto: function (expectInstance) {
                    expect(expectInstance, 'to be', expect);
                    done();
                }
            };
            expect.installPlugin(plugin);
        });

        it('throws if the given arguments does not adhere to the plugin interface', function () {
            expect(function () {
                expect.installPlugin({});
            }, 'to throw', 'Plugins must adhere to the following interface\n' +
                   '{\n' +
                   '  name: <plugin name>,\n' +
                   '  dependencies: <an optional list of dependencies>,\n' +
                   '  installInto: <a function that will update the given expect instance>\n' +
                   '}');
        });

        it('does not fail if all plugin dependencies has been fulfilled', function (done) {
            var pluginA = {
                name: 'PluginA',
                installInto: function (expect) {}
            };
            var pluginB = {
                name: 'PluginB',
                dependencies: ['PluginA'],
                installInto: function (expect) {
                    done();
                }
            };
            expect.installPlugin(pluginA);
            expect.installPlugin(pluginB);
        });

        it('throws if the plugin has unfulfilled plugin dependencies', function () {
            var pluginB = {
                name: 'PluginB',
                dependencies: ['PluginA'],
                installInto: function (expect) {}
            };

            expect(function () {
                expect.installPlugin(pluginB);
            }, 'to throw', 'PluginB requires plugin PluginA');

            var pluginC = {
                name: 'PluginC',
                dependencies: ['PluginA', 'PluginB'],
                installInto: function (expect) {}
            };

            expect(function () {
                expect.installPlugin(pluginC);
            }, 'to throw', 'PluginC requires plugins PluginA and PluginB');

            var pluginD = {
                name: 'PluginD',
                dependencies: ['PluginA', 'PluginB', 'PluginC'],
                installInto: function (expect) {}
            };

            expect(function () {
                expect.installPlugin(pluginD);
            }, 'to throw', 'PluginD requires plugins PluginA, PluginB and PluginC');
        });

        it('dependencies can be fulfilled across clones', function (done) {
            var pluginA = {
                name: 'PluginA',
                installInto: function (expect) {}
            };
            var pluginB = {
                name: 'PluginB',
                dependencies: ['PluginA'],
                installInto: function (expect) {
                    done();
                }
            };
            expect.installPlugin(pluginA);
            var clonedExpect = expect.clone();
            clonedExpect.installPlugin(pluginB);
        });

        it('installing a plugin more than once is a no-op', function () {
            var callCount = 0;
            var plugin = {
                name: 'plugin',
                installInto: function () {
                    callCount += 1;
                }
            };
            expect.installPlugin(plugin);
            expect.installPlugin(plugin);
            expect.installPlugin(plugin);
            expect(callCount, 'to be', 1);
        });
    });

    describe('addType', function () {
        function box(value) {
            return {
                isBox: true,
                value: value
            };
        }
        var clonedExpect;

        beforeEach(function () {
            clonedExpect = expect.clone();
            clonedExpect.addType({
                name: 'box',
                identify: function (obj) {
                    return obj && typeof obj === 'object' && obj.isBox;
                },
                equal: function (a, b, equal) {
                    return a === b || equal(a.value, b.value);
                },
                inspect: function (obj, depth, output, inspect) {
                    return output
                        .text('box(')
                        .append(inspect(obj.value))
                        .text(')');
                },
                diff: function (actual, expected, output, diff) {
                    var comparison = diff({ value: actual.value }, { value: expected.value });
                    comparison.diff = output.text('box(').append(comparison.diff).text(')');
                    return comparison;
                }
            });
        });

        it('throws an expection if the type has an empty or undefined name', function () {
            expect(function () {
                clonedExpect.addType({});
            }, 'to throw', 'A type must be given a non-empty name');
        });

        it('should use the equal defined by the type', function () {
            clonedExpect(box(123), 'to equal', box(123));
            clonedExpect(box(123), 'not to equal', box(321));
        });

        it('shows a diff in case of a mismatch', function () {
            expect(function () {
                clonedExpect(box(box(123)), 'to equal', box(box(456)));
            }, 'to throw', "expected box(box(123)) to equal box(box(456))\n" +
                   "\n" +
                   "box({\n" +
                   "  value: box({\n" +
                   "    value: 123 // should equal 456\n" +
                   "  })\n" +
                   "})");
        });

        describe('with base type wrapperObject', function () {
            beforeEach(function () {
                clonedExpect = expect.clone();
                clonedExpect.addType({
                    name: 'box',
                    base: 'wrapperObject',
                    identify: function (obj) {
                        return obj && typeof obj === 'object' && obj.isBox;
                    },
                    unwrap: function (box) {
                        return box.value;
                    },
                    prefix: function (output) {
                        return output.text('box(');
                    },
                    suffix: function (output) {
                        return output.text(')');
                    }
                });
            });

            it('should use the equal defined by the type', function () {
                clonedExpect(box(123), 'to equal', box(123));
                clonedExpect(box(123), 'not to equal', box(321));
            });

            it('shows a diff in case of a mismatch', function () {
                expect(function () {
                    clonedExpect(box(box(123)), 'to equal', box(box(456)));
                }, 'to throw', "expected box(box(123)) to equal box(box(456))\n" +
                       "\n" +
                       "box(box(\n" +
                       "  123 // should equal 456\n" +
                       "))");
            });
        });
    });

    function Field(val, options) {
        var value = val;
        var propertyDescription = {
            enumerable: true
        };
        if (options.match(/getter/)) {
            propertyDescription.get = function () { return value; };
        }

        if (options.match(/setter/)) {
            propertyDescription.set = function (val) { value = val; };
        }
        Object.defineProperty(this, 'value', propertyDescription);
    }

    describe('equal', function () {
        it.skipIf(!Object.defineProperty, 'handles getters and setters correctly', function () {
            expect(new Field('VALUE', 'getter'), 'to equal', new Field('VALUE', 'getter'));
            expect(new Field('VALUE', 'setter'), 'to equal', new Field('VALUE', 'setter'));
            expect(new Field('VALUE', 'getter and setter'), 'to equal', new Field('VALUE', 'getter and setter'));
        });
    });

    describe('inspect', function () {
        it.skipIf(!Object.defineProperty, 'handles getters and setters correctly', function () {
            expect(new Field('VALUE', 'getter'), 'to inspect as', "Field({ value: 'VALUE' /* getter */ })");
            expect(new Field('VALUE', 'setter'), 'to inspect as', "Field({ set value: function (val) { value = val; } })");
            expect(new Field('VALUE', 'getter and setter'), 'to inspect as', "Field({ value: 'VALUE' /* getter/setter */ })");
        });

        it('should render strings with control chars and backslashes correctly', function () {
            var stringWithControlCharsAndStuff = '\\';
            for (var i = 0 ; i < 32 ; i += 1) {
                stringWithControlCharsAndStuff += String.fromCharCode(i);
            }

            expect(stringWithControlCharsAndStuff, 'to inspect as',
                "'\\\\\\x00\\x01\\x02\\x03\\x04\\x05\\x06\\x07\\b\\t\\n\\x0b\\f\\r\\x0e\\x0f\\x10\\x11\\x12\\x13\\x14\\x15\\x16\\x17\\x18\\x19\\x1a\\x1b\\x1c\\x1d\\x1e\\x1f'");
        });

        describe('with various special values', function () {
            it('renders null correctly', function () {
                expect(null, 'to inspect as', 'null');
            });

            it('renders undefined correctly', function () {
                expect(undefined, 'to inspect as', 'undefined');
            });

            it('renders NaN correctly', function () {
                expect(NaN, 'to inspect as', 'NaN');
            });

            it('renders zero correctly', function () {
                expect(0, 'to inspect as', '0');
            });

            it('renders negative zero correctly', function () {
                expect(-0, 'to inspect as', '-0');
            });

            it('renders Infinity correctly', function () {
                expect(Infinity, 'to inspect as', 'Infinity');
            });

            it('renders -Infinity correctly', function () {
                expect(-Infinity, 'to inspect as', '-Infinity');
            });
            it('sparse array', function () {
                var sparse = [];
                sparse[1] = 'foo';
                expect(sparse, 'to inspect as', "[ , 'foo' ]");
            });
            it('sparse array with explicit undefined', function () {
                var sparse = [];
                sparse[1] = undefined;
                expect(sparse, 'to inspect as', "[ , undefined ]");
            });
        });

        describe('block items as inspected correctly in', function () {
            var clonedExpect = expect.clone().addType({
                name: 'multiline',
                identify: function (value) {
                    return typeof value === 'string' && value.indexOf('\n') !== -1;
                },
                inspect: function (value, depth, output) {
                    output.block(function () {
                        this.jsString("'").block(function () {
                            this.jsString(value);
                        }).amend('jsString', "'");
                    });
                }
            });

            it('arrays', function () {
                clonedExpect([ 'foo\nfoo', 'bar' ], 'to inspect as',
                       "[\n" +
                       "  'foo\n" +
                       "   foo',\n" +
                       "  'bar'\n" +
                       "]");
            });

            it('objects', function () {
                clonedExpect({ foo: 'foo\nfoo', bar: 'bar' }, 'to inspect as',
                       "{\n" +
                       "  foo:\n" +
                       "    'foo\n" +
                       "     foo',\n" +
                       "  bar: 'bar'\n" +
                       "}");
            });
        });

        it('indents correctly', function () {
            var data = [{
                "guid": "db550c87-1680-462a-bacc-655cecdd8907",
                "isActive": false,
                "age": 38,
                "email": "huntterry@medalert.com",
                "phone": "+1 (803) 472-3209",
                "address": "944 Milton Street, Madrid, Ohio, 1336",
                "about": "Ea consequat nulla duis incididunt ut irure" +
                    "irure cupidatat. Est tempor cillum commodo aliqua" +
                    "consequat esse commodo. Culpa ipsum eu consectetur id" +
                    "enim quis sint. Aliqua deserunt dolore reprehenderit" +
                    "id anim exercitation laboris. Eiusmod aute consectetur" +
                    "excepteur in nulla proident occaecat" +
                    "consectetur.\r\n",
                "registered": new Date("Sun Jun 03 1984 11:36:47 GMT+0200 (CEST)"),
                "latitude": 8.635553,
                "longitude": -103.382498,
                "tags": ["tempor", "dolore", "non", "sit", "minim", "aute", "non"],
                "friends": [
                    {"id": 0, "name": "Jeanne Hyde"},
                    {"id": 1, "name": "Chavez Parker"},
                    {"id": 2, "name": "Orr Rogers"},
                    {"id": 3, "name": "Etta Glover"},
                    {"id": 4, "name": "Glenna Aguirre"},
                    {"id": 5, "name": "Erika England"},
                    {"id": 6, "name": "Casandra Stanton"},
                    {"id": 7, "name": "Hooper Cobb"},
                    {"id": 8, "name": "Gates Todd"},
                    {"id": 9, "name": "Lesa Chase"},
                    {"id": 10, "name": "Natasha Frazier"},
                    {"id": 11, "name": "Lynnette Key"},
                    {"id": 12, "name": "Linda Mclaughlin"},
                    {"id": 13, "name": "Harrison Martinez"},
                    {"id": 14, "name": "Tameka Hebert"},
                    {"id": 15, "name": "Gena Farley"},
                    {"id": 16, "name": "Conley Walsh"},
                    {"id": 17, "name": "Suarez Norman"},
                    {"id": 18, "name": "Susana Pitts"},
                    {"id": 19, "name": "Peck Hester"}
                ]
            }, {
                "guid": "904c2f38-071c-4b97-b968-f5c228aaf41a",
                "isActive": false,
                "age": 34,
                "email": "peckhester@medalert.com",
                "phone": "+1 (848) 599-3447",
                "address": "323 Legion Street, Caspar, Delaware, 4117",
                "registered": new Date("Tue Mar 10 1981 18:02:53 GMT+0100 (CET)"),
                "latitude": -55.321712,
                "longitude": -100.276818,
                "tags": ["Lorem", "laboris", "enim", "anim", "sint", "incididunt", "labore"],
                "friends": [
                    {"id": 0, "name": "Patterson Meadows"},
                    {"id": 1, "name": "Velasquez Joseph"},
                    {"id": 2, "name": "Horn Harrison"},
                    {"id": 3, "name": "Young Mooney"},
                    {"id": 4, "name": "Barbara Lynn"},
                    {"id": 5, "name": "Sharpe Downs"}
                ],
                "circular": circular,
                "this": { "is": { "deeply": { "nested": { "object": "This should not be shown" },
                                              "string": "should be shown",
                                              "a list": [ 1, 2, 3 ] },
                                  "a list": [ 1, 2, 3 ] } }
            }];

            expect(expect.inspect(data, 5).toString(), 'to equal',
                   "[\n" +
                   "  {\n" +
                   "    guid: 'db550c87-1680-462a-bacc-655cecdd8907', isActive: false,\n" +
                   "    age: 38, email: 'huntterry@medalert.com', phone: '+1 (803) 472-3209',\n" +
                   "    address: '944 Milton Street, Madrid, Ohio, 1336',\n" +
                   "    about: 'Ea consequat nulla duis incididunt ut irureirure cupidatat. Est tempor cillum commodo aliquaconsequat esse commodo. Culpa ipsum eu consectetur idenim quis sint. Aliqua deserunt dolore reprehenderitid anim exercitation laboris. Eiusmod aute consecteturexcepteur in nulla proident occaecatconsectetur.\\r\\n',\n" +
                   "    registered: new Date('Sun, 03 Jun 1984 09:36:47 GMT'),\n" +
                   "    latitude: 8.635553, longitude: -103.382498,\n" +
                   "    tags: [ 'tempor', 'dolore', 'non', 'sit', 'minim', 'aute', 'non' ],\n" +
                   "    friends: [\n" +
                   "      { id: 0, name: 'Jeanne Hyde' },\n" +
                   "      { id: 1, name: 'Chavez Parker' },\n" +
                   "      { id: 2, name: 'Orr Rogers' },\n" +
                   "      { id: 3, name: 'Etta Glover' },\n" +
                   "      { id: 4, name: 'Glenna Aguirre' },\n" +
                   "      { id: 5, name: 'Erika England' },\n" +
                   "      { id: 6, name: 'Casandra Stanton' },\n" +
                   "      { id: 7, name: 'Hooper Cobb' },\n" +
                   "      { id: 8, name: 'Gates Todd' },\n" +
                   "      { id: 9, name: 'Lesa Chase' },\n" +
                   "      { id: 10, name: 'Natasha Frazier' },\n" +
                   "      { id: 11, name: 'Lynnette Key' },\n" +
                   "      { id: 12, name: 'Linda Mclaughlin' },\n" +
                   "      { id: 13, name: 'Harrison Martinez' },\n" +
                   "      { id: 14, name: 'Tameka Hebert' },\n" +
                   "      { id: 15, name: 'Gena Farley' },\n" +
                   "      { id: 16, name: 'Conley Walsh' },\n" +
                   "      { id: 17, name: 'Suarez Norman' },\n" +
                   "      { id: 18, name: 'Susana Pitts' },\n" +
                   "      { id: 19, name: 'Peck Hester' }\n" +
                   "    ]\n" +
                   "  },\n" +
                   "  {\n" +
                   "    guid: '904c2f38-071c-4b97-b968-f5c228aaf41a', isActive: false,\n" +
                   "    age: 34, email: 'peckhester@medalert.com',\n" +
                   "    phone: '+1 (848) 599-3447',\n" +
                   "    address: '323 Legion Street, Caspar, Delaware, 4117',\n" +
                   "    registered: new Date('Tue, 10 Mar 1981 17:02:53 GMT'),\n" +
                   "    latitude: -55.321712, longitude: -100.276818,\n" +
                   "    tags: [ 'Lorem', 'laboris', 'enim', 'anim', 'sint', 'incididunt', 'labore' ],\n" +
                   "    friends: [\n" +
                   "      { id: 0, name: 'Patterson Meadows' },\n" +
                   "      { id: 1, name: 'Velasquez Joseph' },\n" +
                   "      { id: 2, name: 'Horn Harrison' },\n" +
                   "      { id: 3, name: 'Young Mooney' },\n" +
                   "      { id: 4, name: 'Barbara Lynn' },\n" +
                   "      { id: 5, name: 'Sharpe Downs' }\n" +
                   "    ],\n" +
                   "    circular: { self: [Circular] },\n" +
                   "    this: {\n" +
                   "      is: {\n" +
                   "        deeply: { nested: ..., string: 'should be shown', 'a list': ... },\n" +
                   "        'a list': [...]\n" +
                   "      }\n" +
                   "    }\n" +
                   "  }\n" +
                   "]");


            var clonedExpect = expect.clone();
            clonedExpect.output.preferredWidth = 200;
            expect(clonedExpect.inspect(data, 5).toString(), 'to equal',
                   "[\n" +
                   "  {\n" +
                   "    guid: 'db550c87-1680-462a-bacc-655cecdd8907', isActive: false, age: 38, email: 'huntterry@medalert.com', phone: '+1 (803) 472-3209', address: '944 Milton Street, Madrid, Ohio, 1336',\n" +
                   "    about: 'Ea consequat nulla duis incididunt ut irureirure cupidatat. Est tempor cillum commodo aliquaconsequat esse commodo. Culpa ipsum eu consectetur idenim quis sint. Aliqua deserunt dolore reprehenderitid anim exercitation laboris. Eiusmod aute consecteturexcepteur in nulla proident occaecatconsectetur.\\r\\n',\n" +
                   "    registered: new Date('Sun, 03 Jun 1984 09:36:47 GMT'), latitude: 8.635553, longitude: -103.382498, tags: [ 'tempor', 'dolore', 'non', 'sit', 'minim', 'aute', 'non' ],\n" +
                   "    friends: [\n" +
                   "      { id: 0, name: 'Jeanne Hyde' },\n" +
                   "      { id: 1, name: 'Chavez Parker' },\n" +
                   "      { id: 2, name: 'Orr Rogers' },\n" +
                   "      { id: 3, name: 'Etta Glover' },\n" +
                   "      { id: 4, name: 'Glenna Aguirre' },\n" +
                   "      { id: 5, name: 'Erika England' },\n" +
                   "      { id: 6, name: 'Casandra Stanton' },\n" +
                   "      { id: 7, name: 'Hooper Cobb' },\n" +
                   "      { id: 8, name: 'Gates Todd' },\n" +
                   "      { id: 9, name: 'Lesa Chase' },\n" +
                   "      { id: 10, name: 'Natasha Frazier' },\n" +
                   "      { id: 11, name: 'Lynnette Key' },\n" +
                   "      { id: 12, name: 'Linda Mclaughlin' },\n" +
                   "      { id: 13, name: 'Harrison Martinez' },\n" +
                   "      { id: 14, name: 'Tameka Hebert' },\n" +
                   "      { id: 15, name: 'Gena Farley' },\n" +
                   "      { id: 16, name: 'Conley Walsh' },\n" +
                   "      { id: 17, name: 'Suarez Norman' },\n" +
                   "      { id: 18, name: 'Susana Pitts' },\n" +
                   "      { id: 19, name: 'Peck Hester' }\n" +
                   "    ]\n" +
                   "  },\n" +
                   "  {\n" +
                   "    guid: '904c2f38-071c-4b97-b968-f5c228aaf41a', isActive: false, age: 34, email: 'peckhester@medalert.com', phone: '+1 (848) 599-3447', address: '323 Legion Street, Caspar, Delaware, 4117',\n" +
                   "    registered: new Date('Tue, 10 Mar 1981 17:02:53 GMT'), latitude: -55.321712, longitude: -100.276818, tags: [ 'Lorem', 'laboris', 'enim', 'anim', 'sint', 'incididunt', 'labore' ],\n" +
                   "    friends: [\n" +
                   "      { id: 0, name: 'Patterson Meadows' },\n" +
                   "      { id: 1, name: 'Velasquez Joseph' },\n" +
                   "      { id: 2, name: 'Horn Harrison' },\n" +
                   "      { id: 3, name: 'Young Mooney' },\n" +
                   "      { id: 4, name: 'Barbara Lynn' },\n" +
                   "      { id: 5, name: 'Sharpe Downs' }\n" +
                   "    ],\n" +
                   "    circular: { self: [Circular] }, this: { is: { deeply: { nested: ..., string: 'should be shown', 'a list': ... }, 'a list': [...] } }\n" +
                   "  }\n" +
                   "]");
        });

        it('should inspect an arguments object differently from an array', function () {
            var args;
            (function () {
                args = arguments;
            }('a', 123));
            expect(args, 'to inspect as', "arguments( 'a', 123 )");
        });

        it('should output the body of a function', function () {
            expect(function () {
                var foo = 'bar';
                var quux = 'baz';
                while (foo) {
                    foo = foo
                        .substr(0, foo.length - 1);
                }
                return quux;
            }, 'to inspect as',
                'function () {\n' +
                '    var foo = \'bar\';\n' +
                '    var quux = \'baz\';\n' +
                '    while (foo) {\n' +
                '        foo = foo\n' +
                '            .substr(0, foo.length - 1);\n' +
                '    }\n' +
                '    return quux;\n' +
                '}');
        });

        it.skipIf(typeof Uint8Array === 'undefined', 'should render a hex dump for an Uint8Array instance', function () {
            expect(
                new Uint8Array([
                    0x00, 0x01, 0x02, 0x48, 0x65, 0x72, 0x65, 0x20, 0x69, 0x73, 0x20, 0x74, 0x68, 0x65, 0x20, 0x74,
                    0x68, 0x69, 0x6E, 0x67, 0x20, 0x49, 0x20, 0x77, 0x61, 0x73, 0x20, 0x74, 0x61, 0x6C, 0x6B, 0x69,
                    0x6E, 0x67, 0x20, 0x61, 0x62, 0x6F, 0x75, 0x74
                ]),
                'to inspect as',
                'Uint8Array([0x00, 0x01, 0x02, 0x48, 0x65, 0x72, 0x65, 0x20, 0x69, 0x73, 0x20, 0x74, 0x68, 0x65, 0x20, 0x74 /* 24 more */ ])'
            );
        });

        it('should output ellipsis when the toString method of a function returns something unparsable', function () {
            function foo() {}
            foo.toString = function () {
                return 'quux';
            };
            expect(foo, 'to inspect as', 'function foo( /*...*/ ) { /*...*/ }');
        });

        it('should render a function within a nested structure ellipsis when the toString method of a function returns something unparsable', function () {
            function foo() {}
            foo.toString = function () {
                return 'quux';
            };
            expect({ bar: { quux: foo } }, 'to inspect as',
                '{ bar: { quux: function foo( /*...*/ ) { /*...*/ } } }');
        });

        it('should bail out of removing the indentation of functions that use multiline string literals', function () {
            /*jshint multistr:true*/
            expect(function () {
                var foo = 'bar';
                var quux = 'baz\
                blah';
                foo = foo + quux;
            }, 'to inspect as',
                'function () {\n' +
                '                var foo = \'bar\';\n' +
                '                var quux = \'baz\\\n' +
                '                blah\';\n' +
                '                foo = foo + quux;\n' +
                '            }');
            /*jshint multistr:false*/
        });

        it('should bail out of removing the indentation of one-liner functions', function () {
            expect(function () {  var foo = 123; return foo; }, 'to inspect as', 'function () {  var foo = 123; return foo; }');
        });

        it('should not show the body of a function with native code', function () {
            expect(Array.prototype.slice, 'to inspect as', 'function slice() { /* native code */ }');
        });
    });

    describe('expect.it', function () {
        it('returns an expectation function that when applyed runs the assertion on the given subject', function () {
            var expectation = expect.it('to be greater than', 14);
            expectation(20);
            expect(function () {
                expectation(10);
            }, 'to throw', 'expected 10 to be greater than 14');
        });

        it('is inspected as it is written', function () {
            var expectation = expect.it('to be a number')
                                        .and('to be less than', 14)
                                        .and('to be negative')
                                    .or('to be a string')
                                        .and('to have length', 6);
            expect(expect.inspect(expectation).toString(), 'to equal',
                   "expect.it('to be a number')\n" +
                   "        .and('to be less than', 14)\n" +
                   "        .and('to be negative')\n" +
                   "      .or('to be a string')\n" +
                   "        .and('to have length', 6)");

        });

        it('does not catch errors that are not thrown by unexpected', function () {
            var clonedExpect = expect.clone().addAssertion('explode', function (expect, subject) {
                throw new Error('Explosion');
            });

            expect(clonedExpect.it('explode'), 'to throw', 'Explosion');
        });

        describe('with chained and', function () {
            it('all assertions has to be satisfied', function () {
                var expectation = expect.it('to be a number')
                    .and('to be less than', 14)
                    .and('to be negative');
                expect(function () {
                    expectation(20);
                }, 'to throw',
                       "✓ expected 20 to be a number and\n" +
                       "⨯ expected 20 to be less than 14 and\n" +
                       "  expected 20 to be negative");
            });

            it('returns a new function', function () {
                var expectation = expect.it('to be a number');
                var compositeExpectation = expectation.and('to be less than', 14);
                expect(compositeExpectation, 'not to be', expectation);

                expectation(20);
                expect(function () {
                    compositeExpectation(20);
                }, 'to throw',
                       '✓ expected 20 to be a number and\n' +
                       '⨯ expected 20 to be less than 14');
            });

            it('outputs one failing assertion correctly', function () {
                var expectation = expect.it('to be a number')
                    .and('to be less than', 14)
                    .and('to be negative');
                expect(function () {
                    expectation(8);
                }, 'to throw',
                       '✓ expected 8 to be a number and\n' +
                       '✓ expected 8 to be less than 14 and\n' +
                       '⨯ expected 8 to be negative');
            });
        });

        describe('with chained or', function () {
            it('succeeds if any expectations succeeds', function () {
                var expectation = expect.it('to be a number')
                    .or('to be a string')
                    .or('to be an array');
                expect(function () {
                    expectation('success');
                }, 'not to throw');
            });

            it('fails if all the expectations fails', function () {
                var expectation = expect.it('to be a number')
                      .and('to be greater than', 6)
                    .or('to be a string')
                      .and('to have length', 6)
                    .or('to be an array');
                expect(function () {
                    expectation('foobarbaz');
                }, 'to throw',
                       "⨯ expected 'foobarbaz' to be a number and\n" +
                       "  expected 'foobarbaz' to be greater than 6\n" +
                       "or\n" +
                       "✓ expected 'foobarbaz' to be a string and\n" +
                       "⨯ expected 'foobarbaz' to have length 6\n" +
                       "    expected 9 to be 6\n" +
                       "or\n" +
                       "⨯ expected 'foobarbaz' to be an array");
            });

            it('if there are no and-clauses it writes the failure output more compactly', function () {
                var expectation = expect.it('to be a number')
                    .or('to be a string')
                    .or('to be an array');
                expect(function () {
                    expectation(true);
                }, 'to throw',
                       "⨯ expected true to be a number or\n" +
                       "⨯ expected true to be a string or\n" +
                       "⨯ expected true to be an array");
            });

            it('returns a new function', function () {
                var expectation = expect.it('to be a number');
                var compositeExpectation = expectation.or('to be a string');
                expect(compositeExpectation, 'not to be', expectation);

                expectation(20);
                expect(function () {
                    compositeExpectation(20);
                    compositeExpectation(true);
                }, 'to throw',
                       '⨯ expected true to be a number or\n' +
                       '⨯ expected true to be a string');
            });
        });

        describe('with async assertions', function () {
            var clonedExpect = expect.clone()
                .addAssertion('to be a number after a short delay', function (expect, subject) {
                    this.errorMode = 'nested';

                    return expect.promise(function (run) {
                        setTimeout(run(function () {
                            expect(subject, 'to be a number');
                        }), 1);
                    });
                })
                .addAssertion('to be finite after a short delay', function (expect, subject) {
                    this.errorMode = 'nested';

                    return expect.promise(function (run) {
                        setTimeout(run(function () {
                            expect(subject, 'to be finite');
                        }), 1);
                    });
                })
                .addAssertion('to be a string after a short delay', function (expect, subject) {
                    this.errorMode = 'nested';

                    return expect.promise(function (run) {
                        setTimeout(run(function () {
                            expect(subject, 'to be a string');
                        }), 1);
                    });
                });

            it('should succeed', function () {
                return clonedExpect.it('to be a number after a short delay')(123);
            });

            it('should fail with a diff', function () {
                return expect(
                    clonedExpect.it('to be a number after a short delay')(false),
                    'to be rejected',
                        'expected false to be a number after a short delay\n' +
                        '  expected false to be a number'
                );
            });

            describe('with a chained "and" construct', function () {
                it('should succeed', function () {
                    return clonedExpect
                        .it('to be a number after a short delay')
                        .and('to be finite after a short delay')(123);
                });

                it('should fail with a diff', function () {
                    return expect(
                        clonedExpect
                            .it('to be a number after a short delay')
                            .and('to be finite after a short delay')(false),
                        'to be rejected',
                            '⨯ expected false to be a number after a short delay and\n' +
                            '    expected false to be a number\n' +
                            '  expected false to be finite after a short delay'
                    );
                });
            });

            describe('with a chained "or" construct', function () {
                it('should succeed', function () {
                    return clonedExpect
                        .it('to be a number after a short delay')
                            .and('to be finite after a short delay')
                        .or('to be a string after a short delay')('abc');
                });

                it('should fail with a diff', function () {
                    return expect(
                        clonedExpect
                            .it('to be a number after a short delay')
                                .and('to be finite after a short delay')
                            .or('to be a string after a short delay')(false),
                        'to be rejected',
                            '⨯ expected false to be a number after a short delay and\n' +
                            '    expected false to be a number\n' +
                            '  expected false to be finite after a short delay\n' +
                            'or\n' +
                            '⨯ expected false to be a string after a short delay\n' +
                            '    expected false to be a string'
                    );
                });
            });
        });
    });

    describe('diffs', function () {
        describe('on strings', function () {
            it('highlights unexpected extra newlines after the input', function () {
                expect(function () {
                    expect('foo\n', 'to equal', 'foo');
                }, 'to throw',
                       "expected 'foo\\n' to equal 'foo'\n" +
                       "\n" +
                       "-foo\\n\n" +
                       "+foo");
            });

            it('highlights missing newlines after the input', function () {
                expect(function () {
                    expect('foo', 'to equal', 'foo\n');
                }, 'to throw',
                       "expected 'foo' to equal 'foo\\n'\n" +
                       "\n" +
                       "-foo\n" +
                       "+foo\\n");
            });

            it('highlights unexpected carriage returns', function () {
                expect(function () {
                    expect('foo\r\nbar', 'to equal', 'foo\nbar');
                }, 'to throw',
                       "expected 'foo\\r\\nbar' to equal 'foo\\nbar'\n" +
                       "\n" +
                       "-foo\\r\n" +
                       "+foo\n" +
                       " bar");

                expect(function () {
                    expect('foo\r\n', 'to equal', 'foo\n');
                }, 'to throw',
                       "expected 'foo\\r\\n' to equal 'foo\\n'\n" +
                       "\n" +
                       "-foo\\r\n" +
                       "+foo");

                expect(function () {
                    expect('foo\r\n', 'to equal', 'foo');
                }, 'to throw',
                       "expected 'foo\\r\\n' to equal 'foo'\n" +
                       "\n" +
                       "-foo\\r\\n\n" +
                       "+foo");
            });

            it('highlights missing carriage returns', function () {
                expect(function () {
                    expect('foo\nbar', 'to equal', 'foo\r\nbar');
                }, 'to throw',
                       "expected 'foo\\nbar' to equal 'foo\\r\\nbar'\n" +
                       "\n" +
                       "-foo\n" +
                       "+foo\\r\n" +
                       " bar");

                expect(function () {
                    expect('foo\n', 'to equal', 'foo\r\n');
                }, 'to throw',
                       "expected 'foo\\n' to equal 'foo\\r\\n'\n" +
                       "\n" +
                       "-foo\n" +
                       "+foo\\r");

                expect(function () {
                    expect('foo', 'to equal', 'foo\r\n');
                }, 'to throw',
                       "expected 'foo' to equal 'foo\\r\\n'\n" +
                       "\n" +
                       "-foo\n" +
                       "+foo\\r\\n");
            });

            it('matching carriage returns are not highlighted', function () {
                expect(function () {
                    expect('foo\r\nbar', 'to equal', 'foo\r\nbaz');
                }, 'to throw',
                       "expected 'foo\\r\\nbar' to equal 'foo\\r\\nbaz'\n" +
                       "\n" +
                       " foo\r\n" +
                       "-bar\n" +
                       "+baz");
            });

            it('should show a \\r\\n line as removed', function () {
                expect(function () {
                    expect('foo\r\n\r\nbar', 'to equal', 'foo\r\nbar');
                }, 'to throw',
                       "expected 'foo\\r\\n\\r\\nbar' to equal 'foo\\r\\nbar'\n" +
                       "\n" +
                       " foo\r\n" +
                       "-\\r\n" +
                       " bar");
            });

            it('should show an empty removed line', function () {
                expect(function () {
                    expect('foo\n\nbar', 'to equal', 'foo\nbar');
                }, 'to throw',
                       "expected 'foo\\n\\nbar' to equal 'foo\\nbar'\n" +
                       "\n" +
                       " foo\n" +
                       "-\n" +
                       " bar");
            });

            it('should show a missing empty line', function () {
                expect(function () {
                    expect('foo\nbar', 'to equal', 'foo\n\nbar');
                }, 'to throw',
                       "expected 'foo\\nbar' to equal 'foo\\n\\nbar'\n" +
                       "\n" +
                       " foo\n" +
                       "+\n" +
                       " bar");
            });

            it('should show missing content when comparing to the empty string', function () {
                expect(function () {
                    expect('', 'to equal', 'foo\nbar');
                }, 'to throw',
                       "expected '' to equal 'foo\\nbar'\n" +
                       "\n" +
                       "+foo\n" +
                       "+bar");
            });

            it('should show unexpected content when comparing to the empty string', function () {
                expect(function () {
                    expect('foo\nbar', 'to equal', '');
                }, 'to throw',
                       "expected 'foo\\nbar' to equal ''\n" +
                       "\n" +
                       "-foo\n" +
                       "-bar");
            });
        });

        describe('on objects', function () {
            it('should not collapse parts containing conflicts', function () {
                expect(function () {
                    expect({
                        bar: {
                            b: {foo: {bar: 123}}
                        }
                    }, 'to equal', {
                        bar: {}
                    });
                }, 'to throw', 'expected { bar: { b: { foo: ... } } } to equal { bar: {} }\n' +
                       '\n' +
                       '{\n' +
                       '  bar: {\n' +
                       '    b: { foo: { bar: 123 } } // should be removed\n' +
                       '  }\n' +
                       '}');
            });

            it('should quote property names that require it', function () {
                expect(function () {
                    expect({
                        'the-\'thing': 123
                    }, 'to equal', {
                        'the-\'thing': 456
                    });
                }, 'to throw', "expected { 'the-\\'thing': 123 } to equal { 'the-\\'thing': 456 }\n" +
                       '\n' +
                       '{\n' +
                       "  'the-\\'thing': 123 // should equal 456\n" +
                       '}');
            });

            it('can contain nested string diffs', function () {
                expect(function () {
                    expect({
                        value: 'bar'
                    }, 'to equal', {
                        value: 'baz'
                    });
                }, 'to throw', "expected { value: 'bar' } to equal { value: 'baz' }\n" +
                       "\n" +
                       "{\n" +
                       "  value: 'bar' // should equal 'baz'\n" +
                       "               // -bar\n" +
                       "               // +baz\n" +
                       "}");
            });

            it('highlights properties that has been removed', function () {
                expect(function () {
                    expect({
                        foo: 'foo',
                        bar: 'bar',
                        baz: 'baz'
                    }, 'to equal', {
                        bar: 'bar',
                        baz: 'baz'
                    });
                }, 'to throw', "expected { foo: 'foo', bar: 'bar', baz: 'baz' } to equal { bar: 'bar', baz: 'baz' }\n" +
                       "\n" +
                       "{\n" +
                       "  foo: 'foo', // should be removed\n" +
                       "  bar: 'bar',\n" +
                       "  baz: 'baz'\n" +
                       "}");
            });

            it('highlights missing properties', function () {
                expect(function () {
                    expect({
                        one: 1,
                        three: 3
                    }, 'to equal', {
                        one: 1,
                        two: 2,
                        three: 3
                    });
                }, 'to throw', "expected { one: 1, three: 3 } to equal { one: 1, two: 2, three: 3 }\n" +
                       "\n" +
                       "{\n" +
                       "  one: 1,\n" +
                       "  three: 3,\n" +
                       "  two: undefined // should equal 2\n" +
                       "}");
            });

            it('highlights properties with an unexpected value', function () {
                expect(function () {
                    expect({
                        one: 1,
                        two: 42,
                        three: 3
                    }, 'to equal', {
                        one: 1,
                        two: 2,
                        three: 3
                    });
                }, 'to throw', "expected { one: 1, two: 42, three: 3 } to equal { one: 1, two: 2, three: 3 }\n" +
                       "\n" +
                       "{\n" +
                       "  one: 1,\n" +
                       "  two: 42, // should equal 2\n" +
                       "  three: 3\n" +
                       "}");
            });

            it('can contain nested object diffs for properties', function () {
                expect(function () {
                    expect({
                        one: { two: { three: 4 } }
                    }, 'to equal', {
                        one: { two: { three: 3 } }
                    });
                }, 'to throw', "expected { one: { two: { three: 4 } } } to equal { one: { two: { three: 3 } } }\n" +
                       "\n" +
                       "{\n" +
                       "  one: {\n" +
                       "    two: {\n" +
                       "      three: 4 // should equal 3\n" +
                       "    }\n" +
                       "  }\n" +
                       "}");
            });

            it('collapses subtrees without conflicts', function () {
                expect(function () {
                    expect({
                        pill: {
                            red: "I'll show you how deep the rabbit hole goes",
                            blue: { ignorance: { of:  'illusion' } }
                        }
                    }, 'to equal', {
                        pill: {
                            red: "I'll show you how deep the rabbit hole goes.",
                            blue: { ignorance: { of:  'illusion' } }
                        }
                    });
                }, 'to throw',
                       "expected\n" +
                       "{\n" +
                       "  pill: {\n" +
                       "    red: 'I\\'ll show you how deep the rabbit hole goes',\n" +
                       "    blue: { ignorance: ... }\n" +
                       "  }\n" +
                       "}\n" +
                       "to equal\n" +
                       "{\n" +
                       "  pill: {\n" +
                       "    red: 'I\\'ll show you how deep the rabbit hole goes.',\n" +
                       "    blue: { ignorance: ... }\n" +
                       "  }\n" +
                       "}\n" +
                       "\n" +
                       "{\n" +
                       "  pill: {\n" +
                       "    red: 'I\\'ll show you how deep the rabbit hole goes', // should equal 'I\\'ll show you how deep the rabbit hole goes.'\n" +
                       "                                                         // -I'll show you how deep the rabbit hole goes\n" +
                       "                                                         // +I'll show you how deep the rabbit hole goes.\n" +
                       "    blue: { ignorance: ... }\n" +
                       "  }\n" +
                       "}");
            });

            it('highlights mismatching constructors', function () {
                function Foo(text) {
                    this.text = text;
                }

                function Bar(text) {
                    this.text = text;
                }

                expect(function () {
                    expect(new Foo('test'), 'to equal', new Bar('test'));
                }, 'to throw', "expected Foo({ text: 'test' }) to equal Bar({ text: 'test' })\n" +
                       "\n" +
                       "Mismatching constructors Foo should be Bar");
            });
        });

        describe('on arrays', function () {
            it('suppresses array diff for large arrays', function () {
                expect(function () {
                    var a = new Array(513),
                    b = new Array(513);
                    a[0] = 1;
                    b[0] = 2;
                    expect(
                        a,
                        'to equal',
                        b
                    );
                }, 'to throw', /Diff suppressed due to size > 512/);
            });

            it('highlights unexpected entries', function () {
                expect(function () {
                    expect([0, 1, 2], 'to equal', [0, 2]);
                }, 'to throw', 'expected [ 0, 1, 2 ] to equal [ 0, 2 ]\n' +
                       '\n' +
                       '[\n' +
                       '  0,\n' +
                       '  1, // should be removed\n' +
                       '  2\n' +
                       ']'
                      );
            });

            it('highlights missing entries', function () {
                expect(function () {
                    expect([0, 2], 'to equal', [0, 1, 2]);
                }, 'to throw', 'expected [ 0, 2 ] to equal [ 0, 1, 2 ]\n' +
                       '\n' +
                       '[\n' +
                       '  0,\n' +
                       '  // missing 1\n' +
                       '  2\n' +
                       ']'
                      );
            });

            it('handles complicated similarities', function () {
                expect(function () {
                    expect([4, 3, 1, 2], 'to equal', [1, 2, 3, 4]);
                }, 'to throw', 'expected [ 4, 3, 1, 2 ] to equal [ 1, 2, 3, 4 ]\n' +
                       '\n' +
                       '[\n' +
                       "  4, // should equal 1\n" +
                       "  3, // should equal 2\n" +
                       "  1, // should equal 3\n" +
                       "  2 // should equal 4\n" +
                       ']'
                      );

                expect(function () {
                    expect([4, 1, 2, 3], 'to equal', [1, 2, 3, 4]);
                }, 'to throw', 'expected [ 4, 1, 2, 3 ] to equal [ 1, 2, 3, 4 ]\n' +
                       '\n' +
                       '[\n' +
                       "  4, // should equal 1\n" +
                       "  1, // should equal 2\n" +
                       "  2, // should equal 3\n" +
                       "  3 // should equal 4\n" +
                       ']'
                      );

                expect(function () {
                    expect([1, 2, 3, 0], 'to equal', [0, 1, 2, 3]);
                }, 'to throw',
                       "expected [ 1, 2, 3, 0 ] to equal [ 0, 1, 2, 3 ]\n" +
                       "\n" +
                       "[\n" +
                       "  // missing 0\n" +
                       "  1,\n" +
                       "  2,\n" +
                       "  3,\n" +
                       "  0 // should be removed\n" +
                       "]");

                expect(function () {
                    expect([4, 3, 1, 2], 'to equal', [3, 4]);
                }, 'to throw', 'expected [ 4, 3, 1, 2 ] to equal [ 3, 4 ]\n' +
                       '\n' +
                       '[\n' +
                       '  4, // should equal 3\n' +
                       '  3, // should equal 4\n' +
                       '  1, // should be removed\n' +
                       '  2 // should be removed\n' +
                       ']'
                      );
            });


            it('highlights conflicting entries', function () {
                expect(function () {
                    expect([0, 'once', 2], 'to equal', [0, 'one', 2]);
                }, 'to throw', "expected [ 0, 'once', 2 ] to equal [ 0, 'one', 2 ]\n" +
                       "\n" +
                       "[\n" +
                       "  0,\n" +
                       "  'once', // should equal 'one'\n" +
                       "          // -once\n" +
                       "          // +one\n" +
                       "  2\n" +
                       "]"
                      );
            });

            it('considers object with a similar structure candidates for diffing', function () {
                expect(function () {
                    expect([0, 1, { name: 'John', age: 34 }, 3, 2], 'to equal', [0, { name: 'Jane', age: 24, children: 2 }, 3, 2]);
                }, 'to throw',
                       "expected [ 0, 1, { name: 'John', age: 34 }, 3, 2 ] to equal [ 0, { name: 'Jane', age: 24, children: 2 }, 3, 2 ]\n" +
                       "\n" +
                       "[\n" +
                       "  0,\n" +
                       "  1, // should be removed\n" +
                       "  {\n" +
                       "    name: 'John', // should equal 'Jane'\n" +
                       "                  // -John\n" +
                       "                  // +Jane\n" +
                       "    age: 34, // should equal 24\n" +
                       "    children: undefined // should equal 2\n" +
                       "  },\n" +
                       "  3,\n" +
                       "  2\n" +
                       "]");
            });

            it('does not considers object with a different structure candidates for diffing', function () {
                expect(function () {
                    expect([0, 1, { name: 'John'}, 3, 2], 'to equal', [0, { firstName: 'John', lastName: 'Doe' }, 3, 2]);
                }, 'to throw',
                       "expected [ 0, 1, { name: 'John' }, 3, 2 ] to equal [ 0, { firstName: 'John', lastName: 'Doe' }, 3, 2 ]\n" +
                       "\n" +
                       "[\n" +
                       "  0,\n" +
                       "  // missing { firstName: 'John', lastName: 'Doe' }\n" +
                       "  1, // should be removed\n" +
                       "  { name: 'John' }, // should be removed\n" +
                       "  3,\n" +
                       "  2\n" +
                       "]");
            });

            it('considers similar strings candidates for diffing', function () {
                expect(function () {
                    expect(['twoo', 1, 3, 4, 5], 'to equal', [0, 1, 'two', 3, 4, 5]);
                }, 'to throw',
                       "expected [ 'twoo', 1, 3, 4, 5 ] to equal [ 0, 1, 'two', 3, 4, 5 ]\n" +
                       "\n" +
                       "[\n" +
                       "  // missing 0\n" +
                       "  // missing 1\n" +
                       "  'twoo', // should equal 'two'\n" +
                       "          // -twoo\n" +
                       "          // +two\n" +
                       "  1, // should be removed\n" +
                       "  3,\n" +
                       "  4,\n" +
                       "  5\n" +
                       "]");
            });

            it('does not considers different strings candidates for diffing', function () {
                expect(function () {
                    expect(['tw00', 1, 3, 4, 5], 'to equal', [0, 1, 'two', 3, 4, 5]);
                }, 'to throw',
                       "expected [ 'tw00', 1, 3, 4, 5 ] to equal [ 0, 1, 'two', 3, 4, 5 ]\n" +
                       "\n" +
                       "[\n" +
                       "  // missing 0\n" +
                       "  'tw00', // should be removed\n" +
                       "  1,\n" +
                       "  // missing 'two'\n" +
                       "  3,\n" +
                       "  4,\n" +
                       "  5\n" +
                       "]");
            });

            it('handles similar objects with no diff defined for custom type', function () {
                function Person(firstName, lastName) {
                    this.firstName = firstName;
                    this.lastName = lastName;
                }

                var clonedExpect = expect.clone()
                    .addType({
                        name: 'Person',
                        identify: function (value) {
                            return value instanceof Person;
                        },
                        equal: function (a, b) {
                            return a.firstName === b.firstName &&
                                a.lastName === b.lastName;
                        },
                        inspect: function (person, depth, output) {
                            return output.text("new Person('").text(person.firstName).text("', '").text(person.lastName).text("')");
                        },
                        diff: function () {
                            return null;
                        }
                    });


                expect(function () {
                    clonedExpect([new Person('John', 'Doe')], 'to equal', [new Person('Jane', 'Doe')]);
                }, 'to throw', "expected [ new Person('John', 'Doe') ] to equal [ new Person('Jane', 'Doe') ]\n" +
                       "\n" +
                       "[\n" +
                       "  new Person('John', 'Doe') // should equal new Person('Jane', 'Doe')\n" +
                       "]");
            });

            describe('sparse arrays', function () {
                it('elem was sparse', function () {
                    expect(function () {
                        var sparse = [];
                        sparse[1] = 2;
                        sparse[2] = 3;
                        expect(sparse, 'to equal', [1, 2, 3]);
                    }, 'to throw', 'expected [ , 2, 3 ] to equal [ 1, 2, 3 ]\n' +
                           '\n' +
                           '[\n' +
                           '  undefined, // should equal 1\n' +
                           '  2,\n' +
                           '  3\n' +
                           ']');
                });
                it('elem should be sparse', function () {
                    expect(function () {
                        var sparse = [];
                        sparse[1] = 2;
                        sparse[2] = 3;
                        expect([1, 2, 3], 'to equal', sparse);
                    }, 'to throw', 'expected [ 1, 2, 3 ] to equal [ , 2, 3 ]\n' +
                           '\n' +
                           '[\n' +
                           '  1, // should be undefined\n' +
                           '  2,\n' +
                           '  3\n' +
                           ']');
                });
            });
        });
    });

    it('makes expect.it available inside a custom assertion', function () {
        var clonedExpect = expect.clone();
        clonedExpect.addAssertion('to foo', function (expect, subject) {
            expect.it('to equal', 'foo')(subject);
        });
        clonedExpect('foo', 'to foo');
        expect(function () {
            clonedExpect('bar', 'to foo');
        }, 'to throw',
               "expected 'bar' to equal 'foo'\n" +
               '\n' +
               '-bar\n' +
               '+foo');
    });

    function add(a, b) {
        return a + b;
    }

    describe('when called with assertion', function () {
        it('should assert that the function invocation produces the correct output', function () {
            expect(add, 'when called with', [3, 4], 'to equal', 7);
        });

        it('should combine with other assertions (showcase)', function () {
            expect(function () {
                expect(add, 'when called with', [3, 4], 'to equal', 9);
            }, 'to throw',
                   'expected\n' +
                    'function add(a, b) {\n' +
                    '    return a + b;\n' +
                    '}\n' +
                    'when called with [ 3, 4 ] to equal 9\n' +
                    '  expected 7 to equal 9');

            expect(function () {
                expect(add, 'when called with', [3, 4], 'to satisfy', 'to equal', 9);
            }, 'to throw',
                   'expected\n' +
                   'function add(a, b) {\n' +
                   '    return a + b;\n' +
                   '}\n' +
                   "when called with [ 3, 4 ] to satisfy 'to equal', 9\n" + // DAMN, fix me
                   "  expected 7 to satisfy 'to equal', 9"); // DAMN, fix me
        });
    });

    describe('when passed as parameters to assertion', function () {
        it('should assert that the function invocation produces the correct output', function () {
            expect([3, 4], 'when passed as parameters to', add, 'to equal', 7);
        });

        it('works with an array-like object', function () {
            var args;
            (function () {
                args = arguments;
            }(3, 4));
            expect(args, 'when passed as parameters to', add, 'to equal', 7);
        });

        it('should produce a nested error message when the assertion fails', function () {
            expect(function () {
                expect([3, 4], 'when passed as parameters to', add, 'to equal', 8);
            }, 'to throw',
                   'expected [ 3, 4 ] when passed as parameters to\n' +
                   'function add(a, b) {\n' +
                   '    return a + b;\n' +
                   '} to equal 8\n' +
                   '  expected 7 to equal 8');

        });

        it('should combine with other assertions (showcase)', function () {
            expect([[1, 2], [3, 4]], 'to have items satisfying', 'when passed as parameters to', add, 'to be a number');
        });

        it('should pass the subject as a single parameter when invoked as "when passed as parameter to"', function () {
            expect(1, 'when passed as parameter to', add.bind(null, 1), 'to equal', 2);
        });

        describe('with the constructor flag', function () {
            function Foo(a, b) {
                this.a = a;
                this.b = b;
                this.numParams = arguments.length;
            }

            it('should create a new instance', function () {
                expect([1, 2], 'when passed as parameters to constructor', Foo, 'to satisfy', function (obj) {
                    expect(obj, 'to be a', Foo);
                    expect(obj.a, 'to equal', 1);
                    expect(obj.b, 'to equal', 2);
                    expect(obj.numParams, 'to equal', 2);
                });
            });
        });

        describe('with the async flag', function () {
            function delayedIncrement(num, cb) {
                setTimeout(function () {
                    if (typeof num === 'number') {
                        cb(null, num + 1);
                    } else {
                        cb(new Error('not a number'));
                    }
                }, 1);
            }

            it('should succeed', function () {
                return expect([123], 'when passed as parameters to async', delayedIncrement, 'to equal', 124);
            });

            it('should fail if the result of the async function does not meet the criteria', function () {
                return expect(
                    expect([123], 'when passed as parameters to async', delayedIncrement, 'to equal', 125),
                    'to be rejected',
                        "expected [ 123 ] when passed as parameters to async\n" +
                        "function delayedIncrement(num, cb) {\n" +
                        "    setTimeout(function () {\n" +
                        "        if (typeof num === 'number') {\n" +
                        "            cb(null, num + 1);\n" +
                        "        } else {\n" +
                        "            cb(new Error('not a number'));\n" +
                        "        }\n" +
                        "    }, 1);\n" +
                        "} to equal 125\n" +
                        "  expected 124 to equal 125"
                );
            });

            it('should fail if the async function calls the callback with an error', function () {
                return expect(
                    expect([false], 'when passed as parameters to async', delayedIncrement, 'to equal', 125),
                    'to be rejected',
                        "expected [ false ] when passed as parameters to async\n" +
                        "function delayedIncrement(num, cb) {\n" +
                        "    setTimeout(function () {\n" +
                        "        if (typeof num === 'number') {\n" +
                        "            cb(null, num + 1);\n" +
                        "        } else {\n" +
                        "            cb(new Error('not a number'));\n" +
                        "        }\n" +
                        "    }, 1);\n" +
                        "}, 'to equal', 125\n" +
                        "  expected Error({ message: 'not a number' }) to be falsy"
                );
            });
        });
    });

    describe('assertion.shift', function () {
        describe('with a function as the next argument', function () {
            it('should succeed', function () {
                var clonedExpect = expect.clone().addAssertion('string', 'when prepended with foo', function (expect, subject) {
                    return this.shift('foo' + subject, 0);
                });
                clonedExpect('foo', 'when prepended with foo', function (str) {
                    clonedExpect(str, 'to equal', 'foofoo');
                });
            });
        });

        describe('with an async assertion', function () {
            it('should succeed', function () {
                return expect(42, 'when delayed a little bit', 'to be a number');
            });

            it('should fail with a diff', function () {
                return expect(
                    expect(false, 'when delayed a little bit', 'to be a number'),
                    'to be rejected',
                    'expected false when delayed a little bit to be a number'
                );
            });
        });
    });

    describe('async', function () {
        before(function () {
            expect = expect.clone()
                .addAssertion('to be sorted after delay', function (expect, subject, delay) {
                    this.errorMode = 'nested';

                    return expect.promise(function (run) {
                        setTimeout(run(function () {
                            expect(subject, 'to be an array');
                            expect(subject, 'to equal', [].concat(subject).sort());
                        }), delay);
                    });
                })
                .addAssertion('to be ordered after delay', function (expect, subject) {
                    this.errorMode = 'nested';
                    return expect(subject, 'to be sorted after delay', 20);
                })
                .addAssertion('im sync', function (expect, subject) {
                    return expect.promise(function (run) {
                        run(function () {
                            expect(subject, 'to be', 24);
                        })();
                    });
                });
        });


        it('fails if it is called without a callback', function () {
            expect(function () {
                expect.async();
            }, 'to throw', /expect.async requires a callback without arguments./);

            expect(function () {
                expect.async('adsf');
            }, 'to throw', /expect.async requires a callback without arguments./);
        });

        it('fails if the returned function is not called with a done callback', function () {
            expect(function () {
                expect.async(function () {})();
            }, 'to throw', /expect.async should be called in the context of an it-block/);

            expect(function () {
                expect.async(function () {})('foo');
            }, 'to throw', /expect.async should be called in the context of an it-block/);
        });

        it('fails if is called within a asynchronous context', function () {
            expect(function () {
                function done() {}
                expect.async(function () {
                    expect.async(function () {
                    })(done);
                })(done);
            }, 'to throw', /expect.async can't be within a expect.async context./);
        });

        it('fails if the callback does not return a promise or throws', function () {
            expect(function () {
                function done() {}
                expect.async(function () {
                })(done);
            }, 'to throw', /expect.async requires the block to return a promise or throw an exception./);

            expect(function () {
                function done() {}
                expect.async(function () {
                    return {};
                })(done);
            }, 'to throw', /expect.async requires the block to return a promise or throw an exception./);
        });

        it('supports composition', expect.async(function () {
            return expect(
                expect([1, 3, 2], 'to be ordered after delay'),
                'to be rejected',
                    'expected [ 1, 3, 2 ] to be ordered after delay\n' +
                    '  expected [ 1, 3, 2 ] to be sorted after delay 20\n' +
                    '    expected [ 1, 3, 2 ] to equal [ 1, 2, 3 ]\n' +
                    '\n' +
                    '    [\n' +
                    '      1,\n' +
                    '      3, // should equal 2\n' +
                    '      2 // should equal 3\n' +
                    '    ]'
            );
        }));

        it('has a nice syntax', expect.async(function () {
            return expect(
                expect([1, 3, 2], 'to be sorted after delay', 20),
                'to be rejected',
                    'expected [ 1, 3, 2 ] to be sorted after delay 20\n' +
                    '  expected [ 1, 3, 2 ] to equal [ 1, 2, 3 ]\n' +
                    '\n' +
                    '  [\n' +
                    '    1,\n' +
                    '    3, // should equal 2\n' +
                    '    2 // should equal 3\n' +
                    '  ]'
            );
        }));

        it('tests that assertions that returns promises are converted to exceptions if they are sync', function () {
            expect(function () {
                expect(42, 'im sync');
            }, 'to throw', 'expected 42 im sync');
        });

        it.skipIf(!workQueue, 'throw an unhandled rejection if a promise is not caught by the test', function (done) {
            workQueue.onUnhandledRejection = function (err) {
                expect(err.output.toString(), 'to equal',
                    'expected [ 1, 3, 2 ] to be ordered after delay\n' +
                    '  expected [ 1, 3, 2 ] to be sorted after delay 20\n' +
                    '    expected [ 1, 3, 2 ] to equal [ 1, 2, 3 ]\n' +
                    '\n' +
                    '    [\n' +
                    '      1,\n' +
                    '      3, // should equal 2\n' +
                    '      2 // should equal 3\n' +
                    '    ]');

                done();
            };

            expect([1, 3, 2], 'to be ordered after delay');
        });
    });

    describe('expect.promise', function () {
        it('should forward non-unexpected errors', function () {
            var clonedExpect = expect.clone().addAssertion('to foo', function (expect, subject, value) {
                return expect.withError(function () {
                    return expect.promise(function () {
                        return expect.promise.any([
                            expect.promise(function () {
                                expect(subject, 'to be', 24);
                            }),
                            expect.promise(function () {
                                throw new Error('wat');
                            })
                        ]);
                    });
                }, function (e) {
                    // success
                });
            });
            expect(function () {
                clonedExpect(42, 'to foo');
            }, 'to throw', 'wat');
        });

        it('should return the resolved value when an assertion returns an oathbreakable promise that returns a value', function () {
            var clonedExpect = expect.clone().addAssertion('to foo', function (expect, subject, value) {
                return expect.promise(function () {
                    expect(subject, 'to equal', 'foo');
                    return 'bar';
                });
            });
            expect(clonedExpect('foo', 'to foo'), 'to equal', 'bar');
        });

        it('should return the resolved value when an assertion returns an oathbreakable promise that resolves with a value', function () {
            var clonedExpect = expect.clone().addAssertion('to foo', function (expect, subject, value) {
                return expect.promise(function (resolve, reject) {
                    expect(subject, 'to equal', 'foo');
                    resolve('bar');
                });
            });
            expect(clonedExpect('foo', 'to foo'), 'to equal', 'bar');
        });

        it('should preserve the resolved value when an assertion contains a non-oathbreakable promise', function (done) {
            var clonedExpect = expect.clone().addAssertion('to foo', function (expect, subject, value) {
                return expect.promise(function (resolve, reject) {
                    expect(subject, 'to equal', 'foo');
                    setTimeout(function () {
                        resolve('bar');
                    }, 1);
                });
            });
            clonedExpect('foo', 'to foo').then(function (value) {
                expect(value, 'to equal', 'bar');
                done();
            });
        });

        it('should preserve the return value when an assertion returns a non-promise value', function () {
            var clonedExpect = expect.clone().addAssertion('to foo', function (expect, subject, value) {
                expect(subject, 'to equal', 'foo');
                return 'bar';
            });
            expect(clonedExpect('foo', 'to foo'), 'to equal', 'bar');
        });

        it('should throw an exception if the argument was not a function', function () {
            var expectedError = new TypeError('expect.promise(...) requires a function argument to be supplied.\n' +
                                              'See http://unexpectedjs.github.io/api/promise/ for more details.');
            expect(function () {
                expect.promise();
            }, 'to throw', expectedError);

            [undefined, null, '', [], {}].forEach(function (arg) {
                expect(function () {
                    expect.promise(arg);
                }, 'to throw', expectedError);
            });
        });
    });

    describe.skipIf(typeof Buffer === 'undefined', 'when decoded as assertion', function () {
        it('should decode a Buffer instance to utf-8', function () {
            expect(new Buffer('æøå', 'utf-8'), 'when decoded as', 'utf-8', 'to equal', 'æøå');
        });
    });
});
