import { Control } from "../utils/Control";
import { Information } from "../utils/Information";

const colors = {
  audio: "#85FFBC",
  video: "#FFDB8C",
  image: "#A1E3FF",
};
export default function CardINF({ INF, CTRL }: { INF: Information; CTRL: Control }) {
  return (
    <div style={{ background: colors[INF.type], width: 100, overflow: "hidden" }}>
      <p>{INF.name}</p>

      {INF.getMedia().map((media, i) => (
        <button key={i} onClick={() => INF.addSource(CTRL.TL_S[0], 2000, [media])}>{`add ${media}`}</button>
      ))}
    </div>
  );
}
