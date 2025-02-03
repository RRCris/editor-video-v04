import EventEmitter from "../EventEmitter";
import { SourceBase } from "../Sources/SourceBase";
import { ModBase } from "./ModBase";

const events_ModTime = ["DURATION", "CROP_START", "CROP_END", "DELAY"] as const;
type Tevents_ModTime = (typeof events_ModTime)[number];

type Tpropertys_ModTime = "DELAY" | "CROP_START" | "CROP_END";

export class ModTime implements ModBase {
  //identificacion
  id: string = crypto.randomUUID();
  type = "MOD" as const;
  subType = "TIME" as const;
  events: Tevents_ModTime = "DURATION";

  //recursos
  EVT = new EventEmitter();
  SRC: SourceBase;
  #originalDuration = 0;

  //dinamicos
  #cropStart = 0;
  #cropEnd = 0;
  #delay = 0;

  get originalDuration() {
    return this.#originalDuration;
  }
  set originalDuration(newValue: number) {
    this.#originalDuration = newValue;
    this.#fire("DURATION", this.duration);
  }
  get cropStart() {
    return this.#cropStart;
  }
  get cropEnd() {
    return this.#cropEnd;
  }
  get delay() {
    return this.#delay;
  }

  get duration() {
    return this.originalDuration - this.#cropStart - this.#cropEnd;
  }

  constructor(SRC: SourceBase) {
    this.SRC = SRC;
  }

  play(miliseconds: number) {
    const timeleft = this.#delay - miliseconds;
    //si no hay audio o ya la reproduccion paso el objeto de tiempo
    if (this.originalDuration <= 0 || timeleft + this.duration < 0)
      return { when: 0, offset: 0, duration: 0 };

    if (timeleft >= 0) {
      return { when: timeleft / 1000, offset: this.#cropStart / 1000, duration: this.duration / 1000 };
    } else {
      // si esta durante la produccion
      const when = 0;
      const offset = this.#cropStart + Math.abs(timeleft);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #fire(event: Tevents_ModTime, value: any) {
    if (events_ModTime.includes(event)) {
      this.EVT.fire(event, value);
    } else {
      throw new Error(`El evento de ${event} o esta en la lista de eventos del tpi ${this.type}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setP(property: Tpropertys_ModTime, newValue: any): { value: any; valid: boolean; message: string } {
    switch (property) {
      case "DELAY":
        //valid
        if (typeof newValue !== "number")
          return { value: this.#delay, message: `${newValue} <- esto no es numero`, valid: false };
        if (newValue < 0)
          return { value: this.#delay, message: `${newValue} <- tiene que ser mayor a 0`, valid: false };
        if (!this.SRC.TL.previewAddSource(newValue, newValue + this.duration, this.SRC.id).valid)
          return {
            value: this.#delay,
            message: `${newValue} <- choca con los recursos de la linea de tiempo actual`,
            valid: false,
          };

        //change
        this.#delay = newValue;
        //fire
        this.#fire("DELAY", this.#delay);
        this.#fire("DURATION", this.duration);

        //feedback about change
        return {
          value: this.#delay,
          message: "all good",
          valid: true,
        };

      case "CROP_START": {
        //valid
        if (typeof newValue !== "number")
          return { value: this.#cropStart, message: `${newValue} <- esto no es numero`, valid: false };
        if (newValue < 0)
          return { value: this.#cropStart, message: `${newValue} <- tiene que ser mayor a 0`, valid: false };
        if (newValue > this.originalDuration - this.cropEnd)
          return {
            value: this.#cropStart,
            message: `${newValue} <- esta en colision con otro corte`,
            valid: false,
          };
        const dur = this.originalDuration - newValue - this.cropEnd;
        if (!this.SRC.TL.previewAddSource(this.delay, this.delay + dur, this.SRC.id).valid)
          return {
            value: this.#delay,
            message: `${newValue} <- choca con los recursos de la linea de tiempo actual`,
            valid: false,
          };

        //change
        this.#cropStart = newValue;
        //fire
        this.#fire("CROP_START", this.#cropStart);
        this.#fire("DURATION", this.duration);

        //feedback about change
        return {
          value: this.#cropStart,
          message: "all good",
          valid: true,
        };
      }
      case "CROP_END": {
        //valid
        if (typeof newValue !== "number")
          return { value: this.#cropEnd, message: `${newValue} <- esto no es numero`, valid: false };
        if (newValue < 0)
          return { value: this.#cropEnd, message: `${newValue} <- tiene que ser mayor a 0`, valid: false };
        if (newValue > this.originalDuration - this.cropStart)
          return {
            value: this.#cropEnd,
            message: `${newValue} <- esta en colision con otro corte`,
            valid: false,
          };
        const dur = this.originalDuration - this.cropStart - newValue;
        if (!this.SRC.TL.previewAddSource(this.delay, this.delay + dur, this.SRC.id).valid)
          return {
            value: this.#delay,
            message: `${newValue} <- choca con los recursos de la linea de tiempo actual`,
            valid: false,
          };

        //change
        this.#cropEnd = newValue;
        //fire
        this.#fire("CROP_END", this.#cropEnd);
        this.#fire("DURATION", this.duration);

        //feedback about change
        return {
          value: this.#cropEnd,
          message: "all good",
          valid: true,
        };
      }
    }
  }
}
