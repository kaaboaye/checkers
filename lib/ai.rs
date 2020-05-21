use crate::board::{Board, Turn};
use crate::console_log;
use crate::tile::Tile;

#[derive(Debug)]
struct AIMove {
  from: (usize, usize),
  to: (usize, usize),
  kills: Option<(usize, usize)>,
  score: u8,
}

pub fn make_a_move(board: &mut Board) {
  let enemy_tiles = match board.turn {
    Turn::Red => [Tile::BlackPawn, Tile::BlackQuin],
    Turn::Black => [Tile::RedPawn, Tile::RedQuin],
  };

  // assumes that each pawn will have on average 2 moves
  // which is a little bit overkill but should prevent a couple of
  // allocations
  let mut possible_moves = Vec::with_capacity(12 * 2);

  for (col_idx, column) in board.data.column_iter().enumerate() {
    for (row_idx, tile) in column.iter().enumerate() {
      if enemy_tiles.iter().any(|enemy| enemy == tile) {
        continue;
      }

      let from = (row_idx, col_idx);
      let tile_moves = board
        .possible_moves(from)
        .into_iter()
        .map(|possible_move| AIMove {
          from,
          to: possible_move.destination,
          kills: possible_move.kills,
          score: optional_tile_score(possible_move.kills.map(|position| board.data[position])),
        });

      possible_moves.extend(tile_moves);
    }
  }

  console_log!("AI moves {:?}", &possible_moves);

  let selected_move = possible_moves.iter().max_by(|a, b| a.score.cmp(&b.score));

  console_log!("AI selected {:?}", &selected_move);

  if let Some(selected_move) = selected_move {
    board.move_pawn(selected_move.from, selected_move.to);
  }
}

fn optional_tile_score(optional_tile: Option<Tile>) -> u8 {
  match optional_tile {
    Some(Tile::RedPawn) => 1,
    Some(Tile::BlackPawn) => 1,
    Some(Tile::RedQuin) => 3,
    Some(Tile::BlackQuin) => 3,
    Some(Tile::Nothing) => panic!("AI tried to kill nothing"),
    None => 0,
  }
}
