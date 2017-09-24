/*global expect*/
const assertionTree = require('../lib/assertionTree');

const type = (name, minimum, maximum) => ({
    type: expect.getType(name),
    minimum: typeof minimum === 'number' ? minimum : 1,
    maximum: typeof maximum === 'number' ? maximum : 1
});

const handler = () => {};

describe('assertionTree', () => {
    it('works :-)', () => {
        let tree = assertionTree.emptyTree;
        tree = assertionTree.addAssertion(tree, [type('string'), 'to be', type('string')], handler);
        tree = assertionTree.addAssertion(tree, [type('any'), 'to be', type('any')], handler);
        tree = assertionTree.addAssertion(tree, [type('any'), 'to equal', type('any')], handler);
        tree = assertionTree.addAssertion(tree, [type('object'), 'to have keys', type('string', 1, Infinity)], handler);
        tree = assertionTree.addAssertion(tree, [type('object'), 'to have keys', type('array')], handler);

        expect(tree, 'to equal', {
            typeEdges: [
                {
                    value: type('string'),
                    typeEdges: [],
                    textEdges: {
                        'to be': {
                            typeEdges: [ { value: type('string'), handler } ],
                            textEdges: {}
                        }
                    }
                },
                {
                    value: type('object'),
                    typeEdges: [],
                    textEdges: {
                        'to have keys': {
                            typeEdges: [
                                { value: type('string', 1, Infinity), handler },
                                { value: type('array'), handler }
                            ],
                            textEdges: {}
                        }
                    }
                },
                {
                    value: type('any'),
                    typeEdges: [],
                    textEdges: {
                        'to be': { typeEdges: [ { value: type('any'), handler } ], textEdges: {} },
                        'to equal': { typeEdges: [ { value: type('any'), handler } ], textEdges: {} }
                    }
                }
            ],
            textEdges: {}
        });
    });
});
