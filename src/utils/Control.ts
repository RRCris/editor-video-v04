/* eslint-disable no-unused-private-class-members */
import { Capturer } from "./Capturer";
import Clock from "./Clock";
import EventEmitter from "./EventEmitter";
import { Information } from "./Information";
import { Timeline } from "./Timeline";

const events_Control = ["INF_S", "TL_S"] as const;
type Tevents_Control = (typeof events_Control)[number];

export class Control {
  type = "CONTROL";
  // #elementCanvas = document.createElement("canvas");
  // #ctx_bitmap = this.#elementCanvas.getContext("bitmaprenderer");
  TL_S: Timeline[] = [];
  CL: Clock = new Clock();
  CAP: Capturer = new Capturer();
  INF_S: Information[] = [];
  #EVT: EventEmitter = new EventEmitter();

  constructor() {
    this.CAP.on("CAPTURE_INFO", (inf: Information) => {
      this.INF_S.push(inf);
      this.#fire("INF_S", this.INF_S);
    });
  }

  on<T>(event: Tevents_Control, callback: (data: T) => void) {
    //Acepta solo eventos registrados
    if (events_Control.includes(event)) {
      return this.#EVT.on(event, callback);
    } else {
      throw new Error(`El evento de ${event} o esta en la lista de eventos del tipo ${this.type}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #fire(event: Tevents_Control, value: any) {
    if (events_Control.includes(event)) {
      this.#EVT.fire(event, value);
    } else {
      throw new Error(`El evento de ${event} o esta en la lista de eventos del tpi ${this.type}`);
    }
  }

  addTimeline(TL: Timeline) {
    this.TL_S.push(TL);
    this.#fire("TL_S", this.TL_S);
  }

  play() {
    this.CL.play();
    const ctx = new AudioContext();
    this.TL_S.map((TL) => {
      TL.SRC_S.map((SRC) => SRC.play(ctx, this.CL.getElapsedTime()));
    });
  }
  pause() {
    this.CL.pause();
    console.log(this.CL.getElapsedTime());
  }
  //Temporal
  reset() {
    this.CL.setSeek(0);
  }
}
