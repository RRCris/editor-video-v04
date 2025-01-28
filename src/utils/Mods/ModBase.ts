import { Subscription } from "rxjs";
import EventEmitter from "../EventEmitter";
import { SourceBase } from "../Sources/SourceBase";

export interface ModBase {
  id: string;
  type: "MOD";
  subType: "TIME";
  EVT: EventEmitter;
  SRC: SourceBase;
  play: (miliseconds: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on: <T>(event: any, callback: (data: T) => void) => Subscription;
}
