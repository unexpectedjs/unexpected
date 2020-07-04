/* global expect:true */
expect = require('./lib/').clone();
expect.output.preferredWidth = 80;
require('./test/promisePolyfill');
