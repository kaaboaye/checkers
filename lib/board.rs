use crate::tile::Tile;
use nalgebra::{MatrixN, U8};

pub type Board = MatrixN<Tile, U8>;

lazy_static! {
  static ref BOARD: Board = Board::from_fn(|row, _| {
    match row {
      0 | 1 => Tile::BlackPawn,
      6 | 7 => Tile::RedPawn,
      _ => Tile::Nothing,
    }
  });
}

pub fn get_board() -> &'static Board {
  &BOARD
}
