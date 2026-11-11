// The Playwright webServer environment contains only dummy Wix account identifiers.
// Build and serve sequentially so the browser checks exercise production output.
const { spawn, spawnSync } = require("node:child_process");
const cli = require.resolve("next/dist/bin/next");
const build = spawnSync(process.execPath, [cli, "build"], {
  stdio: "inherit",
  env: process.env,
});
if (build.status !== 0) process.exit(build.status || 1);
const server = spawn(process.execPath, [cli, "start", "-p", "3100"], {
  stdio: "inherit",
  env: process.env,
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.kill(signal));
server.on("exit", (code) => process.exit(code || 0));
