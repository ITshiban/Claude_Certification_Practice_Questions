import { describe, expect, test } from "vitest";
import {
  dropUnknownSession, exportFileName, exportText, initialData, initialExamData, load, parseData, resetAll, resetExam,
  save, SCHEMA_VERSION, STORAGE_KEY,
} from "../src/storage.js";

// localStorage の代わり
function memoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    raw: map,
  };
}

const throwingStorage = {
  getItem() { throw new Error("SecurityError"); },
  setItem() { throw new Error("QuotaExceededError"); },
};

// CCAO-F の記録（v1 のときの settings から lang を除いた形）
function ccaoRecord() {
  return {
    settings: { count: 20, mode: "incorrect", domains: [2, 6], sources: ["mock"], scenarios: null },
    statuses: { Q001: "correct", Q002: "incorrect", Q003: "unanswered" },
    history: [
      { questionId: "Q001", selected: ["A"], correct: true, answeredAt: "2026-10-19T01:00:00.000Z" },
      { questionId: "Q002", selected: ["B", "D"], correct: false, answeredAt: "2026-10-19T01:01:00.000Z" },
    ],
    currentSession: {
      questionIds: ["Q010", "Q020"],
      orders: { Q010: ["C", "A", "D", "B"], Q020: ["A", "B", "C", "D"] },
      answers: [{ questionId: "Q010", selected: ["C"], correct: false }],
      index: 1,
    },
  };
}

function ccdvRecord() {
  return {
    settings: { count: 5, mode: "random", domains: [1, 8], sources: ["original_hard", "original_new"], scenarios: null },
    statuses: { DV001: "correct" },
    history: [{ questionId: "DV001", selected: ["B"], correct: true, answeredAt: "2026-11-07T01:00:00.000Z" }],
    currentSession: null,
  };
}

function sampleData() {
  return {
    schemaVersion: 3,
    lang: "en",
    currentExam: "ccdv-f",
    exams: {
      "ccao-f": ccaoRecord(),
      "ccdv-f": ccdvRecord(),
      "ccar-f": initialExamData("ccar-f"),
      "ccar-p": initialExamData("ccar-p"),
    },
  };
}

// 設定から scenarios を除いた記録（v1・v2 のころの形）
const withoutScenarios = ({ settings: { scenarios, ...settings }, ...rest }) => ({ settings, ...rest });

// v2（CCAO-F と CCDV-F の2試験、シナリオの絞り込みなし）の保存データ・エクスポートファイル
function v2Data() {
  return {
    schemaVersion: 2,
    lang: "en",
    currentExam: "ccdv-f",
    exams: { "ccao-f": withoutScenarios(ccaoRecord()), "ccdv-f": withoutScenarios(ccdvRecord()) },
  };
}

// v1（CCAO-F 専用だったころ）の保存データ・エクスポートファイル
function v1Data() {
  const { settings, ...rest } = withoutScenarios(ccaoRecord());
  return { schemaVersion: 1, settings: { lang: "en", ...settings }, ...rest };
}

