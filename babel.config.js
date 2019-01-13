module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['last 3 versions', 'ie >=10', 'safari >= 8']
        },
        useBuiltIns: 'entry',
        modules: false
      }
    ]
  ],
  plugins: ['transform-es2015-parameters']
};
