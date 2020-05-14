import React from "react";
import { useBoard } from "./checkers";
import { TileView } from "./TileView";

export const BoardView = () => {
  const board = useBoard();

  return (
    <table>
      <tbody>
        {board?.map((row, rowIdx) => (
          <tr key={rowIdx}>
            {row.map((tile, tileIdx) => (
              <td key={tileIdx}>
                <TileView tile={tile} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
