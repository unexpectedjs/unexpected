/*global expect*/
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
