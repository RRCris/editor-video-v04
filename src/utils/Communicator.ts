/*
Communicator COM :
el objetivo de esta clase es gestinar la comunicacion entre el hilo principal y los web worker creados para renderizar o para grabar
 * la comunicacion va a ser por medio de eventos (Observables & Patron Observador) para ello el metodo ON 
 * para enviar informacion estara el metodo fire
 * el contructor va a recibir el path del worker que es necesario arrancar
 * los eventos que ejecutan y los que se escuchan van a estar juntos tanto de drawing como de recording
 *  necesitamos una funcion que termine la operacion de thread para evitar que cada re-renderizado se cree otro thread
*/

import { Tactions_Worker_Drawing, Tevents_Worker_Drawing } from "../workers/drawing";
import EventEmitter from "./EventEmitter";

export class Communicator {
  #worker: Worker;
  #EV: EventEmitter = new EventEmitter();

  constructor(src: string) {
    this.#worker = new Worker(new URL(src, import.meta.url), { type: "module" });
    this.#worker.onmessage = (msg) => this.#processMessage(msg);
  }

  #processMessage(msg: MessageEvent) {
    const [event, data]: [Tevents_Worker_Drawing, number] = msg.data;
    this.#EV.fire(event, data);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: Tevents_Worker_Drawing, callback: (v: any) => void) {
    this.#EV.on(event, callback);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fire(event: Tactions_Worker_Drawing, data: any) {
    this.#worker.postMessage([event, data]);
  }

  disconnect() {
    console.log("DISCONNECT WORKER");
    this.#worker.terminate();
  }
}
