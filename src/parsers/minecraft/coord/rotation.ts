import { Parser } from "../../../types";
import { CoordBaseParser } from "./coord_base";

export const rotationParser: Parser = new CoordBaseParser({
    count: 2,
    float: true,
    local: false
});
