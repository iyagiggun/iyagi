export function isPosInArea(pos: Position, area: Area): boolean;
export function getOverlappingArea(a1: Area, a2: Area): {
    x: number;
    y: number;
    w: number;
    h: number;
} | null;
export function getDirectionByDelta(deltaX: number, deltaY: number): "up" | "down" | "left" | "right";
export function getDistance(p1: Position, p2: Position): number;
export function findShortestPos(attacker: import('../../object/character').ICharacter, target: import('../../object/character').ICharacter): {
    /** @type {import('../../object').Direction} */
    direction: import('../../object').Direction;
    x: number;
    y: number;
};
export function getCoordinateRelationship(self: import('../../object').IObject, target: import('../../object').IObject): {
    distance: number;
    xDiff: number;
    yDiff: number;
};
export function getNextX({ objects, target, delta, }: {
    objects: import('../../object').IObject[];
    target: import('../../object').IObject;
    delta: number;
}): number;
export function getNextY({ objects, target, delta, }: {
    objects: import('../../object').IObject[];
    target: import('../../object').IObject;
    delta: number;
}): number;
export type Position = {
    x: number;
    y: number;
};
export type Area = {
    x: number;
    y: number;
    w: number;
    h: number;
};
