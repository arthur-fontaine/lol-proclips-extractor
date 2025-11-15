export interface IVodFrame {
  path: string;
  videoTimestamp: number;
}

export namespace IVodFrame {
  export type With<T> = Omit<IVodFrame, keyof T> & T;
  export type GameTimestamp = { gameSeconds: number | null };
}
