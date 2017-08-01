var fs = require('fs');
var pathModule = require('path');

module.exports = {
    banner: '/*!\n' + fs.readFileSync(pathModule.resolve(__dirname, 'LICENSE'), 'utf-8').replace(/^/mg, ' * ').replace(/\s+$/g, '') + '/\n',
    plugins: [
        /* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
        require('rollup-plugin-commonjs')(),
        require('rollup-plugin-node-resolve')(),
        require('rollup-plugin-node-globals')(),
        require('rollup-plugin-uglify')({
            output: {
                comments: function (node, comment) {
                    return /^!|@preserve|@license|@cc_on/i.test(comment.value);
                }
            }
        })
    ]
};
