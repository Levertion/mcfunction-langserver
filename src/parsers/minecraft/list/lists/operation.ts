import { ListSupplier } from "../lists";

const ops = ["+=", "-=", "*=", "/=", "%=", "=", ">", "<", "><"];

export const operationSupplier: ListSupplier = {
    get: () => ops,
    init: () => undefined
};
