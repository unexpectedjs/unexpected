const utils = require('./utils');
const emptyTree = {
    typeEdges: [],
    textEdges: {}
};

const leafTextInsert = (node, parts, partIndex, handler) => {
    const part = parts[partIndex];
    const rest = insert(emptyTree, parts, partIndex + 1, handler);
    const textEdges = { [part]: rest };

    return utils.extend({}, node, { textEdges });
};

const leafInsert = (node, parts, partIndex, handler) => {
    const part = parts[partIndex];

    if (typeof part === 'string') {
        return leafTextInsert(node, parts, partIndex, handler);
    }

    const rest = insert(emptyTree, parts, partIndex + 1, handler);
    const typeEdge = utils.extend({}, rest, { value: part });

    return utils.extend({}, node, { typeEdges: [typeEdge] });
};

const branchTextInsert = (node, parts, partIndex, handler) => {
    const part = parts[partIndex];
    const rest = insert(node.textEdges[part] || emptyTree, parts, partIndex + 1, handler);

    // Potentially slow, but lookup will be fast which it probably more important
    // We could consider using prototypical inheritance to some limit and then do a full copy.
    // That would make lookup slightly slower but adding assertions faster and less memory consuming.
    const textEdges = utils.extend({}, node.textEdges, { [part]: rest });

    return utils.extend({}, node, { textEdges });
};

const branchInsert = (node, parts, partIndex, handler) => {
    const part = parts[partIndex];

    if (typeof part === 'string') {
        return branchTextInsert(node, parts, partIndex, handler);
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
                const rest = insert(typeEdge, parts, partIndex + 1, handler);
                typeEdges.push(utils.extend({}, rest, { value: part }));
                foundInsetionPoint = true;
            } else if (edgeTypeIndex < part.type.index) {
                const rest = insert(emptyTree, parts, partIndex + 1, handler);
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
        const rest = insert(emptyTree, parts, partIndex + 1, handler);
        typeEdges.push(utils.extend({}, rest, { value: part }));
    }

    return utils.extend({}, node, { typeEdges });
};

const insert = (node, parts, partIndex, handler) => {
    if (partIndex === parts.length) {
        return { handler, typeEdges: [], textEdges: {} };
    }

    return (node === emptyTree)
        ? leafInsert(node, parts, partIndex, handler)
        : branchInsert(node, parts, partIndex, handler);
};

const addAssertion = (tree, parts, handler) => insert(tree, parts, 0, handler);

module.exports = {
    emptyTree: emptyTree,
    addAssertion: addAssertion
};
