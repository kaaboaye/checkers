import { wrap, Remote } from "comlink";
import React, { useEffect } from "react";
import { Thunk, createContextStore, thunk, Action, action } from "easy-peasy";

// it has to be copied since it cannot be imported as a value
// because rust cannot be imported in entry bundle
export enum Tile {
  Nothing,
  RedPawn,
  RedQuin,
  BlackPawn,
  BlackQuin,
}

export interface TileCords {
  row: number;
  col: number;
}

export const BOARD_SIZE = 8;
export type Board = Tile[][];

const checkersPromise = new Promise<Checkers>((resolve) => {
  const worker = new Worker("./worker", {
    name: "checkers",
    type: "module",
  });

  const rust = wrap<import("./worker").Checkers>(worker);

  function pingWorker() {
    console.log("pinging");

    const timer = setTimeout(pingWorker, 100);

    (rust.ping() as Promise<boolean>)
      .then((res) => {
        if (res) {
          const wrappedRust = wrapRust(rust);
          resolve(wrappedRust);
          console.log("rust is ready");
          clearTimeout(timer);
        }
      })
      .catch((err) => console.log("ping error", err));
  }

  pingWorker();
});

type Checkers = ReturnType<typeof wrapRust>;
function wrapRust(rust: Remote<import("./worker").Checkers>) {
  return {
    getTiles: () => rust.getTiles() as Promise<Tile[]>,
    getPossibleMoves: ({ row, col }: TileCords) =>
      rust.getPossibleMoves(row, col) as Promise<TileCords[]>,
  };
}

type Injections = {};
type CheckersAction<Args = void> = Action<CheckersState, Args>;
type CheckersThunk<Args = void> = Thunk<CheckersState, Args, Injections>;

interface CheckersState {
  checkers: Checkers | null;
  board: Board | null;
  possibleMoves: TileCords[];

  setCheckers: CheckersAction<Checkers>;
  setBoard: CheckersAction<Tile[]>;
  setPossibleMoves: CheckersAction<TileCords[]>;

  initialize: CheckersThunk;
  getPossibleMoves: CheckersThunk<TileCords>;
}

const checkersContext = createContextStore<CheckersState, void>({
  checkers: null,
  board: null,
  possibleMoves: [],

  setCheckers: action((state, checkers) => {
    state.checkers = checkers;
  }),

  setBoard: action((state, tiles) => {
    const board: Board = Array(BOARD_SIZE).fill(null);

    tiles.forEach((tile, idx) => {
      const row = idx % BOARD_SIZE;
      const col = Math.floor(idx / BOARD_SIZE);

      // initialize row
      if (board[row] == null) {
        board[row] = Array(BOARD_SIZE);
      }

      board[row][col] = tile;
    });

    state.board = board;
  }),

  setPossibleMoves: action((state, positions) => {
    state.possibleMoves = positions;
  }),

  initialize: thunk((actions) => {
    console.log("initializing the store");

    checkersPromise.then((checkers) => {
      console.log("checkers", checkers);
      actions.setCheckers(checkers);

      checkers.getTiles().then((tiles) => actions.setBoard(tiles));
    });
  }),

  getPossibleMoves: thunk((actions, position, { getState }) => {
    const state = getState();

    if (state.checkers === null) return;

    state.checkers
      .getPossibleMoves(position)
      .then((positions) => actions.setPossibleMoves(positions));
  }),
});

function StoreInitializer() {
  const checkers = checkersContext.useStoreState((store) => store.checkers);
  const initialize = checkersContext.useStoreActions(
    (store) => store.initialize
  );

  useEffect(() => {
    if (checkers !== null) return;
    initialize();
  }, [checkers, initialize]);

  return null;
}

// initialize the store

export const CheckersProvider: React.FC = ({ children }) => {
  return (
    <checkersContext.Provider>
      <StoreInitializer />
      {children}
    </checkersContext.Provider>
  );
};

export const useBoard = () =>
  checkersContext.useStoreState((store) => store.board);

export const usePossibleMoves = () =>
  checkersContext.useStoreState((store) => store.possibleMoves);

export const useGetPossibleMoves = () =>
  checkersContext.useStoreActions((store) => store.getPossibleMoves);
