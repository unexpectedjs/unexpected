const utils = require('./utils');
const emptyTree = {};

const leafTextInsert = (node, parts, partIndex) => {
    const part = parts[partIndex];
    const rest = insert(emptyTree, parts, partIndex + 1);
    const textEdges = { [part]: rest };

    return { typeEdges: [], textEdges: textEdges };
};

const leafInsert = (node, parts, partIndex) => {
    const part = parts[partIndex];

    if (typeof part === 'string') {
        return leafTextInsert(node, parts, partIndex);
    }

    const rest = insert(emptyTree, parts, partIndex + 1);
    const typeEdge = utils.extend({}, rest, { value: part });

    return { typeEdges: [typeEdge], textEdges: {} };
};

const branchTextInsert = (node, parts, partIndex) => {
    const part = parts[partIndex];
    const rest = insert(node.textEdges[part] || emptyTree, parts, partIndex + 1);

    // Potentially slow, but lookup will be fast which it probably more important
    // We could consider using prototypical inheritance to some limit and then do a full copy.
    // That would make lookup slightly slower but adding assertions faster and less memory consuming.
    const textEdges = utils.extend({}, node.textEdges, { [part]: rest });

    return { typeEdges: node.typeEdges, textEdges };
};

const branchInsert = (node, parts, partIndex) => {
    const part = parts[partIndex];

    if (typeof part === 'string') {
        return branchTextInsert(node, parts, partIndex);
    }

    const typeEdges = [];
    let foundInsetionPoint = false;

    // We could consider using a linked list instead of an array for better structural sharing
    // but I expect iteration would be slower.
    node.typeEdges.forEach((typeEdge) => {
        if (!foundInsetionPoint) {
            const edgeTypeIndex = typeEdge.value.type.index;
            if (edgeTypeIndex === part.type.index) {
                // wrong, we need to take min and max into considerations.
                const rest = insert(typeEdge, parts, partIndex + 1);
                typeEdges.push(utils.extend({}, rest, { value: part }));
                foundInsetionPoint = true;
            } else if (edgeTypeIndex < part.type.index) {
                const rest = insert(emptyTree, parts, partIndex + 1);
                typeEdges.push(utils.extend({}, rest, { value: part }));
                typeEdges.push(typeEdge);
                foundInsetionPoint = true;
            } else {
                typeEdges.push(typeEdge);
            }
        } else {
            typeEdges.push(typeEdge);
        }
    });

    if (!foundInsetionPoint) {
        const rest = insert(emptyTree, parts, partIndex + 1);
        typeEdges.push(utils.extend({}, rest, { value: part }));
    }

    return { typeEdges, textEdges: node.textEdges };
};

const insert = (node, parts, partIndex) => {
    if (partIndex === parts.length) {
        return node;
    }

    return (node === emptyTree)
        ? leafInsert(node, parts, partIndex)
        : branchInsert(node, parts, partIndex);
};

const addAssertion = (tree, parts) => insert(tree, parts, 0);

module.exports = {
    emptyTree: emptyTree,
    addAssertion: addAssertion
};
