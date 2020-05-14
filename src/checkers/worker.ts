import { expose } from "comlink";
import rust from "../rust";

function onLoaded(callback: () => void) {
  callback();
}

rust.then((rust) => {
  expose(rust);
});

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
export type Checkers = ThenArg<typeof rust>;
