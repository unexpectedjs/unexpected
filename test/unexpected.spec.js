/*global describe, it*/
var expect = require(__dirname + '/../lib/unexpected.js');

describe('unexpected', function () {
    describe('ok/truthy/falsy assertion', function () {
        it('assert that the value is truthy or not', function () {
            expect(1, 'to be ok');
            expect(true, 'to be ok');
            expect(true, 'to not be falsy');
            expect({}, 'to be truthy');
            expect(0, 'to not be ok');
            expect(0, 'to be falsy');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(0, 'to be ok');
            }, 'to throw exception', 'expected 0 to be ok');
        });
    });

    describe('be assertion', function () {
        it('assert === equality', function () {
            var obj = {};
            expect(obj, 'to be', obj);
            expect(obj, 'to not be', {});
            expect(1, 'to be', 1);
            expect(NaN, 'to not be', NaN);
            expect(1, 'to not be', true);
            expect('1', 'to not be', 1);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect('foo', 'to be', 'bar');
            }, 'to throw exception', "expected 'foo' to be 'bar'");
        });
    });

    describe('a/an assertion', function () {
        it('asserts typeof with support for array type and instanceof', function () {
            expect(5, 'to be a', 'number');
            expect([], 'to be an', 'array');
            expect([], 'to be an', 'object');
            expect([], 'to be an', Array);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(5, 'to be a', Array);
            }, 'to throw exception', 'expected 5 to be a [Function: Array]');
        });
    });

    describe('equal assertion', function () {
        it('asserts loose equality that works with objects', function () {
            expect({ a: 'b' }, 'to equal', { a: 'b' });
            expect(1, 'to equal', '1');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect({ a: 'b' }, 'to not equal', { a: 'b' });
            }, 'to throw exception', "expected { a: 'b' } to not equal { a: 'b' }");
        });
    });

    describe('exception assertion', function () {
        it('fails if no exception is thrown', function () {
            expect(function () {
                throw new Error();
            }, 'to throw exception');
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
            }, 'to not throw exception', /matches the exception message/);
        });

        it('exactly matches the message against the given string', function () {
            expect(function () {
                throw new Error('matches the exception message');
            }, 'to throw exception', 'matches the exception message');
            expect(function () {
                throw new Error('matches the exception message');
            }, 'to not throw exception', 'the exception message');
        });
    });

    describe('match assertion', function () {
        it('tests that the subject matches the given regular expression', function () {
            expect('test', 'to match', /.*st/);
            expect('test', 'to not match', /foo/);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect('test', 'to match', /foo/);
            }, 'to throw exception', "expected 'test' to match /foo/");
        });
    });
});
