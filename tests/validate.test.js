import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { checkScenarios, crossExamDuplicates, validate } from "../scripts/validate-questions.mjs";
import { EXAM_IDS, scenarioFile } from "../src/exams.js";

const load = (exam = "ccao-f") => JSON.parse(readFileSync(`public/questions/${exam}.json`, "utf-8"));
const scenarios = (exam) => JSON.parse(readFileSync(`public/${scenarioFile(exam)}`, "utf-8"));
const byId = (d, id) => d.find((q) => q.id === id);
const messagesOf = (list) => list.map(([id, msg]) => `${id}: ${msg}`);

describe("問題データの検証", () => {
  test.each(EXAM_IDS)("現在の問題データはエラーなし（%s）", (exam) => {
    expect(validate(load(exam), exam, scenarios(exam)).errors).toEqual([]);
  });

  test("壊れたデータのエラーを検出する", () => {
    const d = load();
    d[0].answer = ["E"]; // answer が choices にない
    d[1].id = d[2].id; // ID 重複
    d[3].type = "multiple"; // type と answer の数が不一致
    d[4].question.ja = ""; // 日本語の欠落
    d[5].domain = 8; // domain が範囲外
    d[1].explanation.ja = d[1].explanation.ja.replace("(A)", ""); // 記号が英日で不一致
    d[40].explanation.ja = d[40].explanation.ja.replace("【補足】", ""); // 補足の片側欠落
    d[6].exam = "ccdv-f"; // exam がフォルダと違う
    expect(messagesOf(validate(d, "ccao-f").errors)).toEqual(expect.arrayContaining([
      "Q001: answer が choices にない: [\"E\"]",
      "Q003: ID が 2 回重複",
      "Q004: type=multiple なのに answer が 1 個",
      "Q005: question.ja が空",
      "Q006: domain が 1〜7 でない: 8",
      expect.stringMatching(/^Q003: 解説の選択肢記号が英日で一致しない/),
      "Q041: 補足（[Supplement] / 【補足】）が英日の片方にしかない",
      "Q007: exam が ccao-f でない: ccdv-f",
    ]));
  });

  test("CCDV-F ではドメイン 8 まで使える", () => {
    const d = load("ccdv-f");
    byId(d, "DV001").domain = 9;
    expect(messagesOf(validate(d, "ccdv-f").errors)).toContain("DV001: domain が 1〜8 でない: 9");
  });

  test("出典別の件数は試験ごとの期待値で確かめる", () => {
    const d = load("ccdv-f").filter((q) => q.id !== "DV120");
    expect(messagesOf(validate(d, "ccdv-f").errors)).toEqual(expect.arrayContaining([
      "-: 合計が 120 問でない: 119",
      "-: original が 40 問でない: 39",
    ]));
  });
});

describe("based_on の検証", () => {
  test("参照先がない・original を参照・ドメインが違う・欠落を検出する", () => {
    const d = load("ccdv-f");
    byId(d, "DV081").based_on = "Q001"; // 他の試験の問題
    byId(d, "DV082").based_on = "DV101"; // original を参照
    byId(d, "DV083").based_on = "DV005"; // ドメインが違う（DV005 は 1、DV083 は 2）
    delete byId(d, "DV101").based_on; // 新規でも null が必要
    expect(messagesOf(validate(d, "ccdv-f").errors)).toEqual(expect.arrayContaining([
      "DV081: based_on の参照先がこの試験にない: Q001",
      "DV082: based_on の参照先が original: DV101",
      "DV083: based_on の参照先とドメインが違う: DV005（1）",
      "DV101: based_on がない（新規なら null）",
    ]));
  });

  test("original 以外や CCAO-F の問題には based_on を付けない", () => {
    const dv = load("ccdv-f");
    byId(dv, "DV001").based_on = null;
    const ao = load();
    byId(ao, "Q081").based_on = null;
    expect(messagesOf(validate(dv, "ccdv-f").errors)).toContain("DV001: based_on はこの試験の original 以外に付けない");
    expect(messagesOf(validate(ao, "ccao-f").errors)).toContain("Q081: based_on はこの試験の original 以外に付けない");
  });
});

