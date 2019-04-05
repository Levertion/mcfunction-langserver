// A simple result type, to encode a success and failure

export interface Ok<R> {
    ok: R;
}

export interface Err<E> {
    err: E;
}

export type Result<R, E> = Ok<R> | Err<E>;

export function isOk<R>(result: Result<R, any>): result is Ok<R> {
    return result.hasOwnProperty("ok");
}

export function isErr<E>(result: Result<any, E>): result is Err<E> {
    return !isOk(result);
}

export function Ok<R>(ok: R): Ok<R> {
    return { ok };
}

export function Err<E>(err: E): Err<E> {
    return { err };
}
