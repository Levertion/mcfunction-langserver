import { DidChangeTextDocumentParams, DidOpenTextDocumentParams } from "vscode-languageserver/lib/main";
/**
 * A deeply readonly version of the given type.
 */
export type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };
interface OpenJob extends GeneralJob<JobKind.open> {
    params: DidOpenTextDocumentParams;
}

interface ChangeJob extends GeneralJob<JobKind.change> {
    params: DidChangeTextDocumentParams;
}

interface GeneralJob<T extends JobKind> {
    kind: T;
}

/**
 * A message sent to the server.
 */
export type Job = OpenJob | ChangeJob;

export enum JobKind {
    open,
    change,
}
