/* eslint-disable no-unused-private-class-members */
import { Capturer } from "./Capturer";
import Clock from "./Clock";
import EventEmitter from "./EventEmitter";
import { Information } from "./Information";
import { Timeline } from "./Timeline";

const events_Control = ["INF_S", "TL_S", "STATE", "PLAYING", "TIME_SCALE"] as const;
type Tevents_Control = (typeof events_Control)[number];

export class Control {
  //identificación
  type = "CONTROL";
  // #elementCanvas = document.createElement("canvas");
  // #ctx_bitmap = this.#elementCanvas.getContext("bitmaprenderer");

  //recursos
  TL_S: Timeline[] = [new Timeline(this)];
  CL: Clock = new Clock();
  CAP: Capturer = new Capturer();
  INF_S: Information[] = [];
  EVT: EventEmitter = new EventEmitter();

  //variable data
  #intervalTime = 100;
  #idInterval: null | number = null;
  #temporalContextAudio: null | AudioContext = null;
  #state: "STOP" | "PLAYING" = "STOP";
  #timeScale = 50;

  //fire & change
  set state(newState: "STOP" | "PLAYING") {
    this.#state = newState;
    this.#fire("STATE", this.state);
  }
  get state() {
    return this.#state;
  }

  //fire & change
  set timeScale(newValue: number) {
    this.#timeScale = newValue;
    this.#fire("TIME_SCALE", this.timeScale);
  }
  get timeScale() {
    return this.#timeScale;
  }

  constructor() {
    this.CAP.on("CAPTURE_INFO", (inf: Information) => {
      this.INF_S.push(inf);
      this.#fire("INF_S", this.INF_S);
    });
  }

  on<T>(event: Tevents_Control, callback: (data: T) => void) {
    //Acepta solo eventos registrados
    if (events_Control.includes(event)) {
      return this.EVT.on(event, callback);
    } else {
      throw new Error(`El evento de ${event} o esta en la lista de eventos del tipo ${this.type}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #fire(event: Tevents_Control, value: any) {
    if (events_Control.includes(event)) {
      this.EVT.fire(event, value);
    } else {
      throw new Error(`El evento de ${event} o esta en la lista de eventos del tpi ${this.type}`);
    }
  }

  addTimeline(TL: Timeline) {
    this.TL_S.push(TL);
    this.#fire("TL_S", this.TL_S);
  }

  async play() {
    if (this.state === "STOP") {
      this.state = "PLAYING";
      //sincroniza audios video etc para que comiencen en el mismo lugar
      await this.sync(this.CL.getElapsedTime());

      //comienza el conteo del tiempo
      this.CL.play();

      //guardamos para pausar mas adelante
      this.#temporalContextAudio = new AudioContext();

      //comenzamos a reproducir todos los medios
      this.TL_S.forEach((TL) => {
        TL.SRC_S.forEach((SRC) =>
          SRC.play(this.#temporalContextAudio || new AudioContext(), this.CL.getElapsedTime())
        );
      });

      //verificamos el iempo trascurrido cada X tiempo
      this.#idInterval = setInterval(() => {
        this.#fire("PLAYING", this.CL.getElapsedTime());
      }, this.#intervalTime);
    }
  }
  pause() {
    if (this.state === "PLAYING") {
      this.state = "STOP";
      this.CL.pause();
      this.#temporalContextAudio?.close();
      this.#temporalContextAudio = null;
      this.TL_S.forEach((TL) => {
        TL.SRC_S.forEach((SRC) => SRC.pause());
      });

      //limpiamos el intervale
      if (this.#idInterval) clearInterval(this.#idInterval);
    }
  }
  sync(milisecods: number) {
    //esperamos  a que todos los recursos carguen el contenido necesario para iniciar
    return Promise.all(this.TL_S.map((TL) => TL.SRC_S.map((SRC) => SRC.sync(milisecods))).flat());
  }
  //Temporal
  reset() {
    this.pause();
    this.CL.setSeek(0);
  }
}
