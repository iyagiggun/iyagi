export namespace BasicStatusBar {
    function show(character: import("../object/character").ICharacter, { key, before, after, max, color, }: {
        key: string;
        before: number;
        after: number;
        max: number;
        color: string;
    }): void;
}
