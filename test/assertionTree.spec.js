/*global expect*/
const AssertionTree = require('../lib/AssertionTree');

const type = (name, minimum, maximum) => ({
    type: expect.getType(name),
    minimum: typeof minimum === 'number' ? minimum : 1,
    maximum: typeof maximum === 'number' ? maximum : 1
});

const assertionRule = {};

describe('AssertionTree', () => {
    it('creates a correct tree when you add multiple assertions', () => {
        let tree = AssertionTree.emptyTree;
        tree = AssertionTree.addAssertion(tree, [type('string'), 'to be', type('string')], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('any'), 'to be', type('any')], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('any'), 'to equal', type('any')], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('object'), 'to have keys', type('string', 1, Infinity)], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('object'), 'to have keys', type('array')], assertionRule);

        tree = AssertionTree.addAssertion(tree, [type('object'), 'to be evil'], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('object'), 'to be evil', type('string')], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('object'), 'to be evil', type('string', 0, 1)], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('object'), 'to be evil', type('string', 1, Infinity)], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('object'), 'to be evil', type('string', 0, Infinity)], assertionRule);

        tree = AssertionTree.addAssertion(tree, [type('function'), 'when called with', type('array-like'), type('assertion', 0, 1)], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('function'), 'when called', type('assertion', 0, 1)], assertionRule);

        tree = AssertionTree.addAssertion(tree, [type('object'), 'to be evil', type('number')], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('object'), 'to be evil', type('number', 0, Infinity)], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('object'), 'to be evil', type('number', 1, Infinity)], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('object'), 'to be evil', type('number', 0, 1)], assertionRule);

        expect(tree, 'to exhaustively satisfy', {
            typeEdges: [
                {
                    constraint: type('string'),
                    typeEdges: [],
                    textEdges: {
                        'to be': {
                            typeEdges: [
                                {
                                    constraint: type('string'),
                                    typeEdges: [],
                                    textEdges: {},
                                    value: assertionRule
                                }
                            ],
                            textEdges: {}
                        }
                    }
                },

                {
                    constraint: type('function'),
                    splitRange: {
                        minimum: 11,
                        maximum: 11
                    },
                    typeEdges: [],
                    textEdges: {
                        'when called': {
                            typeEdges: [{
                                constraint: type('assertion', 0, 1),
                                typeEdges: [],
                                textEdges: {},
                                value: assertionRule
                            }],
                            textEdges: {}
                        },
                        'when called with': {
                            typeEdges: [
                                {
                                    constraint: type('array-like'),
                                    typeEdges: [{
                                        constraint: type('assertion', 0, 1),
                                        typeEdges: [],
                                        textEdges: {},
                                        value: assertionRule
                                    }],
                                    textEdges: {}
                                }
                            ],
                            textEdges: {}
                        }
                    }
                },

                {
                    constraint: type('object'),
                    typeEdges: [],
                    textEdges: {
                        'to have keys': {
                            typeEdges: [
                                {
                                    constraint: type('string', 1, Infinity),
                                    typeEdges: [],
                                    textEdges: {},
                                    value: assertionRule
                                },
                                {
                                    constraint: type('array'),
                                    typeEdges: [],
                                    textEdges: {},
                                    value: assertionRule
                                }
                            ],
                            textEdges: {}
                        },
                        'to be evil': {
                            typeEdges: [
                                {
                                    constraint: type('number'),
                                    typeEdges: [],
                                    textEdges: {},
                                    value: assertionRule
                                },
                                {
                                    constraint: type('number', 0, 1),
                                    typeEdges: [],
                                    textEdges: {},
                                    value: assertionRule
                                },
                                {
                                    constraint: type('number', 1, Infinity),
                                    typeEdges: [],
                                    textEdges: {},
                                    value: assertionRule
                                },
                                {
                                    constraint: type('number', 0, Infinity),
                                    typeEdges: [],
                                    textEdges: {},
                                    value: assertionRule
                                },
                                {
                                    constraint: type('string'),
                                    typeEdges: [],
                                    textEdges: {},
                                    value: assertionRule
                                },
                                {
                                    constraint: type('string', 0, Infinity),
                                    typeEdges: [],
                                    textEdges: {},
                                    value: assertionRule
                                }
                            ],
                            textEdges: {},
                            value: assertionRule
                        }
                    }
                },

                {
                    constraint: type('any'),
                    typeEdges: [],
                    textEdges: {
                        'to be': {
                            typeEdges: [
                                {
                                    constraint: type('any'),
                                    typeEdges: [],
                                    textEdges: {},
                                    value: assertionRule
                                }
                            ],
                            textEdges: {}
                        },
                        'to equal': {
                            typeEdges: [
                                {
                                    constraint: type('any'),
                                    typeEdges: [],
                                    textEdges: {},
                                    value: assertionRule
                                }
                            ],
                            textEdges: {}
                        }
                    }
                }
            ],
            textEdges: {},
            fastTrack: expect.it('to satisfy', {
                'to be': [
                    {constraint: type('string')},
                    {constraint: type('any')}
                ],
                'to equal': [
                    {constraint: type('any')}
                ],
                'to have keys': [
                    {constraint: type('object')}
                ],
                'to be evil': [
                    {constraint: type('object')}
                ],
                'when called with': [
                    {constraint: type('function')}
                ],
                'when called': [
                    {constraint: type('function')}
                ]
            })
        });
    });

    it('supports multiple subjects', () => {
        const tree = AssertionTree.addAssertion(
            AssertionTree.emptyTree,
            [type('object'), type('string'), 'to have multiple subjects', type('number')],
            assertionRule
        );

        expect(tree, 'to equal', {
            typeEdges: [
                {
                    constraint: type('object'),
                    typeEdges: [
                        {
                            constraint: type('string'),
                            typeEdges: [],
                            textEdges: {
                                'to have multiple subjects': {
                                    typeEdges: [
                                        {
                                            constraint: type('number'),
                                            typeEdges: [],
                                            textEdges: {},
                                            value: assertionRule
                                        }
                                    ],
                                    textEdges: {}
                                }
                            }
                        }
                    ],
                    textEdges: {}
                }
            ],
            textEdges: {}
        });
    });

    it('supports multiple assertion strings', () => {
        const tree = AssertionTree.addAssertion(
            AssertionTree.emptyTree,
            [type('number'), 'to be between', type('number'), 'and', type('number')],
            assertionRule
        );

        expect(tree, 'to exhaustively satisfy', {
            typeEdges: [
                {
                    constraint: type('number'),
                    typeEdges: [],
                    textEdges: {
                        'to be between': {
                            typeEdges: [
                                {
                                    constraint: type('number'),
                                    typeEdges: [],
                                    textEdges: {
                                        and: {
                                            typeEdges: [
                                                {
                                                    constraint: type('number'),
                                                    typeEdges: [],
                                                    textEdges: {},
                                                    value: assertionRule
                                                }
                                            ],
                                            textEdges: {}
                                        }
                                    }
                                }
                            ],
                            textEdges: {}
                        }
                    }
                }
            ],
            textEdges: {},
            fastTrack: expect.it('to be an object')
        });
    });

    describe('find', () => {
        let tree = AssertionTree.emptyTree;
        tree = AssertionTree.addAssertion(tree, [type('string'), 'to be', type('string')], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('any'), 'to be', type('any')], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('any'), 'to equal', type('any')], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('object'), 'to have keys', type('string', 1, Infinity)], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('object'), 'to have keys', type('array')], assertionRule);

        tree = AssertionTree.addAssertion(tree, [type('object'), 'to be evil'], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('object'), 'to be evil', type('string')], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('object'), 'to be evil', type('string', 0, 1)], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('object'), 'to be evil', type('string', 1, Infinity)], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('object'), 'to be evil', type('string', 0, Infinity)], assertionRule);

        tree = AssertionTree.addAssertion(tree, [type('function'), 'when called with', type('array-like'), type('assertion', 0, 1)], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('function'), 'when called', type('assertion', 0, 1)], assertionRule);

        tree = AssertionTree.addAssertion(tree, [type('object'), 'to be evil', type('number')], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('object'), 'to be evil', type('number', 0, Infinity)], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('object'), 'to be evil', type('number', 1, Infinity)], assertionRule);
        tree = AssertionTree.addAssertion(tree, [type('object'), 'to be evil', type('number', 0, 1)], assertionRule);

        it('returns null if the given path can not be found', () => {
            const result = AssertionTree.find(tree, [42, 'to contain', 2]);
            expect(result, 'to be null');
        });

        it('returns a search result if given path is found', () => {
            const result = AssertionTree.find(tree, [42, 'to be', 24]);
            expect(result, 'to equal', {
                node: {
                    typeEdges: [{
                        constraint: type('any'),
                        value: assertionRule,
                        typeEdges: [],
                        textEdges: {}
                    }],
                    textEdges: {}
                }
            });
        });
    });
});
