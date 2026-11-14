// 学習記録の保存（localStorage）、スキーマの確認、エクスポート・インポート
import { domainIds, EXAM_IDS, EXAMS } from "./exams.js";
import { COUNTS, MODES, STATUSES } from "./quiz.js";

// キーは v1 のときのまま（公開中のアプリの記録を引き継ぐため変えない）
export const STORAGE_KEY = "ccaof-quiz:v1";
export const SCHEMA_VERSION = 3;

// schemaVersion を上げるときは、ここに「旧バージョン → 次のバージョン」の変換を追加する
const MIGRATIONS = {
  // v1 は CCAO-F だけの記録。言語は全体の設定に、それ以外は CCAO-F の記録に移す
  1: ({ settings, statuses, history, currentSession }) => {
    const { lang, ...examSettings } = settings ?? {};
    return {
      schemaVersion: 2,
      lang,
      currentExam: "ccao-f",
      exams: { "ccao-f": { settings: examSettings, statuses, history, currentSession } },
    };
  },
  // v3 で出題設定にシナリオの絞り込み（null は絞り込みなし）を追加した
  2: (data) => ({
    ...data,
    schemaVersion: 3,
    exams: Object.fromEntries(
      Object.entries(data.exams ?? {}).map(([exam, d]) => [exam, { ...d, settings: { ...d?.settings, scenarios: null } }]),
    ),
  }),
};

/** 1つの試験の記録の初期値 */
export function initialExamData(exam) {
  return {
    settings: { count: 10, mode: "random", domains: domainIds(exam), sources: [...EXAMS[exam].sourceGroups], scenarios: null },
    statuses: {},
    history: [],
    currentSession: null,
  };
}

export function initialData() {
  return {
    schemaVersion: SCHEMA_VERSION,
    lang: "ja",
    currentExam: null, // 前回選んだ試験（まだ選んでいなければ null）
    exams: Object.fromEntries(EXAM_IDS.map((e) => [e, initialExamData(e)])),
  };
}

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isStringArray = (v) => Array.isArray(v) && v.every((x) => typeof x === "string");

/** 定義にある試験の記録がなければ初期値で補う（試験を追加しても schemaVersion を上げずに済む） */
function fillExams(data) {
  if (!isObject(data) || !isObject(data.exams)) return data;
  const missing = EXAM_IDS.filter((e) => !(e in data.exams));
  if (missing.length === 0) return data;
  return { ...data, exams: { ...data.exams, ...Object.fromEntries(missing.map((e) => [e, initialExamData(e)])) } };
}

/** 1つの試験の記録の形式を確認する */
function findExamProblem(d, exam) {
  if (!isObject(d)) return "exam";
  const s = d.settings;
  const domains = domainIds(exam);
  if (!isObject(s)) return "settings";
  if (!COUNTS.includes(s.count)) return "settings.count";
  if (!MODES.includes(s.mode)) return "settings.mode";
  if (!Array.isArray(s.domains) || !s.domains.every((x) => domains.includes(x))) return "settings.domains";
  if (!Array.isArray(s.sources) || !s.sources.every((g) => EXAMS[exam].sourceGroups.includes(g))) return "settings.sources";
  // シナリオの ID は問題データ側にあるので、ここでは形だけを確かめる
  if (s.scenarios !== null && !isStringArray(s.scenarios)) return "settings.scenarios";

  if (!isObject(d.statuses) || !Object.values(d.statuses).every((v) => STATUSES.includes(v))) return "statuses";

  if (!Array.isArray(d.history)) return "history";
  for (const h of d.history) {
    if (!isObject(h) || typeof h.questionId !== "string" || !isStringArray(h.selected)
      || typeof h.correct !== "boolean" || typeof h.answeredAt !== "string") return "history item";
  }

  const c = d.currentSession;
  if (c !== null) {
    if (!isObject(c) || !isStringArray(c.questionIds) || c.questionIds.length === 0) return "currentSession";
    if (!isObject(c.orders) || !c.questionIds.every((id) => isStringArray(c.orders[id]))) return "currentSession.orders";
    if (!Array.isArray(c.answers) || c.answers.length > c.questionIds.length) return "currentSession.answers";
    for (const [i, a] of c.answers.entries()) {
      if (!isObject(a) || a.questionId !== c.questionIds[i] || !isStringArray(a.selected) || typeof a.correct !== "boolean") {
        return "currentSession.answers item";
      }
    }
    if (!Number.isInteger(c.index) || c.index < 0 || c.index >= c.questionIds.length) return "currentSession.index";
  }
  return null;
}

