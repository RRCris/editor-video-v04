export default class Clock {
  #startTime = performance.now();
  #elapsedTimePause = 0;
  #state: "STOP" | "PLAY" = "STOP";

  getElapsedTime() {
    if (this.#state === "PLAY") return Math.round(performance.now() - this.#startTime);
    else return this.#elapsedTimePause;
  }

  play() {
    const elapsed = this.getElapsedTime();
    this.#state = "PLAY";
    this.setSeek(elapsed);
  }

  setSeek(time: number) {
    this.#elapsedTimePause = time;
    this.#startTime = performance.now() - time;
  }

  pause() {
    const elapsed = this.getElapsedTime();
    this.#elapsedTimePause = elapsed;
    this.#state = "STOP";
  }
}
