/*global unexpected:true, expect:true, setImmediate:true, weknowhow*/
/* eslint no-unused-vars: "off" */
unexpected = typeof weknowhow === 'undefined' ?
    require('../lib/').clone() :
    weknowhow.expect.clone();

unexpected.output.preferredWidth = 80;

unexpected.addAssertion('<any> to inspect as <string>', function (expect, subject, value) {
    expect(expect.inspect(subject).toString(), 'to equal', value);
}).addAssertion('<any> when delayed a little bit <assertion>', function (expect, subject) {
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
});

expect = unexpected.clone();

if (typeof setImmediate !== 'function') {
    setImmediate = function (cb) {
        setTimeout(cb, 0);
    };
}
