import pkg = require("../pkg/index");

export default new Promise<typeof pkg>((resolve) => {
  require.ensure(["../pkg/index.js"], (require) => {
    resolve(require("../pkg/index.js"));
  });
});
