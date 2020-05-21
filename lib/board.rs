use crate::console_log;
use crate::tile::Tile;
use nalgebra::{MatrixN, U8};

const BOARD_SIZE: usize = 8;
pub type BoardData = MatrixN<Tile, U8>;

#[derive(PartialEq, Eq, Clone)]
pub enum Turn {
  Red,
  Black,
}

pub struct Board {
  pub data: BoardData,
  pub turn: Turn,
}

#[derive(Debug)]
pub struct PawnMove {
  pub destination: (usize, usize),
  pub kills: Option<(usize, usize)>,
}

impl Board {
  pub fn new() -> Board {
    let data = BoardData::from_fn(|row, col| match row {
      0..=2 if (row + col) % 2 == 1 => Tile::BlackPawn,
      5..=7 if (row + col) % 2 == 1 => Tile::RedPawn,
      _ => Tile::Nothing,
    });

    Board {
      data,
      turn: Turn::Red,
    }
  }

  pub fn possible_moves(&self, position: (usize, usize)) -> Vec<PawnMove> {
    let (row, col) = position;

    if (row + col) % 2 == 0 {
      return vec![];
    }

    match self.data[position] {
      Tile::Nothing => Vec::new(),
      Tile::BlackPawn => {
        if self.turn == Turn::Red {
          return Vec::new();
        }

        let mut moves = Vec::new();

        // move left down
        if col > 0 && row < BOARD_SIZE - 1 {
          let destination = (row + 1, col - 1);
          if self.data[destination] == Tile::Nothing {
            moves.push(PawnMove {
              destination,
              kills: None,
            });
          } else if (self.data[destination] == Tile::RedPawn
            || self.data[destination] == Tile::RedQuin)
            && (col > 1 && row < BOARD_SIZE - 2)
          {
            let kills = Some(destination);
            let destination = (row + 2, col - 2);

            if self.data[destination] == Tile::Nothing {
              moves.push(PawnMove { destination, kills })
            }
          }
        }

        // move right down
        if col < BOARD_SIZE - 1 && row < BOARD_SIZE - 1 {
          let destination = (row + 1, col + 1);
          if self.data[destination] == Tile::Nothing {
            moves.push(PawnMove {
              destination,
              kills: None,
            });
          } else if (self.data[destination] == Tile::RedPawn
            || self.data[destination] == Tile::RedQuin)
            && (col < BOARD_SIZE - 2 && row < BOARD_SIZE - 2)
          {
            let kills = Some(destination);
            let destination = (row + 2, col + 2);

            if self.data[destination] == Tile::Nothing {
              moves.push(PawnMove { destination, kills })
            }
          }
        }

        // kill left up
        if col > 1 && row > 1 {
          let destination = (row - 2, col - 2);
          let kills = (row - 1, col - 1);

          if self.data[destination] == Tile::Nothing
            && (self.data[kills] == Tile::RedPawn || self.data[kills] == Tile::RedQuin)
          {
            moves.push(PawnMove {
              destination,
              kills: Some(kills),
            })
          }
        }

        // kill right up
        if col < BOARD_SIZE - 2 && row > 1 {
          let destination = (row - 2, col + 2);
          let kills = (row - 1, col + 1);

          if self.data[destination] == Tile::Nothing
            && (self.data[kills] == Tile::RedPawn || self.data[kills] == Tile::RedQuin)
          {
            moves.push(PawnMove {
              destination,
              kills: Some(kills),
            })
          }
        }

        moves
      }
      Tile::RedPawn => {
        if self.turn == Turn::Black {
          return Vec::new();
        }

        let mut moves = Vec::new();

        // move left up
        if col > 0 && row > 0 {
          let destination = (row - 1, col - 1);
          if self.data[destination] == Tile::Nothing {
            moves.push(PawnMove {
              destination,
              kills: None,
            });
          } else if (self.data[destination] == Tile::BlackPawn
            || self.data[destination] == Tile::BlackQuin)
            && (col > 1 && row > 1)
          {
            let kills = Some(destination);
            let destination = (row - 2, col - 2);

            if self.data[destination] == Tile::Nothing {
              moves.push(PawnMove { destination, kills })
            }
          }
        }

        // move right up
        if col < BOARD_SIZE - 1 && row > 0 {
          let destination = (row - 1, col + 1);
          if self.data[destination] == Tile::Nothing {
            moves.push(PawnMove {
              destination,
              kills: None,
            });
          } else if (self.data[destination] == Tile::BlackPawn
            || self.data[destination] == Tile::BlackQuin)
            && (col < BOARD_SIZE - 2 && row > 1)
          {
            let kills = Some(destination);
            let destination = (row - 2, col + 2);

            if self.data[destination] == Tile::Nothing {
              moves.push(PawnMove { destination, kills })
            }
          }
        }

        // kill left down
        if col > 1 && row < BOARD_SIZE - 2 {
          let destination = (row + 2, col - 2);
          let kills = (row + 1, col - 1);

          if self.data[destination] == Tile::Nothing
            && (self.data[kills] == Tile::BlackPawn || self.data[kills] == Tile::BlackQuin)
          {
            moves.push(PawnMove {
              destination,
              kills: Some(kills),
            })
          }
        }

        // kill right down
        if col < BOARD_SIZE - 2 && row < BOARD_SIZE - 2 {
          let destination = (row + 2, col + 2);
          let kills = (row + 1, col + 1);

          if self.data[destination] == Tile::Nothing
            && (self.data[kills] == Tile::BlackPawn || self.data[kills] == Tile::BlackQuin)
          {
            moves.push(PawnMove {
              destination,
              kills: Some(kills),
            })
          }
        }

        moves
      }
      Tile::BlackQuin => self.queen_moves(Turn::Black, position, [Tile::RedPawn, Tile::RedQuin]),
      Tile::RedQuin => self.queen_moves(Turn::Red, position, [Tile::BlackPawn, Tile::BlackQuin]),
    }
  }

