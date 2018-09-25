// tslint:disable:object-literal-sort-keys
import { NBTDocs } from "../../../../data/types";

export const snbtTestData: NBTDocs = new Map();

snbtTestData.set("root.json", {
    children: {
        block: {
            ref: "blocks/block.json"
        }
    },
    type: "root"
});

snbtTestData.set("blocks/block.json", {
    children: {
        "langserver:nbt": {
            children: {
                customTag: {
                    suggestions: ["one", "two", "Hello World"],
                    type: "string"
                }
            },
            type: "compound"
        },
        "langserver:nbt_two": {
            child_ref: ["#langserver:parent_one", "#langserver:parent_two"],
            type: "compound"
        },
        "langserver:parent_one": {
            children: {
                key0: {
                    type: "string"
                }
            },
            type: "compound"
        },
        "langserver:parent_two": {
            children: {
                key1: {
                    type: "int"
                }
            },
            type: "compound"
        }
    },
    type: "root"
});

export const testDocs: NBTDocs = new Map();

testDocs.set("root.json", {
    children: {
        basic_test: {
            type: "no-nbt",
            description: "basic_test OK"
        },
        nest_test: {
            type: "compound",
            children: {
                key0: {
                    type: "no-nbt",
                    description: "nest_test OK"
                },
                key1: {
                    type: "no-nbt",
                    description: "nest_test BAD"
                }
            }
        },
        ref_test: {
            ref: "./ref_test.json"
        },
        alt_frag_test: {
            type: "compound",
            children: {
                key0: {
                    ref: "./alt_frag_test.json#key0"
                }
            }
        },
        self_frag_test: {
            ref: "./root.json#self_frag_ok"
        },
        self_frag_ok: {
            type: "no-nbt",
            description: "self_frag_test OK"
        },
        child_ref_test: {
            type: "compound",
            child_ref: ["./child_ref_test.json"],
            children: {
                bad: {
                    type: "no-nbt",
                    description: "child_ref_test BAD"
                }
            }
        },
        child_ref_self_test: {
            type: "compound",
            child_ref: ["./child_ref_test.json"],
            children: {
                key1: {
                    type: "no-nbt",
                    description: "child_ref_self_test OK"
                }
            }
        },
        list_test: {
            type: "list",
            item: {
                type: "no-nbt",
                description: "list_test OK"
            }
        },
        func_test: {
            function: {
                id: "insertStringNBT",
                params: {
                    ref: "./%s.json",
                    default: "./func_test_fail.json",
                    tag_path: "./var1"
                }
            }
        },
        ref_references_test: {
            ref: "#ref_references_test/key2",
            references: {
                key2: {
                    type: "no-nbt",
                    description: "ref_references_test OK"
                }
            }
        },
        root_group_test: {
            children: {
                "$./root_group_test.json": {
                    description: "root_group_test OK",
                    type: "no-nbt"
                }
            },
            type: "root"
        }
    },
    type: "root"
});

testDocs.set("alt_frag_test.json", {
    type: "compound",
    children: {
        key0: {
            type: "no-nbt",
            description: "alt_frag_test OK"
        }
    }
});
testDocs.set("child_ref_test.json", {
    type: "compound",
    children: {
        badkey: {
            type: "no-nbt",
            description: "child_ref_test BAD"
        },
        key0: {
            type: "no-nbt",
            description: "child_ref_test OK"
        }
    }
});

testDocs.set("func_test.json", {
    type: "no-nbt",
    description: "func_test OK"
});

testDocs.set("func_test_fail.json", {
    type: "no-nbt",
    description: "func_test BAD"
});

testDocs.set("ref_test.json", {
    type: "no-nbt",
    description: "ref_test OK"
});

testDocs.set("root_group_test.json", ["key3"] as any);
