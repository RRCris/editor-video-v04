import { useEffect, useMemo, useState } from "react";
import { Control } from "./utils/Control";
import { button, useControls } from "leva";
import { Subscription } from "rxjs";
import CardINF from "./components/CardINF";
import { Timeline } from "./utils/Timeline";
import TimelineUI from "./components/TimelineUI";

function App() {
  const CTRL = useMemo(() => new Control(), []);
  const [, setINF_S] = useState(CTRL.INF_S);
  const [, setTL_S] = useState(CTRL.TL_S);

  useEffect(() => {
    const subs: Subscription[] = [];

    subs.push(CTRL.on("INF_S", () => setINF_S({ ...CTRL.INF_S })));
    subs.push(CTRL.on("TL_S", () => setTL_S({ ...CTRL.TL_S })));
    subs.push(CTRL.CAP.on("CAPTURE_ERROR", () => alert("hubo un error al intentar cargar el recurso")));

    return () => subs.forEach((sub) => sub.unsubscribe());
  }, []);
  useControls("CTRL", {
    play: button(() => CTRL.play()),
    pause: button(() => CTRL.pause()),
    reset: button(() => CTRL.reset()),
    loadFile: button(() => CTRL.CAP.captureFiles()),
    addTimeline: button(() => CTRL.addTimeline(new Timeline(CTRL))),
    loadLinkAudio: button(() =>
      CTRL.CAP.captureLink(
        "https://v1.cdnpk.net/videvo_files/audio/premium/audio0137/conversions/mp3_option/mi_explosion_03_hpx.mp3?token=exp=1737742039~hmac=66b195fe54866697a171442289a984e12b226acc2aa41200252836e3d4e15c8a&filename=251585_meme_five_different_miexplosion03hpx.mp3"
      )
    ),
    loadLinkVideo: button(() =>
      CTRL.CAP.captureLink(
        "https://videocdn.cdnpk.net/joy/content/video/free/2014-12/originalContent/Raindrops_Videvo.mp4?token=exp=1737742457~hmac=92bea9d7d3b21d2c4df8251e9d3bd4e46ef5ac8b74cc010146010159d78c4c81&filename=3313_rain_raining_rain_drops_RaindropsVidevo.mp4"
      )
    ),
  });
  const controls = useControls({
    library: false,
  });

  return (
    <div>
      <h1>editor video v4</h1>
      <div style={{ display: "flex", maxWidth: 600, flexWrap: "wrap", gap: 20 }}>
        {controls.library &&
          Object.values(CTRL.INF_S).map((INF) => <CardINF key={INF.id} INF={INF} CTRL={CTRL} />)}
      </div>
      <div>
        {CTRL.TL_S.map((TL) => (
          <TimelineUI TL={TL} key={TL.id} />
        ))}
      </div>
    </div>
  );
}

export default App;
