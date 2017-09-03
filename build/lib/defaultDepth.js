/*global window*/
var defaultDepth = 3;
var matchDepthParameter = typeof window !== 'undefined' && typeof window.location !== 'undefined' && window.location.search.match(/[?&]depth=(\d+)(?:$|&)/);

if (matchDepthParameter) {
    defaultDepth = parseInt(matchDepthParameter[1], 10);
} else if (typeof process !== 'undefined' && process.env.UNEXPECTED_DEPTH) {
    defaultDepth = parseInt(process.env.UNEXPECTED_DEPTH, 10);
}
module.exports = defaultDepth;