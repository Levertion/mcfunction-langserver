import * as Long from "long";

//#region World NBT data

export type NBTBoolean = 0 | 1;

//#region Scoreboard
export interface Scoreboard {
    data: ScoreboardData;
    DataVersion: number;
}

export interface ScoreboardData {
    Objectives: Objective[];
    PlayerScores: PlayerScore[];
    Teams: Team[];
}

export interface Objective {
    CriteriaName: string;
    DisplayName: string;
    Name: string;
    RenderType: "hearts" | "integer";
}

export interface PlayerScore {
    Locked: NBTBoolean;
    Name: string;
    Objective: string;
    Score: number;
}

export interface TeamOptions {
    AllowFriendlyFire: NBTBoolean;
    CollisionRule: "always" | "never" | "pushOtherTeams" | "pushOwnTeam";
    DeathMessageVisibility:
        | "always"
        | "never"
        | "hideForOtherTeams"
        | "hideForOwnTeam";
    DisplayName: string;
    MemberNamePreifx: string;
    MemberNameSuffix: string;
    Name: string;
    NameTagVisibility:
        | "always"
        | "never"
        | "hideForOtherTeams"
        | "hideForOwnTeam";
    SeeFriendlyInvisibles: NBTBoolean;
}

export interface Team extends TeamOptions {
    Players: string[];
}

//#endregion
//#region level.dat

export interface Level {
    Data: LevelData;
}

export interface LevelData {
    allowCommands: NBTBoolean;
    BorderCenterX: number;
    BorderCenterZ: number;
    BorderDamagePerBlock: number;
    BorderSafeZone: number;
    BorderSize: number;
    BorderSizeLerpTarget: number;
    BorderSizeLerpTime: Long;
    BorderWarningBlocks: number;
    BorderWarningTime: number;
    clearWeatherTime: number;
    CustomBossEvents: {
        [id: string]: CustomBossEvent;
    };
    Datapacks: {
        Disabled: string[];
        Enabled: string[];
    };
    DataVersion: number;
    DayTime: Long;
    Difficulty: 0 | 1 | 2 | 3;
    DifficultyLocked: NBTBoolean;
    DimensionData: {
        1: EndData;
    };
    GameRules: GameRules;
    gameType: 0 | 1 | 2 | 3;
    generatorName:
        | "default"
        | "flat"
        | "largeBiomes"
        | "amplified"
        | "buffet"
        | "debug_all_block_states";
    generatorOptions: SuperflatGen | BuffetGen;
    generatorVersion: number;
    hardcore: NBTBoolean;
    initialized: NBTBoolean;
    LastPlayed: Long;
    LevelName: string;
    MapFeatures: NBTBoolean;
    Player?: any;
    raining: NBTBoolean;
    rainTime: number;
    RandomSeed: Long;
    SizeOnDisk: Long;
    SpawnX: number;
    SpawnY: number;
    SpawnZ: number;
    thundering: NBTBoolean;
    thunderTime: number;
    Time: Long;
    Version: {
        Id: number;
        Name: string;
        Snapshot: NBTBoolean;
    };
    version: number;
}

export interface CustomBossEvent {
    Color: string;
    CreateWorldFog: NBTBoolean;
    DarkenScreen: NBTBoolean;
    Max: number;
    Name: string;
    Overlay:
        | "progress"
        | "notched_6"
        | "notched_10"
        | "notched_12"
        | "notched_20";
    PlayBossMusic: NBTBoolean;
    Players: Array<{ L: Long; M: Long }>;
    Value: number;
    Visible: NBTBoolean;
}

export interface EndData {
    DragonFight: DragonFight;
}

export interface DragonFight {
    DragonKilled: NBTBoolean;
    DragonUUIDLeast: Long;
    DragonUUIDMost: Long;
    ExitPortalLocation: {
        X: number;
        Y: number;
        Z: number;
    };
    Gateways: number[];
    PreviouslyKilled: NBTBoolean;
}

export interface GameRules {
    [id: string]: string; // Maybe make concrete ones in the future
}

export interface SuperflatGen {
    biome: string;
    layers: SuperflatLayer[];
    structures: {
        [id: string]: {};
    };
}

export interface SuperflatLayer {
    block: string;
    height: number;
}

export interface BuffetGen {
    biome_source: BuffetBiomeSource;
    chunk_generator: BuffetChunkGen;
}

export interface BuffetBiomeSource {
    options: {
        biomes: string[];
    };
    type: "minecraft:fixed" | "minecraft:checkerboard";
}

export interface BuffetChunkGen {
    options: {
        default_block: string;
        default_fluid: string;
    };
    type: "minecraft:surface" | "minecraft:cave" | "minecraft:floating_islands";
}

//#endregion
//#endregion
