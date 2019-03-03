exports[
    "parseCommand() Multi Argument Tests should not add a node when a node which follows fails 1"
] = {
    actions: [],
    nodes: [
        {
            context: {},
            final: {},
            high: 3,
            low: 0,
            path: ["test1"]
        }
    ],
    errors: [
        {
            code: "command.parsing.matchless",
            severity: 1,
            substitutions: ["hel1"],
            text: "No nodes which matched 'hel1' found",
            range: {
                start: 4,
                end: 8
            }
        }
    ]
};

exports[
    "parseCommand() Multi Argument Tests should only add a space between nodes 1"
] = {
    actions: [],
    nodes: [
        {
            context: {},
            final: {},
            high: 7,
            low: 4,
            path: ["test1", "testchild1"]
        },
        {
            context: {},
            high: 3,
            low: 0,
            path: ["test1"]
        }
    ],
    errors: [
        {
            code: "parsing.command.executable",
            severity: 2,
            substitutions: ["hel hel"],
            text: "The command 'hel hel' cannot be run.",
            range: {
                start: 0,
                end: 7
            }
        }
    ]
};

exports[
    "parseCommand() single argument tests should add an error if there text at the start not matched by a node 1"
] = {
    actions: [],
    nodes: [],
    errors: [
        {
            code: "command.parsing.matchless",
            severity: 1,
            substitutions: ["hi"],
            text: "No nodes which matched 'hi' found",
            range: {
                start: 0,
                end: 2
            }
        }
    ]
};

exports[
    "parseCommand() single argument tests should parse an executable, valid, command as such 1"
] = {
    actions: [],
    nodes: [
        {
            context: {},
            final: {},
            high: 3,
            low: 0,
            path: ["test1"]
        }
    ],
    errors: []
};

exports[
    "parseCommand() single argument tests should parse an executable, valid, command as such prefixed by whitespace 1"
] = {
    actions: [],
    nodes: [
        {
            context: {},
            final: {},
            high: 6,
            low: 3,
            path: ["test1"]
        }
    ],
    errors: []
};

exports[
    "parseCommand() single argument tests should return a warning from a command which cannot be executed 1"
] = {
    actions: [],
    nodes: [
        {
            context: {},
            final: {},
            high: 5,
            low: 0,
            path: ["test2"]
        }
    ],
    errors: [
        {
            code: "parsing.command.executable",
            severity: 2,
            substitutions: ["hello"],
            text: "The command 'hello' cannot be run.",
            range: {
                start: 0,
                end: 5
            }
        }
    ]
};
