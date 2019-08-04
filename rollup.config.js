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
  // Add a bogus plugin that gets rid of support-colors' require of the 'os' module:
  plugins.unshift({
    renderChunk(code, chunk, outputOptions) {
      return code.replace(
        "import os from 'os';",
        "var os = {release() {return '4.15.0-43-generic';}}"
      );
    }
  });
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
