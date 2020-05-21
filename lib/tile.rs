use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(PartialEq, Debug, Clone, Copy, Serialize)]
pub enum Tile {
  Nothing = 0,
  RedPawn = 1,
  RedQuin = 2,
  BlackPawn = 3,
  BlackQuin = 4,
}
