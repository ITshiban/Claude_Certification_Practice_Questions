// 問題データを試験ごとに検証し、件数とエラーを表示する。エラーがあれば終了コード1。
// 使い方: npm run validate   （public/questions/<試験>.json をすべて検証する。先に npm run merge）
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { EXAMS, scenarioFile } from "../src/exams.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const LANGS = ["en", "ja"];
const FIELDS = ["id", "exam", "source", "source_url", "source_number", "scenario_id", "domain", "type", "question", "choices", "answer", "explanation"];
// 解説中の選択肢記号：(B) / (B, C) / **B**
const REF = /\(([A-D](?:, [A-D])*)\)|\*\*([A-D])\*\*/g;

function refs(text) {
  const keys = [];
  for (const m of text.matchAll(REF)) keys.push(...(m[1] ?? m[2]).split(", "));
  return keys.sort();
}

const blank = (v) => typeof v !== "string" || v.trim() === "";

/** 1問分のエラーメッセージの配列を返す */
export function checkQuestion(q, exam) {
  const errors = [];
  for (const f of FIELDS) if (!(f in q)) errors.push(`${f} がない`);
  if (errors.length) return errors;

  const { domains, expectedSources } = EXAMS[exam];
  if (q.exam !== exam) errors.push(`exam が ${exam} でない: ${q.exam}`);
  if (!(q.source in expectedSources)) errors.push(`source が不正: ${q.source}`);
  if (q.source === "original") {
    if (q.source_url !== null || q.source_number !== null) errors.push("original なのに source_url / source_number が null でない");
  } else if (!q.source_url || !Number.isInteger(q.source_number)) {
    errors.push("source_url / source_number がない");
  }
  const ids = Object.keys(domains);
  if (!(q.domain in domains) || !Number.isInteger(q.domain)) errors.push(`domain が 1〜${ids.length} でない: ${q.domain}`);

  const keys = q.choices.map((c) => c.key);
  if (keys.length !== 4 || new Set(keys).size !== 4) errors.push(`choices の key が4つの異なる値でない: ${JSON.stringify(keys)}`);
  const missing = q.answer.filter((a) => !keys.includes(a));
  if (missing.length) errors.push(`answer が choices にない: ${JSON.stringify(missing)}`);
  if (new Set(q.answer).size !== q.answer.length) errors.push("answer が重複している");
  const expectedN = { single: 1, multiple: 2 }[q.type];
  if (expectedN === undefined) errors.push(`type が不正: ${q.type}`);
  else if (q.answer.length !== expectedN) errors.push(`type=${q.type} なのに answer が ${q.answer.length} 個`);

  let missingText = false;
  for (const lang of LANGS) {
    if (blank(q.question[lang])) { errors.push(`question.${lang} が空`); missingText = true; }
    if (blank(q.explanation[lang])) { errors.push(`explanation.${lang} が空`); missingText = true; }
    for (const c of q.choices) if (blank(c[lang])) errors.push(`choices[${c.key}].${lang} が空`);
  }
  if (missingText) return errors;

  if (q.type === "multiple" && (!q.question.en.includes("Choose two") || !q.question.ja.includes("2つ選べ"))) {
    errors.push("multiple なのに問題文に Choose two / 2つ選べ がない");
  }
  const enRefs = refs(q.explanation.en);
  const jaRefs = refs(q.explanation.ja);
  if (JSON.stringify(enRefs) !== JSON.stringify(jaRefs)) {
    errors.push(`解説の選択肢記号が英日で一致しない: en=${JSON.stringify(enRefs)} ja=${JSON.stringify(jaRefs)}`);
  }
  const bad = [...new Set(enRefs)].filter((k) => !keys.includes(k));
  if (bad.length) errors.push(`解説が存在しない選択肢を参照している: ${JSON.stringify(bad)}`);
  if (q.explanation.en.includes("[Supplement]") !== q.explanation.ja.includes("【補足】")) {
    errors.push("補足（[Supplement] / 【補足】）が英日の片方にしかない");
  }
  return errors;
}

/** based_on のエラーを [id, メッセージ] の配列で返す。参照先は同じ試験の original 以外で、同じドメインであること */
function checkBasedOn(questions, exam) {
  const errors = [];
  const byId = Object.fromEntries(questions.map((q) => [q.id, q]));
  const required = Boolean(EXAMS[exam].originalRules);
  for (const q of questions) {
    if (!required || q.source !== "original") {
      if ("based_on" in q) errors.push([q.id, "based_on はこの試験の original 以外に付けない"]);
      continue;
    }
    if (!("based_on" in q)) errors.push([q.id, "based_on がない（新規なら null）"]);
    else if (q.based_on !== null) {
      const base = byId[q.based_on];
      if (!base) errors.push([q.id, `based_on の参照先がこの試験にない: ${q.based_on}`]);
      else if (base.source === "original") errors.push([q.id, `based_on の参照先が original: ${q.based_on}`]);
      else if (base.domain !== q.domain) errors.push([q.id, `based_on の参照先とドメインが違う: ${q.based_on}（${base.domain}）`]);
    }
  }
  return errors;
}

