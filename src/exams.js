// 試験の定義。アプリと scripts/*.mjs の両方から読み込む（React に依存させない）。
// 試験を追加するときは、ここに1項目足して data/questions/<試験のキー>/ に出典別JSONを置き、npm run merge する。

const REPO = "https://github.com/Amey-Thakur/CLAUDE-CERTIFICATIONS";

export const EXAMS = {
  "ccao-f": {
    code: "CCAO-F",
    name: { ja: "Claude Certified Associate – Foundations", en: "Claude Certified Associate – Foundations" },
    file: "questions/ccao-f.json", // public/ からのパス（npm run merge で生成）
    sourceUrl: `${REPO}/tree/main/associate-foundations`,
    domains: {
      1: { en: "Prompting and Task Execution", ja: "プロンプトとタスク実行", weight: 14 },
      2: { en: "Output Evaluation and Validation", ja: "出力の評価と検証", weight: 21 },
      3: { en: "Product and Model Selection", ja: "製品とモデルの選択", weight: 12 },
      4: { en: "Workflow Integration and Solution Design", ja: "ワークフロー統合とソリューション設計", weight: 16 },
      5: { en: "Configuration and Knowledge Management", ja: "設定とナレッジ管理", weight: 12 },
      6: { en: "Governance, Risk, and Responsible Use", ja: "ガバナンス、リスク、責任ある利用", weight: 15 },
      7: { en: "Troubleshooting and Optimization", ja: "トラブルシューティングと最適化", weight: 10 },
    },
    // 出題設定・問題一覧の「出典で絞り込み」の選択肢（quiz.js の sourceGroup() の戻り値）
    sourceGroups: ["practice", "mock", "original"],
    expectedSources: { practice: 35, mock1: 15, mock2: 15, mock3: 15, original: 20 },
  },
  "ccdv-f": {
    code: "CCDV-F",
    name: { ja: "Claude Certified Developer – Foundations", en: "Claude Certified Developer – Foundations" },
    file: "questions/ccdv-f.json",
    sourceUrl: `${REPO}/tree/main/developer-foundations`,
    domains: {
      1: { en: "Agents and Workflows", ja: "エージェントとワークフロー", weight: 14.7 },
      2: { en: "Applications and Integration", ja: "アプリケーションと統合", weight: 33.1 },
      3: { en: "Claude Code", ja: "Claude Code", weight: 3.1 },
      4: { en: "Eval, Testing, and Debugging", ja: "評価、テスト、デバッグ", weight: 2.6 },
      5: { en: "Model Selection and Optimization", ja: "モデルの選択と最適化", weight: 16.8 },
      6: { en: "Prompt and Context Engineering", ja: "プロンプト・コンテキストエンジニアリング", weight: 11.0 },
      7: { en: "Security and Safety", ja: "セキュリティと安全性", weight: 8.1 },
      8: { en: "Tools and MCPs", ja: "ツールと MCP", weight: 10.6 },
    },
    // original は based_on の有無で「難化版」と「新規」に分ける
    sourceGroups: ["practice", "mock", "original_hard", "original_new"],
    expectedSources: { practice: 35, mock1: 15, mock2: 15, mock3: 15, original: 40 },
    // オリジナル問題の作成ルール。npm run validate が基準外を警告として一覧表示する（エラーにはしない）
    // これがある試験では、original に based_on（難化版は元の問題のID、新規は null）が必須になる
    originalRules: {
      baseSources: ["mock1", "mock2", "mock3"], // 問題文の長さの基準（英語の文字数の平均）
      lengthRatio: [1.7, 5.0], // 問題文の長さ ÷ 基準の平均
      maxChoiceDiff: 0.2, // 選択肢の長さの差 (最長 − 最短) ÷ 最長
      maxCorrectLongest: 0.3, // 正解が単独で最長の選択肢になっている問題の割合
      positionShare: [0.15, 0.35], // 正解位置 A〜D それぞれの割合
    },
  },
};

export const EXAM_IDS = Object.keys(EXAMS);
export const REPO_URL = REPO;

export function domainIds(exam) {
  return Object.keys(EXAMS[exam].domains).map(Number);
}
