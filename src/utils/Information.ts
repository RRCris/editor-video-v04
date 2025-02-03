import { SourceAudio } from "./Sources/SourceAudio";
import { Timeline } from "./Timeline";

export type T_INF = "audio" | "video" | "image";

interface prop_Information {
  name: string;
  infoRaw: ArrayBuffer;
  type: T_INF;
  subType: string;
}

export class Information {
  id: string = crypto.randomUUID();
  name: string;
  infoRaw: ArrayBuffer;
  type: T_INF;
  subType: string;

  constructor(information: prop_Information) {
    this.name = information.name;
    this.infoRaw = information.infoRaw;
    this.type = information.type;
    this.subType = information.subType;
  }

  addSource(TL: Timeline, select: number, medias: T_INF[]) {
    for (const media of medias) {
      if (media === "audio") {
        const source = new SourceAudio(this, TL);
        TL.addSource(source, select);
      }
    }
  }

  getMedia(): T_INF[] {
    if (this.type === "audio") return ["audio"];
    else if (this.type === "image") return ["image"];
    else if (this.type === "video") return ["audio", "video"];
    else return [];
  }
}
