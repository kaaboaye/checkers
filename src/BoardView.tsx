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
            {row.map((tile, colIdx) => (
              <td
                key={colIdx}
                style={{
                  backgroundColor: (rowIdx + colIdx) % 2 ? "gray" : "white",
                  textAlign: "center",
                  width: "64px",
                  height: "64px",
                }}
              >
                <TileView tile={tile} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
