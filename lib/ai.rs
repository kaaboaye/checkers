use crate::board::{Board, Turn};
use crate::console_log;
use crate::tile::Tile;

#[derive(Debug)]
struct AIMove {
  from: (usize, usize),
  to: (usize, usize),
  kills: Option<(usize, usize)>,
  score: i16,
}

const MAX_DEPTH: u8 = 7;

pub fn make_a_move(board: &mut Board) {
  let best_of_ai = min_max(board, 1, 0, 0);
  console_log!("best of ai {}", best_of_ai);
}

fn min_max(board: &mut Board, depth: u8, previous_score: i16, best_score: i16) -> i16 {
  if depth > MAX_DEPTH {
    return previous_score;
  }

  let own_tiles = match board.turn {
    Turn::Red => [Tile::RedPawn, Tile::RedQuin],
    Turn::Black => [Tile::BlackPawn, Tile::BlackQuin],
    // don't panic because this action could be caused by stupid user
    Turn::GameOver => return previous_score,
  };

  // assumes that each pawn will have on average 2 moves
  // which is a little bit overkill but should prevent a couple of
  // allocations
  let mut possible_moves = Vec::with_capacity(12 * 2);

  for (col_idx, column) in board.data.column_iter().enumerate() {
    for (row_idx, tile) in column.iter().enumerate() {
      if !own_tiles.iter().any(|own| own == tile) {
        continue;
      }

      // 0 * 2 - 1 => -1
      // 1 * 2 - 1 => +1
      // so score on friendly depth 1, 3, .. will be positive
      // and score on enemy depth will be negative
      let score_sign = (depth as i16 % 2) * 2 - 1;

      let from = (row_idx, col_idx);

      for possible_move in board.possible_moves(from).into_iter() {
        let to = possible_move.destination;
        let kills = possible_move.kills;

        let move_score =
          optional_tile_score(possible_move.kills.map(|position| board.data[position]));

        let score = previous_score + (score_sign * move_score);

        let mut simulation = board.clone();
        simulation.move_pawn(from, to);

        // alpha beta pruning
        if board.turn != simulation.turn
          && best_score - score >= (MAX_DEPTH as i16 - depth as i16 * 2)
        {
          continue;
        }

        // if another move within given turn is possible, do it
        let depth_change = (board.turn != simulation.turn) as u8;
        let score = min_max(
          &mut simulation,
          depth + depth_change,
          score,
          std::cmp::max(score, best_score),
        );

        possible_moves.push(AIMove {
          from,
          to,
          kills,
          score,
        });
      }
    }
  }

  let selected_move = possible_moves.iter().max_by(|a, b| a.score.cmp(&b.score));

  if let Some(selected_move) = selected_move {
    board.move_pawn(selected_move.from, selected_move.to);
    return selected_move.score;
  } else {
    return previous_score;
  }
}

fn optional_tile_score(optional_tile: Option<Tile>) -> i16 {
  match optional_tile {
    Some(Tile::RedPawn) => 1,
    Some(Tile::BlackPawn) => 1,
    Some(Tile::RedQuin) => 3,
    Some(Tile::BlackQuin) => 3,
    Some(Tile::Nothing) => panic!("AI tried to kill nothing"),
    None => 0,
  }
}
