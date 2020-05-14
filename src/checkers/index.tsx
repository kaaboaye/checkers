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
    getTile: () => rust.getTile() as Promise<Tile>,
    getTiles: () => rust.getTiles() as Promise<Tile[]>,
  };
}

type Injections = {};
type CheckersAction<Args = void> = Action<CheckersState, Args>;
type CheckersThunk<Args = void> = Thunk<CheckersState, Args, Injections>;

interface CheckersState {
  checkers: Checkers | null;
  board: Board | null;

  setCheckers: CheckersAction<Checkers>;
  setBoard: CheckersAction<Tile[]>;

  initialize: CheckersThunk;
}

const checkersContext = createContextStore<CheckersState, void>({
  checkers: null,
  board: null,

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

  initialize: thunk((actions) => {
    console.log("initializing the store");

    checkersPromise.then((checkers) => {
      actions.setCheckers(checkers);

      checkers.getTiles().then((tiles) => actions.setBoard(tiles));
    });
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
