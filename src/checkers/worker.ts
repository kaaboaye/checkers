import { expose } from "comlink";
import rust from "../rust";

rust.then((rust) => {
  expose(rust);
});

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
export type Checkers = ThenArg<typeof rust>;
