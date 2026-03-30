import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import Papa from "papaparse";
import dotenv from "dotenv";
import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config({ path: path.resolve(".env") });

const CAREERS_CSV = path.resolve("public", "data", "Careers.csv");
const CLUSTERS_CSV = path.resolve("public", "data", "ClusterSummary.csv");
const isDryRun = process.argv.includes("--dry-run");

function parseCsv(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV file not found: ${filePath}`);
  }

  const fileText = fs.readFileSync(filePath, "utf-8");
  const parsed = Papa.parse(fileText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => String(header || "").trim(),
  });

  if (parsed.errors?.length) {
    const first = parsed.errors[0];
    throw new Error(`CSV parse failed for ${filePath}: ${first.message}`);
  }

  return parsed.data;
}

function getAdminCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const json = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      return cert(json);
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.");
    }
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const servicePath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    if (!fs.existsSync(servicePath)) {
      throw new Error(`FIREBASE_SERVICE_ACCOUNT_PATH file not found: ${servicePath}`);
    }
    const json = JSON.parse(fs.readFileSync(servicePath, "utf-8"));
    return cert(json);
  }

  return applicationDefault();
}

function normalizeCluster(row) {
  return {
    cluster_id: String(row.cluster_id || "").trim(),
    cluster_name: String(row.cluster_name || "").trim(),
    updated_at: new Date().toISOString(),
  };
}

function normalizeCareer(row) {
  const careerNo = Number(row["No."] || 0);
  return {
    career_no: Number.isFinite(careerNo) ? careerNo : 0,
    career_name: String(row["Career Name"] || "").trim(),
    cluster_id: String(row.Cluster || "").trim(),
    one_line_summary: String(row["One-Line Summary"] || "").trim(),
    what_they_do: String(row["What They Do"] || "").trim(),
    industries: String(row.Industries || "").trim(),
    entry_salary_lpa: String(row["Entry Salary (LPA)"] || "").trim(),
    mid_salary_lpa: String(row["Mid Salary (LPA)"] || "").trim(),
    senior_salary_lpa: String(row["Senior Salary (LPA)"] || "").trim(),
    top_earnings_lpa: String(row["Top Earnings (LPA)"] || "").trim(),
    demand_level: String(row["Demand Level"] || "").trim(),
    growth_rate: String(row["Growth Rate"] || "").trim(),
    ai_impact: String(row["AI Impact"] || "").trim(),
    core_skills: String(row["Core Skills"] || "").trim(),
    key_certifications: String(row["Key Certifications"] || "").trim(),
    degree_required: String(row["Degree Required"] || "").trim(),
    work_life_balance: String(row["Work-Life Balance"] || "").trim(),
    stress_level: String(row["Stress Level"] || "").trim(),
    entry_path: String(row["Entry Path"] || "").trim(),
    who_should_choose: String(row["Who Should Choose"] || "").trim(),
    who_should_avoid: String(row["Who Should Avoid"] || "").trim(),
    verdict: String(row.Verdict || "").trim(),
    money_score: Number(row["Money Score"] || 0),
    growth_score: Number(row["Growth Score"] || 0),
    stability_score: Number(row["Stability Score"] || 0),
    updated_at: new Date().toISOString(),
  };
}

async function run() {
  const clusterRows = parseCsv(CLUSTERS_CSV).map(normalizeCluster).filter((row) => row.cluster_id);
  const careerRows = parseCsv(CAREERS_CSV).map(normalizeCareer).filter((row) => row.career_no > 0 && row.career_name);

  if (isDryRun) {
    console.log(`Dry run: ${clusterRows.length} clusters and ${careerRows.length} careers parsed.`);
    console.log("No Firestore writes were executed.");
    return;
  }

  initializeApp({ credential: getAdminCredential() });
  const db = getFirestore();
  const batchSize = 400;

  for (let index = 0; index < clusterRows.length; index += batchSize) {
    const chunk = clusterRows.slice(index, index + batchSize);
    const batch = db.batch();
    for (const row of chunk) {
      const ref = db.collection("clusters").doc(row.cluster_id);
      batch.set(ref, row, { merge: true });
    }
    await batch.commit();
  }

  for (let index = 0; index < careerRows.length; index += batchSize) {
    const chunk = careerRows.slice(index, index + batchSize);
    const batch = db.batch();
    for (const row of chunk) {
      const ref = db.collection("careers").doc(String(row.career_no));
      batch.set(ref, row, { merge: true });
    }
    await batch.commit();
  }

  console.log(`Imported ${clusterRows.length} clusters into Firestore collection clusters.`);
  console.log(`Imported ${careerRows.length} careers into Firestore collection careers.`);
}

run().catch((error) => {
  console.error("Import failed:", error.message);
  process.exit(1);
});
