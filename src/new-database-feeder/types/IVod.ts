import type { WithRequiredProps } from "../../lib/types/WithRequiredProps.ts";
import type { IGame } from "./IGame.ts";

export type IVod = WithRequiredProps<IGame["vods"][number], "startMillis" | "endMillis">
export namespace IVod {
  export type With<T> = Omit<IVod, keyof T> & T;
  export type LocalPath = { localPath: string };
}
