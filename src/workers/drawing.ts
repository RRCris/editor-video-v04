import { Control, Tdraw_Control } from "../utils/Control";
import { Tplay_source } from "../utils/Sources/SourceBase";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Tdraw_Worker {
  control: Tdraw_Control;
  sources: Tplay_source[];
}

const actions = {
  DRAW: ({ control }: Tdraw_Worker) => {
    const canvas = new OffscreenCanvas(control.view.width, control.view.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    //Drawing
    Control.drawInWorker(ctx, control);

    //Export
    const bitmap = canvas.transferToImageBitmap();
    fire("PRINT", bitmap, [bitmap]);
  },
} as const;

export type Tactions_Worker_Drawing = keyof typeof actions;
export type Tevents_Worker_Drawing = "PRINT";

function fire(event: Tevents_Worker_Drawing, data: any, transfer?: Transferable[]) {
  postMessage([event, data], { transfer });
}

function on(event: Tactions_Worker_Drawing, data: any) {
  actions[event](data);
}

self.onmessage = (msg) => on(msg.data[0], msg.data[1]);