describe("オリジナル問題の作成ルール（警告）", () => {
  test.each(["ccdv-f", "ccar-f", "ccar-p"])("現在の %s のオリジナル問題は警告なし", (exam) => {
    const r = validate(load(exam), exam, scenarios(exam));
    expect(r.warnings).toEqual([]);
    expect(r.originalStats.count).toBe(40);
  });

  test("長さ・選択肢の差・正解が最長・正解位置の偏りを警告し、エラーにはしない", () => {
    const d = load("ccdv-f");
    const originals = d.filter((q) => q.source === "original");
    const q = byId(d, "DV101");
    q.question.en = "Too short?";
    q.choices.find((c) => q.answer.includes(c.key)).en += " with a much longer and more careful explanation than any other choice";
    for (const o of originals) o.answer = o.type === "multiple" ? ["A", "B"] : ["A"];
    const r = validate(d, "ccdv-f");
    expect(r.errors.filter(([id]) => id === "DV101")).toEqual([]);
    expect(messagesOf(r.warnings)).toEqual(expect.arrayContaining([
      expect.stringMatching(/^DV101: 問題文の長さが基準外/),
      expect.stringMatching(/^DV101: 選択肢の長さの差が大きい/),
      expect.stringMatching(/^-: 正解位置 A の割合が基準外/),
    ]));
  });

  test("ルールのない試験（CCAO-F）では調べない", () => {
    const r = validate(load(), "ccao-f");
    expect(r.warnings).toEqual([]);
    expect(r.originalStats).toBeNull();
  });
});

describe("試験をまたいだ検証", () => {
  test("現在のデータでは ID が試験をまたいで重複しない", () => {
    expect(crossExamDuplicates(Object.fromEntries(EXAM_IDS.map((exam) => [exam, load(exam)])))).toEqual([]);
  });

  test("同じ ID が別の試験にあれば検出する", () => {
    const dv = load("ccdv-f");
    dv[0].id = "Q001";
    expect(messagesOf(crossExamDuplicates({ "ccao-f": load(), "ccdv-f": dv }))).toEqual(["Q001: ID が ccao-f と ccdv-f で重複"]);
  });
});

describe("シナリオの検証", () => {
  test("別の試験のシナリオには紐づけられない", () => {
    const qs = load("ccar-p");
    qs[0].scenario_id = scenarios("ccar-f")[0].id;
    expect(messagesOf(validate(qs, "ccar-p", []).errors)).toContain("AP001: scenario_id の参照先がこの試験にない: AFS01");
  });

  test("重複ID、未使用、日英と出典の欠落を検出する", () => {
    const ss = scenarios("ccar-f");
    ss.push(structuredClone(ss[0]));
    ss.push({ ...structuredClone(ss[0]), id: "AFS-unused" });
    ss[1].title.ja = "";
    ss[2].body.en = "";
    ss[3].source_url = "";
    ss[4].source_note = "";
    expect(messagesOf(checkScenarios(load("ccar-f"), ss, "ccar-f"))).toEqual(expect.arrayContaining([
      "AFS01: シナリオの ID が重複",
      "AFS-unused: 使われていないシナリオ",
      "AFS02: シナリオの title.ja が空",
      "AFS03: シナリオの body.en が空",
      "AFS04: シナリオの source_url が空",
      "AFS05: シナリオの source_note が空",
    ]));
  });

  test("参照の欠落・不正な形を検出し、null は許可する", () => {
    const qs = load("ccar-p");
    delete qs[0].scenario_id;
    qs[1].scenario_id = 1;
    qs[2].scenario_id = "";
    const errors = messagesOf(validate(qs, "ccar-p", []).errors);
    expect(errors).toContain("AP001: scenario_id がない");
    expect(errors).toContain("AP002: scenario_id が null または空でない文字列でない");
    expect(errors).toContain("AP003: scenario_id が null または空でない文字列でない");
    expect(errors).toHaveLength(3);
    expect(checkScenarios([], {}, "ccar-p")).toEqual([["-", "シナリオが配列でない"]]);
  });
});
