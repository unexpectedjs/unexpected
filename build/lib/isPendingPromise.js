module.exports = function isPendingPromise(obj) {
    return obj && typeof obj.then === 'function' && typeof obj.isPending === 'function' && obj.isPending();
};