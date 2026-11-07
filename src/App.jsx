import { useEffect, useState } from "react";
import { t, tParts } from "./i18n.js";
import { EXAMS, REPO_URL } from "./exams.js";
import { createSession, filterQuestions, isCorrect, selectQuestions } from "./quiz.js";
import { dropUnknownSession, load, resetAll, resetExam, save } from "./storage.js";
import ExamSelect from "./screens/ExamSelect.jsx";
import Home from "./screens/Home.jsx";
import Quiz from "./screens/Quiz.jsx";
import Result from "./screens/Result.jsx";
import List from "./screens/List.jsx";
import Stats from "./screens/Stats.jsx";
import Settings from "./screens/Settings.jsx";

const BASE = import.meta.env.BASE_URL;

const NAV = ["home", "list", "stats", "settings"];

const isComplete = (s) => s !== null && s.answers.length === s.questionIds.length;

export default function App() {
  const [questionsByExam, setQuestionsByExam] = useState({}); // 読み込んだ試験の問題 { 試験: [...] }
  const [loadError, setLoadError] = useState(false);
  const [counts, setCounts] = useState(null); // 試験ごとの問題数（試験選択画面用）
  // 保存データ（lang / currentExam / exams）をそのまま状態として持つ
  const [boot] = useState(() => load());
  const [data, setData] = useState(boot.data);
  const [storageWarning, setStorageWarning] = useState(boot.warning); // 読み込み・保存の注意
  const [page, setPage] = useState("select"); // 毎回、試験選択画面から始める
  const [notice, setNotice] = useState(""); // 出題開始時のお知らせ（件数不足）
  const [warning, setWarning] = useState(""); // ホームの警告（該当0件）

  const lang = data.lang;
  const exam = data.currentExam;
  const rec = exam ? data.exams[exam] : null; // 選んでいる試験の記録
  const session = rec?.currentSession ?? null;
  const questions = exam ? questionsByExam[exam] : undefined;
  const byId = questions ? Object.fromEntries(questions.map((q) => [q.id, q])) : {};

  useEffect(() => {
    fetch(`${BASE}questions/index.json`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(setCounts)
      .catch(() => setCounts({}));
  }, []);

  // 選んだ試験の問題ファイルだけを読み込む（読み込んだ分は持っておく）
  useEffect(() => {
    if (!exam || questionsByExam[exam]) return;
    setLoadError(false);
    fetch(`${BASE}${EXAMS[exam].file}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((qs) => {
        setQuestionsByExam((m) => ({ ...m, [exam]: qs }));
        setData((d) => dropUnknownSession(d, exam, new Set(qs.map((q) => q.id))));
      })
      .catch(() => setLoadError(true));
  }, [exam, questionsByExam]);

  // 状態が変わるたびに保存する（回答・ステータス変更・設定変更・クールの進行）
  useEffect(() => {
    if (!save(data) && boot.warning !== "unavailable") setStorageWarning("save_failed");
  }, [data, boot.warning]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // 選んでいる試験の記録を更新する
  const updateExam = (patch) =>
    setData((d) => ({ ...d, exams: { ...d.exams, [d.currentExam]: { ...d.exams[d.currentExam], ...patch } } }));
  const setSettings = (settings) => updateExam({ settings });
  const setLang = (l) => setData((d) => ({ ...d, lang: l }));

  function selectExam(next, discardCurrent) {
    setData((d) => {
      let exams = d.exams;
      if (discardCurrent) exams = { ...exams, [d.currentExam]: { ...exams[d.currentExam], currentSession: null } };
      return { ...d, exams, currentExam: next };
    });
    setNotice("");
    setWarning("");
    // 結果画面のまま閉じていた場合は結果画面から、それ以外はホームから始める
    setPage(isComplete(data.exams[next].currentSession) ? "result" : "home");
  }

  function start() {
    const { count, mode, domains, sources } = rec.settings;
    const picked = selectQuestions(filterQuestions(questions, domains, sources), count, mode, rec.statuses);
    if (picked.length === 0) {
      setWarning(t("no_questions", lang));
      return;
    }
    setWarning("");
    setNotice(picked.length < count ? t("fewer_questions", lang, { n: picked.length }) : "");
    updateExam({ currentSession: createSession(picked) });
    setPage("quiz");
  }

  function submit(selected) {
    setData((d) => {
      const e = d.exams[d.currentExam];
      const s = e.currentSession;
      if (s.answers.length !== s.index) return d; // 二重登録防止
      const id = s.questionIds[s.index];
      const correct = isCorrect(byId[id], selected);
      const updated = {
        ...e,
        currentSession: { ...s, answers: [...s.answers, { questionId: id, selected, correct }] },
        history: [...e.history, { questionId: id, selected, correct, answeredAt: new Date().toISOString() }],
        statuses: { ...e.statuses, [id]: correct ? "correct" : "incorrect" },
      };
      return { ...d, exams: { ...d.exams, [d.currentExam]: updated } };
    });
  }

  function next() {
    if (session.index === session.questionIds.length - 1) {
      setPage("result");
      return;
    }
    updateExam({ currentSession: { ...session, index: session.index + 1 } });
  }

  // 画面を移る。結果画面から離れるときは、終わったクールを片付ける
  function navigate(to) {
    if (page === "result") {
      updateExam({ currentSession: null });
      setNotice("");
    }
    setWarning("");
    setPage(to);
  }

  function discardSession() {
    updateExam({ currentSession: null });
    setNotice("");
  }

  function setStatus(id, status) {
    setData((d) => {
      const e = d.exams[d.currentExam];
      return { ...d, exams: { ...d.exams, [d.currentExam]: { ...e, statuses: { ...e.statuses, [id]: status } } } };
    });
  }

  function importRecords(imported) {
    // 読み込み済みの試験について、問題データにないクールを破棄する
    let d = { ...imported, currentExam: exam ?? imported.currentExam };
    for (const [e, qs] of Object.entries(questionsByExam)) d = dropUnknownSession(d, e, new Set(qs.map((q) => q.id)));
    setData(d);
    setNotice("");
  }

  function reset(all) {
    setData((d) => (all ? resetAll(d) : resetExam(d, d.currentExam)));
    setNotice("");
  }

  const inProgress = session && !isComplete(session) ? session : null;

  let content;
  if (page === "select" || !exam) {
    content = <ExamSelect lang={lang} data={data} counts={counts} onSelect={selectExam} />;
  } else if (loadError) content = <p className="notice warn">{t("load_error", lang)}</p>;
  else if (!questions) content = <p>{t("loading", lang)}</p>;
  else if (page === "quiz" && session) {
    const id = session.questionIds[session.index];
    content = (
      <Quiz
        key={`${id}-${session.index}`}
        lang={lang}
        question={byId[id]}
        order={session.orders[id]}
        index={session.index}
        total={session.questionIds.length}
        answer={session.answers[session.index] ?? null}
        notice={notice}
        onSubmit={submit}
        onNext={next}
        onQuit={() => navigate("home")}
      />
    );
  } else if (page === "result" && session) {
    content = (
      <Result lang={lang} session={session} byId={byId} statuses={rec.statuses} onSetStatus={setStatus}
        onHome={() => navigate("home")} />
    );
  } else if (page === "list") {
    content = <List key={exam} lang={lang} exam={exam} questions={questions} statuses={rec.statuses} onSetStatus={setStatus} />;
  } else if (page === "stats") {
    content = <Stats lang={lang} exam={exam} questions={questions} statuses={rec.statuses} history={rec.history} />;
  } else if (page === "settings") {
    content = (
      <Settings lang={lang} exam={exam} data={data} onSetLang={setLang}
        onResetExam={() => reset(false)} onResetAll={() => reset(true)} onImport={importRecords} />
    );
  } else {
    content = (
      <Home lang={lang} exam={exam} total={questions.length} settings={rec.settings} onChange={setSettings} onStart={start}
        warning={warning} session={inProgress} onResume={() => setPage("quiz")} onDiscard={discardSession} />
    );
  }

  const onSelectPage = page === "select" || !exam;
  const sourceUrl = onSelectPage ? REPO_URL : EXAMS[exam].sourceUrl;

  return (
    <div className="app">
      <header>
        <div className="brand">
          <h1>{t("app_title", lang)}</h1>
          {!onSelectPage && <p>{EXAMS[exam].name[lang]}</p>}
        </div>
        <div className="header-actions">
          {!onSelectPage && (
            <button type="button" className="secondary exam-switch" onClick={() => navigate("select")}>
              {EXAMS[exam].code}<span className="sep">|</span>{t("exam_switch", lang)}
            </button>
          )}
          <div className="lang-switch" role="group" aria-label={t("language", lang)}>
            {["ja", "en"].map((l) => (
              <button key={l} type="button" className={l === lang ? "active" : ""} onClick={() => setLang(l)}>
                {l === "ja" ? "日本語" : "English"}
              </button>
            ))}
          </div>
        </div>
        {!onSelectPage && (
          <nav>
            {NAV.map((p) => (
              <button key={p} type="button" className={page === p ? "active" : ""} onClick={() => navigate(p)}>
                {t(`page_${p}`, lang)}
              </button>
            ))}
          </nav>
        )}
      </header>
      <main>
        {storageWarning && (
          <div className="notice warn storage-warning">
            <span>{t(storageWarning === "save_failed" ? "save_failed" : `storage_${storageWarning}`, lang)}</span>
            <button type="button" className="link" onClick={() => setStorageWarning(null)}>{t("dismiss", lang)}</button>
          </div>
        )}
        {content}
      </main>
      <footer>
        {tParts("footer", lang, {
          link: (
            <a key="link" href={sourceUrl} target="_blank" rel="noreferrer">
              {onSelectPage ? "CLAUDE-CERTIFICATIONS" : `CLAUDE-CERTIFICATIONS / ${sourceUrl.split("/").pop()}`}
            </a>
          ),
        })}{" "}
        <a href={`${BASE}THIRD_PARTY_NOTICES.txt`} target="_blank" rel="noreferrer">
          {t("notices", lang)}
        </a>
      </footer>
    </div>
  );
}
