module.exports = {
  root: true,
  extends: [
    "airbnb-typescript",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  plugins: ["@typescript-eslint", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  rules: {
    "react/jsx-one-expression-per-line": "off",

    "@typescript-eslint/quotes": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/indent": "off",

    "import/prefer-default-export": "off",

    "no-console": "error",

    "prettier/prettier": "error",
  },
};
