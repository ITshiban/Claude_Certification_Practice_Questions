import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { domainIds, EXAM_IDS, EXAMS, scenarioFile } from "../src/exams.js";
import { filterQuestions, selectQuestions, sourceGroup } from "../src/quiz.js";

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

  test.each([5, 10, 20])("CCDV-F を選んで %i 問出題すると、CCDV-F の問題だけが出る", (count) => {
    const pool = filterQuestions(load("ccdv-f"), domainIds("ccdv-f"), EXAMS["ccdv-f"].sourceGroups);
    const picked = selectQuestions(pool, count, "random", {});
    expect(picked).toHaveLength(count);
    expect(picked.every((q) => q.exam === "ccdv-f" && q.id.startsWith("DV"))).toBe(true);
  });

  test("CCAO-F の問題で出題すると、CCDV-F の問題は出ない", () => {
    const picked = selectQuestions(load("ccao-f"), 100, "random", {});
    expect(picked.every((q) => q.exam === "ccao-f" && q.id.startsWith("Q"))).toBe(true);
  });

  test("CCDV-F の出典の絞り込みで、難化版と新規を分けられる", () => {
    const qs = load("ccdv-f");
    const hard = filterQuestions(qs, null, ["original_hard"]);
    const fresh = filterQuestions(qs, null, ["original_new"]);
    expect(hard).toHaveLength(20);
    expect(fresh).toHaveLength(20);
    expect(hard.every((q) => q.based_on)).toBe(true);
    expect(fresh.every((q) => q.based_on === null)).toBe(true);
  });
});
