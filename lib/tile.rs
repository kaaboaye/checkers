use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(PartialEq, Debug, Clone, Copy)]
pub enum Tile {
  Nothing = 0,
  RedPawn = 1,
  RedQuin = 2,
  BlackPawn = 3,
  BlackQuin = 4,
}
