module.exports = function oathbreaker(value) {
    if (!value || typeof value.then !== 'function') {
        return null;
    }

    if (!value.isRejected) {
        return value;
    }

    if (value.isRejected()) {
        value.caught(function () {
            // Ignore - already handled
        });

        throw value.reason();
    } else if (!value.isFulfilled()) {
        return value;
    }
};
