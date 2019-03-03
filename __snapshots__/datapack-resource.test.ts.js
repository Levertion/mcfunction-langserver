exports["Datapack Resource Testing should return the correct data 1"] = {
    actions: [],
    errors: [],
    suggestions: [],
    misc: [
        {
            group: "InvalidTagNoValues",
            filePath:
                "E:\\mcfunction-langserver\\test_data\\test_world\\datapacks\\ExampleDatapack\\data\\minecraft\\tags\\functions\\tick.json",
            kind: "ClearError"
        },
        {
            group: "InvalidTagValuesNotArray",
            filePath:
                "E:\\mcfunction-langserver\\test_data\\test_world\\datapacks\\ExampleDatapack\\data\\minecraft\\tags\\functions\\tick.json",
            kind: "ClearError"
        },
        {
            group: "InvalidTagValuesNotString",
            filePath:
                "E:\\mcfunction-langserver\\test_data\\test_world\\datapacks\\ExampleDatapack\\data\\minecraft\\tags\\functions\\tick.json",
            kind: "ClearError"
        },
        {
            group: "InvalidTagValuesDuplicates",
            filePath:
                "E:\\mcfunction-langserver\\test_data\\test_world\\datapacks\\ExampleDatapack\\data\\minecraft\\tags\\functions\\tick.json",
            kind: "ClearError"
        },
        {
            group: "InvalidTagValuesUnknown",
            filePath:
                "E:\\mcfunction-langserver\\test_data\\test_world\\datapacks\\ExampleDatapack\\data\\minecraft\\tags\\functions\\tick.json",
            kind: "ClearError"
        }
    ],
    data: {
        location: "E:\\mcfunction-langserver\\test_data\\test_world\\datapacks",
        packnamesmap: {
            ExampleDatapack: 0,
            ExampleDatapack2: 1
        },
        packs: {
            "0": {
                id: 0,
                data: {
                    functions: [
                        {
                            namespace: "test_namespace",
                            pack: 0,
                            path: "function"
                        }
                    ],
                    function_tags: [
                        {
                            namespace: "minecraft",
                            pack: 0,
                            path: "tick",
                            data: {
                                values: ["test_namespace:function"]
                            }
                        }
                    ]
                },
                name: "ExampleDatapack",
                mcmeta: {
                    pack: {
                        pack_format: 3,
                        description: "test datapack"
                    }
                }
            },
            "1": {
                id: 1,
                data: {
                    functions: [
                        {
                            namespace: "test_namespace",
                            pack: 1,
                            path: "function"
                        }
                    ]
                },
                name: "ExampleDatapack2",
                mcmeta: {
                    pack: {
                        pack_format: 3,
                        description: "test datapack 2"
                    }
                }
            }
        },
        nbt: {
            level: {
                Data: {
                    RandomSeed: {
                        low: -2021306761,
                        high: -1388691519,
                        unsigned: false
                    },
                    generatorName: "flat",
                    BorderCenterZ: 0,
                    Difficulty: 2,
                    BorderSizeLerpTime: {
                        low: 0,
                        high: 0,
                        unsigned: false
                    },
                    raining: 0,
                    DimensionData: {
                        "1": {
                            DragonFight: {
                                Gateways: [
                                    6,
                                    11,
                                    18,
                                    10,
                                    16,
                                    3,
                                    7,
                                    8,
                                    5,
                                    1,
                                    14,
                                    12,
                                    0,
                                    2,
                                    19,
                                    15,
                                    4,
                                    9,
                                    17,
                                    13
                                ],
                                DragonKilled: 1,
                                PreviouslyKilled: 1
                            }
                        }
                    },
                    Time: {
                        low: 404036,
                        high: 0,
                        unsigned: false
                    },
                    GameType: 1,
                    MapFeatures: 1,
                    BorderCenterX: 0,
                    BorderDamagePerBlock: 0.2,
                    BorderWarningBlocks: 5,
                    BorderSizeLerpTarget: 60000000,
                    Version: {
                        Snapshot: 0,
                        Id: 1628,
                        Name: "1.13.1"
                    },
                    DayTime: {
                        low: 18000,
                        high: 0,
                        unsigned: false
                    },
                    initialized: 1,
                    allowCommands: 1,
                    SizeOnDisk: {
                        low: 0,
                        high: 0,
                        unsigned: false
                    },
                    CustomBossEvents: {
                        bossbar: {
                            PlayBossMusic: 0,
                            CreateWorldFog: 0,
                            Max: 20,
                            Color: "red",
                            Visible: 1,
                            Value: 0,
                            Overlay: "notched_20",
                            DarkenScreen: 0,
                            Name: '{"color":"white","text":"Custom Bar"}',
                            Players: [
                                {
                                    L: {
                                        low: -400175091,
                                        high: -1742195773,
                                        unsigned: false
                                    },
                                    M: {
                                        low: 1954434988,
                                        high: -161708486,
                                        unsigned: false
                                    }
                                }
                            ]
                        }
                    },
                    GameRules: {
                        doTileDrops: "true",
                        doFireTick: "false",
                        maxCommandChainLength: "65536",
                        reducedDebugInfo: "false",
                        naturalRegeneration: "true",
                        disableElytraMovementCheck: "false",
                        doMobLoot: "true",
                        announceAdvancements: "true",
                        keepInventory: "false",
                        doEntityDrops: "true",
                        doLimitedCrafting: "false",
                        mobGriefing: "true",
                        randomTickSpeed: "3",
                        commandBlockOutput: "false",
                        spawnRadius: "10",
                        doMobSpawning: "false",
                        maxEntityCramming: "24",
                        logAdminCommands: "true",
                        spectatorsGenerateChunks: "true",
                        doWeatherCycle: "false",
                        sendCommandFeedback: "true",
                        doDaylightCycle: "false",
                        showDeathMessages: "true"
                    },
                    SpawnY: 4,
                    rainTime: 34330,
                    thunderTime: 98129,
                    SpawnZ: 8,
                    hardcore: 0,
                    DifficultyLocked: 0,
                    SpawnX: 8,
                    clearWeatherTime: 0,
                    thundering: 0,
                    generatorVersion: 0,
                    version: 19133,
                    BorderSafeZone: 5,
                    generatorOptions: {
                        biome: "minecraft:the_void",
                        layers: [
                            {
                                block: "minecraft:air",
                                height: 1
                            }
                        ],
                        structures: {
                            decoration: {}
                        }
                    },
                    LastPlayed: {
                        low: 2081333130,
                        high: 357,
                        unsigned: false
                    },
                    BorderWarningTime: 15,
                    LevelName: "The Second Hiest",
                    BorderSize: 60000000,
                    DataVersion: 1628,
                    DataPacks: {
                        Enabled: ["file/ExampleDatapack"],
                        Disabled: ["vanilla", "file/ExampleDatapack2"]
                    }
                }
            }
        }
    },
    kind: true
};

exports["Datapack Resource Testing should return the correct data 2"] = [
    {
        namespace: "minecraft",
        path: "tick"
    }
];

exports["Datapack Resource Testing should return the correct data 3"] = [
    {
        namespace: "test_namespace",
        path: "function"
    }
];

exports["Datapack Resource Testing should return the correct data 4"] = [
    {
        namespace: "test_namespace",
        path: "function"
    }
];
