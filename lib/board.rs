use crate::position::Position;
use crate::tile::Tile;
use nalgebra::{MatrixN, U8};

#[derive(Serialize)]
pub struct Victim {
  pub pawn: Tile,
  pub position: Position,
}

#[derive(Serialize)]
pub struct LogEntry {
  pawn: Tile,
  moved_from: Position,
  moved_to: Position,
  killed: Option<Victim>,
}

const BOARD_SIZE: usize = 8;
pub type BoardData = MatrixN<Tile, U8>;

#[derive(PartialEq, Eq)]
pub enum Turn {
  Red,
  Black,
}

pub struct Board {
  pub data: BoardData,
  pub turn: Turn,
  pub event_log: Vec<LogEntry>,
}

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
      event_log: Vec::new(),
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
      Tile::BlackQuin => Vec::new(),
      Tile::RedQuin => Vec::new(),
    }
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

    if let Some(kills) = possible_move.unwrap().kills {
      self.event_log.push(LogEntry {
        pawn: self.data[to],
        moved_from: Position::from(from),
        moved_to: Position::from(to),
        killed: Some(Victim {
          pawn: self.data[kills],
          position: Position::from(kills),
        }),
      });

      self.data[kills] = Tile::Nothing;
    } else {
      self.turn = match self.turn {
        Turn::Red => Turn::Black,
        Turn::Black => Turn::Red,
      };

      self.event_log.push(LogEntry {
        pawn: self.data[to],
        moved_from: Position::from(from),
        moved_to: Position::from(to),
        killed: None,
      });
    }
  }
}
