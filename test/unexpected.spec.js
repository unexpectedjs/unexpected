/*global describe, it, expect*/

// use this instead of Object.create in order to make the tests run in
// browsers that are not es5 compatible.
function create(o) {
    function F() {}
    F.prototype = o;
    return new F();
}

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
            if (typeof Buffer !== 'undefined') {
                var buffer = new Buffer([0x45, 0x59]);
                expect(buffer, 'to be', buffer);
            }
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
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(5, 'to be a', Array);
            }, 'to throw exception', /expected 5 to be a \[Function(: Array)?\]/);

            expect(function () {
                expect([], 'not to be an', 'array');
            }, 'to throw exception', "expected [] not to be an 'array'");
        });
    });

    describe('equal assertion', function () {
        it('asserts loose equality that works with objects', function () {
            expect({ a: 'b' }, 'to equal', { a: 'b' });
            expect(1, 'to equal', '1');
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
            if (typeof Buffer !== 'undefined') {
                expect(new Buffer([0x45, 0x59]), 'to equal', new Buffer([0x45, 0x59]));
            }
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect({ a: { b: 'c'} }, 'to equal', { a: { b: 'd'} });
            }, 'to throw exception', "expected { a: { b: 'c' } } to equal { a: { b: 'd' } }");

            expect(function () {
                expect({ a: 'b' }, 'not to equal', { a: 'b' });
            }, 'to throw exception', "expected { a: 'b' } not to equal { a: 'b' }");
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
            expect([1,2,3], 'to have length', 3);
            expect([1,2,3], 'not to have length', 4);
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
                // property expectations on value expects the property to be present
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
            }, 'to throw', "expected {} to have own properties [ 'a', 'b' ]")
        });

        it('asserts absence of a list of properties', function () {
            expect({a: 'foo', b: 'bar'}, 'not to have properties', ['c','d']);
            expect(function () {
                expect({a: 'foo', b: 'bar'}, 'not to have properties', ['a','d']);
            }, 'to throw', "expected { a: 'foo', b: 'bar' } not to have properties [ 'a', 'd' ]")
        });

        it('asserts absence of a list of own properties', function () {
            var obj = create({a: 'foo', b: 'bar'});
            expect(obj, 'to have properties', ['a', 'b']);
            expect(obj, 'not to have own properties', ['a', 'b']);
            expect(function () {
                expect({a: 'foo', b: 'bar'}, 'not to have own properties', ['a', 'b']); // should fail
            }, 'to throw', "expected { a: 'foo', b: 'bar' } not to have own properties [ 'a', 'b' ]")
        });

        it.skip('asserts presence and values of an object of properties');
        it.skip('asserts presence and values of an object of own properties');

        it.skip('asserts absence and values of an object of properties');
        it.skip('asserts absence and values of an object of own properties');

        it('throws when the assertion fails', function () {
            expect(function () {
                expect({a: 'foo', b: 'bar'}, 'to have properties', ['c', 'd']);
            }, 'to throw', "expected { a: 'foo', b: 'bar' } to have properties [ 'c', 'd' ]");
        });

        it('throws when given invalid input', function () {
            expect(function () {
                expect({a: 'foo', b: 'bar'}, 'to have properties', 'a', 'b');
            }, 'to throw', "Assertion 'to have properties' only supports input in the form of an Array.");
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
            expect([1,2,3], 'not to be empty');
            expect([1,2,3], 'to be non-empty');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect([1,2,3], 'to be empty');
            }, 'to throw exception', "expected [ 1, 2, 3 ] to be empty");

            expect(function () {
                expect('', 'to be non-empty');
            }, 'to throw exception', "expected '' not to be empty");

            expect(function () {
                expect(null, 'to be empty');
            }, 'to throw exception', "Assertion 'to be empty' only supports strings, arrays and objects");
        });
    });

    describe('key assertion', function () {
        it('asserts the presence of a key', function () {
            expect({ a: 'b' }, 'to have key', 'a');
            expect({ a: 'b' }, 'not to have key', 'b');
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
                expect([1,2,3], 'to be an array whose items satisfy');
            }, 'to throw', 'Assertions "to be an array whose items satisfy" expects a functions as argument');

            expect(function () {
                expect([1,2,3], 'to be an array whose items satisfy', 42);
            }, 'to throw', 'Assertions "to be an array whose items satisfy" expects a functions as argument');
        });

        it('only accepts arrays as the target object', function () {
            expect(function () {
                expect(42, 'to be an array whose items satisfy', function (item) {});
            }, 'to throw', "expected 42 to be an 'array'");
        });

        it('supports the non-empty clause', function () {
            expect([1], 'to be a non-empty array whose items satisfy', function (item) {
                expect(item, 'to be a number');
            });
        });

        it('asserts that the given callback does not throw for any items in the array', function () {
            expect([0,1,2,3], 'to be an array whose items satisfy', function (item, index) {
                expect(item, 'to be a number');
                expect(index, 'to be a number');
            });

            expect(['0','1','2','3'], 'to be an array whose items satisfy', function (item, index) {
                expect(item, 'not to be a number');
                expect(index, 'to be a number');
            });

            expect([0,1,2,3], 'to be an array whose items satisfy', 'to be a number');

            expect(['0','1','2','3'], 'to be an array whose items satisfy', 'not to be a number');

            expect([[1], [2]], 'to be an array whose items satisfy', 'to be an array whose items satisfy', 'to be a number');
        });

        it('provides the item index to the callback function', function () {
            var arr = ['0','1','2','3'];
            expect(arr, 'to be an array whose items satisfy', function (item, index) {
                expect(index, 'to be a number');
                expect(index, 'to be', arr.indexOf(item));
            });
        });

        it('fails when the assertion fails', function () {
            expect(function () {
                expect(['0',1,'2','3'], 'to be an array whose items satisfy', function (item) {
                    expect(item, 'not to be a number');
                });
            }, 'to throw', /expected 1 not to be a 'number'/);

            expect(function () {
                expect(['0',1,'2','3'], 'to be an array whose items satisfy', 'not to be a number');
            }, 'to throw', /expected 1 not to be a 'number'/);

            expect(function () {
                expect([], 'to be a non-empty array whose items satisfy', function (item) {
                    expect(item, 'not to be a number');
                });
            }, 'to throw', 'expected [] not to be empty');
        });

        it('provides a detailed report of where failures occur', function () {
            expect(function () {
                expect([0, 1, '2', 3, 4], 'to be an array whose items satisfy', function (item) {
                    expect(item, 'to be a number');
                    expect(item, 'to be less than', 4);
                });
            }, 'to throw',
                   "failed expectation in [ 0, 1, '2', 3, 4 ]:\n" +
                   "    2: expected '2' to be a 'number'\n" +
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
                "        1: expected '5' to be a 'number'\n" +
                "    2: failed expectation in [ 7, 8, '9' ]:\n" +
                "        2: expected '9' to be a 'number'");
        });
    });

    describe('to be a map whose values satisfy assertion', function () {
        it('requires a function or a string as the third argument', function () {
            expect(function () {
                expect([1,2,3], 'to be a map whose values satisfy');
            }, 'to throw', 'Assertions "to be a map whose values satisfy" expects a functions as argument');

            expect(function () {
                expect([1,2,3], 'to be a map whose values satisfy', 42);
            }, 'to throw', 'Assertions "to be a map whose values satisfy" expects a functions as argument');
        });

        it('only accepts objects as the target', function () {
            expect(function () {
                expect(42, 'to be a map whose values satisfy', function (value) {});
            }, 'to throw', "expected 42 to be an 'object'");
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
            }, 'to throw', /expected 1 not to be a 'number'/);
        });

        it('provides a detailed report of where failures occur', function () {
            expect(function () {
                expect({ foo: 0, bar: 1, baz: '2', qux: 3, quux: 4 }, 'to be a map whose values satisfy', function (value) {
                    expect(value, 'to be a number');
                    expect(value, 'to be less than', 4);
                });
            }, 'to throw',
                   "failed expectation in { foo: 0, bar: 1, baz: '2', qux: 3, quux: 4 }:\n" +
                   "    baz: expected '2' to be a 'number'\n" +
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
                "{ foo: [ 0, 1, 2 ],\n" +
                "  bar: [ 4, '5', 6 ],\n" +
                "  baz: [ 7, 8, '9' ] }:\n" +
                "    bar: failed expectation in [ 4, '5', 6 ]:\n" +
                "        1: expected '5' to be a 'number'\n" +
                "    baz: failed expectation in [ 7, 8, '9' ]:\n" +
                "        2: expected '9' to be a 'number'");
        });
    });

    describe('to be a map whose keys satisfy assertion', function () {
        it('requires a function or string as the third argument', function () {
            expect(function () {
                expect([1,2,3], 'to be a map whose keys satisfy');
            }, 'to throw', 'Assertions "to be a map whose keys satisfy" expects a functions as argument');

            expect(function () {
                expect([1,2,3], 'to be a map whose keys satisfy', 42);
            }, 'to throw', 'Assertions "to be a map whose keys satisfy" expects a functions as argument');
        });

        it('only accepts objects as the target', function () {
            expect(function () {
                expect(42, 'to be a map whose keys satisfy', function (key) {});
            }, 'to throw', "expected 42 to be an 'object'");
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

    function sortBy(arr, property) {
        arr.sort(function (x, y) {
            var xp = x[property];
            var yp = y[property];
            if (xp > yp) { return 1; }
            if (xp < yp) { return -1; }
            return 0;
        });
    }

    describe('addAssertion', function () {
        it('is chainable', function () {
            expect.addAssertion('foo', function () {})
                  .addAssertion('bar', function () {});

            expect(expect.assertions, 'to have keys',
                   'foo',
                   'bar');
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
    });

    describe('clone', function () {
        var clonedExpect;
        beforeEach(function () {
            clonedExpect = expect.clone();
            clonedExpect.addAssertion('[not] to be answer to the Ultimate Question of Life, the Universe, and Everything', function () {
                this.assert(this.obj === 42);
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
        it('calls the given plugin with the expect instance as the paramenter', function (done) {
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
});
