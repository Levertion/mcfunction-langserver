import { StringReader } from "../../../../../brigadier_components/string_reader";
import { NBTParser } from "../../../../../parse/parsers/minecraft/nbt/nbt";
import { ParserInfo } from "../../../../../types";

const out = new NBTParser().parse(
    new StringReader("{Duration:20}"),
    { node_properties: {} } as any as ParserInfo,
    {
        changeContext: false, handlerInfo: {
            id: "minecraft:area_effect_cloud",
            type: "entity",
        },
    },
);
for (const s of out.actions ? out.actions : []) {
    if (s.data instanceof Function) {
        global.console.log(s.data());
    } else {
        global.console.log(s.data);
    }
}
