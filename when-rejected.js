function isPromise(obj) {
    return obj && typeof obj.then === 'function';
}
if (typeof unexpected === 'undefined') {
    unexpected = require('unexpected');
    unexpected.output.preferredWidth = 80;
}
describe('when-rejected', function () {
    it('example #1 (documentation/assertions/Promise/when-rejected.md:4:1) should succeed', function () {
        var expect = unexpected.clone();
        var __returnValue1;
        example1:
            try {
                var rejectedPromise = expect.promise(function (resolve, reject) {
                    setTimeout(function () {
                        reject(new Error('argh'));
                    });
                });
            } catch (err) {
                return endOfExample1(err);
            }
        if (isPromise(__returnValue1)) {
            return __returnValue1.then(function () {
                endOfExample1();
            }, endOfExample1);
        } else {
            return endOfExample1();
        }
        function endOfExample1(err) {
            if (err) {
                expect.fail(err);
            }
        }
    });
    it('example #2 (documentation/assertions/Promise/when-rejected.md:12:1) should succeed', function () {
        var expect = unexpected.clone();
        var __returnValue1;
        example1:
            try {
                var rejectedPromise = expect.promise(function (resolve, reject) {
                    setTimeout(function () {
                        reject(new Error('argh'));
                    });
                });
            } catch (err) {
                return endOfExample1(err);
            }
        if (isPromise(__returnValue1)) {
            return __returnValue1.then(function () {
                endOfExample1();
            }, endOfExample1);
        } else {
            return endOfExample1();
        }
        function endOfExample1(err) {
            var __returnValue2;
            example2:
                try {
                    __returnValue2 = expect(rejectedPromise, 'when rejected', 'to equal', new Error('argh'));
                    break example2;
                } catch (err) {
                    return endOfExample2(err);
                }
            if (isPromise(__returnValue2)) {
                return __returnValue2.then(function () {
                    endOfExample2();
                }, endOfExample2);
            } else {
                return endOfExample2();
            }
            function endOfExample2(err) {
                if (err) {
                    expect.fail(err);
                }
            }
        }
    });
    it('example #3 (documentation/assertions/Promise/when-rejected.md:18:1) should succeed', function () {
        var expect = unexpected.clone();
        var __returnValue1;
        example1:
            try {
                var rejectedPromise = expect.promise(function (resolve, reject) {
                    setTimeout(function () {
                        reject(new Error('argh'));
                    });
                });
            } catch (err) {
                return endOfExample1(err);
            }
        if (isPromise(__returnValue1)) {
            return __returnValue1.then(function () {
                endOfExample1();
            }, endOfExample1);
        } else {
            return endOfExample1();
        }
        function endOfExample1(err) {
            var __returnValue2;
            example2:
                try {
                    __returnValue2 = expect(rejectedPromise, 'when rejected', 'to equal', new Error('argh'));
                    break example2;
                } catch (err) {
                    return endOfExample2(err);
                }
            if (isPromise(__returnValue2)) {
                return __returnValue2.then(function () {
                    endOfExample2();
                }, endOfExample2);
            } else {
                return endOfExample2();
            }
            function endOfExample2(err) {
                var __returnValue3;
                example3:
                    try {
                        __returnValue3 = expect(rejectedPromise, 'when rejected', expect.it('to have message', 'argh'));
                        break example3;
                    } catch (err) {
                        return endOfExample3(err);
                    }
                if (isPromise(__returnValue3)) {
                    return __returnValue3.then(function () {
                        endOfExample3();
                    }, endOfExample3);
                } else {
                    return endOfExample3();
                }
                function endOfExample3(err) {
                    if (err) {
                        expect.fail(err);
                    }
                }
            }
        }
    });
    it('example #4 (documentation/assertions/Promise/when-rejected.md:24:1) should fail with the correct error message', function () {
        var expect = unexpected.clone();
        var __returnValue1;
        example1:
            try {
                var rejectedPromise = expect.promise(function (resolve, reject) {
                    setTimeout(function () {
                        reject(new Error('argh'));
                    });
                });
            } catch (err) {
                return endOfExample1(err);
            }
        if (isPromise(__returnValue1)) {
            return __returnValue1.then(function () {
                endOfExample1();
            }, endOfExample1);
        } else {
            return endOfExample1();
        }
        function endOfExample1(err) {
            var __returnValue2;
            example2:
                try {
                    __returnValue2 = expect(rejectedPromise, 'when rejected', 'to equal', new Error('argh'));
                    break example2;
                } catch (err) {
                    return endOfExample2(err);
                }
            if (isPromise(__returnValue2)) {
                return __returnValue2.then(function () {
                    endOfExample2();
                }, endOfExample2);
            } else {
                return endOfExample2();
            }
            function endOfExample2(err) {
                var __returnValue3;
                example3:
                    try {
                        __returnValue3 = expect(rejectedPromise, 'when rejected', expect.it('to have message', 'argh'));
                        break example3;
                    } catch (err) {
                        return endOfExample3(err);
                    }
                if (isPromise(__returnValue3)) {
                    return __returnValue3.then(function () {
                        endOfExample3();
                    }, endOfExample3);
                } else {
                    return endOfExample3();
                }
                function endOfExample3(err) {
                    var __returnValue4;
                    example4:
                        try {
                            var fulfilledPromise = expect.promise(function (resolve, reject) {
                                setTimeout(function () {
                                    resolve(123);
                                });
                            });
                            __returnValue4 = expect(fulfilledPromise, 'when rejected', 'to have message', 'argh');
                            break example4;
                        } catch (err) {
                            return endOfExample4(err);
                        }
                    if (isPromise(__returnValue4)) {
                        return __returnValue4.then(function () {
                            endOfExample4();
                        }, endOfExample4);
                    } else {
                        return endOfExample4();
                    }
                    function endOfExample4(err) {
                        if (err) {
                            expect(err, 'to have message', 'expected Promise (fulfilled) => 123 when rejected to have message \'argh\'\n  Promise (fulfilled) => 123 unexpectedly fulfilled with 123');
                        } else {
                            throw new Error('expected example 1 to fail');
                        }
                    }
                }
            }
        }
    });
});var fileName = "documentation/assertions/Promise/when-rejected.md";
