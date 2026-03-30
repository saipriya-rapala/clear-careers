const fs = require("fs");
const path = require("path");
const data = require("../src/data/clearcareers_data.json");

function esc(value) {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

const outDir = path.join(__dirname, "..", "public", "data");
fs.mkdirSync(outDir, { recursive: true });

const headers = Object.keys(data[0]);
const careerLines = [headers.join(",")];
for (const row of data) {
  careerLines.push(headers.map((h) => esc(row[h])).join(","));
}
fs.writeFileSync(path.join(outDir, "Careers.csv"), careerLines.join("\n"));

const nameMap = {
  "Cluster 1": "Information Technology",
  "Cluster 2": "Healthcare & Life Sciences",
  "Cluster 3": "Business & Management",
  "Cluster 4": "Finance & Banking",
  "Cluster 5": "Engineering & Manufacturing",
  "Cluster 6": "Media & Communication",
  "Cluster 7": "Education & Training",
  "Cluster 8": "Research & Innovation",
  "Cluster 9": "Governance & Legal",
  "Cluster 10": "Security & Protection",
};

const uniqueClusters = [...new Set(data.map((d) => d.Cluster))].sort(
  (a, b) => Number(a.split(" ")[1]) - Number(b.split(" ")[1])
);

const clusterLines = ["cluster_id,cluster_name"];
for (const id of uniqueClusters) {
  clusterLines.push(`${esc(id)},${esc(nameMap[id] || id)}`);
}
fs.writeFileSync(path.join(outDir, "ClusterSummary.csv"), clusterLines.join("\n"));

console.log("CSV data generated.");
