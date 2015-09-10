/*global window*/
var defaultDepth = 3;
if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
    var m = window.location.search.match(/[?&]depth=(\d+)(?:$|&)/);
    if (m) {
        defaultDepth = parseInt(m[1], 10);
    }
} else if (typeof process !== 'undefined' && process.env.UNEXPECTED_DEPTH) {
    defaultDepth = parseInt(process.env.UNEXPECTED_DEPTH, 10);
}
module.exports = defaultDepth;
