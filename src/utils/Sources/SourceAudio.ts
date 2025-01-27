import EventEmitter from "../EventEmitter";
import { Information } from "../Information";
import { events_Source, SourceBase, T_SRC_STATE, Tevents_Source } from "./SourceBase";

export class SourceAudio implements SourceBase {
  id = crypto.randomUUID();
  type = "AUDIO";
  #audiobuffer: null | AudioBuffer = null;
  bufferDuration: number | null = null;
  state: T_SRC_STATE = "PREPARING";
  subType: string;
  name: string;

  #EVT = new EventEmitter();

  constructor(INF: Information) {
    this.subType = INF.subType;
    this.name = INF.name;
    new AudioContext().decodeAudioData(INF.infoRaw).then((audiobuffer) => {
      this.#audiobuffer = audiobuffer;
      this.bufferDuration = audiobuffer.duration * 1000;
      this.state = "STOP";
    });
  }

  play(ctx: AudioContext, milisecods: number) {
    const node = ctx.createBufferSource();
    node.buffer = this.#audiobuffer;

    node.start();

    node.connect(ctx.destination);

    console.log(milisecods);
  }

  on<T>(event: Tevents_Source, callback: (data: T) => void) {
    //Acepta solo eventos registrados
    if (events_Source.includes(event)) {
      return this.#EVT.on(event, callback);
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
