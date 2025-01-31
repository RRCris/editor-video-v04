import { useEffect, useState } from "react";
import { Timeline } from "../utils/Timeline";
import { Subscription } from "rxjs";
import SourceUI from "./SourceUI";
import css from "../styles/components/TimelineUI.module.css";
export default function TimelineUI({ TL }: { TL: Timeline }) {
  const [, setSRC_S] = useState(TL.SRC_S);

  useEffect(() => {
    const subs: Subscription[] = [];
    subs.push(TL.on("SRC_S", () => setSRC_S([...TL.SRC_S])));

    return () => subs.forEach((sub) => sub.unsubscribe());
  }, []);

  return (
    <div className={css.container}>
      {TL.SRC_S.map((SRC) => (
        <SourceUI SRC={SRC} key={SRC.id} />
      ))}
    </div>
  );
}
