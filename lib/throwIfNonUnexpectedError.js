module.exports = function _throwIfNonUnexpectedError(err) {
    if (err && err.message === 'aggregate error') {
        for (var i = 0 ; i < err.length ; i += 1) {
            _throwIfNonUnexpectedError(err[i]);
        }
    } else if (!err || !err._isUnexpected) {
        throw err;
    }
};
