import { useEffect, useState } from "react";
import { Timeline } from "../utils/Timeline";
import { Subscription } from "rxjs";
import SourceUI from "./SourceUI";

export default function TimelineUI({ TL }: { TL: Timeline }) {
  const [, setSRC_S] = useState(TL.SRC_S);

  useEffect(() => {
    const subs: Subscription[] = [];
    subs.push(TL.on("SRC_S", () => setSRC_S([...TL.SRC_S])));

    return () => subs.forEach((sub) => sub.unsubscribe());
  }, []);

  console.log(TL.SRC_S);
  return (
    <div style={{ background: "#FFD1B0", height: 64 }}>
      {TL.SRC_S.map((SRC) => (
        <SourceUI SRC={SRC} key={SRC.id} />
      ))}
    </div>
  );
}
