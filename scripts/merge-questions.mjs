// 試験ごとに、出典別の問題JSON（data/questions/<試験>/*.json）を結合して public/questions/<試験>.json を作る。
// exam フィールドはフォルダ名から付け、scenario_id がない問題には null を入れる。
// シナリオ（data/questions/<試験>/scenarios.json）は public/questions/<試験>-scenarios.json に書く（なければ空配列）。
// 試験選択画面用に、試験ごとの問題数を public/questions/index.json に書く。
// 使い方: npm run merge
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { EXAMS, scenarioFile } from "../src/exams.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "questions");
const write = (path, data) => writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf-8");

mkdirSync(OUT_DIR, { recursive: true });
const counts = {};
for (const [exam, def] of Object.entries(EXAMS)) {
  console.log(`## ${exam}`);
  const dir = join(ROOT, "data", "questions", exam);
  const questions = [];
  for (const name of Object.keys(def.expectedSources)) {
    const path = join(dir, `${name}.json`);
    if (!existsSync(path)) {
      console.log(`skip: ${exam}/${name}.json がありません`);
      continue;
    }
    const items = JSON.parse(readFileSync(path, "utf-8"));
    console.log(`${exam}/${name}.json: ${items.length}問`);
    questions.push(...items.map(({ id, ...rest }) => ({ id, exam, ...rest, scenario_id: rest.scenario_id ?? null })));
  }
  questions.sort((a, b) => a.id.localeCompare(b.id));
  write(join(ROOT, "public", def.file), questions);
  console.log(`-> public/${def.file}: ${questions.length}問`);

  const scenariosPath = join(dir, "scenarios.json");
  const scenarios = existsSync(scenariosPath) ? JSON.parse(readFileSync(scenariosPath, "utf-8")) : [];
  write(join(ROOT, "public", scenarioFile(exam)), scenarios);
  console.log(`-> public/${scenarioFile(exam)}: ${scenarios.length}件\n`);
  counts[exam] = questions.length;
}
write(join(OUT_DIR, "index.json"), counts);
console.log(`-> public/questions/index.json: ${JSON.stringify(counts)}`);
