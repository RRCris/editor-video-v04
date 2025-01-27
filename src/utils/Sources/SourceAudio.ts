import EventEmitter from "../EventEmitter";
import { Information } from "../Information";
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

  //data only readble
  #audiobuffer: null | AudioBuffer = null;
  bufferDuration: number | null = null;
  subType: string;

  //variable data
  state: T_SRC_STATE = "PREPARING";

  constructor(INF: Information, TL: Timeline) {
    this.TL = TL;
    this.subType = INF.subType;
    this.name = INF.name;
    new AudioContext().decodeAudioData(INF.infoRaw).then((audiobuffer) => {
      this.#audiobuffer = audiobuffer;
      this.bufferDuration = audiobuffer.duration * 1000;
      this.MOD_TIME.duration = audiobuffer.duration * 1000;
      this.state = "STOP";
    });
  }
  sync(milisecods: number) {
    return Promise.resolve();
  }

  play(ctx: AudioContext, milisecods: number) {
    const { duration, offset, when } = this.MOD_TIME.play(milisecods);
    const node = ctx.createBufferSource();
    node.buffer = this.#audiobuffer;

    node.start(when, offset, duration);

    node.connect(ctx.destination);

    console.log(milisecods);
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
  // #fire(event: Tevents_Source, value: any) {
  //   if (events_Source.includes(event)) {
  //     this.#EVT.fire(event, value);
  //   } else {
  //     throw new Error(`El evento de ${event} o esta en la lista de eventos del tpi ${this.type}`);
  //   }
  // }
}
