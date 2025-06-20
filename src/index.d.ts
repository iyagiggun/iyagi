import { ServerMessage } from "./server/const/index.js";
import { UserType } from "./server/user/index.js";

export type IyagiNext = (p: {user: UserType, reply: (msg: ServerMessage) => void }) => void;