export interface ContextHandler {
    path: string[];
    handle: (args: string[]) => any;
}

export type ContextChangePath = string[];

const contextHandlers: ContextHandler[] = [

];

const contextChangePaths: ContextChangePath[] = [

];

export interface ContextInformation {
    changeContext: boolean;
    handlerInfo: any;
}

export function runContextHandlers(path: string[], args: string[]): any {
    for (const c of contextHandlers) {
        if (arrEq(path, c.path)) {
            return c.handle(args);
        }
    }
    return undefined;
}

export function shouldChangeContext(path: string[]): boolean {
    for (const c of contextChangePaths) {
        if (arrEq(path, c)) {
            return true;
        }
    }
    return false;
}

function arrEq<L>(obj1: L[], obj2: L[]) {
    return obj1.length === obj2.length && obj1.every(
        (v, i) => obj2[i] === v,
    );
}
