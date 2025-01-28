import EventEmitter from "../EventEmitter";
import { SourceBase } from "../Sources/SourceBase";
import { ModBase } from "./ModBase";

const events_ModTime = ["DURATION", "CROP_START", "CROP_END", "DELAY"] as const;
type Tevents_ModTime = (typeof events_ModTime)[number];
export class ModTime implements ModBase {
  id: string = crypto.randomUUID();
  type = "MOD" as const;
  subType = "TIME" as const;
  EVT = new EventEmitter();
  SRC: SourceBase;
  originalDuration = 0;
  cropStart = 0;
  cropEnd = 3000;
  delay = 0;

  get duration() {
    return this.originalDuration - this.cropStart - this.cropEnd;
  }

  constructor(SRC: SourceBase) {
    this.SRC = SRC;
  }
  play(miliseconds: number) {
    const timeleft = this.delay - miliseconds;
    //si no hay audio o ya la reproduccion paso el objeto de tiempo
    if (this.originalDuration <= 0 || timeleft + this.duration < 0)
      return { when: 0, offset: 0, duration: 0 };

    if (timeleft >= 0) {
      return { when: timeleft / 1000, offset: this.cropStart / 1000, duration: this.duration / 1000 };
    } else {
      // si esta durante la produccion
      const when = 0;
      const offset = this.cropStart + Math.abs(timeleft);
      const duration = this.duration - Math.abs(timeleft);

      return { when: when / 1000, offset: offset / 1000, duration: duration / 1000 };
    }
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
