import EventEmitter from "./EventEmitter";
import { Information, T_INF } from "./Information";

const events_Capturer = ["CAPTURE_INFO", "STATE", "CAPTURE_ERROR"] as const;
type Tevents_Capturer = (typeof events_Capturer)[number];

export class Capturer {
  type = "CAPTURER";
  accept: string[] = ["video/mp4", "audio/mp3", "audio/mpeg", "image/webp", "image/png", "image/jpeg"];
  #EVT: EventEmitter = new EventEmitter();

  #state: "inactive" | "capturing" = "inactive";
  get state() {
    return this.#state;
  }
  set state(newState: "inactive" | "capturing") {
    this.#state = newState;
    this.#fire("STATE", this.state);
  }

  #getName(src: string | File) {
    if (!src) return "Archivo desconocido";

    const fileName = src instanceof File ? src.name : src.split("/").pop()?.split("?")[0];
    return fileName?.replace(/\.[^/.]+$/, "") || "Archivo desconocido"; // Elimina la extensión
  }

  captureFiles() {
    if (this.state !== "inactive") return;
    this.state = "capturing";
    const elementInput = document.createElement("input");
    elementInput.type = "file";
    elementInput.multiple = true;
    elementInput.accept = this.accept.join(", ");
    elementInput.onchange = (e) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const files: FileList | undefined = (e.target as any).files;
      if (!files) return;

      for (const file of files) {
        const reader = new FileReader();
        reader.onloadend = (e) => {
          const arraybuffer = e.target?.result as ArrayBuffer | undefined;
          if (!arraybuffer) return;

          this.#fire(
            "CAPTURE_INFO",
            new Information({
              infoRaw: arraybuffer,
              name: this.#getName(file),
              subType: file.type,
              type: file.type.split("/")[0] as T_INF,
            })
          );
          this.state = "inactive";
        };
        reader.onerror = (err) => {
          this.state = "inactive";
          this.#fire("CAPTURE_ERROR", err);
        };
        reader.readAsArrayBuffer(file);
      }
    };
    elementInput.click();
    elementInput.oncancel = () => {
      this.state = "inactive";
      this.#fire("CAPTURE_ERROR", new Error("Se ha cancelado la seleccion de archivo"));
    };
  }

  captureLink(link: string) {
    if (this.state !== "inactive") return;
    this.state = "capturing";
    const name = this.#getName(link);
    let subType: null | string = null;
    fetch(link)
      .then((res) => {
        subType = res.headers.get("content-type");
        return res.arrayBuffer();
      })
      .then((arraybuffer) => {
        if (subType && this.accept.includes(subType)) {
          this.#fire(
            "CAPTURE_INFO",
            new Information({
              name,
              infoRaw: arraybuffer,
              subType,
              type: subType.split("/")[0] as T_INF,
            })
          );
          this.state = "inactive";
        } else {
          this.state = "inactive";
          this.#fire(
            "CAPTURE_ERROR",
            new Error(
              ` El tipo de archivo que se ha obtenido no hace parte de los acceptados por el capturador, intente con los siguientes tipos de archivo ${this.accept}`
            )
          );
        }
      })
      .catch((err) => {
        this.state = "inactive";
        this.#fire("CAPTURE_ERROR", err);
      });
  }

  on<T>(event: Tevents_Capturer, callback: (data: T) => void) {
    //Acepta solo eventos registrados
    if (events_Capturer.includes(event)) {
      return this.#EVT.on(event, callback);
    } else {
      throw new Error(`El evento de ${event} o esta en la lista de eventos del tipo ${this.type}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #fire(event: Tevents_Capturer, value: any) {
    if (events_Capturer.includes(event)) {
      this.#EVT.fire(event, value);
    } else {
      throw new Error(`El evento de ${event} o esta en la lista de eventos del tpi ${this.type}`);
    }
  }
}
