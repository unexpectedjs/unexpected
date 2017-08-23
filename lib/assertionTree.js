var utils = require('./utils');
var emptyNode = {}

function addAssertion(graph, parts) {
    function insert(node, partIndex) {
        if (partIndex === parts.length) {
            return node;
        }

        var part = parts[partIndex];
        var isText = typeof part === 'string';

        var rest, textEdges, typeEdge;
        if (node === emptyNode) {
            rest = insert(emptyNode, partIndex + 1);

            if (isText) {
                textEdges = {};
                textEdges[part] = rest;

                return {
                    typeEdges: [],
                    textEdges: textEdges
                };
            }

            typeEdge = { value: part, node: rest };

            return {
                typeEdges: [typeEdge],
                textEdges: {}
            };
        } else {
            if (isText) {
                rest = insert(node.textEdges[part] || emptyNode, partIndex + 1);
                // Potentially slow, but lookup will be fast which it probably more important
                textEdges = utils.extend({}, node.textEdges);
                textEdges[part] = rest;

                return {
                    typeEdges: node.typeEdges,
                    textEdges: textEdges
                };
            }

            var typeEdges = [];
            var foundInsetionPoint = false;
            for (var i = 0 ; i < node.typeEdges.length; i += 1) {
                typeEdge = node.typeEdges[i];
                if (!foundInsetionPoint) {
                    var edgeTypeIndex = typeEdge.value.type.index;
                    if (edgeTypeIndex === part.type.index) {
                        // wrong, we need to take min and max into considerations.
                        typeEdges.push({ value: typeEdge.value, node: insert(typeEdge.node, partIndex + 1)});
                        foundInsetionPoint = true;
                    } else if (edgeTypeIndex < part.type.index) {
                        typeEdges.push({ value: part, node: insert(emptyNode, partIndex + 1) });
                        typeEdges.push(typeEdge);
                        foundInsetionPoint = true;
                    } else {
                        typeEdges.push(typeEdge);
                    }
                } else {
                    typeEdges.push(typeEdge);
                }
            }

            if (!foundInsetionPoint) {
                typeEdges.push({ value: part, node: insert(emptyNode, partIndex + 1) });
            }

            return {
                typeEdges: typeEdges,
                textEdges: node.textEdges
            };
        }
    }

    return insert(graph, 0);
}

module.exports = {
    emptyNode: emptyNode,
    addAssertion: addAssertion
};
