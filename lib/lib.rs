#[macro_use]
extern crate lazy_static;
extern crate nalgebra;

mod board;
mod tile;

use crate::tile::Tile;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
//
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn ping() -> bool {
  true
}

#[wasm_bindgen]
#[allow(non_snake_case)]
pub fn getTile() -> Tile {
  Tile::BlackQuin
}

#[wasm_bindgen]
#[allow(non_snake_case)]
pub fn getBoard() -> JsValue {
  let board = board::get_board()
    .iter()
    .map(|t| (*t) as i32)
    .collect::<Vec<i32>>();

  JsValue::from_serde(&board).unwrap()
}
