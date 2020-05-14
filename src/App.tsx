import React from "react";
import { CheckersProvider } from "./checkers";
import { BoardView } from "./BoardView";

export function App() {
  return (
    <CheckersProvider>
      <BoardView />
    </CheckersProvider>
  );
}
