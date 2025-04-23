module.exports = {
  root: true,
  extends: ["universe/native", "universe/web"],
  ignorePatterns: ["build"],
  rules: {
    "prettier/prettier": ["off", { trailingComma: "false" }],
  },
};
