const utils = require('./utils');
const emptyTree = {
    typeEdges: [],
    textEdges: {}
};

const isAssertion = (typeConstraint) =>
    typeConstraint && typeConstraint.type.name === 'assertion';

const calculateTextEdgeLength = (node, parts, partIndex) => {
    if (!isAssertion(parts[partIndex + 1])) {
        return null;
    }

    const partLength = parts[partIndex].length;

    const { minimum = Infinity, maximum = 0 } = node.splitRange || {};

    return {
        minimum: Math.min(minimum, partLength),
        maximum: Math.max(maximum, partLength)
    };
};

const leafTextInsert = (node, parts, partIndex, handler) => {
    const part = parts[partIndex];
    const rest = insert(emptyTree, parts, partIndex + 1, handler);
    const splitRange = calculateTextEdgeLength(node, parts, partIndex);
    const textEdges = { [part]: rest };

    return utils.extend({}, node, { textEdges }, splitRange && { splitRange });
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
    const splitRange = calculateTextEdgeLength(node, parts, partIndex);

    // Potentially slow, but lookup will be fast which it probably more important
    // We could consider using prototypical inheritance to some limit and then do a full copy.
    // That would make lookup slightly slower but adding assertions faster and less memory consuming.
    const textEdges = utils.extend({}, node.textEdges, { [part]: rest });

    return utils.extend({}, node, { textEdges }, splitRange && { splitRange });
};

const isVarargs = (typeConstraint) => typeConstraint.minimum !== 1 || typeConstraint.maximum !== 1;
const isShadowedBy = (currentTypeConstraint, newTypeConstraint) => (
    isVarargs(currentTypeConstraint) && isVarargs(currentTypeConstraint) &&
    newTypeConstraint.minimum <= currentTypeConstraint.minimum &&
    currentTypeConstraint.maximum <= newTypeConstraint.maximum
);

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
            if (typeEdge.value.type === part.type) {
                if (isVarargs(typeEdge.value) && isVarargs(part)) {
                    const rest = insert(emptyTree, parts, partIndex + 1, handler);
                    typeEdges.push(utils.extend({}, rest, { value: part }));
                    if (!isShadowedBy(typeEdge.value, part)) {
                        typeEdges.push(typeEdge);
                    }
                    foundInsetionPoint = true;
                } else if (isVarargs(typeEdge.value) || isVarargs(part)) {
                    typeEdges.push(typeEdge);
                } else {
                    const rest = insert(typeEdge, parts, partIndex + 1, handler);
                    typeEdges.push(utils.extend({}, rest, { value: part }));
                    foundInsetionPoint = true;
                }
            } else if (typeEdge.value.type.index < part.type.index) {
                const rest = insert(emptyTree, parts, partIndex + 1, handler);
                typeEdges.push(utils.extend({}, rest, { value: part }));
                typeEdges.push(typeEdge);
                foundInsetionPoint = true;
            } else {
                typeEdges.push(typeEdge);
            }
        } else {
            if (typeEdge.value.type !== part.type || !isShadowedBy(typeEdge.value, part)) {
                typeEdges.push(typeEdge);
            }
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

const updateFastTrack = (tree, parts) => {
    if (typeof parts[1] !== 'string') {
        return tree;
    }

    const assertionString = parts[1];

    const subjectType = parts[0].type;
    const updatedEdge = utils.findFirst(tree.typeEdges, (edge) => edge.value.type === subjectType);

    const currentFastTract = tree.fastTrack || {};
    const edges = [];
    let foundInsetionPoint = false;

    const currentEdges = currentFastTract[assertionString] || [];

    currentEdges.forEach((edge) => {
        if (foundInsetionPoint || subjectType.index < edge.value.type.index) {
            edges.push(edge);
        } else if (subjectType.index === edge.value.type.index) {
            edges.push(updatedEdge);
            foundInsetionPoint = true;
        } else {
            edges.push(updatedEdge);
            edges.push(edge);
            foundInsetionPoint = true;
        }
    });

    if (!foundInsetionPoint) {
        edges.push(updatedEdge);
    }

    const fastTrack = utils.extend({}, tree.fastTrack, { [assertionString]: edges });

    return utils.extend({}, tree, { fastTrack });
};

const addAssertion = (tree, parts, handler) => updateFastTrack(insert(tree, parts, 0, handler), parts);

module.exports = {
    emptyTree: emptyTree,
    addAssertion: addAssertion
};