/**
 * オリジナル問題が作成ルールに合っているかを調べる（警告。エラーにはしない）。
 * 戻り値: { warnings: [id, メッセージ][], stats } または ルールのない試験では null
 */
export function checkOriginalRules(questions, exam) {
  const rules = EXAMS[exam].originalRules;
  if (!rules) return null;
  const base = questions.filter((q) => rules.baseSources.includes(q.source));
  const originals = questions.filter((q) => q.source === "original");
  if (base.length === 0 || originals.length === 0) return { warnings: [], stats: null };

  const baseAvg = base.reduce((n, q) => n + q.question.en.length, 0) / base.length;
  const warnings = [];
  const positions = { A: 0, B: 0, C: 0, D: 0 };
  let correctLongest = 0;
  for (const q of originals) {
    const ratio = q.question.en.length / baseAvg;
    if (ratio < rules.lengthRatio[0] || ratio > rules.lengthRatio[1]) {
      warnings.push([q.id, `問題文の長さが基準外: ${q.question.en.length}字（${ratio.toFixed(2)}倍）`]);
    }
    const len = (c) => c.en.length;
    const lengths = q.choices.map(len);
    const diff = (Math.max(...lengths) - Math.min(...lengths)) / Math.max(...lengths);
    if (diff > rules.maxChoiceDiff) warnings.push([q.id, `選択肢の長さの差が大きい: ${(diff * 100).toFixed(1)}%`]);
    const correct = q.choices.filter((c) => q.answer.includes(c.key)).map(len);
    const wrong = q.choices.filter((c) => !q.answer.includes(c.key)).map(len);
    if (Math.max(...correct) > Math.max(...wrong)) correctLongest += 1;
    for (const k of q.answer) if (k in positions) positions[k] += 1;
  }

  const longestShare = correctLongest / originals.length;
  if (longestShare > rules.maxCorrectLongest) {
    warnings.push(["-", `正解が単独で最長の選択肢になっている問題が多い: ${correctLongest}/${originals.length}`]);
  }
  const slots = Object.values(positions).reduce((a, b) => a + b, 0);
  for (const [k, n] of Object.entries(positions)) {
    const share = n / slots;
    if (share < rules.positionShare[0] || share > rules.positionShare[1]) {
      warnings.push(["-", `正解位置 ${k} の割合が基準外: ${(share * 100).toFixed(1)}%`]);
    }
  }
  return { warnings, stats: { baseAvg, count: originals.length, correctLongest, positions } };
}

/** 同じ試験のシナリオだけを参照でき、全シナリオが使われていることを確かめる */
export function checkScenarios(questions, scenarios, exam) {
  const errors = [];
  if (!Array.isArray(scenarios)) return [["-", "シナリオが配列でない"]];
  const ids = new Set();
  for (const s of scenarios) {
    if (!s || typeof s !== "object") {
      errors.push(["?", "シナリオがオブジェクトでない"]);
      continue;
    }
    const id = s.id ?? "?";
    if (blank(s.id)) errors.push([id, "シナリオの id が空"]);
    else {
      if (ids.has(s.id)) errors.push([id, "シナリオの ID が重複"]);
      ids.add(s.id);
    }
    for (const field of ["title", "body"]) {
      for (const lang of LANGS) if (blank(s[field]?.[lang])) errors.push([id, `シナリオの ${field}.${lang} が空`]);
    }
    if (s.source !== "guide" && !(s.source in EXAMS[exam].expectedSources)) errors.push([id, "シナリオの source が不正"]);
    for (const field of ["source_url", "source_note"]) if (blank(s[field])) errors.push([id, `シナリオの ${field} が空`]);
  }
  const used = new Set();
  for (const q of questions) {
    if (!("scenario_id" in q) || q.scenario_id === null) continue;
    if (blank(q.scenario_id)) errors.push([q.id, "scenario_id が null または空でない文字列でない"]);
    else if (!ids.has(q.scenario_id)) errors.push([q.id, `scenario_id の参照先がこの試験にない: ${q.scenario_id}`]);
    else used.add(q.scenario_id);
  }
  for (const id of ids) if (!used.has(id)) errors.push([id, "使われていないシナリオ"]);
  return errors;
}

