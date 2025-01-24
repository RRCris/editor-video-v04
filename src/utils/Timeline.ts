import EventEmitter from "./EventEmitter";
import { SourceBase } from "./Sources/SourceBase";

const events_Timeline = ["SRC_S"] as const;
type Tevents_Timeline = (typeof events_Timeline)[number];

export class Timeline {
  type = "TIMELINE";
  id: string = crypto.randomUUID();
  SRC_S: SourceBase[] = [];
  #EVT: EventEmitter = new EventEmitter();

  addSource(SRC: SourceBase) {
    this.SRC_S.push(SRC);
    this.#fire("SRC_S", this.SRC_S);
  }

  on<T>(event: Tevents_Timeline, callback: (data: T) => void) {
    //Acepta solo eventos registrados
    if (events_Timeline.includes(event)) {
      return this.#EVT.on(event, callback);
    } else {
      throw new Error(`El evento de ${event} o esta en la lista de eventos del tipo ${this.type}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #fire(event: Tevents_Timeline, value: any) {
    if (events_Timeline.includes(event)) {
      this.#EVT.fire(event, value);
    } else {
      throw new Error(`El evento de ${event} o esta en la lista de eventos del tpi ${this.type}`);
    }
  }
}
