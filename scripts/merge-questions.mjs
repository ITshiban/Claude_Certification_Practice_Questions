// 試験ごとに、出典別の問題JSON（data/questions/<試験>/*.json）を結合して public/questions/<試験>.json を作る。
// exam フィールドはフォルダ名から付ける。試験選択画面用に、試験ごとの問題数を public/questions/index.json に書く。
// 使い方: npm run merge
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { EXAMS } from "../src/exams.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "questions");

mkdirSync(OUT_DIR, { recursive: true });
const counts = {};
for (const [exam, def] of Object.entries(EXAMS)) {
  console.log(`## ${exam}`);
  const questions = [];
  for (const name of Object.keys(def.expectedSources)) {
    const path = join(ROOT, "data", "questions", exam, `${name}.json`);
    if (!existsSync(path)) {
      console.log(`skip: ${exam}/${name}.json がありません`);
      continue;
    }
    const items = JSON.parse(readFileSync(path, "utf-8"));
    console.log(`${exam}/${name}.json: ${items.length}問`);
    questions.push(...items.map(({ id, ...rest }) => ({ id, exam, ...rest })));
  }
  questions.sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync(join(OUT_DIR, `${exam}.json`), JSON.stringify(questions, null, 2) + "\n", "utf-8");
  console.log(`-> public/${def.file}: ${questions.length}問\n`);
  counts[exam] = questions.length;
}
writeFileSync(join(OUT_DIR, "index.json"), JSON.stringify(counts, null, 2) + "\n", "utf-8");
console.log(`-> public/questions/index.json: ${JSON.stringify(counts)}`);
