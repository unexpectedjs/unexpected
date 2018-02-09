function throwIfNonUnexpectedError(err) {
  if (err && err.message === 'aggregate error') {
    for (let i = 0; i < err.length; i += 1) {
      throwIfNonUnexpectedError(err[i]);
    }
  } else if (!err || !err._isUnexpected) {
    throw err;
  }
}

module.exports = throwIfNonUnexpectedError;
