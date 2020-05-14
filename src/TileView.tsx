import React, { CSSProperties } from "react";
import { Tile } from "./checkers";

const style: CSSProperties = { fontSize: "64px", lineHeight: "0.6" };

const Pawn = ({ color }: { color: "red" | "black" }) => (
  <span style={style} color={color}>
    &#x25CF;
  </span>
);

const Queen = ({ color }: { color: "red" | "black" }) => (
  <span style={style} color={color}>
    &#x25CE;
  </span>
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
      return <span style={style}></span>;
  }
};