describe("保存と読み込み", () => {
  test("保存 → 読み込みで内容が一致する", () => {
    const storage = memoryStorage();
    expect(save(sampleData(), storage)).toBe(true);
    expect(load(storage)).toEqual({ data: sampleData(), warning: null });
  });

  test("保存データがなければ初期状態（注意なし）。試験はまだ選んでいない", () => {
    const r = load(memoryStorage());
    expect(r).toEqual({ data: initialData(), warning: null });
    expect(r.data.currentExam).toBeNull();
    expect(Object.keys(r.data.exams)).toEqual(["ccao-f", "ccdv-f", "ccar-f", "ccar-p"]);
  });

  test("JSON として壊れていれば初期状態で起動し、注意を出す", () => {
    const r = load(memoryStorage({ [STORAGE_KEY]: "{not json" }));
    expect(r).toEqual({ data: initialData(), warning: "corrupt" });
  });

  test("形式が不正（項目の型が違う）なら初期状態で起動し、注意を出す", () => {
    const broken = sampleData();
    broken.exams["ccao-f"].history = "oops";
    expect(load(memoryStorage({ [STORAGE_KEY]: JSON.stringify(broken) })).warning).toBe("corrupt");
  });

  test("新しい schemaVersion のデータは読み込まず、注意を出す", () => {
    const newer = { ...sampleData(), schemaVersion: SCHEMA_VERSION + 1 };
    expect(load(memoryStorage({ [STORAGE_KEY]: JSON.stringify(newer) }))).toEqual({ data: initialData(), warning: "newer" });
  });

  test("localStorage が使えなくても止まらない", () => {
    expect(load(throwingStorage)).toEqual({ data: initialData(), warning: "unavailable" });
    expect(load(undefined)).toEqual({ data: initialData(), warning: "unavailable" });
    expect(save(sampleData(), throwingStorage)).toBe(false);
    expect(save(sampleData(), undefined)).toBe(false);
  });

  test("定義にある試験の記録がなければ初期値で補う", () => {
    const d = sampleData();
    delete d.exams["ccdv-f"];
    expect(parseData(JSON.stringify(d)).data.exams["ccdv-f"]).toEqual(initialExamData("ccdv-f"));
  });
});

describe("v1 → v2 の変換", () => {
  test("キーは v1 のときのまま", () => {
    expect(STORAGE_KEY).toBe("ccaof-quiz:v1");
  });

  test("v1 の保存データは CCAO-F の記録として引き継ぐ", () => {
    const r = load(memoryStorage({ [STORAGE_KEY]: JSON.stringify(v1Data()) }));
    expect(r.warning).toBeNull();
    expect(r.data).toEqual({
      schemaVersion: 3,
      lang: "en",
      currentExam: "ccao-f",
      exams: {
        "ccao-f": ccaoRecord(),
        "ccdv-f": initialExamData("ccdv-f"),
        "ccar-f": initialExamData("ccar-f"),
        "ccar-p": initialExamData("ccar-p"),
      },
    });
  });

  test("v1 形式のエクスポートファイルもインポートできる", () => {
    const r = parseData(JSON.stringify(v1Data(), null, 2));
    expect(r.data.exams["ccao-f"]).toEqual(ccaoRecord());
    expect(r.data.schemaVersion).toBe(3);
  });

  test("v1 として不正なデータは読み込まない", () => {
    expect(parseData(JSON.stringify({ ...v1Data(), statuses: { Q001: "maybe" } }))).toEqual({ error: "invalid" });
    expect(parseData(JSON.stringify({ ...v1Data(), settings: { ...v1Data().settings, lang: "fr" } }))).toEqual({ error: "invalid" });
  });
});

describe("v2 → v3 の変換", () => {
  test("v2 の保存データは、各試験の出題設定に scenarios: null を足して引き継ぎ、新しい試験を補う", () => {
    const r = load(memoryStorage({ [STORAGE_KEY]: JSON.stringify(v2Data()) }));
    expect(r.warning).toBeNull();
    expect(r.data).toEqual(sampleData());
  });

  test("v2 形式のエクスポートファイルもインポートできる", () => {
    expect(parseData(JSON.stringify(v2Data(), null, 2))).toEqual({ data: sampleData() });
  });

  test("シナリオの絞り込みは null か文字列の配列だけを受け付ける", () => {
    const ok = sampleData();
    ok.exams["ccar-f"].settings.scenarios = ["AFS01", "none"];
    expect(parseData(JSON.stringify(ok)).data.exams["ccar-f"].settings.scenarios).toEqual(["AFS01", "none"]);
    const bad = sampleData();
    bad.exams["ccar-f"].settings.scenarios = "AFS01";
    expect(parseData(JSON.stringify(bad))).toEqual({ error: "invalid" });
  });
});

