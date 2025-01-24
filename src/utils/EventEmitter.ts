import { Subject } from "rxjs";

export default class {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subject = new Subject<[string, any]>();

  on<T>(event: string, callback: (data: T) => void) {
    return this.subject.subscribe(([eventEmitted, data]) => {
      if (eventEmitted === event) {
        callback(data);
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fire(event: string, data: any) {
    this.subject.next([event, data]);
  }
}
