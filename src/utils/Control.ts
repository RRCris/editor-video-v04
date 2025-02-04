import { Capturer } from "./Capturer";
import Clock from "./Clock";
import { Communicator } from "./Communicator";
import EventEmitter from "./EventEmitter";
import { Information } from "./Information";
import { Timeline } from "./Timeline";

import workerDrawing from "../workers/drawing?worker&url";
import { Tdraw_Worker } from "../workers/drawing";

const events_Control = [
  "INF_S",
  "TL_S",
  "STATE",
  "PLAYING",
  "TIME_SCALE",
  "BACKGROUND_VIEW",
  "ZOOM_VIEW",
  "OFFSETX_VIEW",
  "OFFSETY_VIEW",
  "BACKGROUND_SCENE",
  "WIDTH_SCENE",
  "HEIGHT_SCENE",
] as const;
type Tevents_Control = (typeof events_Control)[number];

export interface Tdraw_Control {
  scene: {
    background: string;
    width: number; //1280;
    height: number; //720;
  };
  view: {
    width: number; //1280;
    height: number; //720;
    background: string;
    zoom: number;
    offsetX: number;
    offsetY: number;
  };
}

export class Control {
  //identificación
  type = "CONTROL";
  id: string = crypto.randomUUID();

  SC = document.createElement("canvas");
  CTX_BITMAP = this.SC.getContext("bitmaprenderer");

  //recursos
  TL_S: Timeline[] = [new Timeline(this)];
  CL: Clock = new Clock();
  CAP: Capturer = new Capturer();
  INF_S: Information[] = [];
  EVT: EventEmitter = new EventEmitter();
  COM_D: Communicator = new Communicator(workerDrawing);

  //variable data
  #intervalTime = 100;
  #idInterval: null | number = null;
  #temporalContextAudio: null | AudioContext = null;
  #state: "STOP" | "PLAYING" = "STOP";
  #timeScale = 50;

  #view = {
    width: 1280,
    height: 720,
    background: "#F00",
    zoom: 100,
    offsetX: 0,
    offsetY: 0,
  };

  #scene = {
    background: "#00F",
    width: 400,
    height: 400,
  };

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

  //fire & change & update draw_______ VIEW
  set backgroundView(newValue: string) {
    this.#view.background = newValue;
    this.#fire("BACKGROUND_VIEW", this.#view.background);
    this.draw();
  }
  get backgroundView() {
    return this.#view.background;
  }
  //fire & change& update draw _______ VIEW
  set zoomView(newValue: number) {
    //valid
    if (newValue < 10 || newValue > 200) return;
    this.#view.zoom = newValue;
    this.#fire("ZOOM_VIEW", this.#view.zoom);
    this.draw();
  }
  get zoomView() {
    return this.#view.zoom;
  }
  //fire & change& update draw _______ VIEW
  set offsetXView(newValue: number) {
    this.#view.offsetX = newValue;
    this.#fire("OFFSETX_VIEW", this.#view.offsetX);
    this.draw();
  }
  get offsetXView() {
    return this.#view.offsetX;
  }

  //fire & change & update draw_______ VIEW
  set offsetYView(newValue: number) {
    this.#view.offsetY = newValue;
    this.#fire("OFFSETY_VIEW", this.#view.offsetY);
    this.draw();
  }
  get offsetYView() {
    return this.#view.offsetY;
  }
  //fire & change & update draw_______ SCENE
  set backgroundScene(newValue: string) {
    this.#scene.background = newValue;
    this.#fire("BACKGROUND_SCENE", this.#scene.background);
    this.draw();
  }
  get backgroundScene() {
    return this.#scene.background;
  }

  //fire & change & update draw_______ SCENE
  set widthScene(newValue: number) {
    this.#scene.width = newValue;
    this.#fire("WIDTH_SCENE", this.#scene.width);
    this.draw();
  }
  get widthScene() {
    return this.#scene.width;
  }

  //fire & change & update draw_______ SCENE
  set heightScene(newValue: number) {
    this.#scene.height = newValue;
    this.#fire("HEIGHT_SCENE", this.#scene.height);
    this.draw();
  }
  get heightScene() {
    return this.#scene.height;
  }

  constructor() {
    this.COM_D.on("PRINT", (v) => this.#print(v));

    this.CAP.on("CAPTURE_INFO", (inf: Information) => {
      this.INF_S.push(inf);
      this.#fire("INF_S", this.INF_S);
    });

    this.draw(); //para que el canvas no inicie vacio
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
      this.TL_S.forEach((TL) =>
        TL.SRC_S.forEach((SRC) =>
          SRC.play(this.#temporalContextAudio || new AudioContext(), this.CL.getElapsedTime())
        )
      );

      this.draw();

      //verificamos el tiempo trascurrido cada X tiempo
      this.#idInterval = setInterval(() => {
        this.#fire("PLAYING", this.CL.getElapsedTime());
      }, this.#intervalTime);
    }
  }
  draw() {
    const sources = this.TL_S.map((TL) =>
      TL.SRC_S.map((SRC) =>
        SRC.play(this.#temporalContextAudio || new AudioContext(), this.CL.getElapsedTime())
      )
    )
      .flat()
      .filter((dt) => dt !== null);

    //imprimir
    const data: Tdraw_Worker = {
      control: {
        view: this.#view,
        scene: this.#scene,
      },
      sources,
    };
    this.COM_D.fire("DRAW", data);
  }
  #print(data: ImageBitmap) {
    this.CTX_BITMAP?.transferFromImageBitmap(data);
    if (this.state === "PLAYING") requestAnimationFrame(() => this.draw());
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

      this.#fire("PLAYING", this.CL.getElapsedTime());
    }
  }
  sync(milisecods: number) {
    //esperamos  a que todos los recursos carguen el contenido necesario para iniciar
    return Promise.all(this.TL_S.map((TL) => TL.SRC_S.map((SRC) => SRC.sync(milisecods))).flat());
  }

  focusScene() {
    this.offsetXView = this.#view.width / 2;
    this.offsetYView = this.#view.height / 2;

    const aspectRatioW = this.#view.width / this.#scene.width;
    const aspectRatioH = this.#view.height / this.#scene.height;
    this.zoomView = Math.round(Math.min(aspectRatioH, aspectRatioW) * 90);
  }
  couple(root: HTMLElement) {
    const { width, height } = root.getBoundingClientRect();
    this.#view.width = width;
    this.#view.height = height;
    this.SC.width = width;
    this.SC.height = height;

    root.appendChild(this.SC);
    setTimeout(() => this.focusScene());
  }

  //Temporal
  reset() {
    this.pause();
    this.CL.setSeek(0);
  }

  static drawInWorker(ctx: OffscreenCanvasRenderingContext2D, { view, scene }: Tdraw_Control) {
    ctx.save();
    ctx.fillStyle = view.background;
    ctx.fillRect(0, 0, view.width, view.height);
    ctx.restore();

    ctx.translate(view.offsetX, view.offsetY);
    ctx.scale(view.zoom / 100, view.zoom / 100);

    ctx.save();
    ctx.fillStyle = scene.background;
    ctx.fillRect(-scene.width / 2, -scene.height / 2, scene.width, scene.height);
    ctx.restore();

    // ctx.scale(view.zoom / 100, view.zoom / 100);
    // ctx.translate(view.offsetX,view.offsetY)
  }
}
