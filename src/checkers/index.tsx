import { wrap, Remote } from "comlink";
import React, { createContext, useState, useEffect, useContext } from "react";

export enum Tile {
  Nothing = 0,
  RedPawn = 1,
  RedQuin = 2,
  BlackPawn = 3,
  BlackQuin = 4,
}

export type Checkers = ReturnType<typeof wrapRust>;

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

function wrapRust(rust: Remote<import("./worker").Checkers>) {
  return {
    getTile: () => rust.getTile().then((tile) => Tile[tile]),
    getBoard: () =>
      rust
        .getBoard()
        .then((board: number[]) => board.map((tile) => Tile[tile])),
  };
}

const checkersContext = createContext<Checkers | null>(null);

export const CheckersProvider: React.FC = ({ children }) => {
  const [value, setValue] = useState<Checkers | null>(null);

  useEffect(() => {
    checkersPromise.then((checkers) => {
      setValue(checkers);
    });
  }, []);

  useEffect(() => console.log("value", value), [value]);

  return (
    <checkersContext.Provider value={value}>
      {children}
    </checkersContext.Provider>
  );
};

export function useCheckers() {
  return useContext(checkersContext);
}

export function useBoard() {
  const checkers = useCheckers();
  const [board, setBoard] = useState<Tile[] | null>(null);

  useEffect(() => {
    if (!checkers) return;
    checkers.getBoard().then(setBoard);
  }, [checkers]);

  return board;
}
