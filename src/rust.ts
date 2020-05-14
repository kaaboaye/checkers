import pkg = require("../pkg/index.js");

export default new Promise<any>((resolve) => {
  require.ensure(["../pkg/index.js"], (require) => {
    resolve(require("../pkg/index.js"));
  });
});
