#!/usr/bin/env node
// scripts/regenerate-command-center.js
// Regenerates educrm-command-center.html with live data from GitHub and Vercel APIs

const fs = require("fs");
const path = require("path");
const https = require("https");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
const REPO = "ejnburrows-rgb/cartilla-de-gretel";
const HTML_FILE = path.join(process.cwd(), "educrm-command-center.html");

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

async function getGitHubData() {
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "cartilla-command-center",
  };

  const [commitsData, prsData, branchData] = await Promise.all([
    fetch(`https://api.github.com/repos/${REPO}/commits?per_page=1`, { headers }),
    fetch(`https://api.github.com/repos/${REPO}/pulls?state=open&per_page=10`, { headers }),
    fetch(`https://api.github.com/repos/${REPO}/branches?per_page=30`, { headers }),
  ]);

  const latestCommit = Array.isArray(commitsData) ? commitsData[0] : null;
  const openPRs = Array.isArray(prsData) ? prsData : [];
  const branches = Array.isArray(branchData) ? branchData : [];

  return {
    latestCommitHash: latestCommit ? latestCommit.sha.slice(0, 7) : "unknown",
    latestCommitMessage: latestCommit ? latestCommit.commit.message.split("\n")[0] : "unknown",
    latestCommitAuthor: latestCommit ? latestCommit.commit.author.name : "unknown",
    latestCommitDate: latestCommit ? latestCommit.commit.author.date : "unknown",
    openPRCount: openPRs.length,
    openPRs: openPRs.map((pr) => ({ number: pr.number, title: pr.title, branch: pr.head.ref })),
    branchCount: branches.length,
    branches: branches.map((b) => b.name),
  };
}

async function getVercelData() {
  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
    return {
      status: "VERCEL_TOKEN or VERCEL_PROJECT_ID not set",
      url: "cartilla-de-gretel.vercel.app",
    };
  }

  const teamParam = VERCEL_TEAM_ID ? `&teamId=${VERCEL_TEAM_ID}` : "";
  const deploymentsUrl = `https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=1${teamParam}`;
  const headers = {
    Authorization: `Bearer ${VERCEL_TOKEN}`,
    "User-Agent": "cartilla-command-center",
  };

  const data = await fetch(deploymentsUrl, { headers });
  const latest = data.deployments && data.deployments[0];

  if (!latest) return { status: "no deployments found", url: "cartilla-de-gretel.vercel.app" };

  return {
    status: latest.state,
    url: `https://${latest.url}`,
    createdAt: new Date(latest.createdAt).toISOString(),
    inspectorUrl: latest.inspectorUrl || "",
  };
}

async function main() {
  console.log("Fetching GitHub and Vercel data...");

  const [github, vercel] = await Promise.all([getGitHubData(), getVercelData()]);

  console.log("GitHub:", JSON.stringify(github, null, 2));
  console.log("Vercel:", JSON.stringify(vercel, null, 2));

  if (!fs.existsSync(HTML_FILE)) {
    console.log(`${HTML_FILE} not found — skipping injection`);
    return;
  }

  let html = fs.readFileSync(HTML_FILE, "utf8");
  const timestamp = new Date().toISOString();

  // Inject data into HTML as a JSON data block for dashboard scripts to consume
  const dataBlock = `<!-- COMMAND-CENTER-DATA
${JSON.stringify({ github, vercel, regeneratedAt: timestamp }, null, 2)}
END-COMMAND-CENTER-DATA -->`;

  if (html.includes("<!-- COMMAND-CENTER-DATA")) {
    html = html.replace(/<!-- COMMAND-CENTER-DATA[\s\S]*?END-COMMAND-CENTER-DATA -->/, dataBlock);
  } else {
    html = html.replace("</head>", `${dataBlock}\n</head>`);
  }

  // Replace known KPI placeholders if present
  html = html
    .replace(/data-latest-commit="[^"]*"/, `data-latest-commit="${github.latestCommitHash}"`)
    .replace(/data-open-prs="[^"]*"/, `data-open-prs="${github.openPRCount}"`)
    .replace(/data-deploy-status="[^"]*"/, `data-deploy-status="${vercel.status}"`)
    .replace(/data-deploy-url="[^"]*"/, `data-deploy-url="${vercel.url}"`)
    .replace(/data-regenerated-at="[^"]*"/, `data-regenerated-at="${timestamp}"`);

  fs.writeFileSync(HTML_FILE, html, "utf8");
  console.log(`Command center regenerated at ${timestamp}`);
  console.log(`  Commit: ${github.latestCommitHash} — ${github.latestCommitMessage}`);
  console.log(`  Open PRs: ${github.openPRCount}`);
  console.log(`  Deploy status: ${vercel.status}`);
}

main().catch((err) => {
  console.error("Error regenerating command center:", err);
  process.exit(1);
});
