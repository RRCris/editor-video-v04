import { Subscription } from "rxjs";
import { ModTime } from "../Mods/ModTime";
import EventEmitter from "../EventEmitter";
import { Timeline } from "../Timeline";

export type T_SRC_STATE = "STOP" | "PLAYING" | "PREPARING";

export const events_Source = [""] as const;
export type Tevents_Source = (typeof events_Source)[number];
export interface SourceBase {
  //identificacion
  id: string;
  type: "SOURCE";
  name: string;
  //data readonly
  subType: string;
  //recursos
  EVT: EventEmitter;
  MOD_TIME: ModTime;
  TL: Timeline;
  //variable data
  state: T_SRC_STATE;
  play: (ctx: AudioContext, milisecods: number) => void;
  on: <T>(event: Tevents_Source, callback: (data: T) => void) => Subscription;
  sync: (milisecods: number) => Promise<void>;
}
