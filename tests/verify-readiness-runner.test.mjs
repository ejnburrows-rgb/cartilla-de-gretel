/**
 * Regression coverage for the readiness harness generated-config collision.
 *
 * The runner used to write one shared `playwright.readiness.generated.cjs` in
 * the repository root, so a second run could overwrite or remove the first
 * run's config before Playwright read it. These tests import the real runner
 * and prove each run now owns a unique config file that concurrent runs can
 * neither overwrite nor remove.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { test } from 'node:test';

import {
  createReadinessConfig,
  createReadinessRunId,
  readinessConfigFileName,
  removeReadinessConfig,
  writeReadinessConfig,
} from '../scripts/verify-classroom-readiness.mjs';

const repoRoot = process.cwd();
const serialized = (config) => `module.exports = ${JSON.stringify(config)};`;
const collect = (runId, config) => {
  const path = writeReadinessConfig(config, runId);
  return { path, cleanup: () => removeReadinessConfig(path) };
};
const defer = () => new Promise((resolve) => setImmediate(resolve));

test('each run gets a unique generated config file name', () => {
  const runA = createReadinessRunId();
  const runB = createReadinessRunId();

  assert.notEqual(runA, runB);
  assert.notEqual(readinessConfigFileName(runA), readinessConfigFileName(runB));
  for (const runId of [runA, runB]) {
    assert.match(readinessConfigFileName(runId), /^playwright\.readiness\.generated\.[\w-]+\.cjs$/);
  }
});

test('two runs cannot overwrite each other\'s config content', () => {
  const configA = createReadinessConfig('/tmp/run-a');
  const configB = createReadinessConfig('/tmp/run-b');
  const first = collect(createReadinessRunId(), configA);
  const second = collect(createReadinessRunId(), configB);
  try {
    assert.notEqual(first.path, second.path);
    assert.ok(first.path.startsWith(repoRoot), 'config stays in the repository root, preserving cwd and node_modules resolution');
    assert.equal(readFileSync(first.path, 'utf8'), serialized(configA));
    assert.equal(readFileSync(second.path, 'utf8'), serialized(configB));
  } finally {
    first.cleanup();
    second.cleanup();
  }
});

test('a finished run removes only its own config', () => {
  const first = collect(createReadinessRunId(), createReadinessConfig('/tmp/run-a'));
  const second = collect(createReadinessRunId(), createReadinessConfig('/tmp/run-b'));
  try {
    first.cleanup();
    assert.equal(existsSync(first.path), false);
    assert.equal(existsSync(second.path), true);
  } finally {
    second.cleanup();
  }
});

test('concurrent runs keep both configs intact until each cleans up', async () => {
  const configA = createReadinessConfig('/tmp/run-a');
  const configB = createReadinessConfig('/tmp/run-b');

  const [a, b] = await Promise.all([
    defer().then(() => collect(createReadinessRunId(), configA)),
    defer().then(() => collect(createReadinessRunId(), configB)),
  ]);

  try {
    assert.notEqual(a.path, b.path);
    assert.equal(readFileSync(a.path, 'utf8'), serialized(configA));
    assert.equal(readFileSync(b.path, 'utf8'), serialized(configB));
    assert.equal(existsSync(a.path), true);
    assert.equal(existsSync(b.path), true);
  } finally {
    a.cleanup();
    b.cleanup();
    rmSync(a.path, { force: true });
    rmSync(b.path, { force: true });
  }
});
