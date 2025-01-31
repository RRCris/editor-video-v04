export class Frame<T> {
  position = 0;
  info: T;

  constructor(value: T) {
    this.info = value;
  }
}
