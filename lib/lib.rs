#[macro_use]
extern crate lazy_mut;
#[macro_use]
extern crate serde_derive;
extern crate nalgebra;

mod board;
mod position;
mod tile;

use crate::board::{Board, Turn};
use crate::position::Position;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
//
// If you don't want to use `wee_alloc`, you can safely delete this.
// #[cfg(feature = "wee_alloc")]
// #[global_allocator]
// static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

lazy_mut! {
  static mut __BOARD: Board = Board::new();
}

fn board_mut() -> &'static mut Board {
  // it's save since it's operating only on one thread
  unsafe { &mut __BOARD }
}

pub fn board() -> &'static Board {
  // it's save since it's operating only on one thread
  unsafe { &__BOARD }
}

#[wasm_bindgen]
pub fn initialize() -> bool {
  unsafe { __BOARD.init() };

  true
}

#[wasm_bindgen]
#[allow(non_snake_case)]
pub fn getTiles() -> JsValue {
  let board = board()
    .data
    .iter()
    .map(|t| (*t) as i32)
    .collect::<Vec<i32>>();

  JsValue::from_serde(&board).unwrap()
}

#[wasm_bindgen]
#[allow(non_snake_case)]
pub fn getTurn() -> JsValue {
  let turn = match board().turn {
    Turn::Red => "red",
    Turn::Black => "black",
  };

  JsValue::from_serde(&turn).unwrap()
}

#[wasm_bindgen]
#[allow(non_snake_case)]
pub fn getLog() -> JsValue {
  JsValue::from_serde(&board().event_log).unwrap()
}

#[derive(Serialize)]
pub struct JsPossibleMove {
  destination: Position,
  kills: Option<Position>,
}

#[wasm_bindgen]
#[allow(non_snake_case)]
pub fn getPossibleMoves(row: usize, col: usize) -> JsValue {
  let values = board()
    .possible_moves((row, col))
    .iter()
    .map(|possible_move| JsPossibleMove {
      destination: Position::from(possible_move.destination),
      kills: possible_move.kills.map(|kill| Position::from(kill)),
    })
    .collect::<Vec<_>>();

  JsValue::from_serde(&values).unwrap()
}

#[wasm_bindgen]
#[allow(non_snake_case)]
pub fn movePawn(from_row: usize, from_col: usize, to_row: usize, to_col: usize) {
  board_mut().move_pawn((from_row, from_col), (to_row, to_col))
}
