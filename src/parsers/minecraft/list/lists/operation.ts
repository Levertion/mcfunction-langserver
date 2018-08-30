import { ListSupplier } from "../lists";

const ops = ["+=", "-=", "*=", "/=", "%=", "=", ">", "<", "><"];

const supplier: ListSupplier = {
    get: () => ops,
    init: () => undefined
};

export = supplier;
