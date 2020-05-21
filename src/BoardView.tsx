import React, { useState, useCallback, useEffect } from "react";
import {
  useBoard,
  usePossibleMoves,
  TileCords,
  useGetPossibleMoves,
  useMovePawn,
  PossibleMove,
  useTurn,
  useMakeAMove,
} from "./checkers";
import { TileView } from "./TileView";

export const BoardView = () => {
  const board = useBoard();
  const turn = useTurn();
  const possibleMoves = usePossibleMoves();
  const getPossibleMoves = useGetPossibleMoves();
  const movePawn = useMovePawn();
  const makeAMove = useMakeAMove();

  const [selectedCords, setSelectedCords] = useState<TileCords>({
    row: 0,
    col: 0,
  });

  const onTileClick = useCallback(
    (cords: TileCords) => {
      const to = possibleMoves.find(
        ({ destination }) =>
          cords.row === destination.row && cords.col === destination.col
      );

      if (to) {
        movePawn({ from: selectedCords, to: to.destination });
      } else {
        setSelectedCords(cords);
        getPossibleMoves(cords);
      }
    },
    [selectedCords, possibleMoves, getPossibleMoves]
  );

  // hide possible destinations after move
  useEffect(() => {
    // for this tile there will never be any possible destinations
    const tile = { row: 0, col: 0 };
    getPossibleMoves(tile);
    setSelectedCords(tile);
  }, [board, getPossibleMoves]);

  return (
    <>
      <h1>
        Turn{" "}
        <span
          style={{
            color:
              turn == "red" ? "red" : turn == "game_over" ? "green" : "black",
          }}
        >
          {turn?.toUpperCase()}
        </span>
      </h1>
      <button onClick={() => makeAMove()}>AI</button>
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
                  onClick={() => onTileClick({ row: rowIdx, col: colIdx })}
                >
                  <TileView tile={tile} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

function tileBackgroundColor(
  rowIdx: number,
  colIdx: number,
  possibleMoves: PossibleMove[]
) {
  if (
    possibleMoves.findIndex(
      ({ destination }) =>
        destination.row === rowIdx && destination.col === colIdx
    ) !== -1
  ) {
    return "gold";
  }

  if (
    possibleMoves.findIndex(
      ({ kills }) => kills && kills.row === rowIdx && kills.col === colIdx
    ) !== -1
  ) {
    return "pink";
  }

  return (rowIdx + colIdx) % 2 ? "gray" : "white";
}
