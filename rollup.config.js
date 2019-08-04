const fs = require('fs');
const pathModule = require('path');

const plugins = [
  /* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
  require('rollup-plugin-commonjs')(),
  require('rollup-plugin-node-resolve')(),
  require('rollup-plugin-node-globals')(),
  require('rollup-plugin-terser').terser({
    output: {
      comments: function(node, comment) {
        return /^!|@preserve|@license|@cc_on/i.test(comment.value);
      }
    }
  })
];

if (process.env.DENO_BUILD) {
  // leave the os require in the tree as that codepath is not
  // taken when executed in Deno after magicpen porting work
  plugins[0] = require('rollup-plugin-commonjs')({
    ignore: ['os']
  })
}

module.exports = {
  output: {
    banner:
      '/*!\n' +
      fs
        .readFileSync(pathModule.resolve(__dirname, 'LICENSE'), 'utf-8')
        .replace(/^/gm, ' * ')
        .replace(/\s+$/g, '') +
      '/\n'
  },
  plugins
};
