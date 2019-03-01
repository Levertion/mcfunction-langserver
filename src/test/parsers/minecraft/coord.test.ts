import { CoordParser } from "../../../parsers/minecraft/coordinates";
import { snapshot, testParser } from "../../assertions";

describe("Coordinate tests", () => {
    it("should work for various inputs with settings: {count: 2, float: false, local: true }", () => {
        const parser = new CoordParser({
            count: 2,
            float: false,
            local: true
        });
        const tester = testParser(parser)();
        snapshot(
            tester,
            "~1 ~",
            "2 3",
            "5 ~",
            "~ ~",
            "1 ^4",
            "~1 ^4",
            "~2 ",
            "1.3 1"
        );
    });
    it("should work for various inputs with settings: {count: 3, float: true , local: true }", () => {
        const parser = new CoordParser({
            count: 3,
            float: true,
            local: true
        });
        const tester = testParser(parser)();
        snapshot(
            tester,
            "1 2 3",
            "~1 ~2 3",
            "^1 ^ ^2",
            "~ ~ ~",
            "1.2 3 ~1",
            "^.1 ^ ^3"
        );
    });
    it("should work for various inputs with settings: {count: 2, float: true , local: false}", () => {
        const parser = new CoordParser({
            count: 2,
            float: true,
            local: false
        });
        const tester = testParser(parser)();
        snapshot(tester, "~1 ~", "2 3", "5 ~20", "~ ~", "^ ^3");
    });
});
