import { Tplay_source } from "../utils/Sources/SourceBase";

/* eslint-disable @typescript-eslint/no-explicit-any */
console.log("LOAD WORKER DRAWING");

const actions = {
  DRAW: (data: Tplay_source[]) => {
    const canvas = new OffscreenCanvas(300, 300);
    const ctx = canvas.getContext("2d");
    ctx?.fillRect(10, 10, 100, 100);
    console.log(data);

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
