import type { WithRequiredProps } from "../../lib/types/WithRequiredProps.ts";
import type { IGame } from "./IGame.ts";

export type IVod = WithRequiredProps<IGame["vods"][number], "startMillis" | "endMillis">
