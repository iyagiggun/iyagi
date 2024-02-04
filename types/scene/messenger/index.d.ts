export default messanger;
declare namespace messanger {
    function talk({ speaker, message, width, height, }: {
        speaker: import("../../object/character").ICharacter;
        message: string;
        width?: number | undefined;
        height?: number | undefined;
    }): Promise<any>;
}
