export type T_SRC_STATE = "STOP" | "PLAYING" | "PREPARING";

export const events_Source = [""] as const;
export type Tevents_Source = (typeof events_Source)[number];
export interface SourceBase {
  id: string;
  state: T_SRC_STATE;
  subType: string;
  name: string;
  play: (ctx: AudioContext, milisecods: number) => void;
  on: <T>(event: Tevents_Source, callback: (data: T) => void) => void;
}
