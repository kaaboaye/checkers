import React, { CSSProperties } from "react";
import { Tile } from "./checkers";

const styles = (custom: CSSProperties = {}): CSSProperties => ({
  fontSize: "64px",
  lineHeight: "0.6",
  ...custom,
});

const Pawn = ({ color }: { color: "red" | "black" }) => (
  <span style={styles({ color })}>&#x25CF;</span>
);

const Queen = ({ color }: { color: "red" | "black" }) => (
  <span style={styles({ color })}>&#x25CE;</span>
);

export const TileView = ({ tile }: { tile: Tile }) => {
  switch (tile) {
    case Tile.RedPawn:
      return <Pawn color={"red"} />;

    case Tile.BlackPawn:
      return <Pawn color={"black"} />;

    case Tile.RedQuin:
      return <Queen color={"red"} />;

    case Tile.BlackQuin:
      return <Queen color={"black"} />;

    default:
      return <span style={styles()}></span>;
  }
};
