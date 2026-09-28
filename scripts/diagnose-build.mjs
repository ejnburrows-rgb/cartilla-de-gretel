import { spawnSync } from "node:child_process";
import fs from "node:fs";

const diagnosticVersion = "2026-09-28T21:58Z";

const steps = [
  ["verify:reconstruction", ["pnpm", "verify:reconstruction"]],
  ["prepare:art", ["pnpm", "prepare:art"]],
  ["verify:platform", ["pnpm", "verify:platform"]],
  ["typecheck", ["pnpm", "typecheck"]],
  ["test", ["pnpm", "test"]],
  ["vite-build", ["pnpm", "exec", "vite", "build"]],
];

const results = [];
for (const [name, command] of steps) {
  const [cmd, ...args] = command;
  const run = spawnSync(cmd, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env,
    shell: process.platform === "win32",
    maxBuffer: 1024 * 1024 * 50,
    timeout: 240000,
  });
  results.push({
    name,
    code: run.status,
    signal: run.signal,
    error: run.error ? String(run.error.stack || run.error.message || run.error) : null,
    stdout: run.stdout ?? "",
    stderr: run.stderr ?? "",
  });
}

fs.rmSync("dist", { recursive: true, force: true });
fs.mkdirSync("dist", { recursive: true });
fs.writeFileSync("dist/diagnostic.json", JSON.stringify(results, null, 2));
fs.writeFileSync("dist/index.html", "<!doctype html><meta charset=utf-8><title>Cartilla diagnostic</title><pre>diagnostic ready</pre>");
console.log(diagnosticVersion, JSON.stringify(results.map(({ name, code, signal }) => ({ name, code, signal }))));
