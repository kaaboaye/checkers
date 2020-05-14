import React from "react";
import {
  useBoard,
  usePossibleMoves,
  TileCords,
  useGetPossibleMoves,
} from "./checkers";
import { TileView } from "./TileView";

export const BoardView = () => {
  const board = useBoard();
  const possibleMoves = usePossibleMoves();
  const getPossibleMoves = useGetPossibleMoves();

  return (
    <table>
      <tbody>
        {board?.map((row, rowIdx) => (
          <tr key={rowIdx}>
            {row.map((tile, colIdx) => (
              <td
                key={colIdx}
                style={{
                  backgroundColor: tileBackgroundColor(
                    rowIdx,
                    colIdx,
                    possibleMoves
                  ),
                  textAlign: "center",
                  width: "64px",
                  height: "64px",
                }}
                onClick={() => getPossibleMoves({ row: rowIdx, col: colIdx })}
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

function tileBackgroundColor(
  rowIdx: number,
  colIdx: number,
  possibleMoves: TileCords[]
) {
  if (
    possibleMoves.findIndex(
      (cords) => cords.row === rowIdx && cords.col === colIdx
    ) !== -1
  ) {
    return "gold";
  }

  return (rowIdx + colIdx) % 2 ? "gray" : "white";
}
