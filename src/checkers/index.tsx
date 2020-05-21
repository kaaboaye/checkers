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

console.log("tile", Tile);

export interface TileCords {
  row: number;
  col: number;
}

export interface PossibleMove {
  destination: TileCords;
  kills: TileCords | null;
}

export interface LogEntry {
  pawn: string;
  movedFrom: TileCords;
  movedTo: TileCords;
  killed: null | {
    pawn: string;
    position: TileCords;
  };
}

export type Turn = "red" | "black";

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

    (rust.initialize() as Promise<boolean>)
      .then((res) => {
        if (res) {
          const wrappedRust = wrapRust(rust);
          resolve(wrappedRust);
          console.log("rust is ready", rust);
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
    getTurn: () => rust.getTurn() as Promise<"red" | "black">,
    getLog: () =>
      (rust.getLog() as Promise<any>).then((entries) =>
        entries.map(
          (log: any) =>
            ({
              pawn: log.pawn,
              movedFrom: log.moved_from,
              movedTo: log.moved_to,
              killed: log.killed,
            } as LogEntry)
        )
      ) as Promise<LogEntry[]>,
    getPossibleMoves: ({ row, col }: TileCords) =>
      rust.getPossibleMoves(row, col) as Promise<PossibleMove[]>,
    movePawn: (from: TileCords, to: TileCords) =>
      rust.movePawn(from.row, from.col, to.row, to.col),
  };
}

type Injections = {};
type CheckersAction<Args = void> = Action<CheckersState, Args>;
type CheckersThunk<Args = void> = Thunk<CheckersState, Args, Injections>;

interface CheckersState {
  checkers: Checkers | null;
  board: Board | null;
  turn: Turn | null;
  eventLog: LogEntry[];
  possibleMoves: PossibleMove[];

  setCheckers: CheckersAction<Checkers>;
  setBoard: CheckersAction<Tile[]>;
  setTurn: CheckersAction<Turn>;
  setLog: CheckersAction<LogEntry[]>;
  setPossibleMoves: CheckersAction<PossibleMove[]>;

  initialize: CheckersThunk;
  fetchState: CheckersThunk;
  getBoard: CheckersThunk;
  getTurn: CheckersThunk;
  getLog: CheckersThunk;
  getPossibleMoves: CheckersThunk<TileCords>;
  movePawn: CheckersThunk<{ from: TileCords; to: TileCords }>;
}

const checkersContext = createContextStore<CheckersState, void>({
  checkers: null,
  board: null,
  turn: null,
  eventLog: [],
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

  setTurn: action((state, turn) => {
    state.turn = turn;
  }),

  setLog: action((state, log) => {
    state.eventLog = log;
  }),

  setPossibleMoves: action((state, positions) => {
    state.possibleMoves = positions;
  }),

  initialize: thunk((actions) => {
    console.log("initializing the store");

    checkersPromise.then((checkers) => {
      console.log("checkers", checkers);
      actions.setCheckers(checkers);
      actions.fetchState();
    });
  }),

  fetchState: thunk((actions) => {
    actions.getBoard();
    actions.getTurn();
    actions.getLog();
  }),

  getBoard: thunk((actions, _, { getState }) => {
    const state = getState();
    if (state.checkers === null) return;

    state.checkers.getTiles().then((tiles) => actions.setBoard(tiles));
  }),

  getTurn: thunk((actions, _, { getState }) => {
    const state = getState();
    if (state.checkers === null) return;

    state.checkers.getTurn().then((turn) => actions.setTurn(turn));
  }),

  getLog: thunk((actions, _, { getState }) => {
    const state = getState();
    if (state.checkers === null) return;

    state.checkers.getLog().then((log) => actions.setLog(log));
  }),

  getPossibleMoves: thunk((actions, position, { getState }) => {
    const state = getState();
    if (state.checkers === null) return;

    state.checkers
      .getPossibleMoves(position)
      .then((positions) => actions.setPossibleMoves(positions));
  }),

  movePawn: thunk((actions, { from, to }, { getState }) => {
    const state = getState();
    if (state.checkers === null) return;

    state.checkers.movePawn(from, to).then(() => actions.fetchState());
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

export const useTurn = () =>
  checkersContext.useStoreState((store) => store.turn);

export const useLog = () =>
  checkersContext.useStoreState((store) => store.eventLog);

export const usePossibleMoves = () =>
  checkersContext.useStoreState((store) => store.possibleMoves);

export const useGetPossibleMoves = () =>
  checkersContext.useStoreActions((store) => store.getPossibleMoves);

export const useMovePawn = () =>
  checkersContext.useStoreActions((store) => store.movePawn);
