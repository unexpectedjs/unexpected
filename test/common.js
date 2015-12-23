/*global unexpected:true, expect:true, setImmediate:true, weknowhow*/
unexpected = typeof weknowhow === 'undefined' ?
    require('../lib/').clone() :
    weknowhow.expect.clone();

expect = unexpected.clone();

unexpected.output.preferredWidth = 80;

if (typeof setImmediate !== 'function') {
    setImmediate = function (cb) {
        setTimeout(cb, 0);
    };
}
