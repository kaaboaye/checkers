#[derive(Serialize)]
pub struct Position {
  pub row: usize,
  pub col: usize,
}

impl From<(usize, usize)> for Position {
  fn from((row, col): (usize, usize)) -> Self {
    Position { row, col }
  }
}
