import { floatRange, intRange } from "../../../parsers/minecraft/range";
import { testParser } from "../../assertions";

describe("range parser", () => {
    describe("int range", () => {
        const tester = testParser(intRange)();
        it("should succeed with a single int", () => {
            tester("10", {
                succeeds: true,
                suggestions: [
                    {
                        start: 2,
                        text: ".."
                    }
                ]
            });
        });
        it("should succeed with a right unbounded range", () => {
            tester("3..", {
                succeeds: true,
                suggestions: [
                    {
                        start: 1,
                        text: ".."
                    }
                ]
            });
        });
        it("should succeed with a left unbounded range", () => {
            tester("..34", {
                succeeds: true
            });
        });
        it("should succeed with a bounded range", () => {
            tester("12..34", {
                succeeds: true
            });
        });
        it("should fail when no numbers", () => {
            tester("..", {
                errors: [
                    {
                        code: "parsing.int.expected",
                        range: {
                            end: 2,
                            start: 2
                        }
                    }
                ],
                succeeds: false,
                suggestions: [
                    {
                        start: 0,
                        text: ".."
                    }
                ]
            });
        });
        it("should have errors when min as greater than max", () => {
            tester("7..-12", {
                actions: [
                    {
                        data: "-12..7",
                        high: 6,
                        low: 0,
                        type: "format"
                    }
                ],
                errors: [
                    {
                        code: "argument.range.swapped",
                        range: {
                            end: 6,
                            start: 0
                        }
                    }
                ],
                succeeds: true
            });
        });
        it("should have a hint when min equals max", () => {
            tester("5..5", {
                actions: [
                    {
                        data: "5",
                        high: 4,
                        low: 0,
                        type: "format"
                    }
                ],
                errors: [
                    {
                        code: "argument.range.equal",
                        range: {
                            end: 4,
                            start: 0
                        }
                    }
                ],
                succeeds: true
            });
        });
    });
    describe("float range", () => {
        const tester = testParser(floatRange)();
        it("should succeed with a single float", () => {
            tester("9.32", {
                succeeds: true,
                suggestions: [
                    {
                        start: 4,
                        text: ".."
                    }
                ]
            });
        });
        it("should succeed with a right unbounded range", () => {
            tester("3.12..", {
                succeeds: true,
                suggestions: [
                    {
                        start: 4,
                        text: ".."
                    }
                ]
            });
        });
        it("should succeed with a left unbounded range & float without starting '0'", () => {
            tester("...4", {
                succeeds: true
            });
        });
        it("should have errors when min as greater than max", () => {
            tester("3.4..0.2", {
                actions: [
                    {
                        data: "0.2..3.4",
                        high: 8,
                        low: 0,
                        type: "format"
                    }
                ],
                errors: [
                    {
                        code: "argument.range.swapped",
                        range: {
                            end: 8,
                            start: 0
                        }
                    }
                ],
                succeeds: true
            });
        });
    });
});
