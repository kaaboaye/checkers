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
  useWorking,
} from "./checkers";
import { TileView } from "./TileView";

export const BoardView = () => {
  const working = useWorking();
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

  const [redAutoAI, setRedAutoAI] = useState(false);
  const [blackAutoAI, setBlackAutoAI] = useState(false);

  useEffect(() => {
    if (turn != "red" || !redAutoAI) return;

    const handle = setTimeout(makeAMove, 250);
    return () => clearInterval(handle);
  }, [turn, redAutoAI, makeAMove, board]);

  useEffect(() => {
    if (turn != "black" || !blackAutoAI) return;

    const handle = setTimeout(makeAMove, 250);
    return () => clearInterval(handle);
  }, [turn, blackAutoAI, makeAMove, board]);

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
        {working && " COMPUTING"}
      </h1>

      <button onClick={() => makeAMove()} disabled={working}>
        MANUAL AI
      </button>

      <label htmlFor="red-auto-ai" style={{ color: "red" }}>
        RED AUTO AI
      </label>
      <input
        id="red-auto-ai"
        type="checkbox"
        checked={redAutoAI}
        onChange={() => setRedAutoAI(!redAutoAI)}
        disabled={working && !redAutoAI}
      />

      <label htmlFor="black-auto-ai">BLACK AUTO AI</label>
      <input
        id="black-auto-ai"
        type="checkbox"
        checked={blackAutoAI}
        onChange={() => setBlackAutoAI(!blackAutoAI)}
        disabled={working && !blackAutoAI}
      />

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
