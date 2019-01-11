/*global expect*/
const AssertionTree = require("../lib/AssertionTree");

const constraint = (name, minimum, maximum) => ({
    type: expect.getType(name),
    minimum: typeof minimum === "number" ? minimum : 1,
    maximum: typeof maximum === "number" ? maximum : 1
});

const assertionRule = {};

describe("AssertionTree", () => {
    it("creates a correct tree when you add multiple assertions", () => {
        let tree = AssertionTree.emptyTree;
        tree = AssertionTree.addAssertion(
            tree,
            [constraint("string"), "to be", constraint("string")],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [constraint("any"), "to be", constraint("any")],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [constraint("any"), "to equal", constraint("any")],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [
                constraint("object"),
                "to have keys",
                constraint("string", 1, Infinity)
            ],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [constraint("object"), "to have keys", constraint("array")],
            assertionRule
        );

        tree = AssertionTree.addAssertion(
            tree,
            [constraint("object"), "to be evil"],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [constraint("object"), "to be evil", constraint("string")],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [constraint("object"), "to be evil", constraint("string", 0, 1)],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [
                constraint("object"),
                "to be evil",
                constraint("string", 1, Infinity)
            ],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [
                constraint("object"),
                "to be evil",
                constraint("string", 0, Infinity)
            ],
            assertionRule
        );

        tree = AssertionTree.addAssertion(
            tree,
            [
                constraint("function"),
                "when called with",
                constraint("array-like"),
                constraint("assertion", 0, 1)
            ],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [
                constraint("function"),
                "when called",
                constraint("assertion", 0, 1)
            ],
            assertionRule
        );

        tree = AssertionTree.addAssertion(
            tree,
            [constraint("object"), "to be evil", constraint("number")],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [
                constraint("object"),
                "to be evil",
                constraint("number", 0, Infinity)
            ],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [
                constraint("object"),
                "to be evil",
                constraint("number", 1, Infinity)
            ],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [constraint("object"), "to be evil", constraint("number", 0, 1)],
            assertionRule
        );

        expect(tree, "to exhaustively satisfy", {
            typeEdges: [
                {
                    constraint: constraint("string"),
                    typeEdges: [],
                    textEdges: {
                        "to be": {
                            typeEdges: [
                                {
                                    constraint: constraint("string"),
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
                    constraint: constraint("function"),
                    splitRange: {
                        minimum: 11,
                        maximum: 11
                    },
                    typeEdges: [],
                    textEdges: {
                        "when called": {
                            typeEdges: [
                                {
                                    constraint: constraint("assertion", 0, 1),
                                    typeEdges: [],
                                    textEdges: {},
                                    value: assertionRule
                                }
                            ],
                            textEdges: {}
                        },
                        "when called with": {
                            typeEdges: [
                                {
                                    constraint: constraint("array-like"),
                                    typeEdges: [
                                        {
                                            constraint: constraint(
                                                "assertion",
                                                0,
                                                1
                                            ),
                                            typeEdges: [],
                                            textEdges: {},
                                            value: assertionRule
                                        }
                                    ],
                                    textEdges: {}
                                }
                            ],
                            textEdges: {}
                        }
                    }
                },

                {
                    constraint: constraint("object"),
                    typeEdges: [],
                    textEdges: {
                        "to have keys": {
                            typeEdges: [
                                {
                                    constraint: constraint(
                                        "string",
                                        1,
                                        Infinity
                                    ),
                                    typeEdges: [],
                                    textEdges: {},
                                    value: assertionRule
                                },
                                {
                                    constraint: constraint("array"),
                                    typeEdges: [],
                                    textEdges: {},
                                    value: assertionRule
                                }
                            ],
                            textEdges: {}
                        },
                        "to be evil": {
                            typeEdges: [
                                {
                                    constraint: constraint("number"),
                                    typeEdges: [],
                                    textEdges: {},
                                    value: assertionRule
                                },
                                {
                                    constraint: constraint("number", 0, 1),
                                    typeEdges: [],
                                    textEdges: {},
                                    value: assertionRule
                                },
                                {
                                    constraint: constraint(
                                        "number",
                                        1,
                                        Infinity
                                    ),
                                    typeEdges: [],
                                    textEdges: {},
                                    value: assertionRule
                                },
                                {
                                    constraint: constraint(
                                        "number",
                                        0,
                                        Infinity
                                    ),
                                    typeEdges: [],
                                    textEdges: {},
                                    value: assertionRule
                                },
                                {
                                    constraint: constraint("string"),
                                    typeEdges: [],
                                    textEdges: {},
                                    value: assertionRule
                                },
                                {
                                    constraint: constraint(
                                        "string",
                                        0,
                                        Infinity
                                    ),
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
                    constraint: constraint("any"),
                    typeEdges: [],
                    textEdges: {
                        "to be": {
                            typeEdges: [
                                {
                                    constraint: constraint("any"),
                                    typeEdges: [],
                                    textEdges: {},
                                    value: assertionRule
                                }
                            ],
                            textEdges: {}
                        },
                        "to equal": {
                            typeEdges: [
                                {
                                    constraint: constraint("any"),
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
            fastTrack: expect.it("to satisfy", {
                "to be": [
                    { constraint: constraint("string") },
                    { constraint: constraint("any") }
                ],
                "to equal": [{ constraint: constraint("any") }],
                "to have keys": [{ constraint: constraint("object") }],
                "to be evil": [{ constraint: constraint("object") }],
                "when called with": [{ constraint: constraint("function") }],
                "when called": [{ constraint: constraint("function") }]
            })
        });
    });

    it("supports multiple subjects", () => {
        const tree = AssertionTree.addAssertion(
            AssertionTree.emptyTree,
            [
                constraint("object"),
                constraint("string"),
                "to have multiple subjects",
                constraint("number")
            ],
            assertionRule
        );

        expect(tree, "to equal", {
            typeEdges: [
                {
                    constraint: constraint("object"),
                    typeEdges: [
                        {
                            constraint: constraint("string"),
                            typeEdges: [],
                            textEdges: {
                                "to have multiple subjects": {
                                    typeEdges: [
                                        {
                                            constraint: constraint("number"),
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

    it("supports multiple assertion strings", () => {
        const tree = AssertionTree.addAssertion(
            AssertionTree.emptyTree,
            [
                constraint("number"),
                "to be between",
                constraint("number"),
                "and",
                constraint("number")
            ],
            assertionRule
        );

        expect(tree, "to exhaustively satisfy", {
            typeEdges: [
                {
                    constraint: constraint("number"),
                    typeEdges: [],
                    textEdges: {
                        "to be between": {
                            typeEdges: [
                                {
                                    constraint: constraint("number"),
                                    typeEdges: [],
                                    textEdges: {
                                        and: {
                                            typeEdges: [
                                                {
                                                    constraint: constraint(
                                                        "number"
                                                    ),
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
            fastTrack: expect.it("to be an object")
        });
    });

    describe("find", () => {
        let tree = AssertionTree.emptyTree;
        tree = AssertionTree.addAssertion(
            tree,
            [constraint("string"), "to be", constraint("string")],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [constraint("any"), "to be", constraint("any")],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [constraint("any"), "to equal", constraint("any")],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [
                constraint("object"),
                "to have keys",
                constraint("string", 1, Infinity)
            ],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [constraint("object"), "to have keys", constraint("array")],
            assertionRule
        );

        tree = AssertionTree.addAssertion(
            tree,
            [constraint("object"), "to be evil"],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [constraint("object"), "to be evil", constraint("string")],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [constraint("object"), "to be evil", constraint("string", 0, 1)],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [
                constraint("object"),
                "to be evil",
                constraint("string", 1, Infinity)
            ],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [
                constraint("object"),
                "to be evil",
                constraint("string", 0, Infinity)
            ],
            assertionRule
        );

        tree = AssertionTree.addAssertion(
            tree,
            [
                constraint("function"),
                "when called with",
                constraint("array-like"),
                constraint("assertion", 0, 1)
            ],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [
                constraint("function"),
                "when called",
                constraint("assertion", 0, 1)
            ],
            assertionRule
        );

        tree = AssertionTree.addAssertion(
            tree,
            [constraint("object"), "to be evil", constraint("number")],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [
                constraint("object"),
                "to be evil",
                constraint("number", 0, Infinity)
            ],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [
                constraint("object"),
                "to be evil",
                constraint("number", 1, Infinity)
            ],
            assertionRule
        );
        tree = AssertionTree.addAssertion(
            tree,
            [constraint("object"), "to be evil", constraint("number", 0, 1)],
            assertionRule
        );

        it("returns null if the given path can not be found", () => {
            const result = AssertionTree.find(tree, [42, "to contain", 2]);
            expect(result, "to be null");
        });

        it("returns a search result if given path is found", () => {
            const result = AssertionTree.find(tree, [42, "to be", 24]);

            expect(result, "to equal", {
                node: {
                    typeEdges: [
                        {
                            constraint: constraint("any"),
                            value: assertionRule,
                            typeEdges: [],
                            textEdges: {}
                        }
                    ],
                    textEdges: {}
                }
            });
        });

        it("can traverse adverbrial assertions", () => {
            const greeting = name => `Hello, ${name}`;
            const result = AssertionTree.find(tree, [
                greeting,
                "when called with",
                ["Jane"],
                "to be",
                "Hello, Jane"
            ]);

            expect(result, "to equal", {
                node: {
                    typeEdges: [
                        {
                            constraint: constraint("any"),
                            value: assertionRule,
                            typeEdges: [],
                            textEdges: {}
                        }
                    ],
                    textEdges: {}
                }
            });
        });
    });
});
