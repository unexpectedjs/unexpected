const fs = require('fs');
const pathModule = require('path');

const plugins = [
  /* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
  require('rollup-plugin-commonjs')({
    // leave the os require in the tree as that codepath is not
    // taken when executed in Deno after magicpen porting work
    ignore: process.env.ESM_BUILD ? ['os'] : undefined
  }),
  require('rollup-plugin-node-resolve')({ preferBuiltins: true }),
  require('rollup-plugin-node-globals')()
];

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
