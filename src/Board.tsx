import React from "react";
import { useBoard } from "./checkers";

export const Board = () => {
  const board = useBoard();

  return (
    <div>
      <h1>BOARD</h1>

      {board?.map((tile, idx) => (
        <p key={idx}>{tile}</p>
      ))}
    </div>
  );
};
