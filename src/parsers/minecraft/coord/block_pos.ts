import { Parser } from "../../../types";
import { CoordBaseParser } from "./coord_base";

export const blockPosParser: Parser = new CoordBaseParser({
    count: 3,
    float: false,
    local: true
});
