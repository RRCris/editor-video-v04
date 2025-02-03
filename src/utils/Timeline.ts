import { Control } from "./Control";
import EventEmitter from "./EventEmitter";
import { SourceBase } from "./Sources/SourceBase";

const events_Timeline = ["SRC_S"] as const;
type Tevents_Timeline = (typeof events_Timeline)[number];

interface Tsrc {
  start: number;
  end: number;
  src: SourceBase;
}

export class Timeline {
  type = "TIMELINE";
  id: string = crypto.randomUUID();

  SRC_S: SourceBase[] = [];
  EVT: EventEmitter = new EventEmitter();
  CTRL: Control;

  constructor(CTRL: Control) {
    this.CTRL = CTRL;
  }

  addSource(SRC: SourceBase, select: number) {
    const sub = SRC.on("STATE", () => {
      sub.unsubscribe();
      const free = this.getFreeSpace(select, SRC.MOD_TIME.duration, SRC.id);
      SRC.MOD_TIME.setP("DELAY", free.start);
    });
    this.SRC_S.push(SRC);
    this.#fire("SRC_S", this.SRC_S);
  }

  on<T>(event: Tevents_Timeline, callback: (data: T) => void) {
    //Acepta solo eventos registrados
    if (events_Timeline.includes(event)) {
      return this.EVT.on(event, callback);
    } else {
      throw new Error(`El evento de ${event} o esta en la lista de eventos del tipo ${this.type}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #fire(event: Tevents_Timeline, value: any) {
    if (events_Timeline.includes(event)) {
      this.EVT.fire(event, value);
    } else {
      throw new Error(`El evento de ${event} o esta en la lista de eventos del tpi ${this.type}`);
    }
  }

  previewAddSource(start: number, end: number, exeption?: string) {
    const suggestion = this.getFreeSpace(start, end, exeption);
    return {
      valid: start === suggestion.start && end === suggestion.end,
      ...suggestion,
    };
  }

  getAllSpace(): Tsrc[] {
    const res = this.SRC_S.map((SRC) => ({
      start: SRC.MOD_TIME.delay,
      end: SRC.MOD_TIME.delay + SRC.MOD_TIME.duration,
      src: SRC,
    }));

    return res;
  }

  getFreeSpace(start: number, end: number, exeption?: string): { start: number; end: number } {
    if (start < 0) {
      end += Math.abs(start);
      start = 0;
    }
    const collisions = this.getColisions(start, end, exeption || "xxx");
    if (collisions.length === 0) return { start, end };
    return this.getFreeSpace(start + 300, end + 300, exeption);
  }

  getColisions(start: number, end: number, exeption: string): Tsrc[] {
    const src_s = this.getAllSpace();
    const collitions: Tsrc[] = [];
    for (const src of src_s) {
      if (src.src.id === exeption) continue;
      if (end > src.start && src.end > start) {
        collitions.push(src);
      }
    }

    return collitions;
  }
}
