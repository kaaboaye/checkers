import { expose } from "comlink";

function helloWorld() {
  return "hello world";
}

const exports = { helloWorld };

export type Checkers = typeof exports;

expose(exports);
