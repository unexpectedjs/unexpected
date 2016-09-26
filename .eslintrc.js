module.exports = {
    extends: [
        'onelint'
    ],
    plugins: ['import'],
    rules: {
        'import/no-extraneous-dependencies': [
            'error', {
                devDependencies: [ '**/test/**/*.js' ],
                optionalDependencies: false,
                peerDependencies: false
            }
        ]
    }
};
