/* global ArrayBuffer, Int8Array, Uint8Array, Uint8ClampedArray,
Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array,
Float64Array, DataView, global, process, GLOBAL, root, Buffer,
setTimeout, setInterval, clearTimeout, clearInterval, setImmediate,
clearImmediate, console */
var vm = require('vm');

module.exports = function (context) {
    var baseContext = {
        ArrayBuffer: ArrayBuffer,
        Int8Array: Int8Array,
        Uint8Array: Uint8Array,
        Uint8ClampedArray: Uint8ClampedArray,
        Int16Array: Int16Array,
        Uint16Array: Uint16Array,
        Int32Array: Int32Array,
        Uint32Array: Uint32Array,
        Float32Array: Float32Array,
        Float64Array: Float64Array,
        DataView: DataView,
        global: global,
        process: process,
        GLOBAL: GLOBAL,
        root: root,
        Buffer: Buffer,
        setTimeout: setTimeout,
        setInterval: setInterval,
        clearTimeout: clearTimeout,
        clearInterval: clearInterval,
        setImmediate: setImmediate,
        clearImmediate: clearImmediate,
        console: console
    };

    var newContext = {};
    Object.keys(baseContext).forEach(function (key) {
        newContext[key] = baseContext[key];
    });

    Object.keys(context).forEach(function (key) {
        newContext[key] = context[key];
    });

    return vm.createContext(newContext);
};
