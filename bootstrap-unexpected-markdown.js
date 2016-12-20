/*global unexpected:true*/
unexpected = require('./lib/');
unexpected.output.preferredWidth = 80;
require('./test/promisePolyfill');
