module.exports = 'inspect';

try {
  const util = require('' + 'util');
  if (util && typeof util.inspect === 'function' && util.inspect.custom) {
    module.exports = util.inspect.custom;
  }
} catch (err) {}
