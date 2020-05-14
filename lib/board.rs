use crate::tile::Tile;
use nalgebra::{MatrixN, U12};

pub type Board = MatrixN<Tile, U12>;

lazy_static! {
  static ref BOARD: Board = Board::from_fn(|row, _| {
    match row {
      0 | 1 => Tile::BlackPawn,
      10 | 11 => Tile::RedPawn,
      _ => Tile::Nothing,
    }
  });
}

pub fn get_board() -> &'static Board {
  &BOARD
}
