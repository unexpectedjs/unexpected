/*global window*/
var useFullStackTrace = false;
if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
    useFullStackTrace = !!window.location.search.match(/[?&]full-trace=true(?:$|&)/);
}

if (typeof process !== 'undefined' && process.env && process.env.UNEXPECTED_FULL_TRACE) {
    useFullStackTrace = true;
}
module.exports = useFullStackTrace;
