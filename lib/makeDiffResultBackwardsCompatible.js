module.exports = function makeDiffResultBackwardsCompatible(diff) {
    if (diff) {
        if (diff.isMagicPen) {
            // New format: { [MagicPen], inline: <boolean> }
            // Make backwards compatible by adding a 'diff' property that points
            // to the instance itself.
            diff.diff = diff;
        } else {
            // Old format: { inline: <boolean>, diff: <magicpen> }
            // Upgrade to the new format by moving the inline property to
            // the magicpen instance, and remain backwards compatibly by adding
            // the diff property pointing to the instance itself.
            diff.diff.inline = diff.inline;
            diff = diff.diff;
            diff.diff = diff;
        }
    }
    return diff;
};
