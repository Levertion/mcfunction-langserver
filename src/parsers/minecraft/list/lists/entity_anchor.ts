import { ListSupplier } from "../lists";

const anchors = ["feet", "eyes"];

const supplier: ListSupplier = {
    get: () => anchors,
    init: () => undefined
};

export = supplier;
