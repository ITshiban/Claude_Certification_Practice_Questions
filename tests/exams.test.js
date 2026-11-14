import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { domainIds, EXAM_IDS, EXAMS, scenarioFile } from "../src/exams.js";
import { createSession, filterQuestions, isCorrect, NO_SCENARIO, selectQuestions, sourceGroup } from "../src/quiz.js";
import { initialData, parseData } from "../src/storage.js";

const load = (exam) => JSON.parse(readFileSync(`public/${EXAMS[exam].file}`, "utf-8"));
const loadScenarios = (exam) => JSON.parse(readFileSync(`public/${scenarioFile(exam)}`, "utf-8"));
const counts = JSON.parse(readFileSync("public/questions/index.json", "utf-8"));

describe("試験ごとの問題", () => {
  test.each(EXAM_IDS)("%s の問題ファイルには、その試験の問題だけが入っている", (exam) => {
    const qs = load(exam);
    expect(qs.every((q) => q.exam === exam)).toBe(true);
    expect(qs.every((q) => domainIds(exam).includes(q.domain))).toBe(true);
    expect(qs.every((q) => EXAMS[exam].sourceGroups.includes(sourceGroup(q)))).toBe(true);
  });

  test("シナリオのファイルは試験ごとにあり、シナリオのない試験は空の配列", () => {
    for (const exam of EXAM_IDS) expect(Array.isArray(loadScenarios(exam))).toBe(true);
    expect(loadScenarios("ccao-f")).toEqual([]);
  });

  test("試験選択画面用の問題数は、問題ファイルの件数と一致する", () => {
    expect(counts).toEqual(Object.fromEntries(EXAM_IDS.map((e) => [e, load(e).length])));
  });

  test.each(EXAM_IDS.flatMap((exam) => [5, 10, 20].map((count) => [exam, count])))("%s の %i 問クールを最後まで採点できる", (exam, count) => {
    const pool = filterQuestions(load(exam), domainIds(exam), EXAMS[exam].sourceGroups);
    const picked = selectQuestions(pool, count, "random", {});
    expect(picked).toHaveLength(count);
    expect(picked.every((q) => q.exam === exam)).toBe(true);
    const session = createSession(picked);
    expect(new Set(session.questionIds).size).toBe(count);
    let data = initialData();
    data.currentExam = exam;
    data.exams[exam].settings.count = count;
    data.exams[exam].currentSession = session;
    const otherRecords = Object.fromEntries(EXAM_IDS.filter((e) => e !== exam).map((e) => [e, structuredClone(data.exams[e])]));
    for (const [index, q] of picked.entries()) {
      expect([...session.orders[q.id]].sort()).toEqual(["A", "B", "C", "D"]);
      expect(isCorrect(q, q.answer)).toBe(true);
      const rec = data.exams[exam];
      rec.currentSession.index = index;
      rec.currentSession.answers.push({ questionId: q.id, selected: q.answer, correct: true });
      rec.statuses[q.id] = "correct";
      rec.history.push({ questionId: q.id, selected: q.answer, correct: true, answeredAt: "2026-11-14T00:00:00.000Z" });
      // 回答ごとの保存・再開で、問題・順序・進行状態を失わないことを確認する。
      const restored = parseData(JSON.stringify(data));
      expect(restored).toEqual({ data });
      data = restored.data;
    }
    expect(data.exams[exam].currentSession.answers).toHaveLength(count);
    expect(data.exams[exam].history).toHaveLength(count);
    for (const [e, record] of Object.entries(otherRecords)) expect(data.exams[e]).toEqual(record);
  });

  test("CCAO-F の問題で出題すると、CCDV-F の問題は出ない", () => {
    const picked = selectQuestions(load("ccao-f"), 100, "random", {});
    expect(picked.every((q) => q.exam === "ccao-f" && q.id.startsWith("Q"))).toBe(true);
  });

  test.each(["ccdv-f", "ccar-f", "ccar-p"])("%s の出典の絞り込みで、難化版と新規を分けられる", (exam) => {
    const qs = load(exam);
    const hard = filterQuestions(qs, null, ["original_hard"]);
    const fresh = filterQuestions(qs, null, ["original_new"]);
    expect(hard).toHaveLength(20);
    expect(fresh).toHaveLength(20);
    expect(hard.every((q) => q.based_on)).toBe(true);
    expect(fresh.every((q) => q.based_on === null)).toBe(true);
  });

  test("実データでシナリオ・ドメイン・出典を同時に絞れる", () => {
    const qs = load("ccar-f");
    for (const s of loadScenarios("ccar-f")) {
      const picked = filterQuestions(qs, null, null, [s.id]);
      expect(picked.length).toBeGreaterThan(0);
      expect(picked.every((q) => q.scenario_id === s.id)).toBe(true);
      const q = picked[0];
      const combined = filterQuestions(qs, [q.domain], [sourceGroup(q)], [s.id]);
      expect(combined).toContain(q);
      expect(combined.every((x) => x.domain === q.domain && sourceGroup(x) === sourceGroup(q) && x.scenario_id === s.id)).toBe(true);
    }
    expect(filterQuestions(qs, null, null, [NO_SCENARIO]).every((q) => q.scenario_id === null)).toBe(true);
  });
});
