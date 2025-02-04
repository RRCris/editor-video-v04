import { useEffect, useMemo, useRef } from "react";
import { Control } from "./utils/Control";
import { button, useControls } from "leva";
import CardINF from "./components/CardINF";
import TimelineUI from "./components/TimelineUI";
import { useObserver, useObserver2 } from "./hooks/useObserver";

function App() {
  const CTRL = useMemo(() => new Control(), []);
  const refContainer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (refContainer.current) {
      CTRL.couple(refContainer.current);
    }
    return () => {
      if (refContainer.current) refContainer.current.innerHTML = "";
    };
  }, []);

  const INF_S = useObserver(CTRL.INF_S, CTRL, "INF_S", (v) => [...v]);
  const TL_S = useObserver(CTRL.TL_S, CTRL, "TL_S", (v) => [...v]);
  useObserver2(0, () => CTRL.on("PLAYING", (time: number) => console.log(time)));
  useObserver2(0, () =>
    CTRL.CAP.on("CAPTURE_ERROR", () => alert("hubo un error al intentar cargar el recurso"))
  );

  useControls("CTRL", {
    play: button(() => CTRL.play()),
    pause: button(() => CTRL.pause()),
    reset: button(() => CTRL.reset()),
    loadFile: button(() => CTRL.CAP.captureFiles()),
    // addTimeline: button(() => CTRL.addTimeline(new Timeline(CTRL))),
    preview: button(() => console.log(CTRL.TL_S[0].previewAddSource(2000, 6000))),
    focus: button(() => CTRL.focusScene()),
    addZoom: {
      value: CTRL.timeScale,
      min: 0,
      max: 200,
      onChange: (value: number) => (CTRL.timeScale = value),
    },
    background: {
      value: CTRL.backgroundView,
      onChange: (clr: string) => (CTRL.backgroundView = clr),
    },
    zoom: {
      value: CTRL.zoomView,
      min: 10,
      max: 200,
      onChange: (value: number) => (CTRL.zoomView = value),
    },
    offsets: {
      value: { x: CTRL.offsetXView, y: CTRL.offsetYView },
      step: 5,
      onChange: ({ x, y }: { x: number; y: number }) => {
        CTRL.offsetXView = x;
        CTRL.offsetYView = y;
      },
    },
    backgroundScene: {
      value: CTRL.backgroundScene,
      onChange: (clr: string) => (CTRL.backgroundScene = clr),
    },
    widthScene: {
      value: CTRL.widthScene,
      onChange: (clr: number) => (CTRL.widthScene = clr),
    },
    heightScene: {
      value: CTRL.heightScene,
      onChange: (clr: number) => (CTRL.heightScene = clr),
    },
  });
  const controls = useControls({
    library: true,
  });

  return (
    <div>
      <h1>editor video v4</h1>
      <div ref={refContainer} style={{ width: 500, height: 300 }} />
      <div style={{ display: "flex", maxWidth: 600, flexWrap: "wrap", gap: 20 }}>
        {controls.library &&
          Object.values(INF_S).map((INF) => <CardINF key={INF.id} INF={INF} CTRL={CTRL} />)}
      </div>
      <div>
        {TL_S.map((TL) => (
          <TimelineUI TL={TL} key={TL.id} />
        ))}
      </div>
    </div>
  );
}

export default App;
