import { useState } from "react";
import { t } from "../i18n.js";
import { EXAM_IDS, EXAMS } from "../exams.js";
import { progressOf } from "../quiz.js";

const inProgress = (s) => s !== null && s.answers.length < s.questionIds.length;

// counts: { 試験: 問題数 }（読み込み中は null、取得できなければ {}）
export default function ExamSelect({ lang, data, counts, onSelect }) {
  const [pending, setPending] = useState(null); // 切り替えの確認待ちの試験
  const current = data.currentExam;
  const currentSession = current ? data.exams[current].currentSession : null;

  function choose(exam) {
    // 別の試験に切り替えるとき、今の試験に進行中のクールがあれば確認する
    if (current && exam !== current && inProgress(currentSession)) setPending(exam);
    else onSelect(exam, false);
  }

  return (
    <section>
      <h2>{t("select_title", lang)}</h2>
      {pending && (
        <div className="confirm">
          <p><strong>{t("switch_confirm", lang, {
            code: EXAMS[current].code,
            i: currentSession.index + 1,
            n: currentSession.questionIds.length,
          })}</strong></p>
          <div className="row">
            <button type="button" className="secondary" onClick={() => onSelect(pending, false)}>{t("switch_keep", lang)}</button>
            <button type="button" className="danger" onClick={() => onSelect(pending, true)}>{t("switch_discard", lang)}</button>
            <button type="button" className="secondary" onClick={() => setPending(null)}>{t("cancel", lang)}</button>
          </div>
        </div>
      )}
      <div className="exam-list">
        {EXAM_IDS.map((exam) => {
          const def = EXAMS[exam];
          const rec = data.exams[exam];
          const n = counts?.[exam];
          const { correct, answered } = progressOf(rec.statuses);
          return (
            <div key={exam} className={`card exam-card${exam === current ? " last" : ""}`}>
              <p className="meta">
                {def.code}
                {exam === current && <><span className="sep">|</span><strong>{t("exam_last", lang)}</strong></>}
              </p>
              <h3>{def.name[lang]}</h3>
              <p>
                {counts !== null && (
                  <>
                    {n === undefined ? t("exam_questions_unknown", lang) : n === 0 ? t("exam_no_questions", lang) : t("exam_questions", lang, { n })}
                    <span className="sep">|</span>
                  </>
                )}
                {t("exam_progress", lang, { c: correct, a: answered })}
              </p>
              {inProgress(rec.currentSession) && <p className="hint">{t("exam_in_progress", lang)}</p>}
              <button type="button" className={exam === current ? "primary" : "secondary"} onClick={() => choose(exam)}>
                {t("exam_choose", lang)}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
