use crate::tile::Tile;
use nalgebra::{MatrixN, U8};

pub type Board = MatrixN<Tile, U8>;

lazy_static! {
  static ref BOARD: Board = Board::from_fn(|row, col| {
    match row {
      0..=2 if (row + col) % 2 == 1 => Tile::BlackPawn,
      5..=7 if (row + col) % 2 == 1 => Tile::RedPawn,
      _ => Tile::Nothing,
    }
  });
}

pub fn get_board() -> &'static Board {
  &BOARD
}
