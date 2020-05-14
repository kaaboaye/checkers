export function loadRust() {
  require("../pkg/index.js")
    .catch(console.error)
    .then((rust) => {
      if (!rust) return;

      console.log(rust);
      console.log(rust.elko());
    });
}
