use crate::tile::Tile;
use nalgebra::{MatrixN, U8};

pub type Board = MatrixN<Tile, U8>;

const BOARD_SIZE: usize = 8;

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

pub fn possible_moves((row, col): (usize, usize)) -> Vec<(usize, usize)> {
  if (row + col) % 2 == 0 || board()[(row, col)] == Tile::Nothing {
    return vec![];
  }

  [
    (row + 1, col + 1),
    (row + 1, col - 1),
    (row - 1, col + 1),
    (row - 1, col - 1),
  ]
  .iter()
  .cloned()
  .filter(|(row, col)| {
    (0..BOARD_SIZE).contains(row)
      && (0..BOARD_SIZE).contains(col)
      && board()[(*row, *col)] == Tile::Nothing
  })
  .collect()
}

pub fn move_pawn(from: (usize, usize), to: (usize, usize)) {
  let destinations = possible_moves(from);

  if !destinations.contains(&to) {
    return;
  }

  let pawn = board()[from];
  board()[from] = Tile::Nothing;
  board()[to] = pawn;
}
