use crate::tile::Tile;
use nalgebra::{MatrixN, U8};

pub type Board = MatrixN<Tile, U8>;

const BOARD_SIZE: i32 = 8;

lazy_mut! {
  static mut __BOARD: Board = Board::from_fn(|row, col| {
    match row {
      0..=2 if (row + col) % 2 == 1 => Tile::BlackPawn,
      5..=7 if (row + col) % 2 == 1 => Tile::RedPawn,
      _ => Tile::Nothing,
    }
  });
}

fn board() -> &'static mut Board {
  // it's save since it's operating only on one thread
  unsafe { &mut __BOARD }
}

pub fn get_board() -> &'static Board {
  board()
}

pub fn possible_moves((row, col): (i32, i32)) -> Vec<(i32, i32)> {
  [
    (row + 1, col + 1),
    (row + 1, col - 1),
    (row - 1, col + 1),
    (row - 1, col - 1),
  ]
  .iter()
  .cloned()
  .filter(|(row, col)| (0..BOARD_SIZE).contains(row) && (0..BOARD_SIZE).contains(col))
  .collect()
}