describe("インポートの形式チェック", () => {
  test("正しいエクスポートファイルは読み込める", () => {
    expect(parseData(exportText(sampleData()))).toEqual({ data: sampleData() });
  });

  const withCcao = (patch) => {
    const d = sampleData();
    d.exams["ccao-f"] = { ...d.exams["ccao-f"], ...patch };
    return JSON.stringify(d);
  };
  const ccaoSettings = (patch) => withCcao({ settings: { ...ccaoRecord().settings, ...patch } });

  test.each([
    ["JSON でない", "hello", "corrupt"],
    ["配列", "[]", "invalid"],
    ["schemaVersion なし", JSON.stringify({ ...sampleData(), schemaVersion: undefined }), "invalid"],
    ["新しいバージョン", JSON.stringify({ ...sampleData(), schemaVersion: 99 }), "newer"],
    ["不正な言語", JSON.stringify({ ...sampleData(), lang: "fr" }), "invalid"],
    ["未知の試験を選んでいる", JSON.stringify({ ...sampleData(), currentExam: "xxx" }), "invalid"],
    ["不正な出題数", ccaoSettings({ count: 7 }), "invalid"],
    ["試験にないドメイン", ccaoSettings({ domains: [8] }), "invalid"],
    ["試験にない出典グループ", ccaoSettings({ sources: ["original_new"] }), "invalid"],
    ["不正なステータス", withCcao({ statuses: { Q001: "maybe" } }), "invalid"],
    ["履歴の項目が不足", withCcao({ history: [{ questionId: "Q001" }] }), "invalid"],
    ["クールの index が範囲外", withCcao({ currentSession: { ...ccaoRecord().currentSession, index: 5 } }), "invalid"],
    ["クールの回答が出題順と食い違う", withCcao({
      currentSession: { ...ccaoRecord().currentSession, answers: [{ questionId: "Q020", selected: ["A"], correct: true }] },
    }), "invalid"],
  ])("%s は読み込まない", (_, text, error) => {
    expect(parseData(text)).toEqual({ error });
  });

  test("CCDV-F では original を難化版・新規に分けた出典グループを使える", () => {
    expect(parseData(JSON.stringify(sampleData())).data.exams["ccdv-f"].settings.sources).toEqual(["original_hard", "original_new"]);
  });
});

describe("リセット", () => {
  test("試験ごとのリセットは、ほかの試験の記録と出題設定を消さない", () => {
    const d = resetExam(sampleData(), "ccao-f");
    expect(d.exams["ccao-f"]).toEqual({ ...initialExamData("ccao-f"), settings: ccaoRecord().settings });
    expect(d.exams["ccdv-f"]).toEqual(ccdvRecord());
    expect(d.lang).toBe("en");
    expect(d.currentExam).toBe("ccdv-f");
  });

  test("すべての記録のリセットは、全試験の記録を消して出題設定は残す", () => {
    const d = resetAll(sampleData());
    expect(d.exams["ccao-f"]).toEqual({ ...initialExamData("ccao-f"), settings: ccaoRecord().settings });
    expect(d.exams["ccdv-f"]).toEqual({ ...initialExamData("ccdv-f"), settings: ccdvRecord().settings });
  });
});

describe("その他", () => {
  test("エクスポートのファイル名に日付が入る", () => {
    expect(exportFileName(new Date(2026, 9, 5))).toBe("claude-cert-quiz-backup-2026-10-05.json");
  });

  test("問題データにない問題を含むクールは破棄する（その試験だけ）", () => {
    const d = sampleData();
    expect(dropUnknownSession(d, "ccao-f", new Set(["Q010", "Q020"]))).toBe(d);
    const dropped = dropUnknownSession(d, "ccao-f", new Set(["Q010"]));
    expect(dropped.exams["ccao-f"].currentSession).toBeNull();
    expect(dropped.exams["ccdv-f"]).toBe(d.exams["ccdv-f"]);
  });
});
