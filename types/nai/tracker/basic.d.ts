export namespace IBasicTracker {
    function control({ scene, controlled, target, onArrived, intervalDelay, }: {
        scene: import("../../scene").IScene;
        controlled: import("../../object/character").ICharacter;
        target: import("../../object/character").ICharacter;
        onArrived?: (() => void) | undefined;
        intervalDelay?: number | undefined;
    }): void;
    function release(target: import("../../object/character").ICharacter): void;
}
