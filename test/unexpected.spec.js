/*global describe, it, expect, beforeEach, setTimeout, Uint8Array, Uint16Array*/

// use this instead of Object.create in order to make the tests run in
// browsers that are not es5 compatible.
function create(o) {
    function F() {}
    F.prototype = o;
    return new F();
}

function itSkipIf(condition) {
    (condition ? it.skip : it).apply(it, Array.prototype.slice.call(arguments, 1));
}

var circular = {};
circular.self = circular;

describe('unexpected', function () {
    describe('argument validation', function () {
        it('fails when given no parameters', function () {
            expect(function () {
                expect();
            }, 'to throw', 'The expect functions requires at least two parameters.');
        });

        it('fails when given only one parameter', function () {
            expect(function () {
                expect({});
            }, 'to throw', 'The expect functions requires at least two parameters.');
        });

        it('fails when the second parameter is not a string', function () {
            expect(function () {
                expect({}, {});
            }, 'to throw', 'The expect functions requires second parameter to be a string.');
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
            }, 'to throw', "expected [Error: error message { data: 'extra' }] to be a number");
        });

        it('throws with a stack trace that has the calling function as the top frame when the assertion fails (if the environment supports it)', function () {
            if (Error.captureStackTrace || 'stack' in new Error()) {
                expect(function TheCallingFunction() {
                    expect(4 < 4, 'to be ok');
                }, 'to throw exception', function (err) {
                    expect(err.stack.split('\n')[1], 'to match', /TheCallingFunction/);
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
        });

        itSkipIf(typeof Buffer === 'undefined', 'asserts === equality for Buffers', function () {
            var buffer = new Buffer([0x45, 0x59]);
            expect(buffer, 'to be', buffer);
        });

        itSkipIf(typeof Uint8Array === 'undefined', 'asserts === equality for Uint8Array', function () {
            var uint8Array = new Uint8Array([0x45, 0x59]);
            expect(uint8Array, 'to be', uint8Array);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect('foo', 'to be', 'bar');
            }, 'to throw exception', "expected 'foo' to be 'bar'");

            expect(function () {
                expect(true, 'not to be', true);
            }, 'to throw exception', "expected true not to be true");
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
            expect(['abc'], 'to be an array of strings');
            expect([{}], 'to be an array of objects');
            expect([{}], 'to be a non-empty array of objects');
            expect([/foo/, /bar/], 'to be a non-empty array of regexps');
            expect([[], [], []], 'to be an array of arrays');
            expect(['abc'], 'to be a non-empty array of strings');
            expect([], 'to be an empty array');
            expect({}, 'to be an', Object);
            expect({}, 'to be an empty object');
            expect({foo: 123}, 'to be a non-empty object');
            expect([123], 'to be a non-empty array');
            expect([], 'to be an', 'object');
            expect([], 'to be an object');
            expect([], 'to be an empty object');
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

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(5, 'to be a', Array);
            }, 'to throw exception', /expected 5 to be a \[Function(: Array)?\]/);

            expect(function () {
                expect([], 'not to be an', 'array');
            }, 'to throw exception', "expected [] not to be an 'array'");

            expect(function () {
                expect(circular, 'not to be an object');
            }, 'to throw exception', "expected { self: [Circular] } not to be an object");
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
            expect(/foo/, 'to equal', /foo/);
            expect(/foo/i, 'not to equal', /foo/);
            expect(/foo/gm, 'to equal', /foo/gm);
            expect(/foo/m, 'not to equal', /foo/i);
            expect(/foo/m, 'to equal', new RegExp('foo', 'm'));
            expect([], 'not to equal', 0);
            expect(new Error('foo'), 'to equal', new Error('foo'));
        });

        it('handles argument arrays as arrays', function () {
            (function () {
                expect(arguments, 'to equal', ['foo', 'bar', 'baz']);
            }('foo', 'bar', 'baz'));
        });

        it('should treat properties with a value of undefined as equivalent to missing properties', function () {
            expect({foo: undefined, bar: 1}, 'to equal', {bar: 1});
            expect({bar: 1}, 'to equal', {foo: undefined, bar: 1});
        });

        itSkipIf(typeof Buffer === 'undefined', 'asserts equality for Buffer instances', function () {
            expect(new Buffer([0x45, 0x59]), 'to equal', new Buffer([0x45, 0x59]));
        });

        itSkipIf(typeof Uint8Array === 'undefined', 'asserts equality for Uint8Array', function () {
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

        it('throws when the assertion fails', function () {
            expect(function () {
                expect({ a: { b: 'c'} }, 'to equal', { a: { b: 'd'} });
            }, 'to throw exception', "expected { a: { b: 'c' } } to equal { a: { b: 'd' } }");

            expect(function () {
                expect({ a: 'b' }, 'not to equal', { a: 'b' });
            }, 'to throw exception', "expected { a: 'b' } not to equal { a: 'b' }");

            expect(function () {
                expect(new Error('foo'), 'to equal', new Error('bar'));
            }, 'to throw exception', "expected [Error: foo {}] to equal [Error: bar {}]");

            expect(function () {
                (function () {
                    expect(arguments, 'to equal', ['foo', 'bar', 'baz']);
                }('foo', 'bar'));
            }, 'to throw exception', "expected [ 'foo', 'bar' ] to equal [ 'foo', 'bar', 'baz' ]");
        });

        it("throws an error with 'expected' and 'actual' properties when not negated", function () {
            var expected = 123,
                actual = 456;
            expect(function () {
                expect(actual, 'to equal', expected);
            }, 'to throw exception', function (e) {
                expect(e.expected, 'to equal', expected);
                expect(e.actual, 'to equal', actual);
            });
        });

        it("throws an error without 'expected' and 'actual' properties when negated", function () {
            expect(function () {
                expect(123, 'not to equal', 123);
            }, 'to throw exception', function (e) {
                expect(e.expected, 'not to be ok');
                expect(e.actual, 'not to be ok');
            });
        });

        it("throws an error with showDiff:true when comparing arrays and not negated", function () {
            expect(function () {
                expect([1], 'to equal', [2]);
            }, 'to throw exception', function (e) {
                expect(e.showDiff, 'to be ok');
            });
        });

        it("throws an error with showDiff:true when comparing objects and not negated", function () {
            expect(function () {
                expect({foo: 1}, 'to equal', {foo: 2});
            }, 'to throw exception', function (e) {
                expect(e.showDiff, 'to be ok');
            });
        });

        it("throws an error with showDiff:true when comparing an object to an array", function () {
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

        itSkipIf(typeof Buffer === 'undefined', 'produces a hex-diff in JSON when Buffers differ', function () {
            expect(function () {
                expect(
                    new Buffer('\x00\x01\x02Here is the thing I was talking about', 'utf-8'),
                    'to equal',
                    new Buffer('\x00\x01\x02Here is the thing I was quuxing about', 'utf-8')
                );
            }, 'to throw', function (err) {
                expect(err, 'to have properties', {
                    showDiff: true,
                    actual: {
                        $Buffer: [
                            '00 01 02 48 65 72 65 20 69 73 20 74 68 65 20 74  |...Here is the t|',
                            '68 69 6E 67 20 49 20 77 61 73 20 74 61 6C 6B 69  |hing I was talki|',
                            '6E 67 20 61 62 6F 75 74                          |ng about|'
                        ]
                    },
                    expected: {
                        $Buffer: [
                            '00 01 02 48 65 72 65 20 69 73 20 74 68 65 20 74  |...Here is the t|',
                            '68 69 6E 67 20 49 20 77 61 73 20 71 75 75 78 69  |hing I was quuxi|',
                            '6E 67 20 61 62 6F 75 74                          |ng about|'
                        ]
                    }
                });
            });
        });

        itSkipIf(typeof Uint8Array === 'undefined' || !Array.prototype.map, 'produces a hex-diff in JSON when Uint8Arrays differ', function () {
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
            }, 'to throw', function (err) {
                expect(err, 'to have properties', {
                    showDiff: true,
                    actual: {
                        $Uint8Array: [
                            '00 01 02 48 65 72 65 20 69 73 20 74 68 65 20 74  |...Here is the t|',
                            '68 69 6E 67 20 49 20 77 61 73 20 74 61 6C 6B 69  |hing I was talki|',
                            '6E 67 20 61 62 6F 75 74                          |ng about|'
                        ]
                    },
                    expected: {
                        $Uint8Array: [
                            '00 01 02 48 65 72 65 20 69 73 20 74 68 65 20 74  |...Here is the t|',
                            '68 69 6E 67 20 49 20 77 61 73 20 71 75 75 78 69  |hing I was quuxi|',
                            '6E 67 20 61 62 6F 75 74                          |ng about|'
                        ]
                    }
                });
            });
        });

        itSkipIf(typeof Uint16Array === 'undefined', 'produces a hex-diff in JSON when Uint16Arrays differ', function () {
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
            }, 'to throw', function (err) {
                expect(err, 'to have properties', {
                    showDiff: true,
                    actual: {
                        $Uint16Array: [
                            '0001 0248 6572 6520 6973 2074 6865 2074',
                            '6869 6E67 2049 2077 6173 2074 616C 6B69',
                            '6E67 2061 626F 7574'
                        ]
                    },
                    expected: {
                        $Uint16Array: [
                            '0001 0248 6572 6520 6973 2074 6865 2074',
                            '6869 6E67 2049 2077 6173 2071 7575 7869',
                            '6E67 2061 626F 7574'
                        ]
                    }
                });
            });
        });
    });

    describe('exception assertion', function () {
        it('fails if no exception is thrown', function () {
            expect(function () {
                expect(function () {
                    // Don't throw
                }, 'to throw exception');
            }, 'to throw', 'expected [Function] to throw exception');

        });
        it('fails if expection is throw', function () {
            expect(function () {
                expect(function () {
                    throw new Error('The exception message');
                }, 'not to throw exception');
            }, 'to throw');
            expect(function () {
                expect(function () {
                    throw new Error('The exception message');
                }, 'not to throw exception');
            }, 'to throw', 'expected [Function] not to throw exception');
        });

        it('fails if the argument is not a function', function () {
            expect(function () {
                expect(1, 'to throw exception');
            }, 'to throw exception', "Assertion 'to throw exception' only supports functions");
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
            expect(function () {
                throw new Error('Other error');
            }, 'not to throw exception', /matches the exception message/);
        });

        it('provides actual and expected properties when the exception message does not match the given string', function () {
            expect(function () {
                expect(function () {
                    throw new Error('bar');
                }, 'to throw exception', 'foo');
            }, 'to throw exception', function (err) {
                expect(err.message, 'to equal', "expected 'bar' to equal 'foo'");
                expect(err, 'to have properties', {
                    actual: 'bar',
                    expected: 'foo'
                });
            });
        });

        it('exactly matches the message against the given string', function () {
            expect(function () {
                throw new Error('matches the exception message');
            }, 'to throw exception', 'matches the exception message');
            expect(function () {
                throw new Error('matches the exception message');
            }, 'not to throw exception', 'the exception message');
        });
    });

    describe('match assertion', function () {
        it('tests that the subject matches the given regular expression', function () {
            expect('test', 'to match', /.*st/);
            expect('test', 'not to match', /foo/);
            expect(null, 'not to match', /foo/);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect('test', 'to match', /foo/);
            }, 'to throw exception', "expected 'test' to match /foo/");
        });
    });

    describe('contain assertion', function () {
        it('asserts indexOf for an array or string', function () {
            expect([1, 2], 'to contain', 1);
            expect([1, 2], 'to contain', 2, 1);
            expect('hello world', 'to contain', 'world');
            expect(null, 'not to contain', 'world');
        });

        it('throws when the assertion fails', function () {
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
                expect(1, 'to contain', 1);
            }, 'to throw exception', "Assertion 'to contain' only supports strings and arrays");
        });
    });

    describe('length assertion', function () {
        it('asserts array .length', function () {
            expect([], 'to have length', 0);
            expect([1, 2, 3], 'to have length', 3);
            expect([1, 2, 3], 'not to have length', 4);
            expect({ length: 4 }, 'to have length', 4);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect([1, 2], 'to have length', 3);
            }, 'to throw exception', "expected [ 1, 2 ] to have length 3");

            expect(function () {
                expect(null, 'to have length', 4);
            }, 'to throw exception', "Assertion 'to have length' only supports array like objects");

            expect(function () {
                expect({ length: 'foo' }, 'to have length', 4);
            }, 'to throw exception', "Assertion 'to have length' only supports array like objects");
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
            expect({a: 'b'}, 'to have own property', 'a');
            expect(create({a: 'b'}), 'not to have own property', 'a');
            expect(1, 'not to have property', 'a');
            expect(null, 'not to have property', 'a');
            expect(undefined, 'not to have property', 'a');
            expect(true, 'not to have property', 'a');
            expect(false, 'not to have property', 'a');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect({a: 'b'}, 'to have property', 'b');
            }, 'to throw exception', "expected { a: 'b' } to have property 'b'");

            expect(function () {
                expect(null, 'to have property', 'b');
            }, 'to throw exception', "expected null to have property 'b'");

            expect(function () {
                expect({a: 'b'}, 'to have property', 'a', 'c');
            }, 'to throw exception', "expected { a: 'b' } to have property 'a', 'c'");

            expect(function () {
                // property expectations ignores value if property
                expect(null, 'not to have property', 'a', 'b');
            }, 'to throw exception', "expected null not to have property 'a', 'b'");

            expect(function () {
                // property expectations on value expects the property to be present
                expect(null, 'not to have own property', 'a', 'b');
            }, 'to throw exception', "expected null not to have own property 'a', 'b'");
        });
    });

    describe('properties assertion', function () {
        it('asserts presence of a list of properties', function () {
            expect({a: 'foo', b: 'bar'}, 'to have properties', ['a', 'b']);
        });

        it('asserts presence of a list of own properties', function () {
            expect({a: 'foo', b: 'bar'}, 'to have own properties', ['a', 'b']);
            expect(function () {
                var obj = create({a: 'foo', b: 'bar'});
                expect(obj, 'to have properties', ['a', 'b']); // should not fail
                expect(obj, 'to have own properties', ['a', 'b']); // should fail
            }, 'to throw', "expected {} to have own properties [ 'a', 'b' ]");
        });

        it('asserts absence of a list of properties', function () {
            expect({a: 'foo', b: 'bar'}, 'not to have properties', ['c', 'd']);
            expect(function () {
                expect({a: 'foo', b: 'bar'}, 'not to have properties', ['a', 'd']);
            }, 'to throw', "expected { a: 'foo', b: 'bar' } not to have properties [ 'a', 'd' ]");
        });

        it('asserts absence of a list of own properties', function () {
            var obj = create({a: 'foo', b: 'bar'});
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
            }, 'to throw', "expected { a: 'foo', b: 'bar' } to have properties { c: 'baz' }");
            expect(function () {
                expect({a: 'foo', b: 'bar'}, 'to have properties', {b: 'baz'});
            }, 'to throw', "expected { a: 'foo', b: 'bar' } to have properties { b: 'baz' }");
        });

        it('asserts presence and values of an object of own properties', function () {
            expect({a: 'foo', b: 'bar'}, 'to have own properties', {a: 'foo', b: 'bar'});
            expect(function () {
                var obj = create({a: 'foo', b: 'bar'});
                expect(obj, 'to have properties', {a: 'foo', b: 'bar'}); // should not fail
                expect(obj, 'to have own properties', {a: 'foo', b: 'bar'}); // should fail
            }, 'to throw', "expected {} to have own properties { a: 'foo', b: 'bar' }");
        });

        it('asserts absence and values of an object of properties', function () {
            expect({a: 'foo', b: 'bar'}, 'not to have properties', {c: 'baz', d: 'qux'});
            expect(function () {
                expect({a: 'foo', b: 'bar'}, 'not to have properties', {a: 'foo', c: 'baz'});
            }, 'to throw', "expected { a: 'foo', b: 'bar' } not to have properties { a: 'foo', c: 'baz' }");
        });

        it('asserts absence and values of an object of own properties', function () {
            var obj = create({a: 'foo', b: 'bar'});
            expect(obj, 'to have properties', {a: 'foo', b: 'bar'});
            expect(obj, 'not to have own properties', {a: 'foo', b: 'bar'});
            expect(function () {
                expect({a: 'foo', b: 'bar'}, 'not to have own properties', {a: 'foo', b: 'bar'}); // should fail
            }, 'to throw', "expected { a: 'foo', b: 'bar' } not to have own properties { a: 'foo', b: 'bar' }");
        });

        it('should add showDiff:true and diffable actual and expected properties to the error instance', function () {
            expect(function () {
                expect({a: 123, b: 456, c: 789}, 'to have properties', {a: 123, b: 987});
            }, 'to throw', function (e) {
                expect(e.showDiff, 'to be true');
                expect(e.actual, 'to equal', {a: 123, b: 456, c: 789});
                expect(e.expected, 'to equal', {a: 123, b: 987, c: 789});
            });
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect({a: 'foo', b: 'bar'}, 'to have properties', ['c', 'd']);
            }, 'to throw', "expected { a: 'foo', b: 'bar' } to have properties [ 'c', 'd' ]");
        });

        it('throws when given invalid input', function () {
            expect(function () {
                expect({a: 'foo', b: 'bar'}, 'to have properties', 'a', 'b');
            }, 'to throw', "Assertion 'to have properties' only supports input in the form of an Array or an Object.");
        });
    });

    describe('empty assertion', function () {
        it('asserts presence of an own property (and value optionally)', function () {
            expect([], 'to be empty');
            expect('', 'to be empty');
            expect({}, 'to be empty');
            expect({ length: 0, duck: 'typing' }, 'to be empty');
            expect({ my: 'object' }, 'not to be empty');
            expect({ my: 'object' }, 'to be non-empty');
            expect([1, 2, 3], 'not to be empty');
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
            }, 'to throw exception', "Assertion 'to be empty' only supports strings, arrays and objects");
        });
    });

    describe('key assertion', function () {
        it('asserts the presence of a key', function () {
            expect({ a: 'b' }, 'to have key', 'a');
            expect({ a: 'b' }, 'not to have key', 'b');
            expect({ a: 'b', c: 'd' }, 'not to have key', 'b');
            expect({ a: 'b', c: 'd' }, 'to not only have key', 'a');
            expect({ a: 'b', c: 'd' }, 'to only have keys', 'a', 'c');
            expect({ a: 'b', c: 'd' }, 'to only have keys', ['a', 'c']);
            expect({ a: 'b', c: 'd', e: 'f' }, 'to not only have keys', ['a', 'c']);
            expect(null, 'not to have key', 'a');
            expect(undefined, 'not to have key', 'a');
            expect(true, 'not to have key', 'a');
            expect(false, 'not to have key', 'a');
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
            expect(NaN, 'not to be finite');
            expect(null, 'not to be finite');
            expect({}, 'not to be finite');

            it('throws when the assertion fails', function () {
                expect(function () {
                    expect(Infinity, 'to be finite');
                }, 'to throw exception', 'expected Infinity to be finite');
            });
        });
    });

    describe('finite assertion', function () {
        it('asserts a infinite number', function () {
            expect(123, 'not to be infinite');
            expect(0, 'not to be infinite');
            expect(Infinity, 'to be infinite');
            expect(-Infinity, 'to be infinite');
            expect(NaN, 'not to be infinite');
            expect(null, 'not to be infinite');
            expect({}, 'not to be infinite');

            it('throws when the assertion fails', function () {
                expect(function () {
                    expect(123, 'to be finite');
                }, 'to throw exception', 'expected 123 to be infinite');
            });
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
            }, 'to throw exception', "expected 4 not to be within '0..4'");
            expect(function () {
                expect(null, 'not to be within', 0, 4);
            }, 'to throw exception', "expected null not to be within '0..4'");
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
            expect({}, 'to be NaN');
            expect(2, 'not to be NaN');
            expect(null, 'not to be NaN');
            expect(undefined, 'to be NaN');
            expect("String", 'to be NaN');
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

    describe('fail assertion', function () {
        it('throws an error', function () {
            expect(function () {
                expect.fail();
            }, 'to throw exception', "explicit failure");
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
                expect.fail('{0} was expected to be {1}', 0);
            }, 'to throw exception', "0 was expected to be {1}");
        });

    });

    describe('to be an array whose items satisfy assertion', function () {
        it('requires a function or a string as the third argument', function () {
            expect(function () {
                expect([1, 2, 3], 'to be an array whose items satisfy');
            }, 'to throw', 'Assertion "to be an array whose items satisfy" expects a function as argument');

            expect(function () {
                expect([1, 2, 3], 'to be an array whose items satisfy', 42);
            }, 'to throw', 'Assertion "to be an array whose items satisfy" expects a function as argument');
        });

        it('only accepts arrays as the target object', function () {
            expect(function () {
                expect(42, 'to be an array whose items satisfy', function (item) {});
            }, 'to throw', /expected 42 to be an array/);
        });

        it('supports the non-empty clause', function () {
            expect([1], 'to be a non-empty array whose items satisfy', function (item) {
                expect(item, 'to be a number');
            });
        });

        it('asserts that the given callback does not throw for any items in the array', function () {
            expect([0, 1, 2, 3], 'to be an array whose items satisfy', function (item, index) {
                expect(item, 'to be a number');
                expect(index, 'to be a number');
            });

            expect(['0', '1', '2', '3'], 'to be an array whose items satisfy', function (item, index) {
                expect(item, 'not to be a number');
                expect(index, 'to be a number');
            });

            expect([0, 1, 2, 3], 'to be an array whose items satisfy', 'to be a number');

            expect(['0', '1', '2', '3'], 'to be an array whose items satisfy', 'not to be a number');

            expect([[1], [2]], 'to be an array whose items satisfy', 'to be an array whose items satisfy', 'to be a number');
        });

        it('provides the item index to the callback function', function () {
            var arr = ['0', '1', '2', '3'];
            expect(arr, 'to be an array whose items satisfy', function (item, index) {
                expect(index, 'to be a number');
                expect(index, 'to be', parseInt(item, 10));
            });
        });

        it('fails when the assertion fails', function () {
            expect(function () {
                expect(['0', 1, '2', '3'], 'to be an array whose items satisfy', function (item) {
                    expect(item, 'not to be a number');
                });
            }, 'to throw', /expected 1 not to be a number/);

            expect(function () {
                expect(['0', 1, '2', '3'], 'to be an array whose items satisfy', 'not to be a number');
            }, 'to throw', /expected 1 not to be a number/);

            expect(function () {
                expect([], 'to be a non-empty array whose items satisfy', function (item) {
                    expect(item, 'not to be a number');
                });
            }, 'to throw', /expected \[\] to be non-empty/);
        });

        it('provides a detailed report of where failures occur', function () {
            expect(function () {
                expect([0, 1, '2', 3, 4], 'to be an array whose items satisfy', function (item) {
                    expect(item, 'to be a number');
                    expect(item, 'to be less than', 4);
                });
            }, 'to throw',
                   "failed expectation in [ 0, 1, '2', 3, 4 ]:\n" +
                   "    2: expected '2' to be a number\n" +
                   "    4: expected 4 to be less than 4");
        });

        it('indents failure reports of nested assertions correctly', function () {
            expect(function () {
                expect([[0, 1, 2], [4, '5', 6], [7, 8, '9']], 'to be an array whose items satisfy', function (arr) {
                    expect(arr, 'to be an array whose items satisfy', function (item) {
                        expect(item, 'to be a number');
                    });
                });
            }, 'to throw',
                "failed expectation in [ [ 0, 1, 2 ], [ 4, '5', 6 ], [ 7, 8, '9' ] ]:\n" +
                "    1: failed expectation in [ 4, '5', 6 ]:\n" +
                "        1: expected '5' to be a number\n" +
                "    2: failed expectation in [ 7, 8, '9' ]:\n" +
                "        2: expected '9' to be a number");
        });
    });

    describe('to be a map whose values satisfy assertion', function () {
        it('requires a function or a string as the third argument', function () {
            expect(function () {
                expect([1, 2, 3], 'to be a map whose values satisfy');
            }, 'to throw', 'Assertion "to be a map whose values satisfy" expects a function as argument');

            expect(function () {
                expect([1, 2, 3], 'to be a map whose values satisfy', 42);
            }, 'to throw', 'Assertion "to be a map whose values satisfy" expects a function as argument');
        });

        it('only accepts objects as the target', function () {
            expect(function () {
                expect(42, 'to be a map whose values satisfy', function (value) {});
            }, 'to throw', /expected 42 to be an object/);
        });

        it('asserts that the given callback does not throw for any values in the map', function () {
            expect({ foo: 0, bar: 1, baz: 2, qux: 3 }, 'to be a map whose values satisfy', function (value) {
                expect(value, 'to be a number');
            });

            expect({ foo: '0', bar: '1', baz: '2', qux: '3' }, 'to be a map whose values satisfy', function (value) {
                expect(value, 'not to be a number');
            });

            expect({ foo: 0, bar: 1, baz: 2, qux: 3 }, 'to be a map whose values satisfy', 'to be a number');

            expect({ foo: '0', bar: '1', baz: '2', qux: '3' }, 'to be a map whose values satisfy', 'not to be a number');
        });

        it('supports the non-empty clause', function () {
            expect({ foo: '0' }, 'to be a non-empty map whose values satisfy', function (value) {
                expect(value, 'to equal', '0');
            });
        });

        it('supports "hash" and "object" as aliases', function () {
            expect({ foo: '0' }, 'to be an object whose values satisfy', function (value) {
                expect(value, 'not to be a number');
            });

            expect({ foo: '0' }, 'to be a hash whose values satisfy', function (value) {
                expect(value, 'not to be a number');
            });
        });

        it('fails when the assertion fails', function () {
            expect(function () {
                expect({ foo: '0', bar: 1, baz: '2', qux: '3' }, 'to be a map whose values satisfy', function (value) {
                    expect(value, 'not to be a number');
                });
            }, 'to throw', /expected 1 not to be a number/);
        });

        it('provides a detailed report of where failures occur', function () {
            expect(function () {
                expect({ foo: 0, bar: 1, baz: '2', qux: 3, quux: 4 }, 'to be a map whose values satisfy', function (value) {
                    expect(value, 'to be a number');
                    expect(value, 'to be less than', 4);
                });
            }, 'to throw',
                   "failed expectation in { foo: 0, bar: 1, baz: '2', qux: 3, quux: 4 }:\n" +
                   "    baz: expected '2' to be a number\n" +
                   "    quux: expected 4 to be less than 4");
        });

        it('indents failure reports of nested assertions correctly', function () {
            expect(function () {
                expect({ foo: [0, 1, 2], bar: [4, '5', 6], baz: [7, 8, '9'] }, 'to be a map whose values satisfy', function (arr) {
                    expect(arr, 'to be an array whose items satisfy', function (item) {
                        expect(item, 'to be a number');
                    });
                });
            }, 'to throw',
                "failed expectation in\n" +
                "{\n" +
                "  foo: [ 0, 1, 2 ],\n" +
                "  bar: [ 4, '5', 6 ],\n" +
                "  baz: [ 7, 8, '9' ]\n" +
                "}:\n" +
                "    bar: failed expectation in [ 4, '5', 6 ]:\n" +
                "        1: expected '5' to be a number\n" +
                "    baz: failed expectation in [ 7, 8, '9' ]:\n" +
                "        2: expected '9' to be a number");
        });
    });

    describe('to be a map whose keys satisfy assertion', function () {
        it('requires a function or string as the third argument', function () {
            expect(function () {
                expect([1, 2, 3], 'to be a map whose keys satisfy');
            }, 'to throw', 'Assertion "to be a map whose keys satisfy" expects a function as argument');

            expect(function () {
                expect([1, 2, 3], 'to be a map whose keys satisfy', 42);
            }, 'to throw', 'Assertion "to be a map whose keys satisfy" expects a function as argument');
        });

        it('only accepts objects as the target', function () {
            expect(function () {
                expect(42, 'to be a map whose keys satisfy', function (key) {});
            }, 'to throw', /expected 42 to be an object/);
        });

        it('asserts that the given callback does not throw for any keys in the map', function () {
            expect({ foo: 0, bar: 1, baz: 2, qux: 3 }, 'to be a map whose keys satisfy', function (key) {
                expect(key, 'not to be empty');
            });

            expect({ foo: 0, bar: 1, baz: 2, qux: 3 }, 'to be a map whose keys satisfy', function (key) {
                expect(key, 'to match', /^[a-z]{3}$/);
            });

            expect({ foo: 0, bar: 1, baz: 2, qux: 3 }, 'to be a map whose keys satisfy', 'not to be empty');

            expect({ foo: 0, bar: 1, baz: 2, qux: 3 }, 'to be a map whose keys satisfy', 'to match', /^[a-z]{3}$/);
        });

        it('supports the non-empty clause', function () {
            expect({ foo: '0' }, 'to be a non-empty map whose keys satisfy', function (key) {
                expect(key, 'to match', /^[a-z]{3}$/);
            });
        });

        it('supports "hash" and "object" as aliases', function () {
            expect({ foo: '0' }, 'to be an object whose keys satisfy', function (key) {
                expect(key, 'to match', /^[a-z]{3}$/);
            });

            expect({ foo: '0' }, 'to be a hash whose keys satisfy', function (key) {
                expect(key, 'to match', /^[a-z]{3}$/);
            });
        });

        it('fails when the assertion fails', function () {
            expect(function () {
                expect({ foo: 0, bar: 1, Baz: 2, qux: 3 }, 'to be a map whose keys satisfy', function (key) {
                    expect(key, 'to match', /^[a-z]{3}$/);
                });
            }, 'to throw', /expected 'Baz' to match/);
        });

        it('provides a detailed report of where failures occur', function () {
            expect(function () {
                expect({ foo: 0, bar: 1, baz: 2, qux: 3, quux: 4 }, 'to be a map whose keys satisfy', function (key) {
                    expect(key, 'to have length', 3);
                });
            }, 'to throw',
                   "failed expectation on keys foo, bar, baz, qux, quux:\n" +
                   "    quux: expected 'quux' to have length 3");
        });
    });

    it('throws if the assertion does not exists', function () {
        expect(function () {
            expect(1, "to bee", 2);
        }, 'to throw exception', 'Unknown assertion "to bee", did you mean: "to be"');
    });

    describe('addAssertion', function () {
        it('is chainable', function () {
            expect.addAssertion('foo', function () {})
                  .addAssertion('bar', function () {});

            expect(expect.assertions, 'to have keys',
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
                it("must not be empty", function () {
                    expect(function () {
                        expect.addAssertion('foo ()', function () {});
                    }, 'to throw', "Assertion patterns must not contain empty alternations: 'foo ()'");

                    expect(function () {
                        expect.addAssertion('foo (bar|)', function () {});
                    }, 'to throw', "Assertion patterns must not contain empty alternations: 'foo (bar|)'");

                    expect(function () {
                        expect.addAssertion('foo (||)', function () {});
                    }, 'to throw', "Assertion patterns must not contain empty alternations: 'foo (||)'");

                    expect(function () {
                        expect.addAssertion('foo (|bar|)', function () {});
                    }, 'to throw', "Assertion patterns must not contain empty alternations: 'foo (|bar|)'");
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
                    }, 'to throw', 'expected 42 to be sorted\n    expected 42 to be an array');
                });

                it('errorMode=bubble bubbles uses the error message of expect failures in the assertion', function () {
                    errorMode = 'bubble';
                    expect(function () {
                        clonedExpect(42, 'to be sorted');
                    }, 'to throw', 'expected 42 to be an array');
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
                            setTimeout(function () {
                                try {
                                    expect(subject, 'to be an array');
                                    expect(subject, 'to equal', [].concat(subject).sort());
                                } catch (e) {
                                    done(e);
                                }
                            }, delay);
                        });
                });

                it('errorMode=nested nest the error message of expect failures in the assertion under the assertion standard message', function (done) {
                    errorMode = 'nested';
                    clonedExpect(42, 'to be sorted after delay', 1, function (err) {
                        expect(err.message, 'to match', /^expected 42 to be sorted after delay 1.*\n    expected 42 to be an array/);
                        done();
                    });
                });

                it('errorMode=bubble bubbles uses the error message of expect failures in the assertion', function (done) {
                    errorMode = 'bubble';
                    clonedExpect(42, 'to be sorted after delay', 1, function (err) {
                        expect(err.message, 'to match', /^expected 42 to be an array/);
                        done();
                    });
                });

                it('errorMode=default uses the standard error message of the assertion', function (done) {
                    errorMode = 'default';
                    clonedExpect(42, 'to be sorted after delay', 1, function (err) {
                        expect(err.message, 'to match', /^expected 42 to be sorted after delay 1/);
                        done();
                    });
                });
            });
        });

        // I can't figure out why this doesn't work in mocha-phantomjs:
        itSkipIf(typeof mochaPhantomJS !== 'undefined', 'truncates the stack when a custom assertion throws a regular assertion error', function () {
            var clonedExpect = expect.clone().addAssertion('to equal foo', function theCustomAssertion(expect, subject) {
                expect(subject, 'to equal', 'foo');
            });
            expect(function () {
                clonedExpect('bar', 'to equal foo');
            }, 'to throw', function (err) {
                expect(err.stack, 'not to contain', 'theCustomAssertion');
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
                expect(err.message, 'to match', /is not a function/);
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
            clonedExpect.addAssertion('[not] to be answer to the Ultimate Question of Life, the Universe, and Everything', function (expect, subject) {
                this.assert(subject === 42);
            });
        });

        it('changes to the clone does not affect the original instance', function () {
            expect(expect.assertions, 'not to have keys',
                   'to be answer to the Ultimate Question of Life, the Universe, and Everything',
                   'not to be answer to the Ultimate Question of Life, the Universe, and Everything');
        });

        it('assertions can be added to the clone', function () {
            expect(clonedExpect.assertions, 'to have keys',
                   'to be answer to the Ultimate Question of Life, the Universe, and Everything',
                   'not to be answer to the Ultimate Question of Life, the Universe, and Everything');
            clonedExpect(42, 'to be answer to the Ultimate Question of Life, the Universe, and Everything');
            clonedExpect(41, 'not to be answer to the Ultimate Question of Life, the Universe, and Everything');

            expect(function () {
                clonedExpect(41, 'to be answer to the Ultimate Question of Life, the Universe, and Everything');
            }, 'to throw');
        });

        it('suggests an assertion if the given assertion does not exists', function () {
            expect(function () {
                clonedExpect(1, "to bee", 2);
            }, 'to throw', 'Unknown assertion "to bee", did you mean: "to be"');

            expect(function () {
                clonedExpect(1, "to be answer to the ultimate question of life, the universe, and everything");
            }, 'to throw', 'Unknown assertion "to be answer to the ultimate question of life, the universe, and everything", did you mean: "to be answer to the Ultimate Question of Life, the Universe, and Everything"');
        });

        describe('toString', function () {
            it('returns a string containing all the expanded assertions', function () {
                expect(clonedExpect.toString(), 'to contain', 'to be');
                expect(clonedExpect.toString(), 'to contain', 'not to be');
                expect(clonedExpect.toString(), 'to contain', 'to be answer to the Ultimate Question of Life, the Universe, and Everything');
                expect(clonedExpect.toString(), 'to contain', 'not to be answer to the Ultimate Question of Life, the Universe, and Everything');
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
        it('calls the given plugin with the expect instance as the parameter', function (done) {
            var plugin = function (expectInstance) {
                expect(expectInstance, 'to be', expect);
                done();
            };
            expect.installPlugin(plugin);
        });

        it('throws if the given arguments in not a function', function () {
            expect(function () {
                expect.installPlugin({});
            }, 'to throw', 'Expected first argument given to installPlugin to be a function');
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
                identify: function (obj) {
                    return obj && typeof obj === 'object' && obj.isBox;
                },
                equal: function (a, b, equal) {
                    return a === b || equal(a.value, b.value);
                },
                inspect: function (obj, inspect) {
                    return '[Box: ' + inspect(obj.value) + ']';
                },
                toJSON: function (obj, toJSON) {
                    return {
                        $box: toJSON(obj.value)
                    };
                }
            });
        });

        it('should use the equal defined by the type', function () {
            clonedExpect(box(123), 'to equal', box(123));
            clonedExpect(box(123), 'not to equal', box(321));
        });

        it('should call toJSON recursively in case of a mismatch', function () {
            expect(function () {
                clonedExpect(box(box(123)), 'to equal', box(box(456)));
            }, 'to throw', function (err) {
                expect(err, 'to have properties', {
                    showDiff: true,
                    actual: {$box: {$box: 123}},
                    expected: {$box: {$box: 456}}
                });
                expect(err.message, 'to equal', "expected [Box: [Box: 123]] to equal [Box: [Box: 456]]");
            });
        });
    });

    function Field(val, options) {
        var value = val;
        if (options.match(/getter/)) {
            this.__defineGetter__('value', function () { return value; });
        }

        if (options.match(/setter/)) {
            this.__defineSetter__('value', function (val) { value = val; });
        }
    }

    describe('equal', function () {
        itSkipIf(!Object.prototype.__lookupGetter__, 'handles getters and setters correctly', function () {
            expect(new Field('VALUE', 'getter'), 'to equal', new Field('VALUE', 'getter'));
            expect(new Field('VALUE', 'setter'), 'to equal', new Field('VALUE', 'setter'));
            expect(new Field('VALUE', 'getter and setter'), 'to equal', new Field('VALUE', 'getter and setter'));
        });
    });

    describe('inspect', function () {
        itSkipIf(!Object.prototype.__lookupGetter__, 'handles getters and setters correctly', function () {
            expect(expect.inspect(new Field('VALUE', 'getter')), 'to equal', "{ value: 'VALUE' [Getter] }");
            expect(expect.inspect(new Field('VALUE', 'setter')), 'to equal', "{ value: [Setter] }");
            expect(expect.inspect(new Field('VALUE', 'getter and setter')), 'to equal', "{ value: 'VALUE' [Getter/Setter] }");
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
                "this": { "is": { "deeply": { "nested": "This should not be shown", "a list": [ 1, 2, 3 ] }, "a list": [ 1, 2, 3 ] } }
            }];

            expect(expect.inspect(data, 5), 'to equal',
                   "[\n" +
                   "  {\n" +
                   "    guid: 'db550c87-1680-462a-bacc-655cecdd8907',\n" +
                   "    isActive: false,\n" +
                   "    age: 38,\n" +
                   "    email: 'huntterry@medalert.com',\n" +
                   "    phone: '+1 (803) 472-3209',\n" +
                   "    address: '944 Milton Street, Madrid, Ohio, 1336',\n" +
                   "    about: 'Ea consequat nulla duis incididunt ut irureirure cupidatat. Est tempor cillum commodo aliquaconsequat esse commodo. Culpa ipsum eu consectetur idenim quis sint. Aliqua deserunt dolore reprehenderitid anim exercitation laboris. Eiusmod aute consecteturexcepteur in nulla proident occaecatconsectetur.\\r\\n',\n" +
                   "    registered: [Date Sun, 03 Jun 1984 09:36:47 GMT],\n" +
                   "    latitude: 8.635553,\n" +
                   "    longitude: -103.382498,\n" +
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
                   "    guid: '904c2f38-071c-4b97-b968-f5c228aaf41a',\n" +
                   "    isActive: false,\n" +
                   "    age: 34,\n" +
                   "    email: 'peckhester@medalert.com',\n" +
                   "    phone: '+1 (848) 599-3447',\n" +
                   "    address: '323 Legion Street, Caspar, Delaware, 4117',\n" +
                   "    registered: [Date Tue, 10 Mar 1981 17:02:53 GMT],\n" +
                   "    latitude: -55.321712,\n" +
                   "    longitude: -100.276818,\n" +
                   "    tags: [\n" +
                   "      'Lorem',\n" +
                   "      'laboris',\n" +
                   "      'enim',\n" +
                   "      'anim',\n" +
                   "      'sint',\n" +
                   "      'incididunt',\n" +
                   "      'labore'\n" +
                   "    ],\n" +
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
                   "        deeply: { nested: ..., 'a list': ... },\n" +
                   "        'a list': [...]\n" +
                   "      }\n" +
                   "    }\n" +
                   "  }\n" +
                   "]");
        });
    });
});
