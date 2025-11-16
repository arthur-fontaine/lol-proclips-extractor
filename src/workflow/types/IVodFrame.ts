export interface IVodFrame {
  path: string;
  videoTimestampSeconds: number;
}

export namespace IVodFrame {
  export type With<T> = Omit<IVodFrame, keyof T> & T;
  export type GameTimestamp = { gameTimestampSeconds: number | null };
}
