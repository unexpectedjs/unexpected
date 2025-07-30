const arrayChanges = require('array-changes');

module.exports = function (...args) {
  return arrayChanges(...args).map((change) => {
    if (change.type === 'moveSource' && change.equal === false) {
      return {
        type: 'remove',
        value: change.value,
        actualIndex: change.actualIndex,
        last: change.last,
      };
    }

    if (change.type === 'moveTarget' && change.equal === false) {
      return {
        type: 'insert',
        value: change.expected,
        actualIndex: change.actualIndex,
      };
    }

    return change;
  });
};
