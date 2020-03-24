/* globals Deno */
import './deno-setup.js';
import '../test/common.js';
import '../build/tests.esm.js';

window.mocha.run((failureCount) => {
  Deno.exit(failureCount > 0 ? 1 : 0);
});
