use crate::tile::Tile;
use nalgebra::{MatrixN, U8};

const BOARD_SIZE: usize = 8;
pub type BoardData = MatrixN<Tile, U8>;

pub struct Board {
  pub data: BoardData,
}

impl Board {
  pub fn new() -> Board {
    let data = BoardData::from_fn(|row, col| match row {
      0..=2 if (row + col) % 2 == 1 => Tile::BlackPawn,
      5..=7 if (row + col) % 2 == 1 => Tile::RedPawn,
      _ => Tile::Nothing,
    });

    Board { data }
  }

  pub fn possible_moves(&self, (row, col): (usize, usize)) -> Vec<(usize, usize)> {
    if (row + col) % 2 == 0 || self.data[(row, col)] == Tile::Nothing {
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
        && self.data[(*row, *col)] == Tile::Nothing
    })
    .collect()
  }

  pub fn move_pawn(&mut self, from: (usize, usize), to: (usize, usize)) {
    let destinations = self.possible_moves(from);

    if !destinations.contains(&to) {
      return;
    }

    self.data[to] = self.data[from];
    self.data[from] = Tile::Nothing;
  }
}