  fn queen_moves(
    &self,
    team: Turn,
    position: (usize, usize),
    enemy_pawns: [Tile; 2],
  ) -> Vec<PawnMove> {
    if self.turn != team {
      return Vec::new();
    }

    let (row, col) = position;
    let mut moves = Vec::new();

    for (row_move, col_move) in [(1, 1), (1, -1), (-1, 1), (-1, -1)].iter() {
      let board_range = 0..BOARD_SIZE as isize;

      let mut irow = row as isize;
      let mut icol = col as isize;

      loop {
        irow += row_move;
        icol += col_move;

        if !board_range.contains(&irow) || !board_range.contains(&icol) {
          break;
        }

        let destination = (irow as usize, icol as usize);

        if self.data[destination] == Tile::Nothing {
          moves.push(PawnMove {
            destination,
            kills: None,
          })
        } else {
          if enemy_pawns
            .iter()
            .any(|enemy| *enemy == self.data[destination])
          {
            let kills = Some(destination);
            let (irow, icol) = (
              destination.0 as isize + row_move,
              destination.1 as isize + col_move,
            );

            if !board_range.contains(&irow) || !board_range.contains(&icol) {
              break;
            }

            let destination = (irow as usize, icol as usize);

            if self.data[destination] != Tile::Nothing {
              break;
            }

            moves.push(PawnMove { destination, kills })
          }

          break;
        }
      }
    }

    moves
  }

  pub fn move_pawn(&mut self, from: (usize, usize), to: (usize, usize)) {
    let moves = self.possible_moves(from);

    let possible_move = moves
      .iter()
      .find(|possible_move| possible_move.destination == to);

    if possible_move.is_none() {
      return;
    }

    self.data[to] = self.data[from];
    self.data[from] = Tile::Nothing;

    if to.0 == 0 || to.0 == BOARD_SIZE - 1 {
      self.data[to] = match self.data[to] {
        Tile::RedPawn => Tile::RedQuin,
        Tile::BlackPawn => Tile::BlackQuin,
        other => other,
      }
    }

    if let Some(kills) = possible_move.unwrap().kills {
      console_log!(
        "move {from:?} --> {kills:?} --> {to:?} pawn {killer:?} killed {victim:?}",
        from = from,
        kills = kills,
        to = to,
        killer = self.data[to],
        victim = self.data[kills]
      );

      self.data[kills] = Tile::Nothing;
    } else {
      console_log!(
        "move {from:?} --> {to:?} pawn {pawn:?}",
        from = from,
        to = to,
        pawn = self.data[to],
      );

      self.turn = match self.turn {
        Turn::Red => Turn::Black,
        Turn::Black => Turn::Red,
      };
    }
  }
}
