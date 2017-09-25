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

        tree = assertionTree.addAssertion(tree, [type('object'), 'to be evil'], handler);
        tree = assertionTree.addAssertion(tree, [type('object'), 'to be evil', type('string')], handler);
        tree = assertionTree.addAssertion(tree, [type('object'), 'to be evil', type('string', 0, 1)], handler);
        tree = assertionTree.addAssertion(tree, [type('object'), 'to be evil', type('string', 1, Infinity)], handler);
        tree = assertionTree.addAssertion(tree, [type('object'), 'to be evil', type('string', 0, Infinity)], handler);

        tree = assertionTree.addAssertion(tree, [type('object'), 'to be evil', type('number')], handler);
        tree = assertionTree.addAssertion(tree, [type('object'), 'to be evil', type('number', 0, Infinity)], handler);
        tree = assertionTree.addAssertion(tree, [type('object'), 'to be evil', type('number', 1, Infinity)], handler);
        tree = assertionTree.addAssertion(tree, [type('object'), 'to be evil', type('number', 0, 1)], handler);

        expect(tree, 'to equal', {
            typeEdges: [
                {
                    value: type('string'),
                    typeEdges: [],
                    textEdges: {
                        'to be': {
                            typeEdges: [
                                {
                                    value: type('string'),
                                    typeEdges: [],
                                    textEdges: {},
                                    handler
                                }
                            ],
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
                                {
                                    value: type('string', 1, Infinity),
                                    typeEdges: [],
                                    textEdges: {},
                                    handler
                                },
                                {
                                    value: type('array'),
                                    typeEdges: [],
                                    textEdges: {},
                                    handler
                                }
                            ],
                            textEdges: {}
                        },
                        'to be evil': {
                            typeEdges: [
                                {
                                    value: type('number'),
                                    typeEdges: [],
                                    textEdges: {},
                                    handler
                                },
                                {
                                    value: type('number', 0, 1),
                                    typeEdges: [],
                                    textEdges: {},
                                    handler
                                },
                                {
                                    value: type('number', 1, Infinity),
                                    typeEdges: [],
                                    textEdges: {},
                                    handler
                                },
                                {
                                    value: type('number', 0, Infinity),
                                    typeEdges: [],
                                    textEdges: {},
                                    handler
                                },
                                {
                                    value: type('string'),
                                    typeEdges: [],
                                    textEdges: {},
                                    handler
                                },
                                {
                                    value: type('string', 0, Infinity),
                                    typeEdges: [],
                                    textEdges: {},
                                    handler
                                }
                            ],
                            textEdges: {},
                            handler
                        }
                    }
                },
                {
                    value: type('any'),
                    typeEdges: [],
                    textEdges: {
                        'to be': {
                            typeEdges: [
                                {
                                    value: type('any'),
                                    typeEdges: [],
                                    textEdges: {},
                                    handler
                                }
                            ],
                            textEdges: {}
                        },
                        'to equal': {
                            typeEdges: [
                                {
                                    value: type('any'),
                                    typeEdges: [],
                                    textEdges: {},
                                    handler
                                }
                            ],
                            textEdges: {}
                        }
                    }
                }
            ],
            textEdges: {}
        });
    });
});