/** 問題と同じ試験のシナリオを検証する */
export function validate(questions, exam, scenarios = []) {
  const { expectedSources } = EXAMS[exam];
  const errors = [];
  const total = questions.length;
  const expectedTotal = Object.values(expectedSources).reduce((a, b) => a + b, 0);
  if (total !== expectedTotal) errors.push(["-", `合計が ${expectedTotal} 問でない: ${total}`]);

  const idCount = {};
  for (const q of questions) idCount[q.id] = (idCount[q.id] ?? 0) + 1;
  for (const [id, n] of Object.entries(idCount)) if (n > 1) errors.push([id, `ID が ${n} 回重複`]);
  for (const q of questions) for (const msg of checkQuestion(q, exam)) errors.push([q.id ?? "?", msg]);

  const count = (key) => questions.reduce((acc, q) => ({ ...acc, [q[key]]: (acc[q[key]] ?? 0) + 1 }), {});
  const bySource = count("source");
  for (const [src, expected] of Object.entries(expectedSources)) {
    if ((bySource[src] ?? 0) !== expected) errors.push(["-", `${src} が ${expected} 問でない: ${bySource[src] ?? 0}`]);
  }
  errors.push(...checkBasedOn(questions, exam));
  errors.push(...checkScenarios(questions, scenarios, exam));
  const original = checkOriginalRules(questions, exam);
  return {
    errors,
    warnings: original?.warnings ?? [],
    originalStats: original?.stats ?? null,
    total,
    bySource,
    byDomain: count("domain"),
    byType: count("type"),
  };
}

/** 試験をまたいだ ID の重複を [id, メッセージ] の配列で返す */
export function crossExamDuplicates(byExam) {
  const owner = {};
  const errors = [];
  for (const [exam, questions] of Object.entries(byExam)) {
    for (const q of new Set(questions.map((x) => x.id))) {
      if (owner[q] && owner[q] !== exam) errors.push([q, `ID が ${owner[q]} と ${exam} で重複`]);
      owner[q] ??= exam;
    }
  }
  return errors;
}

function report(exam, { errors, warnings, originalStats, total, bySource, byDomain, byType }) {
  const { code, domains, expectedSources } = EXAMS[exam];
  console.log(`## ${code}（public/${EXAMS[exam].file}）\n`);
  console.log(`合計: ${total} 問\n`);
  console.log("| 出典 | 件数 | 期待値 |\n|---|---|---|");
  for (const [src, expected] of Object.entries(expectedSources)) console.log(`| ${src} | ${bySource[src] ?? 0} | ${expected} |`);

  console.log("\n| ドメイン | 件数 | 比率 | 配点比率 | 差 |\n|---|---|---|---|---|");
  for (const [d, { en, weight }] of Object.entries(domains)) {
    const n = byDomain[d] ?? 0;
    const ratio = total ? (n / total) * 100 : 0;
    const diff = (ratio - weight).toFixed(1);
    console.log(`| ${d} ${en} | ${n} | ${ratio.toFixed(1)}% | ${weight}% | ${diff >= 0 ? "+" : ""}${diff}pt |`);
  }
  console.log(`\nsingle: ${byType.single ?? 0} / multiple: ${byType.multiple ?? 0}`);
  console.log(`\nエラー: ${errors.length} 件`);
  for (const [id, msg] of errors) console.log(`- ${id}: ${msg}`);
  if (originalStats) {
    const { baseAvg, count, correctLongest, positions } = originalStats;
    console.log(`\n### オリジナル問題（${count}問）の作成ルール`);
    console.log(`- 問題文の長さの基準（${EXAMS[exam].originalRules.baseSources.join(" / ")} の平均）: ${baseAvg.toFixed(1)}字`);
    console.log(`- 正解が単独で最長の選択肢: ${correctLongest}/${count}`);
    console.log(`- 正解位置: ${Object.entries(positions).map(([k, n]) => `${k} ${n}`).join(" / ")}`);
    console.log(`\n警告: ${warnings.length} 件`);
    for (const [id, msg] of warnings) console.log(`- ${id}: ${msg}`);
  }
  console.log("");
}

function main() {
  const byExam = Object.fromEntries(
    Object.entries(EXAMS).map(([exam, def]) => [exam, JSON.parse(readFileSync(join(ROOT, "public", def.file), "utf-8"))]),
  );
  let errorCount = 0;
  for (const [exam, questions] of Object.entries(byExam)) {
    const scenarios = JSON.parse(readFileSync(join(ROOT, "public", scenarioFile(exam)), "utf-8"));
    const result = validate(questions, exam, scenarios);
    report(exam, result);
    errorCount += result.errors.length;
  }
  const dup = crossExamDuplicates(byExam);
  console.log(`## 試験をまたいだ ID の重複: ${dup.length} 件`);
  for (const [id, msg] of dup) console.log(`- ${id}: ${msg}`);
  errorCount += dup.length;

  console.log(`\nエラー合計: ${errorCount} 件`);
  process.exit(errorCount ? 1 : 0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
