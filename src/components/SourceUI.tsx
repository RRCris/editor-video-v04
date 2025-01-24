import { SourceBase } from "../utils/Sources/SourceBase";
export default function SourceUI({ SRC }: { SRC: SourceBase }) {
  return <div>{SRC.name}</div>;
}
