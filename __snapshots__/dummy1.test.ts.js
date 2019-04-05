exports["dummyParser1 should default to 3 when not given any properties 1"] = {
    cursor: 3,
    parsing: {
        actions: [],
        errors: [],
        suggestions: [],
        misc: [],
        kind: true
    },
    suggesting: {
        actions: [],
        errors: [],
        suggestions: [
            "hello",
            {
                start: 1,
                text: "welcome"
            }
        ],
        misc: [],
        kind: true
    }
};

exports["dummyParser1 should not succeed if there is not enough room 1"] = {
    cursor: 0,
    parsing: {
        actions: [],
        errors: [],
        suggestions: [],
        misc: [],
        kind: false
    },
    suggesting: {
        actions: [],
        errors: [],
        suggestions: [
            "hello",
            {
                start: 1,
                text: "welcome"
            }
        ],
        misc: [],
        kind: false
    }
};

exports["dummyParser1 should read the specified number of characters 1"] = {
    cursor: 4,
    parsing: {
        actions: [],
        errors: [],
        suggestions: [],
        misc: [],
        kind: true
    },
    suggesting: {
        actions: [],
        errors: [],
        suggestions: [
            "hello",
            {
                start: 2,
                text: "welcome"
            }
        ],
        misc: [],
        kind: true
    }
};
