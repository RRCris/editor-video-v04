import { useEffect, useState } from "react";
import { Subscription } from "rxjs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useObserver2<T>(init: T, getSub: (callback: (v: T) => void) => Subscription) {
  const [value, setValue] = useState<T>(init);

  useEffect(() => {
    const sub = getSub(setValue);

    return () => sub.unsubscribe();
  }, []);

  return value;
}

interface Tctrl {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on: <T>(event: any, callback: (data: T) => void) => Subscription;
}

export function useObserver<T>(init: T, ctrl: Tctrl, event: string, asing?: (v: T) => T) {
  const [value, setValue] = useState<T>(init);

  useEffect(() => {
    const sub = ctrl.on(event, asing ? (v: T) => setValue(asing(v)) : setValue);
    return () => sub.unsubscribe();
  }, []);

  return value;
}

// init ,ctrl , event , assing
