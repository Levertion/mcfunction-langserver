import { Parser } from "../../../types";
import { CoordBaseParser } from "./coord_base";

export const vec2Parser: Parser = new CoordBaseParser({
    count: 2,
    float: true,
    local: true
});
