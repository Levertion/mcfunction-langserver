import { Parser } from "./parser";

export class ParserCtx<T> extends Parser {
    public context: T;
    public settings: McFunctionSettings;
    public constructor(
        context: T,
        ...args: ConstructorParameters<typeof Parser>
    ) {
        super(...args);
        this.context = context;
        this.settings = mcLangSettings;
    }
}
