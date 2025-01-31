import { useMemo } from "react";
import { SourceBase } from "../utils/Sources/SourceBase";
import { useObserver } from "../hooks/useObserver";
import { ModTime } from "../utils/Mods/ModTime";

import css from "../styles/components/SourceUI.module.css";
export default function SourceUI({ SRC }: { SRC: SourceBase }) {
  const MOD_TIME = useMemo(() => SRC.getMod("TIME"), [SRC]) as ModTime;
  const CTRL = SRC.TL.CTRL;

  const delay = useObserver(MOD_TIME.delay, MOD_TIME, "DELAY");
  const duration = useObserver(MOD_TIME.duration, MOD_TIME, "DURATION");
  const timeScale = useObserver(CTRL.timeScale, CTRL, "TIME_SCALE");
  //from miliseconds to px
  const fromMtoPX = (milisecods: number) => {
    return (milisecods / 1000) * timeScale;
  };
  const offset = fromMtoPX(delay);
  const width = fromMtoPX(duration);

  return (
    <div className={css.container} style={{ left: offset, width, display: "flex" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <button onClick={() => MOD_TIME.setP("DELAY", MOD_TIME.delay + 500)}>+ delay</button>
        <button onClick={() => MOD_TIME.setP("DELAY", MOD_TIME.delay - 500)}>- delay</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <button onClick={() => MOD_TIME.setP("CROP_START", MOD_TIME.cropStart + 500)}>+ cropStart</button>
        <button onClick={() => MOD_TIME.setP("CROP_START", MOD_TIME.cropStart - 500)}>- cropStart</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <button onClick={() => MOD_TIME.setP("CROP_END", MOD_TIME.cropEnd + 500)}>+ cropEnd</button>
        <button onClick={() => MOD_TIME.setP("CROP_END", MOD_TIME.cropEnd - 500)}>- cropEnd</button>
      </div>
    </div>
  );
}
