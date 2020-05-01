import { wrap } from "comlink";

export function createCheckers() {
  const worker = new Worker("./checkers.worker", {
    name: "checkers",
    type: "module",
  });

  return wrap<import("./checkers.worker").Checkers>(worker);
}
