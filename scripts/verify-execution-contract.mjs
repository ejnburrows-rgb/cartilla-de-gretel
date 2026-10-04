import fs from "node:fs";

const requiredFiles = [
  "AGENTS.md",
  "EMILIO_QUALITY_ROUTER.md",
  "PROJECT_SOURCE_OF_TRUTH.md",
  "CARTILLA_DIGITAL_DIRECTIVE.md",
  "ASSET_FIDELITY_POLICY.md",
  "STUDENT_INTERACTION_STANDARD.md",
  "DESIGN.md",
  "UX-CONTRACT.md",
  "repo.md",
  ".github/PULL_REQUEST_TEMPLATE.md",
];

const failures = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) failures.push(`missing required control/source file: ${file}`);
}

if (fs.existsSync("EMILIO_QUALITY_ROUTER.md")) {
  const router = fs.readFileSync("EMILIO_QUALITY_ROUTER.md", "utf8");
  for (const marker of [
    "## Controller mandate",
    "## Termination rule",
    "## Material-progress rule",
    "## Independent review gate",
    "## Tooling standard",
    "## Execution failover",
  ]) {
    if (!router.includes(marker)) failures.push(`EMILIO_QUALITY_ROUTER.md missing execution marker: ${marker}`);
  }
}

if (fs.existsSync("AGENTS.md")) {
  const agents = fs.readFileSync("AGENTS.md", "utf8");
  for (const marker of [
    "## EXECUTION GATEWAY — EVERY TRIGGER, EVERY CONTROLLER RUN",
    "### Trigger loop",
    "### Worker role",
    "CONTROLLER-FIRST REMEDIATION",
    "STOP ONLY AT A VALID TERMINAL STATE",
    "### Execution failover ladder — mandatory before reporting a blocker",
  ]) {
    if (!agents.includes(marker)) failures.push(`AGENTS.md missing execution marker: ${marker}`);
  }
}

if (fs.existsSync(".github/PULL_REQUEST_TEMPLATE.md")) {
  const template = fs.readFileSync(".github/PULL_REQUEST_TEMPLATE.md", "utf8");
  for (const marker of [
    "## Material change",
    "## Verification",
    "## Independent review",
    "Test coverage for changed behavior",
    "DUAL REVIEW VERIFIED FOR THIS HEAD",
  ]) {
    if (!template.includes(marker)) failures.push(`PR template missing gate marker: ${marker}`);
  }
}

if (fs.existsSync("package.json")) {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const release = pkg?.scripts?.["verify:release"] ?? "";
  if (!release.includes("verify:execution-contract") && !release.includes("verify-execution-contract.mjs")) {
    failures.push("verify:release does not run the execution-contract guard");
  }
}

if (failures.length) {
  console.error("Execution contract verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Execution contract verification passed.");
