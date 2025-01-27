import EventEmitter from "../EventEmitter";
import { SourceBase } from "../Sources/SourceBase";
import { ModBase } from "./ModBase";

const events_ModTime = ["DURATION", "CROP_START", "CROP_END", "DELAY"] as const;
type Tevents_ModTime = (typeof events_ModTime)[number];
export class ModTime implements ModBase {
  id: string = crypto.randomUUID();
  type = "MOD" as const;
  EVT = new EventEmitter();
  SRC: SourceBase;
  duration = 0;
  cropStart = 0;
  cropEnd = 0;
  delay = 1;
  constructor(SRC: SourceBase) {
    this.SRC = SRC;
  }
  play(miliseconds: number) {
    console.log(miliseconds);
    return { when: this.delay, offset: 0, duration: this.duration };
  }
  on<T>(event: Tevents_ModTime, callback: (data: T) => void) {
    //Acepta solo eventos registrados
    if (events_ModTime.includes(event)) {
      return this.EVT.on(event, callback);
    } else {
      throw new Error(`El evento de ${event} o esta en la lista de eventos del tipo ${this.type}`);
    }
  }
}
