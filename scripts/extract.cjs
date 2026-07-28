const fs = require("fs");
if (!fs.existsSync("remote_status.html")) {
  console.log("not ready");
  process.exit(0);
}
const html = fs.readFileSync("remote_status.html", "utf8");

const kpiRegex = /<div class="kpi-value">([^<]+)<\/div>\s*<div class="kpi-label">([^<]+)<\/div>/g;
let match;
console.log("--- KPIs ---");
while ((match = kpiRegex.exec(html)) !== null) {
  console.log(match[2].trim() + ":", match[1].trim());
}

console.log("\n--- Blocker Cards ---");
const blockerRegex =
  /<h3[^>]*>Bloqueo:([^<]+)<\/h3>[\s\S]*?<div class="blocker-meta">([\s\S]*?)<\/div>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/g;
while ((match = blockerRegex.exec(html)) !== null) {
  console.log("Blocker:", match[1].trim());
  console.log(
    "Meta:",
    match[2]
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  );
  console.log(
    "Desc:",
    match[3]
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  );
  console.log("-");
}

console.log("\n--- Lessons Needing Verification or < 80% Fidelity ---");
const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
while ((match = rowRegex.exec(html)) !== null) {
  const row = match[1];
  if (row.includes("<th")) continue;

  const lessonMatch = row.match(/<td[^>]*><strong>([^<]+)<\/strong>/);
  const lesson = lessonMatch ? lessonMatch[1].trim() : "Unknown";

  const statusMatch = row.match(/<span class="badge[^"]*">([^<]+)<\/span>/);
  const status = statusMatch ? statusMatch[1].trim() : "";

  const fidelityMatch = row.match(/<span class="fidelity-score[^"]*">([^<]+)<\/span>/);
  const fidelityStr = fidelityMatch ? fidelityMatch[1].trim() : "";
  const fidelity = parseInt(fidelityStr.replace("%", ""), 10);

  if (
    status.includes("needs-source-verification") ||
    status.includes("scaffold") ||
    fidelity < 80
  ) {
    console.log(lesson, "| Status:", status, "| Fidelity:", fidelityStr);
  }
}
