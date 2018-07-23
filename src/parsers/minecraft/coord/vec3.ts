import { Parser } from "../../../types";
import { CoordBaseParser } from "./coord_base";

export const vec3Parser: Parser = new CoordBaseParser({
    count: 3,
    float: true,
    local: true
});
