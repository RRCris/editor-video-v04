import EventEmitter from "../EventEmitter";
import { Information } from "../Information";
import { ModBase, Tmods } from "../Mods/ModBase";
import { ModTime } from "../Mods/ModTime";
import { Timeline } from "../Timeline";
import { events_Source, SourceBase, T_SRC_STATE, Tevents_Source } from "./SourceBase";

export class SourceAudio implements SourceBase {
  //identificacion
  id = crypto.randomUUID();
  type = "SOURCE" as const;
  name: string;

  //recursos
  MOD_TIME: ModTime = new ModTime(this);
  EVT = new EventEmitter();
  TL: Timeline;
  MOD_S: ModBase[] = [];

  //data only readble
  #audiobuffer: null | AudioBuffer = null;
  bufferDuration: number | null = null;
  subType: string;

  //variable data
  #state: T_SRC_STATE = "PREPARING";

  //fire event
  set state(newState: T_SRC_STATE) {
    this.#state = newState;
    this.#fire("STATE", this.state);
  }

  get state() {
    return this.#state;
  }

  constructor(INF: Information, TL: Timeline) {
    this.TL = TL;
    this.subType = INF.subType;
    this.name = INF.name;
    new AudioContext().decodeAudioData(INF.infoRaw.slice(0)).then((audiobuffer) => {
      this.#audiobuffer = audiobuffer;
      this.bufferDuration = audiobuffer.duration * 1000;
      this.MOD_TIME.originalDuration = audiobuffer.duration * 1000;
      this.state = "STOP";
    });
  }
  sync(miliseconds: number) {
    console.log(miliseconds);
    return Promise.resolve();
  }

  play(ctx: AudioContext, milisecods: number) {
    if (this.state === "STOP") {
      const { duration, offset, when } = this.MOD_TIME.play(milisecods);
      const node = ctx.createBufferSource();
      node.buffer = this.#audiobuffer;

      node.start(when, offset, duration);

      node.connect(ctx.destination);
    }
    return null;
  }
  pause() {
    this.state = "STOP";
  }

  on<T>(event: Tevents_Source, callback: (data: T) => void) {
    //Acepta solo eventos registrados
    if (events_Source.includes(event)) {
      return this.EVT.on(event, callback);
    } else {
      throw new Error(`El evento de ${event} o esta en la lista de eventos del tipo ${this.type}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #fire(event: Tevents_Source, value: any) {
    if (events_Source.includes(event)) {
      this.EVT.fire(event, value);
    } else {
      throw new Error(`El evento de ${event} o esta en la lista de eventos del tpi ${this.type}`);
    }
  }

  getMod(subType: Tmods): ModBase {
    if (subType === this.MOD_TIME.subType) return this.MOD_TIME;
    for (const mod of this.MOD_S) {
      if (mod.subType === subType) return mod;
    }
    throw new Error(`El subType ${subType} no se encontro en el recurso de tipo ${this.type}`);
  }
}
