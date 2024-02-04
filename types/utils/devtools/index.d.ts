export namespace devtools {
    let enable: boolean;
    function highlight(scene: import("../../scene").IScene, area: import("../coordinates").Area, options?: {
        color?: string | undefined;
    } | undefined): void;
    function colorize(object: import("../../object").IObject, options?: {
        key?: Object | undefined;
        color?: string | undefined;
    } | undefined): void;
}
