/*global unexpected:true, expect:true, setImmediate:true, weknowhow*/
unexpected = typeof weknowhow === 'undefined' ?
    require('../lib/').clone() :
    weknowhow.expect.clone();

unexpected.output.preferredWidth = 80;

unexpected.addAssertion('<any> to inspect as <string>', function (expect, subject, value) {
    expect(expect.inspect(subject).toString(), 'to equal', value);
});

expect = unexpected.clone();

if (typeof setImmediate !== 'function') {
    setImmediate = function (cb) {
        setTimeout(cb, 0);
    };
}
