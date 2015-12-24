/*global unexpected*/

it.skipIf = function (condition) {
    (condition ? it.skip : it).apply(it, Array.prototype.slice.call(arguments, 1));
};

function toArguments() {
    return arguments;
}

var noBuffer = typeof Buffer === 'undefined';

describe('unexpected', function () {
    var workQueue = typeof weknowhow === 'undefined' ? require('../lib/workQueue') : null;
    var expect = unexpected.clone();

    var circular = {};
    circular.self = circular;

    expect.addAssertion('<any> when delayed a little bit <assertion>', function (expect, subject) {
        return expect.promise(function (run) {
            setTimeout(run(function () {
                return expect.shift();
            }), 1);
        });
    }).addAssertion('<any> when delayed <number> <assertion>', function (expect, subject, value) {
        return expect.promise(function (run) {
            setTimeout(run(function () {
                return expect.shift();
            }), value);
        });
    }).addAssertion('<any> to inspect as <string>', function (expect, subject, value) {
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

    describe('magicpen type', function () {
        describe('#inspect', function () {
            it('should find two pens with different formats to not to be identical', function () {
                var MagicPen = expect.output.constructor;
                expect(new MagicPen('text').text('foo'), 'not to equal', new MagicPen('ansi').text('foo'));
            });

            it('should find two format-less pens with the same contents to be identical', function () {
                var MagicPen = expect.output.constructor;
                expect(new MagicPen().text('foo'), 'to equal', new MagicPen().text('foo'));
            });

            describe('with a pen in text format', function () {
                var pen = expect.createOutput('text').green('abc').nl().text('def').block(function () {
                    this.text('foo').nl().text('bar');
                });

                it('should inspect correctly', function () {
                    expect(pen, 'to inspect as',
                        "magicpen('text')        // abc\n" +
                        "  .green('abc').nl()    // deffoo\n" +
                        "  .text('def')          //    bar\n" +
                        "  .block(function () {\n" +
                        "    this\n" +
                        "      .text('foo').nl()\n" +
                        "      .text('bar');\n" +
                        "  })"
                    );
                });
            });

            describe('with a pen in ansi format', function () {
                var pen = expect.createOutput('ansi').green('abc').text('def').block(function () {
                    this.text('foo');
                });

                it('should inspect correctly', function () {
                    expect(pen, 'to inspect as',
                        "magicpen('ansi')\n" +
                        "  .green('abc')\n" +
                        "  .text('def')\n" +
                        "  .block(function () {\n" +
                        "    this.text('foo');\n" +
                        "  })"
                    );
                });
            });

            describe('with a pen in ansi format', function () {
                var pen = expect.createOutput('html').green('abc').text('def').block(function () {
                    this.text('foo');
                });

                it('should inspect correctly', function () {
                    expect(pen, 'to inspect as',
                        "magicpen('html')\n" +
                        "  .green('abc')\n" +
                        "  .text('def')\n" +
                        "  .block(function () {\n" +
                        "    this.text('foo');\n" +
                        "  })"
                    );
                });
            });
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

        it.skipIf(noBuffer, 'asserts === equality for Buffers', function () {
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

        describe('with a type name', function () {
            it('should succeed when the subject is recognized as having the type', function () {
                expect(new Error('foo'), 'to be an', 'Error');
            });

            it('should fail when the subject is not recognized as having the type', function () {
                expect(function () {
                    expect(123, 'to be an', 'Error');
                }, 'to throw', 'expected 123 to be an Error');
            });

            // Maybe better: throw a non-Unexpected error
            it('should fail when the type is not defined', function () {
                expect(function () {
                    expect(123, 'to be a', 'FoopQuuxDoop');
                }, 'to throw', 'expected 123 to be a FoopQuuxDoop');
            });
        });

        it('formats Error instances correctly when an assertion fails', function () {
            expect(function () {
                var error = new Error('error message');
                error.data = 'extra';
                expect(error, 'to be a number');
            }, 'to throw', "expected Error({ message: 'error message', data: 'extra' }) to be a number");
        });

        it('should fail with the correct error message if the type is given as an anonymous function', function () {
            expect(function () {
                expect('foo', 'to be a', function () {});
            }, 'to throw', "expected 'foo' to be a function () {}");
        });

        it('should throw when the type is specified as undefined', function () {
            expect(function () {
                expect('foo', 'to be an', undefined);
            }, 'to throw',
                   "expected 'foo' to be an undefined\n" +
                   "  No matching assertion, did you mean:\n" +
                   "  <any> [not] to be (a|an) <function>\n" +
                   "  <any> [not] to be (a|an) <string>\n" +
                   "  <any> [not] to be (a|an) <type>");
        });

        it('should throw when the type is specified as null', function () {
            expect(function () {
                expect('foo', 'to be a', null);
            }, 'to throw',
                   "expected 'foo' to be a null\n" +
                   "  No matching assertion, did you mean:\n" +
                   "  <any> [not] to be (a|an) <function>\n" +
                   "  <any> [not] to be (a|an) <string>\n" +
                   "  <any> [not] to be (a|an) <type>");
        });

        it('should not consider a string a to be an instance of an object without a name property', function () {
            expect(function () {
                expect('foo', 'to be a', {});
            }, 'to throw',
                   "expected 'foo' to be a {}\n" +
                   "  No matching assertion, did you mean:\n" +
                   "  <any> [not] to be (a|an) <function>\n" +
                   "  <any> [not] to be (a|an) <string>\n" +
                   "  <any> [not] to be (a|an) <type>");
        });

        it('should throw when the type is specified as an object without an identify function', function () {
            expect(function () {
                expect('foo', 'to be a', { name: 'bar' });
            }, 'to throw',
                   "expected 'foo' to be a { name: 'bar' }\n" +
                   "  No matching assertion, did you mean:\n" +
                   "  <any> [not] to be (a|an) <function>\n" +
                   "  <any> [not] to be (a|an) <string>\n" +
                   "  <any> [not] to be (a|an) <type>");
        });

        it('should throw when the type is specified as an object with an identify function, but without a name property', function () {
            expect(function () {
                expect('foo', 'to be a', { identify: function () { return true; } });
            }, 'to throw',
                   "expected 'foo' to be a { identify: function () { return true; } }\n" +
                   "  No matching assertion, did you mean:\n" +
                   "  <any> [not] to be (a|an) <function>\n" +
                   "  <any> [not] to be (a|an) <string>\n" +
                   "  <any> [not] to be (a|an) <type>");
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
            }, 'to throw exception',
                   "expected 'foo' to be 'bar'\n" +
                   "\n" +
                   "-foo\n" +
                   "+bar");
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

    describe('to error assertion', function () {
        describe('with a function that throws', function () {
            describe('with the "not" flag', function () {
                it('should indicate that the function threw', function () {
                    expect(function () {
                        expect(function () {
                            throw new Error('yikes');
                        }, 'not to error');
                    }, 'to throw',
                        "expected function () { throw new Error('yikes'); } not to error\n" +
                        "  threw: Error('yikes')"
                    );
                });
            });
        });

        describe('with a function that returns a promise that is rejected', function () {
            describe('with the "not" flag', function () {
                it('should indicate that the function returned a rejected promise', function () {
                    return expect(
                        expect(function () {
                            return expect.promise(function (resolve, reject) {
                                setTimeout(function () {
                                    reject(new Error('wat'));
                                }, 1);
                            });
                        }, 'not to error'),
                        'to be rejected with',
                            "expected\n" +
                            "function () {\n" +
                            "  return expect.promise(function (resolve, reject) {\n" +
                            "    setTimeout(function () {\n" +
                            "      reject(new Error('wat'));\n" +
                            "    }, 1);\n" +
                            "  });\n" +
                            "}\n" +
                            "not to error\n" +
                            "  returned promise rejected with: Error('wat')"
                    );
                });
            });
        });
    });

    describe('object type', function () {
        describe('#diff', function () {
            it('should show identical multiline values correctly in diffs', function () {
                var clonedExpect = expect.clone().addType({
                    name: 'numberNine',
                    identify: function (obj) {
                        return obj === 9;
                    },
                    inspect: function (value, depth, output) {
                        output.block(function () {
                            this.text('NUMBER').nl().text(' NINE ');
                        });
                    }
                });
                expect(function () {
                    clonedExpect({a: 123, b: 9}, 'to equal', {a: 456, b: 9});
                }, 'to throw',
                    'expected\n' +
                    '{\n' +
                    '  a: 123,\n' +
                    '  b:\n' +
                    '    NUMBER\n' +
                    '     NINE \n' +
                    '}\n' +
                    'to equal\n' +
                    '{\n' +
                    '  a: 456,\n' +
                    '  b:\n' +
                    '    NUMBER\n' +
                    '     NINE \n' +
                    '}\n' +
                    '\n' +
                    '{\n' +
                    '  a: 123, // should equal 456\n' +
                    '  b:\n' +
                    '    NUMBER\n' +
                    '     NINE \n' +
                    '}'
                );
            });
        });
    });

    describe('array type', function () {
        it('should find an array instance identical to itself', function () {
            var arr = [1, 2, 3];
            expect(arr, 'to equal', arr);
        });
    });

    describe('Error type', function () {
        it('should inspect the constructor name correctly', function () {
            expect(new TypeError('foo'), 'to inspect as', "TypeError('foo')");
        });

        it('should inspect correctly when the message is not set and there are no other properties', function () {
            expect(new Error(), 'to inspect as', 'Error()');
        });

        it('should inspect correctly when the message is set and there are no other properties', function () {
            expect(new Error('foo'), 'to inspect as', "Error('foo')");
        });

        it('should inspect correctly when the message is set and there are other properties', function () {
            var err = new Error('foo');
            err.bar = 123;
            expect(err, 'to inspect as', "Error({ message: 'foo', bar: 123 })");
        });

        it('should inspect correctly when the message is not set and there are other properties', function () {
            var err = new Error();
            err.bar = 123;
            expect(err, 'to inspect as', "Error({ message: '', bar: 123 })");
        });

        it('should diff instances with unwrapped values that do not produce a diff', function () {
            var clonedExpect = expect.clone().addType({
                name: 'numericalError',
                base: 'Error',
                identify: function (obj) {
                    return this.baseType.identify(obj) && /^\d+$/.test(obj.message);
                },
                inspect: function (err, depth, output) {
                    output.text('Error#' + err.message);
                },
                unwrap: function (obj) {
                    return parseInt(obj.message, 10);
                }
            });
            expect(function () {
                clonedExpect(new Error('1'), 'to equal', new Error('2'));
            }, 'to throw',
                'expected Error#1 to equal Error#2'
            );
        });

        describe('with a custom Error class inheriting from Error', function () {
            function inherits(ctor, superCtor) {
                ctor.super_ = superCtor;
                ctor.prototype = Object.create(superCtor.prototype, {
                    constructor: {
                        value: ctor,
                        enumerable: false,
                        writable: true,
                        configurable: true
                    }
                });
            }

            function MyError(message) {
                Error.call(this);
                this.message = message;
            }

            inherits(MyError, Error);

            it('should consider identical instances to be identical', function () {
                expect(new MyError('foo'), 'to equal', new MyError('foo'));
            });

            it('should consider an instance of the custom error different from an otherwise identical Error instance', function () {
                expect(function () {
                    expect(new MyError('foo'), 'to equal', new Error('foo'));
                }, 'to throw',
                    "expected MyError('foo') to equal Error('foo')\n" +
                    "\n" +
                    "Mismatching constructors MyError should be Error"
                );
            });

            it('should instances of the custom error different to be different when they have different messages', function () {
                expect(function () {
                    expect(new MyError('foo'), 'to equal', new MyError('bar'));
                }, 'to throw',
                    "expected MyError('foo') to equal MyError('bar')\n" +
                    "\n" +
                    "MyError({\n" +
                    "  message: 'foo' // should equal 'bar'\n" +
                    "                 // -foo\n" +
                    "                 // +bar\n" +
                    "})"
                );
            });

            describe('when the custom error has a "name" property', function () {
                var myError = new MyError('foo');
                myError.name = 'SomethingElse';

                it('should use the "name" property when inspecting instances', function () {
                    expect(myError, 'to inspect as', "SomethingElse('foo')");
                });

                it('should use the "name" property when reporting mismatching constructors', function () {
                    expect(function () {
                        expect(myError, 'to equal', new Error('foo'));
                    }, 'to throw',
                        "expected SomethingElse('foo') to equal Error('foo')\n" +
                        "\n" +
                        "Mismatching constructors SomethingElse should be Error"
                    );
                });

                it('should use the "name" property when diffing', function () {
                    expect(function () {
                        var otherMyError = new MyError('bar');
                        otherMyError.name = 'SomethingElse';
                        expect(myError, 'to equal', otherMyError);
                    }, 'to throw',
                        "expected SomethingElse('foo') to equal SomethingElse('bar')\n" +
                        "\n" +
                        "SomethingElse({\n" +
                        "  message: 'foo' // should equal 'bar'\n" +
                        "                 // -foo\n" +
                        "                 // +bar\n" +
                        "})"
                    );
                });
            });
        });

        describe('to have message assertion', function () {
            describe('with an Unexpected error', function () {
                var err;
                beforeEach(function () {
                    try {
                        expect(1, 'to equal', 2);
                    } catch (e) {
                        err = e;
                    }
                });

                it('should succeed', function () {
                    expect(err, 'to have message', 'expected 1 to equal 2');
                });

                it('should fail with a diff', function () {
                    expect(function () {
                        expect(err, 'to have message', 'expected 3 to equal 2');
                    }, 'to throw', function (err) {
                        var message = err.getErrorMessage({ format: 'text' }).toString('text');
                        expect(
                            message,
                            'to contain',
                            "to have message 'expected 3 to equal 2'\n" +
                                "  expected 'expected 1 to equal 2' to equal 'expected 3 to equal 2'\n" +
                                "\n" +
                                "  -expected 1 to equal 2\n" +
                                "  +expected 3 to equal 2"
                        );
                        expect(message, 'to match', /^expected\sUnexpectedError\([\s\S]*\)/);
                    });
                });

                it('should support the ansi flag', function () {
                    expect(function () {
                        expect(err, 'to have message', 'expected 3 to equal 2');
                    }, 'to throw', function (err) {
                        expect(err, 'to have ansi message', expect.it('to contain', "\x1B[36m'expected 1 to equal 2'\x1B[39m"));
                    });
                });

                it('should support the html flag', function () {
                    expect(function () {
                        expect(err, 'to have message', 'expected 3 to equal 2');
                    }, 'to throw', function (err) {
                        expect(err, 'to have html message', expect.it('to contain', 'to&nbsp;have&nbsp;message'));
                    });
                });

                it('should support matching the diff instead of the message', function () {
                    expect(function () {
                        expect('abc', 'to equal', 'def');
                    }, 'to throw', expect.it('to have ansi diff',
                        '\x1B[31m-\x1B[39m\x1B[41m\x1B[30mabc\x1B[39m\x1B[49m\n' +
                        '\x1B[32m+\x1B[39m\x1B[42m\x1B[30mdef\x1B[39m\x1B[49m'
                    ));
                });

                it('should fail to get the diff from an Unexpected error that does not have one', function () {
                    expect(function () {
                        expect(function () {
                            expect(123, 'to equal', 456);
                        }, 'to throw', expect.it('to have ansi diff', function () {}));
                    }, 'to throw',
                        "expected function () { expect(123, 'to equal', 456); }\n" +
                        "to throw expect.it('to have ansi diff', function () {})\n" +
                        "  expected UnexpectedError(expected 123 to equal 456)\n" +
                        "  to have ansi diff function () {}\n" +
                        "    The UnexpectedError instance does not have a diff"
                    );
                });

                it('should fail to get the diff from a non-Unexpected error', function () {
                    expect(function () {
                        expect(function () {
                            throw new Error('foo');
                        }, 'to throw', expect.it('to have ansi diff', function () {}));
                    }, 'to throw',
                        "expected function () { throw new Error('foo'); }\n" +
                        "to throw expect.it('to have ansi diff', function () {})\n" +
                        "  expected Error('foo') to have ansi diff function () {}\n" +
                        "    Cannot get the diff from a non-Unexpected error"
                    );
                });

                describe('when comparing against a magicpen instance', function () {
                    it('should succeed', function () {
                        var expectedDiff = expect.createOutput('ansi')
                            .red('-').text('abc', ['bgRed', 'black']).nl()
                            .green('+').text('def', ['bgGreen', 'black']);

                        expect(function () {
                            expect('abc', 'to equal', 'def');
                        }, 'to throw', expect.it('to have ansi diff', expectedDiff));
                    });

                    it('should fail with a diff', function () {
                        var expectedDiff = expect.createOutput('ansi')
                            .red('-').text('abc').nl()
                            .green('+').text('def', ['bgGreen', 'black']);

                        expect(function () {
                            expect(function () {
                                expect('abc', 'to equal', 'def');
                            }, 'to throw', expect.it('to have ansi diff', expectedDiff));
                        }, 'to throw',
                            "expected\n" +
                            "function () {\n" +
                            "  expect('abc', 'to equal', 'def');\n" +
                            "}\n" +
                            "to throw\n" +
                            "expect.it('to have ansi diff', magicpen('ansi')\n" +
                            "                                 .red('-')\n" +
                            "                                 .text('abc').nl()\n" +
                            "                                 .green('+')\n" +
                            "                                 .text('def', [ 'bgGreen', 'black' ]))\n" +
                            "  expected\n" +
                            "  UnexpectedError(\n" +
                            "    expected 'abc' to equal 'def'\n" +
                            "\n" +
                            "    -abc\n" +
                            "    +def\n" +
                            "  )\n" +
                            "  to have ansi diff\n" +
                            "  magicpen('ansi')\n" +
                            "    .red('-')\n" +
                            "    .text('abc').nl()\n" +
                            "    .green('+')\n" +
                            "    .text('def', [ 'bgGreen', 'black' ])\n" +
                            "    expected\n" +
                            "    magicpen('ansi')\n" +
                            "      .block(function () {\n" +
                            "        this.diffRemovedLine('-');\n" +
                            "      })\n" +
                            "      .block(function () {\n" +
                            "        this.diffRemovedHighlight('abc');\n" +
                            "      }).nl()\n" +
                            "      .block(function () {\n" +
                            "        this.diffAddedLine('+');\n" +
                            "      })\n" +
                            "      .block(function () {\n" +
                            "        this.diffAddedHighlight('def');\n" +
                            "      })\n" +
                            "    to equal\n" +
                            "    magicpen('ansi')\n" +
                            "      .red('-')\n" +
                            "      .text('abc').nl()\n" +
                            "      .green('+')\n" +
                            "      .text('def', [ 'bgGreen', 'black' ])"
                        );
                    });
                });

                describe('when building the expected output via a function', function () {
                    it('should succeed', function () {
                        expect(function () {
                            expect('abc', 'to equal', 'def');
                        }, 'to throw', expect.it('to have ansi diff', function () {
                            this.red('-').text('abc', ['bgRed', 'black']).nl()
                                .green('+').text('def', ['bgGreen', 'black']);
                        }));
                    });

                    it('should fail with a diff', function () {
                        expect(function () {
                            expect(function () {
                                expect('abc', 'to equal', 'def');
                            }, 'to throw', expect.it('to have ansi diff', function () {
                                this.red('-').text('abc').nl()
                                    .green('+').text('def', ['bgGreen', 'black']);
                            }));
                        }, 'to throw',
                            "expected\n" +
                            "function () {\n" +
                            "  expect('abc', 'to equal', 'def');\n" +
                            "}\n" +
                            "to throw\n" +
                            "expect.it('to have ansi diff', function () {\n" +
                            "  this.red('-').text('abc').nl()\n" +
                            "    .green('+').text('def', ['bgGreen', 'black']);\n" +
                            "})\n" +
                            "  expected\n" +
                            "  UnexpectedError(\n" +
                            "    expected 'abc' to equal 'def'\n" +
                            "\n" +
                            "    -abc\n" +
                            "    +def\n" +
                            "  )\n" +
                            "  to have ansi diff\n" +
                            "  function () {\n" +
                            "    this.red('-').text('abc').nl()\n" +
                            "      .green('+').text('def', ['bgGreen', 'black']);\n" +
                            "  }\n" +
                            "    expected\n" +
                            "    magicpen('ansi')\n" +
                            "      .block(function () {\n" +
                            "        this.diffRemovedLine('-');\n" +
                            "      })\n" +
                            "      .block(function () {\n" +
                            "        this.diffRemovedHighlight('abc');\n" +
                            "      }).nl()\n" +
                            "      .block(function () {\n" +
                            "        this.diffAddedLine('+');\n" +
                            "      })\n" +
                            "      .block(function () {\n" +
                            "        this.diffAddedHighlight('def');\n" +
                            "      })\n" +
                            "    to equal\n" +
                            "    magicpen('ansi')\n" +
                            "      .red('-')\n" +
                            "      .text('abc').nl()\n" +
                            "      .green('+')\n" +
                            "      .text('def', [ 'bgGreen', 'black' ])"
                        );
                    });
                });

                it('should assume that a function that does not produce any output has run assertions on the stringified diff/message, and thus should not fail', function () {
                    expect(function () {
                        expect('abc', 'to equal', 'def');
                    }, 'to throw', expect.it('to have ansi diff', function (ansiStr) {
                        expect(ansiStr, 'to contain', 'abc');
                    }));
                });

                it('should handle the case where the function returns a promise', function () {
                    return expect(
                        expect(function () {
                            expect('abc', 'to equal', 'def');
                        }, 'to throw', expect.it('to have ansi diff', function (ansiStr) {
                            return expect(123, 'when delayed a little bit', 'to equal', 456);
                        })),
                        'to be rejected with',
                            "expected\n" +
                            "function () {\n" +
                            "  expect('abc', 'to equal', 'def');\n" +
                            "}\n" +
                            "to throw\n" +
                            "expect.it('to have ansi diff', function (ansiStr) {\n" +
                            "  return expect(123, 'when delayed a little bit', 'to equal', 456);\n" +
                            "})\n" +
                            "  expected 123 when delayed a little bit to equal 456"
                    );
                });

                it('should throw an error when asked for a non-text representation of a non-Unexpected error', function () {
                    try {
                        throw new Error('foo');
                    } catch (err) {
                        expect(function () {
                            expect(err, 'to have html message', 'foo');
                        }, 'to throw',
                            "expected Error('foo') to have html message 'foo'\n" +
                            "  Cannot get the html representation of non-Unexpected error");
                    }
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
                        "expected Error('Bummer!') to have message 'Dammit!'\n" +
                        "  expected 'Bummer!' to equal 'Dammit!'\n" +
                        "\n" +
                        "  -Bummer!\n" +
                        "  +Dammit!"
                    );
                });
            });
        });
    });

    describe('UnexpectedError', function () {
        describe('with a single line message', function () {
            it('should be inspected correctly', function () {
                expect(function () {
                    expect(2, 'to equal', 4);
                }, 'to throw', function (err) {
                    expect(err, 'to inspect as', 'UnexpectedError(expected 2 to equal 4)');
                });
            });
        });

        describe('with a multiline message', function () {
            it('should be inspected correctly', function () {
                expect(function () {
                    expect('foo', 'to equal', 'bar');
                }, 'to throw', function (err) {
                    expect(
                        err,
                        'to inspect as',
                        "UnexpectedError(\n" +
                        "  expected 'foo' to equal 'bar'\n" +
                        "\n" +
                        "  -foo\n" +
                        "  +bar\n" +
                        ")"
                    );
                });
            });
        });

        it('#getKeys should return a trimmed-down list', function () {
            expect(function () {
                expect('foo', 'to equal', 'bar');
            }, 'to throw', function (err) {
                expect(expect.findTypeOf(err).getKeys(err), 'to equal', [ 'message', 'errorMode', 'parent' ]);
            });
        });
    });

    describe('Date type', function () {
        it('inspects without milliseconds when the milliseconds field is zero', function () {
            expect(new Date(0), 'to inspect as', "new Date('Thu, 01 Jan 1970 00:00:00 GMT')");
        });

        it('inspects with three milliseconds digits when the milliseconds field has one digit', function () {
            expect(new Date(1), 'to inspect as', "new Date('Thu, 01 Jan 1970 00:00:00.001 GMT')");
        });

        it('inspects with three milliseconds digits when the milliseconds field has two digits', function () {
            expect(new Date(10), 'to inspect as', "new Date('Thu, 01 Jan 1970 00:00:00.010 GMT')");
        });

        it('inspects with three milliseconds digits when the milliseconds field has three digits', function () {
            expect(new Date(100), 'to inspect as', "new Date('Thu, 01 Jan 1970 00:00:00.100 GMT')");
        });
    });

    describe('Promise type', function () {
        var Promise;
        if (typeof weknowhow === 'undefined') {
            Promise = require('rsvp').Promise;
        } else {
            Promise = window.RSVP.Promise;
        }

        describe('"to be fulfilled" assertion', function () {
            describe('with no additional argument', function () {
                it('should succeed if the response is resolved with any value', function () {
                    return expect(new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve('yay');
                        }, 0);
                    }), 'to be fulfilled');
                });

                it('should fail if the promise is rejected', function () {
                    return expect(
                        expect(new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                reject('unhappy times');
                            }, 0);
                        }), 'to be fulfilled'),
                        'to be rejected with',
                            "expected Promise to be fulfilled\n" +
                            "  Promise unexpectedly rejected with 'unhappy times'"
                    );
                });
            });

            describe('with an additional argument', function () {
                it('should succeed if the response is resolved with a reason satisfying the argument', function () {
                    return expect(new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve(123);
                        }, 0);
                    }), 'to be fulfilled with', 123);
                });

                it('should fail if the promise is resolved with a value that does not satisfy the argument', function () {
                    return expect(
                        expect(new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                resolve({ foo: 'bar', baz: 'quux' });
                            }, 1);
                        }), 'to be fulfilled with', { baz: 'qux' }),
                        'to be rejected with',
                            "expected Promise to be fulfilled with { baz: 'qux' }\n" +
                            "  expected { foo: 'bar', baz: 'quux' } to satisfy { baz: 'qux' }\n" +
                            "\n" +
                            "  {\n" +
                            "    foo: 'bar',\n" +
                            "    baz: 'quux' // should equal 'qux'\n" +
                            "                // -quux\n" +
                            "                // +qux\n" +
                            "  }"

                    );
                });
            });
        });

        describe('"to be rejected" assertion', function () {
            describe('with no additional argument', function () {
                it('should succeed if the response is rejected for any reason', function () {
                    return expect(new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            reject();
                        }, 0);
                    }), 'to be rejected');
                });

                it('should succeed if the promise is rejected without a reason', function () {
                    return expect(
                        expect(new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                resolve('happy times');
                            }, 0);
                        }), 'to be rejected'),
                        'to be rejected with',
                            "expected Promise to be rejected\n" +
                            "  Promise unexpectedly fulfilled with 'happy times'"
                    );
                });

                it('should fail if the promise is fulfilled', function () {
                    return expect(
                        expect(new Promise(function (resolve, reject) {
                            setTimeout(resolve, 0);
                        }), 'to be rejected'),
                        'to be rejected with',
                            'expected Promise to be rejected\n' +
                            '  Promise unexpectedly fulfilled'
                    );
                });

                it('should fail if the promise is fulfilled with a value', function () {
                    return expect(
                        expect(new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                resolve('happy times');
                            }, 0);
                        }), 'to be rejected'),
                        'to be rejected with',
                            "expected Promise to be rejected\n" +
                            "  Promise unexpectedly fulfilled with 'happy times'"
                    );
                });
            });

            describe('with an additional argument', function () {
                it('should succeed if the response is rejected with a reason satisfying the argument', function () {
                    return expect(new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            reject(new Error('OMG!'));
                        }, 0);
                    }), 'to be rejected with', new Error('OMG!'));
                });

                it('should support matching the error message against a regular expression', function () {
                    return expect(new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            reject(new Error('OMG!'));
                        }, 0);
                    }), 'to be rejected with', /MG/);
                });

                it('should support matching the error message of an UnexpectedError against a regular expression', function () {
                    return expect(new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            try {
                                expect(false, 'to be truthy');
                            } catch (err) {
                                reject(err);
                            }
                        }, 0);
                    }), 'to be rejected with', /to be/);
                });

                it('should fail if the promise is rejected with a reason that does not satisfy the argument', function () {
                    return expect(
                        expect(new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                reject(new Error('OMG!'));
                            }, 1);
                        }), 'to be rejected with', new Error('foobar')),
                        'to be rejected with',
                            "expected Promise to be rejected with Error('foobar')\n" +
                            "  expected Error('OMG!') to satisfy Error('foobar')\n" +
                            "\n" +
                            "  Error({\n" +
                            "    message: 'OMG!' // should equal 'foobar'\n" +
                            "                    // -OMG!\n" +
                            "                    // +foobar\n" +
                            "  })"
                    );
                });
            });
        });

        describe('"when fulfilled" adverbial assertion', function () {
            it('should delegate to the next assertion with the resolved value', function () {
                return expect(new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        resolve({ foo: 'bar' });
                    }, 0);
                }), 'when fulfilled', 'to satisfy', { foo: 'bar' });
            });

            it('should support expect.it', function () {
                return expect(new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        resolve({ foo: 'bar' });
                    }, 0);
                }), 'when fulfilled', expect.it('to have property', 'foo', 'bar'));
            });

            it('should fail when the promise is rejected', function () {
                return expect(
                    expect(new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            reject(new Error('ugh'));
                        }, 0);
                    }), 'when fulfilled', 'to satisfy', { foo: 'baz' }),
                    'to be rejected with',
                        "expected Promise when fulfilled to satisfy { foo: 'baz' }\n" +
                        "  Promise unexpectedly rejected with Error('ugh')"
                );
            });

            it('should fail when the promise is rejected with a value of undefined', function () {
                return expect(
                    expect(new Promise(function (resolve, reject) {
                        setTimeout(reject, 0);
                    }), 'when fulfilled', 'to satisfy', { foo: 'baz' }),
                    'to be rejected with',
                        "expected Promise when fulfilled to satisfy { foo: 'baz' }\n" +
                        "  Promise unexpectedly rejected"
                );
            });

            it('should fail when the promise is rejected with a value of undefined', function () {
                return expect(
                    expect(new Promise(function (resolve, reject) {
                        setTimeout(reject, 0);
                    }), 'when fulfilled', 'to be truthy'),
                    'to be rejected with',
                        "expected Promise when fulfilled to be truthy\n" +
                        "  Promise unexpectedly rejected"
                );
            });

            it('should fail when the next assertion fails', function () {
                return expect(
                    expect(new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve({ foo: 'bar' });
                        }, 0);
                    }), 'when fulfilled', 'to satisfy', { foo: 'baz' }),
                    'to be rejected with',
                        "expected Promise when fulfilled to satisfy { foo: 'baz' }\n" +
                        "  expected { foo: 'bar' } to satisfy { foo: 'baz' }\n" +
                        "\n" +
                        "  {\n" +
                        "    foo: 'bar' // should equal 'baz'\n" +
                        "               // -bar\n" +
                        "               // +baz\n" +
                        "  }"
                );
            });

            it('should fail with the right error message when the next assertion is an expect.it that fails', function () {
                return expect(
                    expect(new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve({ foo: 'bar' });
                        }, 0);
                    }), 'when fulfilled', expect.it('to have property', 'foo', 'quux')),
                    'to be rejected with',
                        "expected Promise when fulfilled expect.it('to have property', 'foo', 'quux')\n" +
                        "  expected { foo: 'bar' } to have property 'foo' with a value of 'quux'\n" +
                        "\n" +
                        "  -bar\n" +
                        "  +quux"
                );
            });
        });

        describe('"when rejected" adverbial assertion', function () {
            it('should delegate to the next assertion with the rejection reason', function () {
                return expect(new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        reject({ foo: 'bar' });
                    }, 0);
                }), 'when rejected', 'to satisfy', { foo: 'bar' });
            });

            it('should fail when the next assertion fails', function () {
                return expect(
                    expect(new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            reject({ foo: 'bar' });
                        }, 0);
                    }), 'when rejected', 'to satisfy', { foo: 'baz' }),
                    'to be rejected with',
                        "expected Promise when rejected to satisfy { foo: 'baz' }\n" +
                        "  expected { foo: 'bar' } to satisfy { foo: 'baz' }\n" +
                        "\n" +
                        "  {\n" +
                        "    foo: 'bar' // should equal 'baz'\n" +
                        "               // -bar\n" +
                        "               // +baz\n" +
                        "  }"
                );
            });

            it('should fail if the promise is fulfilled', function () {
                return expect(
                    expect(new Promise(function (resolve, reject) {
                        setTimeout(resolve, 0);
                    }), 'when rejected', 'to equal', new Error('unhappy times')),
                    'to be rejected with',
                        "expected Promise when rejected to equal Error('unhappy times')\n" +
                        "  Promise unexpectedly fulfilled"
                );
            });

            it('should fail if the promise is fulfilled with a value', function () {
                return expect(
                    expect(new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve('happy times');
                        }, 0);
                    }), 'when rejected', 'to equal', new Error('unhappy times')),
                    'to be rejected with',
                        "expected Promise when rejected to equal Error('unhappy times')\n" +
                        "  Promise unexpectedly fulfilled with 'happy times'"
                );
            });
        });

        it('should inspect a pending promise', function () {
            var promise = new Promise(function (resolve, reject) {
                setTimeout(resolve, 0);
            });
            expect(promise, 'to inspect as', 'Promise');
            return promise;
        });

        it('should inspect a fulfilled promise without a value', function () {
            var promise = new Promise(function (resolve, reject) {
                resolve();
            });

            return promise.then(function () {
                expect(promise, 'to inspect as', 'Promise');
            });
        });

        it('should inspect a fulfilled promise with a value', function () {
            var promise = new Promise(function (resolve, reject) {
                resolve(123);
            });

            return promise.then(function () {
                expect(promise, 'to inspect as', 'Promise');
            });
        });

        it('should inspect a rejected promise without a value', function () {
            var promise = new Promise(function (resolve, reject) {
                reject();
            });

            return promise.then(undefined, function () {
                expect(promise, 'to inspect as', 'Promise');
            });
        });

        it('should inspect a rejected promise with a value', function () {
            var promise = new Promise(function (resolve, reject) {
                setTimeout(function () {
                    reject(new Error('argh'));
                }, 0);
            });

            return promise.then(undefined, function () {
                expect(promise, 'to inspect as', 'Promise');
            });
        });

        describe('with a Bluebird promise (that supports synchronous inspection)', function () {
            it('should inspect a pending promise', function () {
                var promise = expect.promise(function (run) {
                    setTimeout(run(function () {}), 0);
                });
                expect(promise, 'to inspect as', 'Promise (pending)');
                return promise;
            });

            it('should inspect a fulfilled promise without a value', function () {
                var promise = expect.promise(function () {});

                return promise.then(function () {
                    expect(promise, 'to inspect as', 'Promise (fulfilled)');
                });
            });

            it('should inspect a fulfilled promise without a value method', function () {
                var promise = expect.promise(function () {});
                promise.value = null;
                return promise.then(function () {
                    expect(promise, 'to inspect as', 'Promise (fulfilled)');
                });
            });

            it('should inspect a fulfilled promise with a value', function () {
                var promise = expect.promise(function (resolve, reject) {
                    resolve(123);
                });

                return promise.then(function () {
                    expect(promise, 'to inspect as', 'Promise (fulfilled) => 123');
                });
            });

            it('should inspect a rejected promise without a value', function () {
                var promise = expect.promise(function (resolve, reject) {
                    reject();
                });

                return promise.caught(function () {
                    expect(promise, 'to inspect as', 'Promise (rejected)');
                });
            });

            it('should inspect a rejected promise with a value', function () {
                var promise = expect.promise(function (resolve, reject) {
                    setTimeout(function () {
                        reject(new Error('argh'));
                    }, 0);
                });

                return promise.caught(function () {
                    expect(promise, 'to inspect as', "Promise (rejected) => Error('argh')");
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
                   "  No matching assertion, did you mean:\n" +
                   "  <object|function> [not] to have property <string>\n" +
                   "  <object|function> to have [own] property <string> <any>");

            expect(function () {
                expect({a: 'b'}, 'to have property', 'a', 'c');
            }, 'to throw exception',
                   "expected { a: 'b' } to have property 'a' with a value of 'c'\n" +
                  "\n" +
                   "-b\n" +
                   "+c");

            expect(function () {
                expect({a: 'b'}, 'to have own property', 'a', 'c');
            }, 'to throw exception',
                   "expected { a: 'b' } to have own property 'a' with a value of 'c'\n" +
                  "\n" +
                   "-b\n" +
                   "+c");

            expect(function () {
                // property expectations ignores value if property
                expect(null, 'not to have property', 'a', 'b');
            }, 'to throw exception',
                   "expected null not to have property 'a', 'b'\n" +
                   "  No matching assertion, did you mean:\n" +
                   "  <object|function> [not] to have property <string>");

            expect(function () {
                // property expectations on value expects the property to be present
                expect(null, 'not to have own property', 'a', 'b');
            }, 'to throw exception',
                   "expected null not to have own property 'a', 'b'\n" +
                   "  No matching assertion, did you mean:\n" +
                   "  <object|function> [not] to have own property <string>");
        });

        it('does not support the not-flag in combination with a value argument', function () {
            expect(function () {
                expect({ a: 'a' }, 'not to have property', 'a', 'a');
            }, "to throw",
                   "expected { a: 'a' } not to have property 'a', 'a'\n" +
                   "  No matching assertion, did you mean:\n" +
                   "  <object|function> [not] to have property <string>");

            expect(function () {
                expect({ a: 'a' }, 'not to have own property', 'a', 'a');
            }, "to throw",
                   "expected { a: 'a' } not to have own property 'a', 'a'\n" +
                   "  No matching assertion, did you mean:\n" +
                   "  <object|function> [not] to have own property <string>");
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
                   "  b: 'bar'\n" +
                   "  // missing c: 'baz'\n" +
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
                   "  // missing a: 'foo'\n" +
                   "  // missing b: 'bar'\n" +
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
                   "  doSomething: function () {}\n" +
                   "  // missing a: 123\n" +
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
            }, 'to throw',
                   "expected { a: 'foo', b: 'bar' } to have properties 'a', 'b'\n" +
                   "  No matching assertion, did you mean:\n" +
                   "  <object|function> [not] to have [own] properties <array>\n" +
                   "  <object|function> to have [own] properties <object>");

            expect(function () {
                expect({a: 'foo', b: 'bar'}, 'not to have properties', {a: 'foo', b: 'bar'});
            }, 'to throw',
                   "expected { a: 'foo', b: 'bar' } not to have properties { a: 'foo', b: 'bar' }\n" +
                   "  No matching assertion, did you mean:\n" +
                   "  <object|function> [not] to have [own] properties <array>");
        });
    });

    describe('key assertion', function () {
        it('asserts the presence of a key', function () {
            expect({ a: 'b' }, 'to have key', 'a');
            expect({ a: 'b' }, 'not to have key', 'b');
            expect({ a: 'b' }, 'not to have keys', []);
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
            }, 'to throw exception',
                "expected { a: 'b', b: 'c' } to only have key 'b'\n" +
                "\n" +
                "{\n" +
                "  a: 'b', // should be removed\n" +
                "  b: 'c'\n" +
                "}"
            );

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

        it('should fail with a diff when the only flag is used', function () {
            expect(function () {
                expect({foo: 123, bar: 'quux'}, 'to only have keys', [ 'foo' ]);
            }, 'to throw',
                "expected { foo: 123, bar: 'quux' } to only have keys [ 'foo' ]\n" +
                "\n" +
                "{\n" +
                "  foo: 123,\n" +
                "  bar: 'quux' // should be removed\n" +
                "}"
            );
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
                   "expected NaN not to be finite\n" +
                   "  No matching assertion, did you mean:\n" +
                   "  <number> [not] to be finite");
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
                   "expected NaN not to be infinite\n" +
                   "  No matching assertion, did you mean:\n" +
                   "  <number> [not] to be infinite");
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(123, 'to be infinite');
            }, 'to throw exception', 'expected 123 to be infinite');
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
        it('passes when an object is tested against itself, even in the presence of  circular references', function () {
            var circular = {};
            circular.loop = circular;
            expect(circular, 'to satisfy', circular);
        });

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

        describe('with a buffer instance', function () {
            describe('in an async setting', function () {
                it.skipIf(noBuffer, 'should succeed', function () {
                    return expect(new Buffer([0, 1, 2]), 'to satisfy', expect.it('when delayed a little bit', 'to equal', new Buffer([0, 1, 2])));
                });

                it.skipIf(noBuffer, 'should fail with a diff', function () {
                    return expect(
                        expect(new Buffer([0, 1, 2]), 'to satisfy', expect.it('when delayed a little bit', 'to equal', new Buffer([2, 1, 0]))),
                        'to be rejected with',
                            "expected Buffer([0x00, 0x01, 0x02])\n" +
                            "to satisfy expect.it('when delayed a little bit', 'to equal', Buffer([0x02, 0x01, 0x00]))\n" +
                            "\n" +
                            "expected Buffer([0x00, 0x01, 0x02])\n" +
                            "when delayed a little bit to equal Buffer([0x02, 0x01, 0x00])\n" +
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
                    "[\n" +
                    "  'aa',\n" +
                    "  'bb',\n" +
                    "  'cc' // should match /quux/\n" +
                    "]"
                );
            });
        });

        describe('with an array satisfied against an array', function () {
            it('should render missing items nicely', function () {
                expect(function () {
                    expect([], 'to satisfy', [1, 2]);
                }, 'to throw',
                    "expected [] to satisfy [ 1, 2 ]\n" +
                    "\n" +
                    "[\n" +
                    "  // missing 1\n" +
                    "  // missing 2\n" +
                    "]"
                );
            });

            it('should fall back to comparing index-by-index if one of the arrays has more than 10 entries', function () {
                expect(function () {
                    expect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ], 'to satisfy', [0, 2, 3, 4, 5, 6, 7, 8, 9 ]);
                }, 'to throw',
                    "expected [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]\n" +
                    "to satisfy [ 0, 2, 3, 4, 5, 6, 7, 8, 9 ]\n" +
                    "\n" +
                    "[\n" +
                    "  0,\n" +
                    "  1, // should equal 2\n" +
                    "  2, // should equal 3\n" +
                    "  3, // should equal 4\n" +
                    "  4, // should equal 5\n" +
                    "  5, // should equal 6\n" +
                    "  6, // should equal 7\n" +
                    "  7, // should equal 8\n" +
                    "  8, // should equal 9\n" +
                    "  9, // should be removed\n" +
                    "  10 // should be removed\n" +
                    "]"
                );

                expect(function () {
                    expect([1, 2, 3, 4, 5, 6, 7, 8], 'to satisfy', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
                }, 'to throw',
                    "expected [ 1, 2, 3, 4, 5, 6, 7, 8 ]\n" +
                    "to satisfy [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ]\n" +
                    "\n" +
                    "[\n" +
                    "  1,\n" +
                    "  2,\n" +
                    "  3,\n" +
                    "  4,\n" +
                    "  5,\n" +
                    "  6,\n" +
                    "  7,\n" +
                    "  8\n" +
                    "  // missing 9\n" +
                    "  // missing 10\n" +
                    "  // missing 11\n" +
                    "]"
                );
            });

            describe('with sync expect.it entries in the value', function () {
                it('should render missing entries', function () {
                    expect(function () {
                        expect([1, 2], 'to satisfy', [expect.it('to be a number'), 2, expect.it('to be a string')]);
                    }, 'to throw',
                        "expected [ 1, 2 ]\n" +
                        "to satisfy [ expect.it('to be a number'), 2, expect.it('to be a string') ]\n" +
                        "\n" +
                        "[\n" +
                        "  1,\n" +
                        "  2\n" +
                        "  // missing: should be a string\n" +
                        "]"
                    );
                });

                it('should render moved entries', function () {
                    return expect(function () {
                        expect(['a', 'b'], 'to satisfy', [expect.it('to equal', 'b')]);
                    }, 'to throw',
                        "expected [ 'a', 'b' ] to satisfy [ expect.it('to equal', 'b') ]\n" +
                        "\n" +
                        "[\n" +
                        "  'a', // should be removed\n" +
                        "  'b'\n" +
                        "]"
                    );
                });

                it('should render entries that do not satisfy the RHS entry', function () {
                    return expect(function () {
                        expect(['a', 'b'], 'to satisfy', ['e', expect.it('to equal', 'c')]);
                    }, 'to throw',
                        "expected [ 'a', 'b' ] to satisfy [ 'e', expect.it('to equal', 'c') ]\n" +
                        "\n" +
                        "[\n" +
                        "  'a', // should equal 'e'\n" +
                        "       //\n" +
                        "       // -a\n" +
                        "       // +e\n" +
                        "  'b' // should equal 'c'\n" +
                        "      //\n" +
                        "      // -b\n" +
                        "      // +c\n" +
                        "]"
                    );
                });

                it('should render extraneous entries', function () {
                    expect(function () {
                        expect([1, 2, 3], 'to satisfy', [1, 2]);
                    }, 'to throw',
                        "expected [ 1, 2, 3 ] to satisfy [ 1, 2 ]\n" +
                        "\n" +
                        "[\n" +
                        "  1,\n" +
                        "  2,\n" +
                        "  3 // should be removed\n" +
                        "]"
                    );
                });
            });

            describe('with async expect.it entries in the value', function () {
                it('should render missing entries', function () {
                    return expect(function () {
                        return expect([1, 2], 'to satisfy', [expect.it('when delayed a little bit', 'to be a number'), 2, expect.it('when delayed a little bit', 'to be a string')]);
                    }, 'to error',
                        "expected [ 1, 2 ] to satisfy\n" +
                        "[\n" +
                        "  expect.it('when delayed a little bit', 'to be a number'),\n" +
                        "  2,\n" +
                        "  expect.it('when delayed a little bit', 'to be a string')\n" +
                        "]\n" +
                        "\n" +
                        "[\n" +
                        "  1,\n" +
                        "  2\n" +
                        "  // missing: expected: when delayed a little bit to be a string\n" +
                        "]"
                    );
                });

                it('should render unsatisfied entries', function () {
                    return expect(function () {
                        return expect([1, 2, 3, 4, 5, 6], 'to satisfy', [
                            expect.it('when delayed a little bit', 'to be a number'),
                            2,
                            expect.it('when delayed a little bit', 'to be a string'),
                            expect.it('when delayed a little bit', 'to be a boolean'),
                            expect.it('when delayed a little bit', 'to be a regular expression'),
                            expect.it('when delayed a little bit', 'to be a function')
                        ]);
                    }, 'to error',
                        "expected [ 1, 2, 3, 4, 5, 6 ] to satisfy\n" +
                        "[\n" +
                        "  expect.it('when delayed a little bit', 'to be a number'),\n" +
                        "  2,\n" +
                        "  expect.it('when delayed a little bit', 'to be a string'),\n" +
                        "  expect.it('when delayed a little bit', 'to be a boolean'),\n" +
                        "  expect.it('when delayed a little bit', 'to be a regular expression'),\n" +
                        "  expect.it('when delayed a little bit', 'to be a function')\n" +
                        "]\n" +
                        "\n" +
                        "[\n" +
                        "  1,\n" +
                        "  2,\n" +
                        "  3, // expected: when delayed a little bit to be a string\n" +
                        "  4, // expected: when delayed a little bit to be a boolean\n" +
                        "  5, // expected: when delayed a little bit to be a regular expression\n" +
                        "  6 // expected: when delayed a little bit to be a function\n" +
                        "]"
                    );
                });

                it('should render moved entries', function () {
                    return expect(function () {
                        return expect(['a', 'b'], 'to satisfy', [expect.it('when delayed a little bit', 'to equal', 'b')]);
                    }, 'to error',
                        "expected [ 'a', 'b' ]\n" +
                        "to satisfy [ expect.it('when delayed a little bit', 'to equal', 'b') ]\n" +
                        "\n" +
                        "[\n" +
                        "  'a', // should be removed\n" +
                        "  'b'\n" +
                        "]"
                    );
                });

                it('should render entries that do not satisfy the RHS entry', function () {
                    return expect(function () {
                        return expect(['a', 'b'], 'to satisfy', ['a', expect.it('when delayed a little bit', 'to equal', 'c')]);
                    }, 'to error',
                        "expected [ 'a', 'b' ]\n" +
                        "to satisfy [ 'a', expect.it('when delayed a little bit', 'to equal', 'c') ]\n" +
                        "\n" +
                        "[\n" +
                        "  'a',\n" +
                        "  'b' // expected: when delayed a little bit to equal 'c'\n" +
                        "      //\n" +
                        "      // -b\n" +
                        "      // +c\n" +
                        "]"
                    );
                });

                it('should render extraneous entries', function () {
                    return expect(function () {
                        return expect([1, 2, 3], 'to satisfy', [expect.it('when delayed a little bit', 'to be a number'), 2]);
                    }, 'to error',
                        "expected [ 1, 2, 3 ]\n" +
                        "to satisfy [ expect.it('when delayed a little bit', 'to be a number'), 2 ]\n" +
                        "\n" +
                        "[\n" +
                        "  1,\n" +
                        "  2,\n" +
                        "  3 // should be removed\n" +
                        "]"
                    );
                });
            });
        });

        describe('with an array satisfied against an object', function () {
            it('should render missing items nicely', function () {
                expect(function () {
                    expect([], 'to satisfy', {0: 1, 1: 2});
                }, 'to throw',
                    "expected [] to satisfy { 0: 1, 1: 2 }\n" +
                    "\n" +
                    "[\n" +
                    "  // missing 1\n" +
                    "  // missing 2\n" +
                    "]"
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

        it('renders missing properties correctly', function () {
            expect(function () {
                expect({foo: 'bar'}, 'to satisfy', {foo: 'bar', baz: 123});
            }, 'to throw',
                "expected { foo: 'bar' } to satisfy { foo: 'bar', baz: 123 }\n" +
                "\n" +
                "{\n" +
                "  foo: 'bar'\n" +
                "  // missing baz: 123\n" +
                "}"
            );
        });

        it('ignores blacklisted properties in the diff', function () {
            var error = new Error('foo');
            error.description = 'qux';
            expect(function () {
                expect(error, 'to satisfy', new Error('bar'));
            }, 'to throw',
                   "expected Error('foo') to satisfy Error('bar')\n" +
                   "\n" +
                   "Error({\n" +
                   "  message: 'foo' // should equal 'bar'\n" +
                   "                 // -foo\n" +
                   "                 // +bar\n" +
                   "})");
        });

        it('renders missing properties correctly with expect.it', function () {
            expect(function () {
                expect({foo: 'bar'}, 'to satisfy', {foo: 'bar', baz: expect.it('to equal', 123)});
            }, 'to throw',
                "expected { foo: 'bar' } to satisfy { foo: 'bar', baz: expect.it('to equal', 123) }\n" +
                "\n" +
                "{\n" +
                "  foo: 'bar'\n" +
                "  // missing: baz: should equal 123\n" +
                "}"
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
                    expect({foo: 123}, 'to exhaustively satisfy assertion', 'to equal', {foo: 123});
                });

                it('should fail with a diff', function () {
                    expect(function () {
                        expect({foo: 123}, 'to exhaustively satisfy assertion', 'to equal', {foo: 456});
                    }, 'to throw',
                        "expected { foo: 123 } to equal { foo: 456 }\n" +
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

        describe('with a regexp satisfied against a regexp', function () {
            it('should succeed', function () {
                expect(/wat/igm, 'to satisfy', /wat/igm);
            });

            it('should fail when the regular expressions have different sets of flags', function () {
                expect(function () {
                    expect(/wat/mi, 'to satisfy', /wat/ig);
                }, 'to throw',
                    'expected /wat/im to satisfy /wat/gi\n' +
                    '\n' +
                    '-/wat/im\n' +
                    '+/wat/gi'
                );
            });

            it('should fail when the regular expressions have different patterns', function () {
                expect(function () {
                    expect(/foo/i, 'to satisfy', /bar/i);
                }, 'to throw',
                    'expected /foo/i to satisfy /bar/i\n' +
                    '\n' +
                    '-/foo/i\n' +
                    '+/bar/i'
                );
            });
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

            it('should succeed with an or group where the first assertion passes and the second one fails', function () {
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
                    'to be rejected with',
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
                    'to be rejected with',
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
                    'to be rejected with',
                        "expected 3 to satisfy\n" +
                        "expect.it('when delayed a little bit', 'to equal', 2)\n" +
                        "      .or('to equal', 1)\n" +
                        "\n" +
                        "⨯ expected 3 when delayed a little bit to equal 2 or\n" +
                        "⨯ expected 3 to equal 1"
                );
            });
        });

        it('should support diffs in the error report', function () {
            expect(function () {
                expect('foo', 'to satisfy', expect.it('to equal', 'bar').or('to equal', 'baz'));
            }, 'to throw',
                "expected 'foo' to satisfy\n" +
                "expect.it('to equal', 'bar')\n" +
                "      .or('to equal', 'baz')\n" +
                "\n" +
                "⨯ expected 'foo' to equal 'bar' or\n" +
                "\n" +
                "  -foo\n" +
                "  +bar\n" +
                "⨯ expected 'foo' to equal 'baz'\n" +
                "\n" +
                "  -foo\n" +
                "  +baz"
            );
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
                   "  foo: 'foo' // should not match /oo/\n" +
                   "             //\n" +
                   "             // foo\n" +
                   "             //  ^^\n" +
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

        describe('with a regular function in the RHS object', function () {
            it('should throw an exception if the condition is not met', function () {
                expect({foo: 123}, 'to satisfy', function (obj) {
                    expect(obj.foo, 'to equal', 123);
                });
            });

            it('should only consider functions that are identified as functions by the type system', function () {
                var clonedExpect = expect.clone().addType({
                    name: 'functionStartingWithF',
                    identify: function (obj) {
                        return typeof obj === 'function' && /^f/i.test(obj.name);
                    }
                });

                function foo() {
                    throw new Error('argh, do not call me');
                }

                clonedExpect(foo, 'to satisfy', foo);
                clonedExpect({ foo: foo }, 'to satisfy', { foo: foo });
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
                }, 'to throw', "expected Error('foo') to satisfy TypeError('foo')");
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
                           "expected Error({ message: 'foo', bar: 123 })\n" +
                           "to exhaustively satisfy { message: 'foo' }\n" +
                           "\n" +
                           "{\n" +
                           "  message: 'foo',\n" +
                           "  bar: 123 // should be removed\n" +
                           "}");
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
                    }, 'to throw', "expected Error('Custom message') to be a TypeError");
                });
            });
        });

        describe('on Buffer instances', function () {
            it.skipIf(noBuffer, 'should assert equality', function () {
                expect(new Buffer([1, 2, 3]), 'to satisfy', new Buffer([1, 2, 3]));
            });

            it.skipIf(noBuffer,
                      'should fail with a binary diff when the assertion fails', function () {
                expect(function () {
                    expect(new Buffer([1, 2, 3]), 'to satisfy', new Buffer([1, 2, 4]));
                }, 'to throw',
                    'expected Buffer([0x01, 0x02, 0x03]) to equal Buffer([0x01, 0x02, 0x04])\n' +
                    '\n' +
                    '-01 02 03                                         │...│\n' +
                    '+01 02 04                                         │...│');
            });

            describe('with expect.it', function () {
                it.skipIf(noBuffer, 'should succeed', function () {
                    expect(new Buffer('bar'), 'to satisfy', expect.it('to equal', new Buffer('bar')));
                });

                it.skipIf(noBuffer, 'should fail with a diff', function () {
                    expect(function () {
                        expect(new Buffer('bar'), 'to satisfy', expect.it('to equal', new Buffer('foo')));
                    }, 'to throw',
                        "expected Buffer([0x62, 0x61, 0x72])\n" +
                        "to satisfy expect.it('to equal', Buffer([0x66, 0x6F, 0x6F]))\n" +
                        "\n" +
                        "expected Buffer([0x62, 0x61, 0x72]) to equal Buffer([0x66, 0x6F, 0x6F])\n" +
                        "\n" +
                        "-62 61 72                                         │bar│\n" +
                        "+66 6F 6F                                         │foo│"
                    );
                });
            });

            it.skipIf(noBuffer, 'should satisfy a function', function () {
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
                    'expected Uint8Array([0x01, 0x02, 0x03]) to equal Uint8Array([0x01, 0x02, 0x04])\n' +
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
                    expect(toArguments({foo: 'foo'}, 2, 3), 'to satisfy', [{foo: 'f00'}]);
                }, 'to throw',
                       "expected arguments( { foo: 'foo' }, 2, 3 ) to satisfy [ { foo: 'f00' } ]\n" +
                       "\n" +
                       "arguments(\n" +
                       "  {\n" +
                       "    foo: 'foo' // should equal 'f00'\n" +
                       "               // -foo\n" +
                       "               // +f00\n" +
                       "  },\n" +
                       "  2, // should be removed\n" +
                       "  3 // should be removed\n" +
                       ")");
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
                    '  // missing undefined\n' +
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
                    '  3\n' +
                    '  // missing 4\n' +
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
                   "  foo: 123 // ✓ should be a number and\n" +
                   "           // ⨯ should be greater than 200\n" +
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
                   "expected Error('foo') to satisfy Error('bar')\n" +
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
            }, 'to throw exception', "expected Error('foo') to satisfy /bar/");
        });

        it('fails when using an unknown assertion', function () {
            expect(function () {
                expect({ bool: 'true' }, 'to satisfy', { bool: expect.it('to be true') });
            }, 'to throw exception',
                   "expected { bool: 'true' } to satisfy { bool: expect.it('to be true') }\n" +
                   "\n" +
                   "{\n" +
                   "  bool: 'true' // expected 'true' to be true\n" +
                   "               //   No matching assertion, did you mean:\n" +
                   "               //   <boolean> [not] to be true\n" +
                   "}");
        });

        it('fails is error does not satisfy properties of given object', function () {
            expect(function () {
                expect(new Error('foo'), 'to satisfy', { message: 'bar' });
            }, 'to throw exception',
                   "expected Error('foo') to satisfy { message: \'bar\' }\n" +
                   "\n" +
                   "{\n" +
                   "  message: 'foo' // should equal 'bar'\n" +
                   "                 // -foo\n" +
                   "                 // +bar\n" +
                   "}");
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
                        blue: { ignorance: { of: { illusion: { will: { not: { lead: 'to the truth' } } } } } },
                        purple: { you: 'wat there is another pill', them: 'there is always more choices' }
                    }
                }, 'to satisfy', {
                    pill: {
                        red: "I'll show you how deep the rabbit hole goes.",
                        blue: { ignorance: { of: { illusion: { will: { not: { lead: 'to the truth' } } } } } }
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
                   "    red: 'I\\'ll show you how deep the rabbit hole goes',\n" +
                   "         // should equal 'I\\'ll show you how deep the rabbit hole goes.'\n" +
                   "         // -I'll show you how deep the rabbit hole goes\n" +
                   "         // +I'll show you how deep the rabbit hole goes.\n" +
                   "    blue: { ignorance: { of: ... } },\n" +
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
                                      .text('|' + obj + '|').nl()
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
                    '    bar: 123 // should equal /d/\n' +
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

            it('should support satisfy agaist the unwrapped object with nested expect.it', function () {
                clonedExpect(new MysteryBox({ baz: 123 }), 'to satisfy', { baz: expect.it('to be a number') });
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
                       "expected { foo: MysteryBox({ baz: 123, quux: 987 }) }\n" +
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
                       "expected { foo: MysteryBox({ baz: 123, quux: 987 }) }\n" +
                       "to satisfy { foo: { baz: expect.it('not to be a number') } }\n" +
                       "\n" +
                       "{\n" +
                       "  foo: MysteryBox({\n" +
                       "    baz: 123, // should not be a number\n" +
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
                }, 'to throw',
                       "expected { foo: MysteryBox('abc') } to satisfy { foo: 'def' }\n" +
                       "\n" +
                       "{\n" +
                       "  foo: MysteryBox('abc') // should equal 'def'\n" +
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
            }, 'to throw', "expected 'foobar' to match /quux/i");

            // FIXME: Could this error message be improved?
            expect(function () {
                expect({foo: 123}, 'to satisfy', {foo: expect.it('to be a string')});
            }, 'to throw',
                "expected { foo: 123 } to satisfy { foo: expect.it('to be a string') }\n" +
                "\n" +
                "{\n" +
                "  foo: 123 // should be a string\n" +
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
                    expect.errorMode = 'nested';

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
                       'to be rejected with',
                       "expected 'wat' to satisfy expect.it('to be a number after a short delay')\n" +
                       "\n" +
                       "expected 'wat' to be a number after a short delay\n" +
                       "  expected 'wat' to be a number");
            });

            it('supports many levels of asynchronous assertions', function () {
                return expect(
                    expect('abc', 'when delayed a little bit', 'when delayed a little bit', 'to satisfy', expect.it('when delayed a little bit', 'to equal', 'def')),
                    'to be rejected with',
                        "expected 'abc'\n" +
                        "when delayed a little bit when delayed a little bit to satisfy expect.it('when delayed a little bit', 'to equal', 'def')\n" +
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
                    'to be rejected with',
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
                        "✓ expected 123 to be greater than 100\n" +
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
            }, 'to throw',
                   "expected [ 1, 2, 3 ] to have items satisfying\n" +
                   "  No matching assertion, did you mean:\n" +
                   "  <array-like> to have items satisfying <any+>\n" +
                   "  <array-like> to have items satisfying <assertion>");
        });

        it('only accepts arrays as the target object', function () {
            expect(function () {
                expect(42, 'to have items satisfying', function (item) {});
            }, 'to throw',
                   "expected 42 to have items satisfying function (item) {}\n" +
                   "  No matching assertion, did you mean:\n" +
                   "  <array-like> to have items satisfying <any+>\n" +
                   "  <array-like> to have items satisfying <assertion>");
        });

        it('fails if the given array is empty', function () {
            expect(function () {
                expect([], 'to have items satisfying', function (item) {
                    expect(item, 'to be a number');
                });
            }, 'to throw',
                   "expected [] to have items satisfying\n" +
                   "function (item) {\n" +
                   "  expect(item, 'to be a number');\n" +
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
                "expected array to have items satisfying\n" +
                "function (item) {\n" +
                "  expect.fail(function (output) {\n" +
                "    output.text('foo').nl().text('bar');\n" +
                "  });\n" +
                "}\n" +
                "\n" +
                "[\n" +
                "  [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 ] // foo\n" +
                "                                                                            // bar\n" +
                "]");
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
            }, 'to throw', /1, \/\/ should not be a number/);

            expect(function () {
                expect(['0', 1, '2', '3'], 'to have items satisfying', 'not to be a number');
            }, 'to throw', /1, \/\/ should not be a number/);
        });

        it('provides a detailed report of where failures occur', function () {
            expect(function () {
                expect([0, 1, '2', 3, 4], 'to have items satisfying', function (item) {
                    expect(item, 'to be a number');
                    expect(item, 'to be less than', 4);
                });
            }, 'to throw',
                   "expected [ 0, 1, '2', 3, 4 ] to have items satisfying\n" +
                   "function (item) {\n" +
                   "  expect(item, 'to be a number');\n" +
                   "  expect(item, 'to be less than', 4);\n" +
                   "}\n" +
                   "\n" +
                   "[\n" +
                   "  0,\n" +
                   "  1,\n" +
                   "  '2', // should be a number\n" +
                   "  3,\n" +
                   "  4 // should be less than 4\n" +
                   "]");
        });

        it('indents failure reports of nested assertions correctly', function () {
            expect(function () {
                expect([[0, 1, 2], [4, '5', 6], [7, 8, '9']], 'to have items satisfying', function (arr) {
                    expect(arr, 'to have items satisfying', function (item) {
                        expect(item, 'to be a number');
                    });
                });
            }, 'to throw',
                   "expected array to have items satisfying\n" +
                   "function (arr) {\n" +
                   "  expect(arr, 'to have items satisfying', function (item) {\n" +
                   "    expect(item, 'to be a number');\n" +
                   "  });\n" +
                   "}\n" +
                   "\n" +
                   "[\n" +
                   "  [ 0, 1, 2 ],\n" +
                   "  [\n" +
                   "    4,\n" +
                   "    '5', // should be a number\n" +
                   "    6\n" +
                   "  ],\n" +
                   "  [\n" +
                   "    7,\n" +
                   "    8,\n" +
                   "    '9' // should be a number\n" +
                   "  ]\n" +
                   "]");
        });

        describe('delegating to an async assertion', function () {
            var clonedExpect = expect.clone()
                .addAssertion('to be a number after a short delay', function (expect, subject, delay) {
                    expect.errorMode = 'nested';

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
                    'to be rejected with',
                    "expected [ 0, false, 'abc' ]\n" +
                    "to have items satisfying to be a number after a short delay\n" +
                    "\n" +
                    "[\n" +
                    "  0,\n" +
                    "  false, // should be a number after a short delay\n" +
                    "         //   should be a number\n" +
                    "  'abc' // should be a number after a short delay\n" +
                    "        //   should be a number\n" +
                    "]");
            });
        });
    });

    describe('to have values satisfying assertion', function () {
        it('requires a third argument', function () {
            expect(function () {
                expect([1, 2, 3], 'to have values satisfying');
            }, 'to throw',
                   "expected [ 1, 2, 3 ] to have values satisfying\n" +
                   "  No matching assertion, did you mean:\n" +
                   "  <object> to have values satisfying <any+>\n" +
                   "  <object> to have values satisfying <assertion>");
        });

        it('only accepts objects and arrays as the target', function () {
            expect(function () {
                expect(42, 'to have values satisfying', function (value) {});
            }, 'to throw',
                   "expected 42 to have values satisfying function (value) {}\n" +
                   "  No matching assertion, did you mean:\n" +
                   "  <object> to have values satisfying <any+>\n" +
                   "  <object> to have values satisfying <assertion>");
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
                   "  expect(value, 'to equal', '0');\n" +
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
                   "  expect(item, 'to be a number');\n" +
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
            }, 'to throw', /bar: 1, \/\/ should not be a number/);
        });

        it('provides a detailed report of where failures occur', function () {
            expect(function () {
                expect({ foo: 0, bar: 1, baz: '2', qux: 3, quux: 4 }, 'to have values satisfying', function (value) {
                    expect(value, 'to be a number');
                    expect(value, 'to be less than', 4);
                });
            }, 'to throw',
                   "expected object to have values satisfying\n" +
                   "function (value) {\n" +
                   "  expect(value, 'to be a number');\n" +
                   "  expect(value, 'to be less than', 4);\n" +
                   "}\n" +
                   "\n" +
                   "{\n" +
                   "  foo: 0,\n" +
                   "  bar: 1,\n" +
                   "  baz: '2', // should be a number\n" +
                   "  qux: 3,\n" +
                   "  quux: 4 // should be less than 4\n" +
                   "}");
        });

        it('indents failure reports of nested assertions correctly', function () {
            expect(function () {
                expect({ foo: [0, 1, 2], bar: [4, '5', 6], baz: [7, 8, '9'] }, 'to have values satisfying', function (arr) {
                    expect(arr, 'to have items satisfying', function (item) {
                        expect(item, 'to be a number');
                    });
                });
            }, 'to throw',
                   "expected object to have values satisfying\n" +
                   "function (arr) {\n" +
                   "  expect(arr, 'to have items satisfying', function (item) {\n" +
                   "    expect(item, 'to be a number');\n" +
                   "  });\n" +
                   "}\n" +
                   "\n" +
                   "{\n" +
                   "  foo: [ 0, 1, 2 ],\n" +
                   "  bar: [\n" +
                   "    4,\n" +
                   "    '5', // should be a number\n" +
                   "    6\n" +
                   "  ],\n" +
                   "  baz: [\n" +
                   "    7,\n" +
                   "    8,\n" +
                   "    '9' // should be a number\n" +
                   "  ]\n" +
                   "}");
        });

        describe('delegating to an async assertion', function () {
            var clonedExpect = expect.clone()
                .addAssertion('to be a number after a short delay', function (expect, subject, delay) {
                    expect.errorMode = 'nested';

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
                    'to be rejected with',
                    "expected { 0: 0, 1: false, 2: 'abc' }\n" +
                    "to have values satisfying to be a number after a short delay\n" +
                    "\n" +
                    "{\n" +
                    "  0: 0,\n" +
                    "  1: false, // should be a number after a short delay\n" +
                    "            //   should be a number\n" +
                    "  2: 'abc' // should be a number after a short delay\n" +
                    "           //   should be a number\n" +
                    "}");
            });
        });
    });

    describe('to have keys satisfying assertion', function () {
        it('requires a third argument', function () {
            expect(function () {
                expect([1, 2, 3], 'to have keys satisfying');
            }, 'to throw',
                   "expected [ 1, 2, 3 ] to have keys satisfying\n" +
                   "  No matching assertion, did you mean:\n" +
                   "  <object> to have keys satisfying <any+>");
        });

        it('only accepts objects as the target', function () {
            expect(function () {
                expect(42, 'to have keys satisfying', function (key) {});
            }, 'to throw',
                   "expected 42 to have keys satisfying function (key) {}\n" +
                   "  No matching assertion, did you mean:\n" +
                   "  <object> to have keys satisfying <any+>");
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
            expect({ foo: 123 }, 'to have keys satisfying', function (key) {
                expect(key, 'to equal', 'foo');
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
                   "  expect(key, 'to match', /^[a-z]{3}$/);\n" +
                   "}\n" +
                   "  expected {} not to equal {}");
        });

        it('should work with non-enumerable keys returned by the getKeys function of the subject type', function () {
            expect(function () {
                expect(new Error('foo'), 'to have keys satisfying', /bar/);
            }, 'to throw',
                   "expected Error('foo') to have keys satisfying /bar/\n" +
                   "\n" +
                   "[\n" +
                   "  'message' // should match /bar/\n" +
                   "]");
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
            }, 'to throw', /'Baz', \/\/ should match/);
        });

        it('provides a detailed report of where failures occur', function () {
            expect(function () {
                expect({ foo: 0, bar: 1, baz: 2, qux: 3, quux: 4 }, 'to have keys satisfying', function (key) {
                    expect(key, 'to have length', 3);
                });
            }, 'to throw',
                   "expected { foo: 0, bar: 1, baz: 2, qux: 3, quux: 4 } to have keys satisfying\n" +
                   "function (key) {\n" +
                   "  expect(key, 'to have length', 3);\n" +
                   "}\n" +
                   "\n" +
                   "[\n" +
                   "  'foo',\n" +
                   "  'bar',\n" +
                   "  'baz',\n" +
                   "  'qux',\n" +
                   "  'quux' // should have length 3\n" +
                   "         //   expected 4 to be 3\n" +
                   "]");
        });

        describe('delegating to an async assertion', function () {
            var clonedExpect = expect.clone()
                .addAssertion('to be a sequence of as after a short delay', function (expect, subject, delay) {
                    expect.errorMode = 'nested';

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
                    'to be rejected with',
                    "expected { a: 1, foo: 2, bar: 3 }\n" +
                    "to have keys satisfying 'to be a sequence of as after a short delay'\n" +
                    "\n" +
                    "[\n" +
                    "  'a',\n" +
                    "  'foo', // should be a sequence of as after a short delay\n" +
                    "         //   should match /^a+$/\n" +
                    "  'bar' // should be a sequence of as after a short delay\n" +
                    "        //   should match /^a+$/\n" +
                    "]");
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
        }, 'to throw exception', "Unknown assertion 'to bee', did you mean: 'to be'");
    });

    describe('expect', function () {
        it('should catch non-Unexpected error caught from a nested assertion', function () {
            var clonedExpect = expect.clone().addAssertion('to foo', function (expect, subject) {
                return expect(subject, 'to bar');
            }).addAssertion('to bar', function (expect, subject) {
                return expect.promise(function (run) {
                    setTimeout(run(function () {
                        throw new Error('foo');
                    }), 1);
                });
            });

            return expect(function () {
                return clonedExpect('bar', 'to foo');
            }, 'to error', new Error('foo'));
        });

        it('should make the wrapped expect available as the context (legacy)', function () {
            var clonedExpect = expect.clone().addAssertion('to foo', function (expect, subject) {
                this.errorMode = 'nested';
                expect(this, 'to be', expect);
            });

            return expect(function () {
                return clonedExpect(undefined, 'to foo');
            }, 'not to error');
        });
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

        describe('when overriding an assertion', function () {
            it('uses the most specific version', function () {
                var clonedExpect = expect.clone()
                    .addAssertion('<string> to foo', function (expect, subject) {
                        expect.errorMode = 'bubble';
                        expect.fail('old');
                    }).addAssertion('<any> to foo', function (expect, subject) {
                        expect.errorMode = 'bubble';
                        expect.fail('new');
                    });

                expect(function () {
                    clonedExpect('bar', 'to foo');
                }, 'to throw', 'old');
            });

            describe('with the same specificity', function () {
                it('uses the most recently added version', function () {
                    var clonedExpect = expect.clone()
                        .addAssertion('to foo', function (expect, subject) {
                            expect.errorMode = 'bubble';
                            expect.fail('old');
                        }).addAssertion('to foo', function (expect, subject) {
                            expect.errorMode = 'bubble';
                            expect.fail('new');
                        });

                    expect(function () {
                        clonedExpect('bar', 'to foo');
                    }, 'to throw', 'new');
                });
            });
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
            it("must be a non-empty string", function () {
                expect(function () {
                    expect.addAssertion('', function () {});
                }, 'to throw', "Assertion patterns must be a non-empty string");
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
                }).addAssertion('<box> to be foo', function (expect, subject) {
                    expect(subject.value, 'to be', 'foo');
                }).addAssertion('<string> to be foo', function (expect, subject) {
                    expect(subject, 'to be', 'foo');
                }).addAssertion('<any> to be foo', function (expect, subject) {
                    expect(String(subject), 'to equal', 'foo');
                });
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
                            expect.errorMode = errorMode;
                            expect(subject, 'to be an array');
                            expect(subject, '[not] to equal', [].concat(subject).sort());
                        });
                });

                it('errorMode=nested nest the error message of expect failures in the assertion under the assertion standard message', function () {
                    errorMode = 'nested';
                    expect(function () {
                        clonedExpect(42, 'to be sorted');
                    }, 'to throw', 'expected 42 to be sorted\n  expected 42 to be an array');
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

                it('avoids repeating large subjects', function () {
                    var clonedExpect = expect.clone().addAssertion('to foobarbaz', function (expect, subject) {
                        expect.errorMode = 'nested';
                        expect(subject, 'to satisfy', {foo: 123});
                    });

                    expect(function () {
                        clonedExpect({
                            a: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                            b: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
                        }, 'to foobarbaz');
                    }, 'to throw',
                           "expected\n" +
                           "{\n" +
                           "  a: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',\n" +
                           "  b: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'\n" +
                           "}\n" +
                           "to foobarbaz\n" +
                           "  expected object to satisfy { foo: 123 }\n" +
                           "\n" +
                           "  {\n" +
                           "    a: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',\n" +
                           "    b: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'\n" +
                           "    // missing foo: 123\n" +
                           "  }"
                          );
                });
            });

            describe('for asynchronous custom assertions', function () {
                beforeEach(function () {
                    clonedExpect = expect.clone()
                        .addAssertion('to be sorted after delay', function (expect, subject, delay, done) {
                            expect.errorMode = errorMode;
                            expect.argsOutput.pop(); // Don't let the function be inspected in case of failure
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

                it('errorMode=diff only includes the diff', function (done) {
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
                            expect.errorMode = errorMode;
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
                        'to be rejected with',
                            'expected 42 to be sorted after delay 1\n  expected 42 to be an array'
                    );
                });

                it('errorMode=bubble bubbles uses the error message of expect failures in the assertion', function () {
                    errorMode = 'bubble';
                    return expect(
                        clonedExpect(42, 'to be sorted after delay', 1),
                        'to be rejected with',
                            'expected 42 to be an array'
                    );
                });

                it('errorMode=default uses the standard error message of the assertion', function () {
                    errorMode = 'default';
                    return expect(
                        clonedExpect(42, 'to be sorted after delay', 1),
                        'to be rejected with',
                            'expected 42 to be sorted after delay 1'
                    );
                });

                describe('nested inside another custom assertion', function () {
                    it('errorMode=nested nest the error message of expect failures in the assertion under the assertion standard message', function () {
                        errorMode = 'nested';
                        return expect(
                            clonedExpect(42, 'to be sorted after delay', 1),
                            'to be rejected with',
                                'expected 42 to be sorted after delay 1\n  expected 42 to be an array'
                        );
                    });

                    it('errorMode=bubble bubbles uses the error message of expect failures in the assertion', function () {
                        errorMode = 'bubble';
                        return expect(
                            clonedExpect(42, 'to be sorted after delay', 1),
                            'to be rejected with',
                                'expected 42 to be an array'
                        );
                    });

                    it('errorMode=diff only includes the diff', function () {
                        errorMode = 'diff';
                        return expect(
                            clonedExpect([3, 2, 1], 'to be sorted after delay', 1),
                            'to be rejected with',
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
                            'to be rejected with',
                                'expected 42 to be sorted after delay 1'
                        );
                    });
                });
            });

            describe('when the error mode of the assertion changes after the assertion has failed', function () {
                it('serializes the error with the error mode that was in effect at the time of its creation', function () {
                    var clonedExpect = expect.clone().addAssertion('to be equal to foo', function (expect, subject) {
                        expect.errorMode = 'nested';
                        try {
                            expect(subject, 'to equal', 'foo');
                        } catch (e) {
                            expect.errorMode = 'default';
                            throw e;
                        }
                    });

                    expect(function () {
                        clonedExpect('bar', 'to be equal to foo');
                    }, 'to throw',
                        "expected 'bar' to be equal to foo\n" +
                        "  expected 'bar' to equal 'foo'\n" +
                        "\n" +
                        "  -bar\n" +
                        "  +foo"
                    );
                });
            });
        });

        it('nested expects throws if the assertion does not exists', function () {
            var clonedExpect = expect.clone().addAssertion('to be foo', function theCustomAssertion(expect, subject) {
                expect(subject, 'to bee', 'foo');
            });
            expect(function () {
                clonedExpect('foo', 'to be foo');
            }, 'to throw exception', "Unknown assertion 'to bee', did you mean: 'to be'");
        });

        it('throws if the first parameter is not a string or an array', function () {
            expect(function () {
                expect.addAssertion(123, function (expect, subject) {});
            }, 'to throw',
                'Syntax: expect.addAssertion(<string|array[string]>, function (expect, subject, ...) { ... });'
            );
        });

        it('throws if the second parameter is not a function', function () {
            expect(function () {
                expect.addAssertion('<string> to be foo', 123);
            }, 'to throw',
                'Syntax: expect.addAssertion(<string|array[string]>, function (expect, subject, ...) { ... });'
            );
        });

        it('throws with an extended error message if the pre-Unexpected 10 string type syntax is used', function () {
            expect(function () {
                expect.addAssertion('string', '[not] to be foo', function (expect, subject) {});
            }, 'to throw',
                'Syntax: expect.addAssertion(<string|array[string]>, function (expect, subject, ...) { ... });\n' +
                'As of Unexpected 10, the syntax for adding assertions that apply only to specific\n' +
                'types has changed. See http://unexpected.js.org/api/addAssertion/'
            );
        });

        it('throws with an extended error message if the pre-Unexpected 10 array type syntax is used', function () {
            expect(function () {
                expect.addAssertion(['string', 'number'], '[not] to be foo', function (expect, subject) {});
            }, 'to throw',
                'Syntax: expect.addAssertion(<string|array[string]>, function (expect, subject, ...) { ... });\n' +
                'As of Unexpected 10, the syntax for adding assertions that apply only to specific\n' +
                'types has changed. See http://unexpected.js.org/api/addAssertion/'
            );
        });
    });

    describe('clone', function () {
        var clonedExpect;
        beforeEach(function () {
            clonedExpect = expect.clone();
            clonedExpect.addAssertion('<any> [not] to be the answer to the Ultimate Question of Life, the Universe, and Everything', function (expect, subject) {
                expect(subject, '[not] to equal', 42);
            });
        });

        it('changes to the clone does not affect the original instance', function () {
            expect(expect.assertions, 'not to have keys',
                   'to be the answer to the Ultimate Question of Life, the Universe, and Everything',
                   'not to be the answer to the Ultimate Question of Life, the Universe, and Everything');
        });

        it('assertions can be added to the clone', function () {
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
                }, 'to throw', "Unknown assertion 'to bee', did you mean: 'to be'");

                expect(function () {
                    clonedExpect(1, "to be the answer to the ultimate question of life, the universe, and everything");
                }, 'to throw', "Unknown assertion 'to be the answer to the ultimate question of life, the universe, and everything', did you mean: 'to be the answer to the Ultimate Question of Life, the Universe, and Everything'");
            });

            describe('but exists for another type', function () {
                it('explains that in the error message', function () {
                    clonedExpect.addAssertion('<array> to foobarquux', function (expect, subject) {
                        expect(subject, 'to equal', ['foobarquux']);
                    });
                    clonedExpect(['foobarquux'], 'to foobarquux');
                    expect(function () {
                        clonedExpect('foobarquux', 'to foobarquux');
                    }, 'to throw',
                           "expected 'foobarquux' to foobarquux\n" +
                           "  No matching assertion, did you mean:\n" +
                           "  <array> to foobarquux");
                });

                it('prefers to suggest a similarly named assertion defined for the correct type over an exact match defined for other types', function () {
                    clonedExpect.addAssertion('<array> to foo', function (expect, subject) {
                        expect(subject, 'to equal', ['foo']);
                    }).addAssertion('<string> to fooo', function (expect, subject) {
                        expect(subject, 'to equal', 'fooo');
                    });
                    expect(function () {
                        clonedExpect(['fooo'], 'to fooo');
                    }, 'to throw',
                           "expected [ 'fooo' ] to fooo\n" +
                           "  No matching assertion, did you mean:\n" +
                           "  <string> to fooo");

                    clonedExpect.addAssertion('<null> to fooo', function (expect, subject) {
                        expect(subject.message, 'to equal', 'fooo');
                    });
                    expect(function () {
                        clonedExpect(['fooo'], 'to fooo');
                    }, 'to throw',
                           "expected [ 'fooo' ] to fooo\n" +
                           "  No matching assertion, did you mean:\n" +
                           "  <null> to fooo\n" +
                           "  <string> to fooo");
                });

                it('prefers to suggest a similarly named assertion for a more specific type', function () {
                    clonedExpect.addType({
                        name: 'myType',
                        base: 'string',
                        identify: function (obj) {
                            return (/^a/).test(obj);
                        }
                    }).addType({
                        name: 'myMoreSpecificType',
                        base: 'myType',
                        identify: function (obj) {
                            return (/^aa/).test(obj);
                        }
                    }).addType({
                        name: 'myMostSpecificType',
                        base: 'myMoreSpecificType',
                        identify: function (obj) {
                            return (/^aaa/).test(obj);
                        }
                    }).addAssertion('<myType> to fooa', function () {
                    }).addAssertion('<myMoreSpecificType> to foob', function () {
                    }).addAssertion('<myMostSpecificType> to fooc', function () {});

                    expect(function () {
                        clonedExpect('a', 'to fooo');
                    }, 'to throw', "Unknown assertion 'to fooo', did you mean: 'to fooa'");

                    expect(function () {
                        clonedExpect('aa', 'to fooo');
                    }, 'to throw', "Unknown assertion 'to fooo', did you mean: 'to foob'");

                    expect(function () {
                        clonedExpect('aaa', 'to fooo');
                    }, 'to throw', "Unknown assertion 'to fooo', did you mean: 'to fooc'");

                    expect(function () {
                        clonedExpect('aaa', 'to fooaq');
                    }, 'to throw', "Unknown assertion 'to fooaq', did you mean: 'to fooc'");
                });
            });
        });

        describe('toString', function () {
            it('returns a string containing all the expanded assertions', function () {
                expect(clonedExpect.toString(), 'to contain', 'to be');
                expect(clonedExpect.toString(), 'to contain', '[not] to be');
                expect(clonedExpect.toString(), 'to contain', 'to be the answer to the Ultimate Question of Life, the Universe, and Everything');
                expect(clonedExpect.toString(), 'to contain', '[not] to be the answer to the Ultimate Question of Life, the Universe, and Everything');
            });
        });
    });

    describe('toString', function () {
        it('returns a string containing all the expanded assertions', function () {
            expect(expect.toString(), 'to contain', 'to be');
            expect(expect.toString(), 'to contain', '[not] to be');
        });
    });

    describe('use', function () {
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
            expect.use(plugin);
        });

        it('supports installPlugin as a legacy alias', function (done) {
            expect.installPlugin({
                name: 'test',
                installInto: function (expectInstance) {
                    expect(expectInstance, 'to be', expect);
                    done();
                }
            });
        });

        it('throws if the given arguments does not adhere to the plugin interface', function () {
            expect(function () {
                expect.use({});
            }, 'to throw', 'Plugins must be functions or adhere to the following interface\n' +
                   '{\n' +
                   '  name: <an optional plugin name>,\n' +
                   '  version: <an optional semver version string>,\n' +
                   '  dependencies: <an optional list of dependencies>,\n' +
                   '  installInto: <a function that will update the given expect instance>\n' +
                   '}');
        });

        it('allows the installation of a plugin given as an anonymous function', function () {
            var callCount = 0;
            var plugin = function () {
                callCount += 1;
            };
            expect.use(plugin);
            expect(callCount, 'to equal', 1);
            expect.use(plugin);
            expect(callCount, 'to equal', 1);
        });

        it('allows the installation of a plugin given as a named function', function () {
            var callCount = 0;
            var plugin = function myPlugin() {
                callCount += 1;
            };
            expect.use(plugin);
            expect(callCount, 'to equal', 1);
            expect.use(plugin);
            expect(callCount, 'to equal', 1);
        });

        it('fails if identically named, but different functions are installed', function () {
            expect.use(function myPlugin() {});
            expect(function () {
                expect.use(function myPlugin() {});
            }, 'to throw', "Another instance of the plugin 'myPlugin' is already installed. Please check your node_modules folder for unmet peerDependencies.");
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
            expect.use(pluginA);
            expect.use(pluginB);
        });

        it('throws if the plugin has unfulfilled plugin dependencies', function () {
            var pluginB = {
                name: 'PluginB',
                dependencies: ['PluginA'],
                installInto: function (expect) {}
            };

            expect(function () {
                expect.use(pluginB);
            }, 'to throw', 'PluginB requires plugin PluginA');

            var pluginC = {
                name: 'PluginC',
                dependencies: ['PluginA', 'PluginB'],
                installInto: function (expect) {}
            };

            expect(function () {
                expect.use(pluginC);
            }, 'to throw', 'PluginC requires plugins PluginA and PluginB');

            var pluginD = {
                name: 'PluginD',
                dependencies: ['PluginA', 'PluginB', 'PluginC'],
                installInto: function (expect) {}
            };

            expect(function () {
                expect.use(pluginD);
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
            expect.use(pluginA);
            var clonedExpect = expect.clone();
            clonedExpect.use(pluginB);
        });

        it('installing a plugin more than once is a no-op', function () {
            var callCount = 0;
            var plugin = {
                name: 'plugin',
                installInto: function () {
                    callCount += 1;
                }
            };
            expect.use(plugin);
            expect.use(plugin);
            expect.use(plugin);
            expect(callCount, 'to be', 1);
        });

        it('installing two different plugins that are identically named and have the same version (but not ===) will only install the first one', function () {
            var callCount1 = 0;
            var plugin1 = {
                name: 'plugin',
                version: '1.2.3',
                installInto: function () {
                    callCount1 += 1;
                }
            };
            var callCount2 = 0;
            var plugin2 = {
                name: 'plugin',
                version: '1.2.3',
                installInto: function () {
                    callCount2 += 1;
                }
            };
            expect.use(plugin1).use(plugin2);
            expect(callCount1, 'to be', 1);
            expect(callCount2, 'to be', 0);
        });

        it('should throw an error when installing two different plugins that are identically named and have different versions', function () {
            expect.use({
                name: 'plugin',
                version: '1.2.3',
                installInto: function () {}
            });
            expect(function () {
                expect.use({
                    name: 'plugin',
                    version: '1.5.6',
                    installInto: function () {}
                });
            }, 'to throw', "Another instance of the plugin 'plugin' is already installed (version 1.2.3, trying to install 1.5.6). Please check your node_modules folder for unmet peerDependencies.");
        });

        it('should throw an error when two identically named plugins where the first one has a version number', function () {
            expect.use({
                name: 'plugin',
                version: '1.2.3',
                installInto: function () {}
            });
            expect(function () {
                expect.use({
                    name: 'plugin',
                    installInto: function () {}
                });
            }, 'to throw', "Another instance of the plugin 'plugin' is already installed (version 1.2.3). Please check your node_modules folder for unmet peerDependencies.");
        });

        it('installing a version-less plugin with the same name as another plugin (but not ===) throws an error', function () {
            expect.use({
                name: 'test',
                installInto: function () {}
            });
            expect(function () {
                expect.use({
                    name: 'test',
                    installInto: function () {}
                });
            }, 'to throw', "Another instance of the plugin 'test' is already installed. Please check your node_modules folder for unmet peerDependencies.");
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
            }, 'to throw', 'A type must be given a non-empty name and must match ^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$');
        });

        it('throws an expection if the type has a name of "assertion"', function () {
            expect(function () {
                clonedExpect.addType({ name: 'assertion', identify: false });
            }, 'to throw', 'The type with the name assertion already exists');
        });

        it('throw an expection if the type does not specify a correct identify field', function () {
            expect(function () {
                clonedExpect.addType({ name: 'wat' });
            }, 'to throw', 'Type wat must specify an identify function or be declared abstract by setting identify to false');

            expect(function () {
                clonedExpect.addType({ name: 'wat', identify: true });
            }, 'to throw', 'Type wat must specify an identify function or be declared abstract by setting identify to false');

            expect(function () {
                clonedExpect.addType({ name: 'wat', identify: 'wat' });
            }, 'to throw', 'Type wat must specify an identify function or be declared abstract by setting identify to false');
        });

        it('throws an expection if a type of that name already exists', function () {
            expect(function () {
                clonedExpect.addType({ name: 'Promise', identify: false });
            }, 'to throw', 'The type with the name Promise already exists');
        });

        it('throws an expection if the type starts with .', function () {
            expect(function () {
                clonedExpect.addType({name: '.foo'});
            }, 'to throw', 'A type must be given a non-empty name and must match ^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$');
        });

        it('throws an expection if the type ends with .', function () {
            expect(function () {
                clonedExpect.addType({name: 'foo.'});
            }, 'to throw', 'A type must be given a non-empty name and must match ^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$');
        });

        it('throws an expection if the type contains non-alphanumeric chars', function () {
            expect(function () {
                clonedExpect.addType({name: 'ø'});
            }, 'to throw', 'A type must be given a non-empty name and must match ^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$');
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

            it('should include the diff when one is available', function () {
                expect(function () {
                    clonedExpect(box('abc'), 'to equal', box('abe'));
                }, 'to throw',
                    "expected box('abc') to equal box('abe')\n" +
                    "\n" +
                    "box(\n" +
                    "  'abc' // should equal 'abe'\n" +
                    "        // -abc\n" +
                    "        // +abe\n" +
                    ")"
                );
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
                base: 'string',
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
                   "        'a list': [ 1, 2, 3 ]\n" +
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
                   "    circular: { self: [Circular] }, this: { is: { deeply: { nested: ..., string: 'should be shown', 'a list': ... }, 'a list': [ 1, 2, 3 ] } }\n" +
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
                '  var foo = \'bar\';\n' +
                '  var quux = \'baz\';\n' +
                '  while (foo) {\n' +
                '    foo = foo\n' +
                '      .substr(0, foo.length - 1);\n' +
                '  }\n' +
                '  return quux;\n' +
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
            expect(function () {
                var foo = 123; return foo;
            }, 'to inspect as', 'function () { var foo = 123; return foo; }');
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
                       "⨯ expected 20 to be negative");
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
                       "⨯ expected 'foobarbaz' to be greater than 6\n" +
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
                    expect.errorMode = 'nested';

                    return expect.promise(function (run) {
                        setTimeout(run(function () {
                            expect(subject, 'to be a number');
                        }), 1);
                    });
                })
                .addAssertion('to be finite after a short delay', function (expect, subject) {
                    expect.errorMode = 'nested';

                    return expect.promise(function (run) {
                        setTimeout(run(function () {
                            expect(subject, 'to be finite');
                        }), 1);
                    });
                })
                .addAssertion('to be a string after a short delay', function (expect, subject) {
                    expect.errorMode = 'nested';

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
                    'to be rejected with',
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
                        'to be rejected with',
                            '⨯ expected false to be a number after a short delay and\n' +
                            '    expected false to be a number\n' +
                            '⨯ expected false to be finite after a short delay'
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
                        'to be rejected with',
                            '⨯ expected false to be a number after a short delay and\n' +
                            '    expected false to be a number\n' +
                            '⨯ expected false to be finite after a short delay\n' +
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
                       "  three: 3\n" +
                       "  // missing two: 2\n" +
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
                       "    blue: { ignorance: { of: 'illusion' } }\n" +
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

            it('omits comma after last actual entry', function () {
                expect(function () {
                    expect([0], 'to equal', [0, 1]);
                }, 'to throw', 'expected [ 0 ] to equal [ 0, 1 ]\n' +
                       '\n' +
                       '[\n' +
                       '  0\n' +
                       '  // missing 1\n' +
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
                       "expected [ 0, 1, { name: 'John', age: 34 }, 3, 2 ]\n" +
                       "to equal [ 0, { name: 'Jane', age: 24, children: 2 }, 3, 2 ]\n" +
                       "\n" +
                       "[\n" +
                       "  0,\n" +
                       "  1, // should be removed\n" +
                       "  {\n" +
                       "    name: 'John', // should equal 'Jane'\n" +
                       "                  // -John\n" +
                       "                  // +Jane\n" +
                       "    age: 34 // should equal 24\n" +
                       "    // missing children: 2\n" +
                       "  },\n" +
                       "  3,\n" +
                       "  2\n" +
                       "]");
            });

            it('does not considers object with a different structure candidates for diffing', function () {
                expect(function () {
                    expect([0, 1, { name: 'John'}, 3, 2], 'to equal', [0, { firstName: 'John', lastName: 'Doe' }, 3, 2]);
                }, 'to throw',
                       "expected [ 0, 1, { name: 'John' }, 3, 2 ]\n" +
                       "to equal [ 0, { firstName: 'John', lastName: 'Doe' }, 3, 2 ]\n" +
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

    describe('when passed as parameters to assertion', function () {
        it('should assert that the function invocation produces the correct output', function () {
            expect([3, 4], 'when passed as parameters to', add, 'to equal', 7);
        });

        it('should should provide the result as the fulfillment value if no assertion is provided', function () {
            return expect([3, 4], 'passed as parameters to', add).then(function (sum) {
                expect(sum, 'to equal', 7);
            });
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
                   'expected [ 3, 4 ]\n' +
                   'when passed as parameters to function add(a, b) { return a + b; } to equal 8\n' +
                   '  expected 7 to equal 8');

        });

        it('should combine with other assertions (showcase)', function () {
            expect([[1, 2], [3, 4]], 'to have items satisfying', 'when passed as parameters to', add, 'to be a number');
        });

        describe('when invoked as "when passed as parameter to"', function () {
            it('should pass the subject as a single parameter', function () {
                expect(1, 'when passed as parameter to', add.bind(null, 1), 'to equal', 2);
            });

            it('should should provide the result as the fulfillment value if no assertion is provided', function () {
                return expect(2, 'passed as parameter to', add.bind(null, 1)).then(function (sum) {
                    expect(sum, 'to equal', 3);
                });
            });

            it('should fail with the correct error message and diff', function () {
                function increment(n) {
                    return n + 1;
                }
                expect(function () {
                    expect(1, 'when passed as parameter to', increment, 'to equal', 3);
                }, 'to throw',
                       'expected 1\n' +
                       'when passed as parameter to function increment(n) { return n + 1; } to equal 3\n' +
                       '  expected 2 to equal 3'
                );
            });
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
                    'to be rejected with',
                        "expected [ 123 ] when passed as parameters to async\n" +
                        "function delayedIncrement(num, cb) {\n" +
                        "  setTimeout(function () {\n" +
                        "    if (typeof num === 'number') {\n" +
                        "      cb(null, num + 1);\n" +
                        "    } else {\n" +
                        "      cb(new Error('not a number'));\n" +
                        "    }\n" +
                        "  }, 1);\n" +
                        "} to equal 125\n" +
                        "  expected 124 to equal 125"
                );
            });

            it('should fail if the async function calls the callback with an error', function () {
                return expect(
                    expect([false], 'when passed as parameters to async', delayedIncrement, 'to equal', 125),
                    'to be rejected with',
                        "expected [ false ] when passed as parameters to async\n" +
                        "function delayedIncrement(num, cb) {\n" +
                        "  setTimeout(function () {\n" +
                        "    if (typeof num === 'number') {\n" +
                        "      cb(null, num + 1);\n" +
                        "    } else {\n" +
                        "      cb(new Error('not a number'));\n" +
                        "    }\n" +
                        "  }, 1);\n" +
                        "} to equal 125\n" +
                        "  expected Error('not a number') to be falsy"
                );
            });
        });
    });

    describe('to call the callback assertion', function () {
        it('should succeed when the callback is called synchronously', function () {
            return expect(function (cb) {
                cb();
            }, 'to call the callback');
        });

        it('should fail when the callback is called twice synchronously', function () {
            return expect(function () {
                return expect(function (cb) {
                    cb();
                    cb();
                }, 'to call the callback');
            }, 'to error',
                "expected\n" +
                "function (cb) {\n" +
                "  cb();\n" +
                "  cb();\n" +
                "}\n" +
                "to call the callback\n" +
                "  The callback was called twice"
            );
        });

        it('should fail when the callback is called twice asynchronously', function () {
            return expect(function () {
                return expect(function (cb) {
                    setTimeout(function () {
                        cb();
                        cb();
                    }, 0);
                }, 'to call the callback');
            }, 'to error',
                "expected\n" +
                "function (cb) {\n" +
                "  setTimeout(function () {\n" +
                "    cb();\n" +
                "    cb();\n" +
                "  }, 0);\n" +
                "}\n" +
                "to call the callback\n" +
                "  The callback was called twice"
            );
        });

        it('should return a promise that is fulfilled with the values passed to the callback', function () {
            return expect(function (cb) {
                cb(1, 2, 3, 4);
            }, 'to call the callback').then(function (args) {
                expect(args, 'to equal', [1, 2, 3, 4]);
            });
        });

        it('should return a promise that is compatible with Bluebird\'s spread feature', function () {
            return expect(function (cb) {
                cb(1, 2);
            }, 'to call the callback').spread(function (arg1, arg2) {
                expect(arg1, 'to equal', 1);
                expect(arg2, 'to equal', 2);
                expect(arguments, 'to satisfy', [1, 2]);
            });
        });

        it('should succeed when the callback is called asynchronously', function () {
            return expect(function (cb) {
                setTimeout(function () {
                    cb();
                });
            }, 'to call the callback');
        });

        it('should succeed when the callback is called with an error', function () {
            return expect(function (cb) {
                setTimeout(function () {
                    cb(new Error("don't mind me"));
                });
            }, 'to call the callback');
        });

        it('should fail if the function throws an exception', function () {
            return expect(function () {
                return expect(function (cb) {
                    throw new Error('argh');
                }, 'to call the callback');
            }, 'to error', 'argh');
        });

        describe('with error', function () {
            describe('with an expected error', function () {
                it('should succeed', function () {
                    return expect(function (cb) {
                        setTimeout(function () {
                            cb(new Error('bla'));
                        }, 0);
                    }, 'to call the callback with error', new Error('bla'));
                });

                it('should provide the error as the promise fulfillment value', function () {
                    return expect(function (cb) {
                        setTimeout(function () {
                            cb(new Error('bla'));
                        }, 0);
                    }, 'to call the callback with error', new Error('bla')).then(function (err) {
                        expect(err, 'to equal', new Error('bla'));
                    });
                });

                it('should provide the error as the promise fulfillment value when matching against an UnexpectedError', function () {
                    try {
                        expect(true, 'to be falsy');
                    } catch (err) {
                        return expect(function (cb) {
                            setTimeout(function () {
                                cb(err);
                            }, 0);
                        }, 'to call the callback with error', 'expected true to be falsy').then(function (err) {
                            expect(err, 'to have text message', 'expected true to be falsy');
                        });
                    }
                });

                describe('given as a string to be tested against the error message', function () {
                    it('should succeed', function () {
                        return expect(function (cb) {
                            setTimeout(function () {
                                cb(new Error('bla'));
                            }, 0);
                        }, 'to call the callback with error', 'bla');
                    });

                    it('should fail with a diff', function () {
                        return expect(function () {
                            return expect(function (cb) {
                                setTimeout(function () {
                                    cb(new Error('bla'));
                                }, 0);
                            }, 'to call the callback with error', 'quux');
                        }, 'to error',
                            "expected\n" +
                            "function (cb) {\n" +
                            "  setTimeout(function () {\n" +
                            "    cb(new Error('bla'));\n" +
                            "  }, 0);\n" +
                            "}\n" +
                            "to call the callback with error 'quux'\n" +
                            "  expected Error('bla') to satisfy 'quux'\n" +
                            "\n" +
                            "  -bla\n" +
                            "  +quux"
                        );
                    });
                });

                describe('given as a regular expression to be matched against the error message', function () {
                    it('should succeed', function () {
                        return expect(function (cb) {
                            setTimeout(function () {
                                cb(new Error('bla'));
                            }, 0);
                        }, 'to call the callback with error', /a/);
                    });

                    it('should fail with a diff', function () {
                        return expect(function () {
                            return expect(function (cb) {
                                setTimeout(function () {
                                    cb(new Error('bla'));
                                }, 0);
                            }, 'to call the callback with error', /q/);
                        }, 'to error',
                            "expected\n" +
                            "function (cb) {\n" +
                            "  setTimeout(function () {\n" +
                            "    cb(new Error('bla'));\n" +
                            "  }, 0);\n" +
                            "}\n" +
                            "to call the callback with error /q/\n" +
                            "  expected Error('bla') to satisfy /q/"
                        );
                    });

                    it('should support UnexpectedError instances', function () {
                        return expect(function () {
                            return expect(function (cb) {
                                setTimeout(function () {
                                    try {
                                        expect(false, 'to be truthy');
                                    } catch (err) {
                                        cb(err);
                                    }
                                }, 0);
                            }, 'to call the callback with error', /qqxqwxeqw/);
                        }, 'to error',
                            "expected\n" +
                            "function (cb) {\n" +
                            "  setTimeout(function () {\n" +
                            "    try {\n" +
                            "      expect(false, 'to be truthy');\n" +
                            "    } catch (err) {\n" +
                            "      cb(err);\n" +
                            "    }\n" +
                            "  }, 0);\n" +
                            "}\n" +
                            "to call the callback with error /qqxqwxeqw/\n" +
                            "  expected UnexpectedError(expected false to be truthy)\n" +
                            "  to have text message /qqxqwxeqw/\n" +
                            "    expected 'expected false to be truthy' to match /qqxqwxeqw/"
                        );
                    });
                });

                it('should fail with a diff when the error does not satisfy the expected error', function () {
                    return expect(function () {
                        return expect(function (cb) {
                            setTimeout(function () {
                                cb(new Error('foo'));
                            }, 0);
                        }, 'to call the callback with error', new Error('bla'));
                    }, 'to error',
                        "expected\n" +
                        "function (cb) {\n" +
                        "  setTimeout(function () {\n" +
                        "    cb(new Error('foo'));\n" +
                        "  }, 0);\n" +
                        "}\n" +
                        "to call the callback with error Error('bla')\n" +
                        "  expected Error('foo') to satisfy Error('bla')\n" +
                        "\n" +
                        "  Error({\n" +
                        "    message: 'foo' // should equal 'bla'\n" +
                        "                   // -foo\n" +
                        "                   // +bla\n" +
                        "  })"
                    );
                });

                it('should fail with a diff when no error was passed to the callback', function () {
                    return expect(function () {
                        return expect(function (cb) {
                            setTimeout(cb, 0);
                        }, 'to call the callback with error', new Error('bla'));
                    }, 'to error',
                        "expected function (cb) { setTimeout(cb, 0); }\n" +
                        "to call the callback with error Error('bla')"
                    );
                });
            });

            describe('without an expected error', function () {
                it('should succeed', function () {
                    return expect(function (cb) {
                        setTimeout(function () {
                            cb(new Error('bla'));
                        }, 0);
                    }, 'to call the callback with error');
                });

                it('should fail with a diff when no error was passed to the callback', function () {
                    return expect(function () {
                        return expect(function (cb) {
                            setTimeout(cb, 0);
                        }, 'to call the callback with error');
                    }, 'to error',
                        "expected function (cb) { setTimeout(cb, 0); } to call the callback with error"
                    );
                });
            });
        });

        describe('without error', function () {
            it('should throw if called with an expected error instance', function () {
                expect(function () {
                    return expect(function (cb) {
                        setTimeout(function () {
                            cb(new Error('bla'));
                        }, 0);
                    }, 'to call the callback without error', new Error('bla'));
                }, 'to throw',
                       "expected\n" +
                       "function (cb) {\n" +
                       "  setTimeout(function () {\n" +
                       "    cb(new Error('bla'));\n" +
                       "  }, 0);\n" +
                       "}\n" +
                       "to call the callback without error Error('bla')\n" +
                       "  No matching assertion, did you mean:\n" +
                       "  <function> to call the callback without error");
            });

            it('should succeed', function () {
                return expect(function (cb) {
                    return setTimeout(cb, 0);
                }, 'to call the callback without error');
            });

            it('should fail with a diff', function () {
                return expect(function () {
                    return expect(function (cb) {
                        return setTimeout(function () {
                            cb(new Error('wat'));
                        }, 0);
                    }, 'to call the callback without error');
                }, 'to error',
                    "expected\n" +
                    "function (cb) {\n" +
                    "  return setTimeout(function () {\n" +
                    "    cb(new Error('wat'));\n" +
                    "  }, 0);\n" +
                    "}\n" +
                    "to call the callback without error\n" +
                    "  called the callback with: Error('wat')"
                );
            });

            it('should return a promise that is fulfilled with the values passed to the callback excluding the first (falsy error) parameter', function () {
                return expect(function (cb) {
                    cb(null, 1, 2);
                }, 'to call the callback without error').then(function (args) {
                    expect(args, 'to equal', [1, 2]);
                });
            });

            it('should support UnexpectedError instances', function () {
                return expect(function () {
                    return expect(function (cb) {
                        setTimeout(function () {
                            try {
                                expect(false, 'to be truthy');
                            } catch (err) {
                                cb(err);
                            }
                        }, 0);
                    }, 'to call the callback without error');
                }, 'to error',
                    "expected\n" +
                    "function (cb) {\n" +
                    "  setTimeout(function () {\n" +
                    "    try {\n" +
                    "      expect(false, 'to be truthy');\n" +
                    "    } catch (err) {\n" +
                    "      cb(err);\n" +
                    "    }\n" +
                    "  }, 0);\n" +
                    "}\n" +
                    "to call the callback without error\n" +
                    "  called the callback with: expected false to be truthy"
                );
            });
        });
    });

    describe('expect.shift', function () {
        describe('when preserving the subject by passing no arguments', function () {
            it('should succeed', function () {
                var clonedExpect = expect.clone().addAssertion('<string> blabla <assertion>', function (expect, subject) {
                    return expect.shift();
                });
                clonedExpect('foo', 'blabla', 'to equal', 'foo');
            });

            it('should fail with a diff', function () {
                var clonedExpect = expect.clone().addAssertion('<string> blabla <assertion>', function (expect, subject) {
                    return expect.shift();
                });
                expect(function () {
                    clonedExpect('foo', 'blabla', 'to equal', 'foobar');
                }, 'to throw',
                  "expected 'foo' blabla to equal 'foobar'\n" +
                  "\n" +
                  "-foo\n" +
                  "+foobar"
                );
            });
        });

        it('should support calling shift multiple times', function () {
            var clonedExpect = expect.clone().addAssertion('<number> up to [and including] <number> <assertion>', function (expect, subject, value) {
                expect.errorMode = 'nested';
                var numbers = [];
                for (var i = subject ; i < (expect.flags['and including'] ? value + 1 : value) ; i += 1) {
                    numbers.push(i);
                }
                return expect.promise.all(numbers.map(function (number) {
                    return expect.promise(function () {
                        return expect.shift(number);
                    });
                }));
            });

            return expect(function () {
                clonedExpect(5, 'up to and including', 100, 'to be within', 1, 90);
            }, 'to error',
                'expected 5 up to and including 100 to be within 1, 90\n' +
                '  expected 91 to be within 1..90'
            );
        });

        describe('when substituting a different subject by passing a single argument', function () {
            it('should succeed', function () {
                var clonedExpect = expect.clone().addAssertion('<string> when appended with bar <assertion>', function (expect, subject) {
                    return expect.shift(subject + 'bar');
                });
                clonedExpect('foo', 'when appended with bar', 'to equal', 'foobar');
            });

            it('should fail with a diff', function () {
                var clonedExpect = expect.clone().addAssertion('<string> when appended with bar <assertion>', function (expect, subject) {
                    return expect.shift(subject + 'bar');
                });
                expect(function () {
                    clonedExpect('crow', 'when appended with bar', 'to equal', 'foobar');
                }, 'to throw',
                  "expected 'crow' when appended with bar to equal 'foobar'\n" +
                  "\n" +
                  "-crowbar\n" +
                  "+foobar"
                );
            });
        });

        it('should identify the assertions even when the next assertion fails before shifting', function () {
            var clonedExpect = expect.clone().addAssertion('<string> when appended with bar <assertion>', function (expect, subject) {
                if (subject === 'crow') {
                    expect.fail();
                }
                return expect.shift(subject + 'bar');
            });
            expect(function () {
                clonedExpect('crow', 'when appended with bar', 'when appended with bar', 'to equal', 'foobarbar');
            }, 'to throw',
              "expected 'crow' when appended with bar when appended with bar to equal 'foobarbar'"
          );
        });

        it('supports the legacy 3 argument version', function () {
            var clonedExpect = expect.clone().addAssertion('<string> when prepended with foo <assertion>', function (expect, subject) {
                return this.shift(expect, 'foo' + subject, 0);
            });
            clonedExpect('foo', 'when prepended with foo', expect.it('to equal', 'foofoo'));
        });

        describe('with the legacy 2 argument version', function () {
            it('inspects multiple arguments correctly', function () {
                var clonedExpect = expect.clone().addAssertion('<string> when surrounded by <string> <string> <assertion>', function (expect, subject) {
                    return expect.shift('foo' + subject, 2);
                });

                return expect(function () {
                    clonedExpect('bar', 'when surrounded by', 'foo', 'quux', 'to be a number');
                }, 'to throw',
                    "expected 'bar' when surrounded by 'foo', 'quux' to be a number"
                );
            });
        });

        describe('with an expect.it function as the next argument', function () {
            it('should succeed', function () {
                var clonedExpect = expect.clone().addAssertion('<string> when prepended with foo <assertion>', function (expect, subject) {
                    return expect.shift('foo' + subject);
                });
                clonedExpect('foo', 'when prepended with foo', expect.it('to equal', 'foofoo'));
            });
        });

        it('should fail when the next argument is a non-expect.it function', function () {
            var clonedExpect = expect.clone().addAssertion('<string> when prepended with foo <assertion>', function (expect, subject) {
                return expect.shift('foo' + subject);
            });
            expect(function () {
                clonedExpect('foo', 'when prepended with foo', function () {});
            }, 'to throw',
                "expected 'foo' when prepended with foo function () {}\n" +
                "  No matching assertion, did you mean:\n" +
                "  <string> when prepended with foo <assertion>"
            );
        });

        describe('with an async assertion', function () {
            it('should succeed', function () {
                return expect(42, 'when delayed a little bit', 'to be a number');
            });

            it('should fail with a diff', function () {
                return expect(
                    expect(false, 'when delayed a little bit', 'to be a number'),
                    'to be rejected with',
                    'expected false when delayed a little bit to be a number'
                );
            });
        });
    });

    describe('fail', function () {
        describe('with an object', function () {
            it('should support specifying a label', function () {
                expect(function () {
                    expect.fail({
                        label: 'to yadda'
                    });
                }, 'to throw', {
                    label: 'to yadda'
                });
            });

            it('should set additional properties on the thrown error', function () {
                expect(function () {
                    expect.fail({
                        foobarquux: 123
                    });
                }, 'to throw', {
                    foobarquux: 123
                });
            });

            it('should support message passed as a string', function () {
                expect(function () {
                    expect.fail({
                        message: 'hey'
                    });
                }, 'to throw', {
                    message: '\nhey'
                });
            });

            it('should support message passed as a MagicPen instance', function () {
                expect(function () {
                    expect.fail({
                        message: expect.output.clone().text('hey')
                    });
                }, 'to throw', {
                    message: '\nhey'
                });
            });
        });
    });

    describe('async', function () {
        before(function () {
            expect = expect.clone()
                .addAssertion('to be sorted after delay', function (expect, subject, delay) {
                    expect.errorMode = 'nested';

                    return expect.promise(function (run) {
                        setTimeout(run(function () {
                            expect(subject, 'to be an array');
                            expect(subject, 'to equal', [].concat(subject).sort());
                        }), delay);
                    });
                })
                .addAssertion('to be ordered after delay', function (expect, subject) {
                    expect.errorMode = 'nested';
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
                'to be rejected with',
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
                'to be rejected with',
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
                expect(err.getErrorMessage({ format: 'text' }).toString(), 'to equal',
                    'expected [ 1, 3, 2 ] to be ordered after delay\n' +
                    '  expected [ 1, 3, 2 ] to be sorted after delay 20\n' +
                    '    expected [ 1, 3, 2 ] to equal [ 1, 2, 3 ]\n' +
                    '\n' +
                    '    [\n' +
                    '      1,\n' +
                    '      3, // should equal 2\n' +
                    '      2 // should equal 3\n' +
                    '    ]');

                workQueue.onUnhandledRejection = null;
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

        it('should return the fulfilled promise even if it is oathbreakable', function () {
            var clonedExpect = expect.clone().addAssertion('to foo', function (expect, subject, value) {
                return expect.promise(function () {
                    expect(subject, 'to equal', 'foo');
                    return 'bar';
                });
            });
            expect(clonedExpect('foo', 'to foo'), 'to be fulfilled with', 'bar');
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

        it('should return a promise fulfilled with the return value when an assertion returns a non-promise value', function () {
            var clonedExpect = expect.clone().addAssertion('to foo', function (expect, subject, value) {
                expect(subject, 'to equal', 'foo');
                return 'bar';
            });
            clonedExpect('foo', 'to foo').then(function (value) {
                expect(value, 'to equal', 'bar');
            });
        });

        describe('#and', function () {
            describe('with a synchronous assertion', function () {
                it('should succeed', function () {
                    return expect('foo', 'to equal', 'foo').and('to be a string');
                });

                it('should succeed when another clause is added', function () {
                    return expect('foo', 'to equal', 'foo').and('to be a string').and('to match', /^f/);
                });

                it('should work without returning the promise', function () {
                    expect('foo', 'to equal', 'foo').and('to be a string');
                });

                it('should fail with a diff', function () {
                    return expect(function () {
                        return expect('foo', 'to equal', 'foo').and('to be a number');
                    }, 'to error', "expected 'foo' to be a number");
                });

                it('should fail with a diff even when the promise is not returned', function () {
                    return expect(function () {
                        expect('foo', 'to equal', 'foo').and('to be a number');
                    }, 'to error', "expected 'foo' to be a number");
                });

                describe('with an expect.it as the second clause', function () {
                    it('should succeed', function () {
                        return expect('foo', 'to equal', 'foo').and(expect.it('to be a string'));
                    });

                    it('should fail with a diff', function () {
                        return expect(function () {
                            return expect('foo', 'to equal', 'foo').and(expect.it('to be a number'));
                        }, 'to error', "expected 'foo' to be a number");
                    });
                });
            });

            describe('with an asynchronous assertion anded with a synchronous one', function () {
                it('should succeed', function () {
                    return expect('foo', 'when delayed', 5, 'to equal', 'foo').and('to be a string');
                });

                it('should succeed when another clause is added', function () {
                    return expect('foo', 'when delayed', 5, 'to equal', 'foo').and('when delayed', 5, 'to be a string').and('when delayed', 2, 'to be a string');
                });

                it('should fail with a diff when the asynchronous assertion fails', function () {
                    return expect(function () {
                        return expect('foo', 'when delayed', 5, 'to equal', 'bar').and('to be a string');
                    }, 'to error',
                        "expected 'foo' when delayed 5 to equal 'bar'\n" +
                        "\n" +
                        "-foo\n" +
                        "+bar"
                    );
                });

                it('should fail with a diff when the synchronous assertion fails', function () {
                    return expect(function () {
                        return expect('foo', 'when delayed', 5, 'to equal', 'foo').and('to be a number');
                    }, 'to error', "expected 'foo' to be a number");
                });

                it('should fail with a diff when both assertions fail', function () {
                    return expect(function () {
                        return expect('foo', 'when delayed', 5, 'to equal', 'bar').and('to be a number');
                    }, 'to error',
                        "expected 'foo' when delayed 5 to equal 'bar'\n" +
                        "\n" +
                        "-foo\n" +
                        "+bar"
                    );
                });

                describe('with an expect.it as the second clause', function () {
                    it('should succeed', function () {
                        return expect('foo', 'when delayed', 5, 'to equal', 'foo').and(expect.it('to be a string'));
                    });

                    it('should succeed when more clauses are added', function () {
                        return expect('foo', 'when delayed', 5, 'to equal', 'foo').and(expect.it('to be a string')).and('to be a string').and('to be a string');
                    });

                    it('should fail with a diff', function () {
                        return expect(function () {
                            return expect('foo', 'when delayed', 5, 'to equal', 'foo').and(expect.it('to be a number'));
                        }, 'to error', "expected 'foo' to be a number");
                    });
                });
            });

            describe('with a nested asynchronous assertion', function () {
                it('should mount the and method on a promise returned from a nested assertion', function () {
                    var clonedExpect = expect.clone().addAssertion('to foo', function (expect, subject) {
                        return expect(subject, 'to bar').and('to equal', 'foo');
                    }).addAssertion('to bar', function (expect, subject) {
                        return expect.promise(function (run) {
                            setTimeout(run(function () {
                                expect(subject, 'to be truthy');
                            }), 1);
                        });
                    });
                    return clonedExpect('foo', 'to foo');
                });
            });
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

        describe('#inspect', function () {
            var originalDefaultFormat = expect.output.constructor.defaultFormat;
            beforeEach(function () {
                expect.output.constructor.defaultFormat = 'text';
            });
            afterEach(function () {
                expect.output.constructor.defaultFormat = originalDefaultFormat;
            });

            it('should inspect a fulfilled promise without a value', function () {
                expect(expect.promise(function () {
                    expect(2, 'to equal', 2);
                }).inspect(), 'to equal', 'Promise (fulfilled)');
            });

            it('should inspect a fulfilled promise with a value', function () {
                expect(expect.promise(function () {
                    return 123;
                }).inspect(), 'to equal', 'Promise (fulfilled) => 123');
            });

            it('should inspect a pending promise', function () {
                var asyncPromise = expect('foo', 'when delayed a little bit', 'to equal', 'foo');
                expect(asyncPromise.inspect(), 'to equal', 'Promise (pending)');
                return asyncPromise;
            });

            it('should inspect a rejected promise without a reason', function () {
                var promise = expect.promise(function (resolve, reject) {
                    reject();
                });

                return promise.caught(function () {
                    expect(promise.inspect(), 'to equal', 'Promise (rejected)');
                });
            });

            it('should inspect a rejected promise with a reason', function () {
                var promise = expect.promise(function (resolve, reject) {
                    setTimeout(function () {
                        reject(new Error('argh'));
                    }, 0);
                });

                return promise.caught(function () {
                    expect(promise.inspect(), 'to equal', "Promise (rejected) => Error('argh')");
                });
            });
        });

        describe('#settle', function () {
            it('should support non-Promise leaves', function () {
                return expect.promise.settle({
                    a: 123
                }).then(function (promises) {
                    expect(promises, 'to equal', []);
                });
            });
        });
    });

    describe('function type', function () {
        it('should inspect an empty function correctly', function () {
            expect(function () {}, 'to inspect as',
                'function () {}'
            );
        });

        it('should inspect an function with just a newline correctly', function () {
            expect(function () {
            }, 'to inspect as',
                'function () {}'
            );
        });

        it('should inspect a one-line function correctly', function () {
            expect(function () {
                var a = 123; a = 456;
            }, 'to inspect as', 'function () { var a = 123; a = 456; }');
        });

        it('should inspect a short one-line function with leading and trailing newline correctly', function () {
            expect(function () {
                var a = 123; a = 456;
            }, 'to inspect as',
                'function () { var a = 123; a = 456; }'
            );
        });

        it('should inspect a long one-line function with leading and trailing newline correctly', function () {
            expect(function () {
                var a = 123 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2; a = 456;
            }, 'to inspect as',
                'function () {\n' +
                '  var a = 123 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2; a = 456;\n' +
                '}'
            );
        });

        function singleLineWithComment() {
            var a = 123; a = 456; // foo
        }

        var phantomJsBug = singleLineWithComment.toString().indexOf('// foo;') !== -1;

        it.skipIf(phantomJsBug, 'should inspect a short one-line function with leading and trailing newline correctly and a C++-style comment correctly', function () {
            expect(function () {
                var a = 123; a = 456; // foo
            }, 'to inspect as',
                'function () {\n' +
                '  var a = 123; a = 456; // foo\n' +
                '}'
            );
        });

        it('should reindent a function with an indentation size of 4', function () {
            expect(function () {
                var a = 4;
                if (a === 1) {
                    a();
                }
            }, 'to inspect as',
                'function () {\n' +
                '  var a = 4;\n' +
                '  if (a === 1) {\n' +
                '    a();\n' +
                '  }\n' +
                '}'
            );
        });

        it('should reindent a function with an indentation size of 3', function () {
            // jscs:disable
            expect(function () {
               var a = 4;
               if (a === 1) {
                  a();
               }
            }, 'to inspect as',
                'function () {\n' +
                '  var a = 4;\n' +
                '  if (a === 1) {\n' +
                '    a();\n' +
                '  }\n' +
                '}');
            // jscs:enable
        });

        it('should reindent a function with an indentation size of 1', function () {
            // jscs:disable
            expect(function () {
             var a = 4;
             if (a === 1) {
              a();
             }
            }, 'to inspect as',
                'function () {\n' +
                '  var a = 4;\n' +
                '  if (a === 1) {\n' +
                '    a();\n' +
                '  }\n' +
                '}');
            // jscs:enable
        });
    });

    describe('with an assertion that has a non-standard name', function () {
        it('should render the error message sanely in an annotation block inside a satisfy diff', function () {
            var clonedExpect = expect.clone().addAssertion('foobar', function (expect, subject) {
                expect(subject, 'to equal', 'foobar');
            });
            expect(function () {
                clonedExpect([ 'barfoo' ], 'to have items satisfying', 'foobar');
            }, 'to throw',
                "expected [ 'barfoo' ] to have items satisfying foobar\n" +
                "\n" +
                "[\n" +
                "  'barfoo' // expected: foobar\n" +
                "           //\n" +
                "           // -barfoo\n" +
                "           // +foobar\n" +
                "]"
            );
        });
    });

    describe('styles', function () {
        describe('#magicPen', function () {
            it('should inspect an empty MagicPen instance', function () {
                expect(expect.output.clone().magicPen(expect.output.clone()).toString(), 'to equal', 'magicpen()');
            });
        });

        describe('#errorName', function () {
            it('should inspect an object with an anoymous constructor', function () {
                expect(expect.output.clone().errorName(Object.create(null)).toString(), 'to equal', 'Error');
            });
        });

        describe('#appendItems', function () {
            it('should inspect multiple items', function () {
                var magicPen = expect.output.clone();
                magicPen.addStyle('appendInspected', function (arg) {
                    this.text(arg);
                });
                expect(magicPen.appendItems([1, 2], ',').toString(), 'to equal', '1,2');
            });

            it('should default to a separator of the empty string', function () {
                var magicPen = expect.output.clone();
                magicPen.addStyle('appendInspected', function (arg) {
                    this.text(arg);
                });
                expect(magicPen.appendItems([1, 2]).toString(), 'to equal', '12');
            });
        });
    });

    describe('outputFormat', function () {
        describe('when given a format', function () {
            it('decides the output that will be used for serializing errors', function () {
                expect(function () {
                    var clonedExpect = expect.clone().outputFormat('html');
                    clonedExpect(42, 'to equal', 24);
                }, 'to throw', {
                    htmlMessage:
                        '<div style="font-family: monospace; white-space: nowrap">\n' +
                        '  <div><span style="color: red; font-weight: bold">expected</span>&nbsp;<span style="color: #0086b3">42</span>&nbsp;<span style="color: red; font-weight: bold">to&nbsp;equal</span>&nbsp;<span style="color: #0086b3">24</span></div>\n' +
                        '</div>'
                });

                expect(function () {
                    var clonedExpect = expect.clone().outputFormat('ansi');
                    clonedExpect(42, 'to equal', 24);
                }, 'to throw', {
                    message: '\n\x1b[31m\x1b[1mexpected\x1b[22m\x1b[39m 42 \x1b[31m\x1b[1mto equal\x1b[22m\x1b[39m 24'
                });
            });
        });
    });

    describe('with the next assertion as a continuation', function () {
        describe('with "to have items satisfying" followed by another assertion', function () {
            it('should succeed', function () {
                return expect([ 123 ], 'to have items satisfying to be a number');
            });

            it('should fail', function () {
                return expect(function () {
                    return expect([ 123 ], 'to have items satisfying to be a boolean');
                }, 'to error',
                    "expected [ 123 ] to have items satisfying to be a boolean\n" +
                    "\n" +
                    "[\n" +
                    "  123 // should be a boolean\n" +
                    "]"
                );
            });
        });

        describe('with "to have items satisfying" twice followed by another assertion', function () {
            it('should succeed', function () {
                return expect([ [ 123 ] ], 'to have items satisfying to have items satisfying to be a number');
            });

            it('should fail', function () {
                return expect(function () {
                    return expect([ [ 123 ] ], 'to have items satisfying to have items satisfying to be a boolean');
                }, 'to error',
                    "expected [ [ 123 ] ]\n" +
                    "to have items satisfying to have items satisfying to be a boolean\n" +
                    "\n" +
                    "[\n" +
                    "  [\n" +
                    "    123 // should be a boolean\n" +
                    "  ]\n" +
                    "]"
                );
            });
        });

        describe('with "when rejected" followed by another assertion', function () {
            it('should succeed', function () {
                return expect(expect.promise.reject(123), 'when rejected to satisfy', 123);
            });

            it('should fail', function () {
                return expect(function () {
                    return expect(expect.promise.reject(true), 'when rejected to be a number');
                }, 'to error',
                    "expected Promise (rejected) => true when rejected to be a number\n" +
                    "  expected true to be a number"
                );
            });
        });

        describe('with "when rejected" twice followed by another assertion', function () {
            it('should succeed', function () {
                return expect(expect.promise.reject(expect.promise.reject(123)), 'when rejected when rejected to satisfy', 123);
            });

            it('should fail', function () {
                return expect(function () {
                    return expect(expect.promise.reject(expect.promise.reject(true)), 'when rejected when rejected to be a number');
                }, 'to error',
                    "expected Promise (rejected) => Promise (rejected) => true\n" +
                    "when rejected when rejected to be a number\n" +
                    "  expected Promise (rejected) => true when rejected to be a number\n" +
                    "    expected true to be a number"
                );
            });
        });
    });
});
