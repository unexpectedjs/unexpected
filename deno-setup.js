import './node_modules/mocha/mocha.js';
import unexpected from './unexpected-deno.js';
import unexpectedMagicPen from './node_modules/unexpected-magicpen/unexpected-magicpen.esm.js';

window.mocha.reporter('spec');
window.mocha.setup('bdd');

window.weknowhow = {
  expect: unexpected,
  unexpectedMagicPen: unexpectedMagicPen
};