/** 保存データの形式を確認する。問題があれば理由の文字列、なければ null を返す */
export function findProblem(data) {
  if (!isObject(data)) return "not an object";
  if (data.schemaVersion !== SCHEMA_VERSION) return "schemaVersion";
  if (!["ja", "en"].includes(data.lang)) return "lang";
  if (data.currentExam !== null && !EXAM_IDS.includes(data.currentExam)) return "currentExam";
  if (!isObject(data.exams)) return "exams";
  for (const exam of EXAM_IDS) {
    const problem = findExamProblem(data.exams[exam], exam);
    if (problem) return `exams.${exam}.${problem}`;
  }
  return null;
}

/** 古い schemaVersion のデータを現在の形に変換する */
export function migrate(data) {
  let d = data;
  while (Number.isInteger(d?.schemaVersion) && d.schemaVersion < SCHEMA_VERSION) {
    const step = MIGRATIONS[d.schemaVersion];
    if (!step) break;
    d = step(d);
  }
  return fillExams(d);
}

/**
 * JSON 文字列を保存データとして解釈する（v1・v2 のデータは現在の v3 に変換する）。
 * 戻り値: { data } または { error: "corrupt" | "newer" | "invalid" }
 */
export function parseData(text) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    return { error: "corrupt" };
  }
  if (isObject(raw) && Number.isInteger(raw.schemaVersion) && raw.schemaVersion > SCHEMA_VERSION) {
    return { error: "newer" };
  }
  const data = migrate(raw);
  return findProblem(data) ? { error: "invalid" } : { data };
}

function defaultStorage() {
  return globalThis.localStorage;
}

/**
 * 保存データを読み込む。失敗しても初期状態を返し、warning に理由を入れる。
 * warning: null | "unavailable" | "corrupt" | "newer"
 */
export function load(storage = defaultStorage()) {
  let text;
  try {
    if (!storage) throw new Error("no storage");
    text = storage.getItem(STORAGE_KEY);
  } catch {
    return { data: initialData(), warning: "unavailable" };
  }
  if (text === null || text === undefined) return { data: initialData(), warning: null };
  const result = parseData(text);
  if (result.error) return { data: initialData(), warning: result.error === "newer" ? "newer" : "corrupt" };
  return { data: result.data, warning: null };
}

/** 保存する。成功すれば true、失敗すれば false（例外は外に出さない） */
export function save(data, storage = defaultStorage()) {
  try {
    if (!storage) return false;
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/** 1つの試験の記録（回答履歴・ステータス・進行中のクール）を消す。出題設定とほかの試験の記録は残す */
export function resetExam(data, exam) {
  const { settings } = data.exams[exam];
  return { ...data, exams: { ...data.exams, [exam]: { ...initialExamData(exam), settings } } };
}

/** すべての試験の記録を消す。言語・前回の試験・出題設定は残す */
export function resetAll(data) {
  return EXAM_IDS.reduce(resetExam, data);
}

/** 問題データに存在しない問題を含む進行中のクールは破棄する（exam の記録だけが対象） */
export function dropUnknownSession(data, exam, knownIds) {
  const c = data.exams[exam].currentSession;
  if (c && !c.questionIds.every((id) => knownIds.has(id))) {
    return { ...data, exams: { ...data.exams, [exam]: { ...data.exams[exam], currentSession: null } } };
  }
  return data;
}

export function exportFileName(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `claude-cert-quiz-backup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`;
}

export function exportText(data) {
  return JSON.stringify(data, null, 2);
}
