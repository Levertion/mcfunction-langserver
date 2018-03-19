
export function equalValue(obj1: any, obj2: any): boolean {
    if (typeof obj1 !== typeof obj2) {
        return false;
    } else if (typeof obj1 !== "object") {
        return obj1 === obj2;
    } else {
        const obj1keys = Object.keys(obj1);
        const obj2keys = Object.keys(obj2);
        if (obj1keys.length !== obj2keys.length) {
            return false;
        }
        return obj1keys.every(
            (v) => equalValue(obj1[v], obj2[v]),
        );
    }
}
