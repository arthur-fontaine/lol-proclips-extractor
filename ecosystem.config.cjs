exports.apps = [
  {
    name: "lol-esports-clips:server",
    script: "src/server/server.ts",
    interpreter: "node22",
    interpreter_args: "--env-file=.env",
  },
];
