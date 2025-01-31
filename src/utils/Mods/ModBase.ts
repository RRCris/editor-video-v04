import { Subscription } from "rxjs";
import { SourceBase } from "../Sources/SourceBase";
export type Tmods = "TIME" | "POSITION";
export interface ModBase {
  id: string;
  type: "MOD";
  subType: Tmods;
  SRC: SourceBase;
  play: (miliseconds: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on: <T>(event: any, callback: (data: T) => void) => Subscription;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setP(property: any, newValue: any): { value: any; valid: boolean; message: string };
}
