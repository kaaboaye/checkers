import React from "react";
import { CheckersProvider } from "./checkers";
import { Board } from "./Board";

export function App() {
  return (
    <CheckersProvider>
      <Board />
    </CheckersProvider>
  );
}
