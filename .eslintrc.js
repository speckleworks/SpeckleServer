module.exports = {
  "env": {
    "es6": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "rules": {
    "no-trailing-spaces": [ 2, { "skipBlankLines": false } ],
    "arrow-spacing": [ 2, { "before": true, "after": true } ],
    "array-bracket-spacing": [ 2, "always" ],
    "block-spacing": [2, "always"],
    "camelcase": [1, {"properties": "always"}],
    "space-in-parens": [2, "always"],
    "keyword-spacing": 2
  }
};
