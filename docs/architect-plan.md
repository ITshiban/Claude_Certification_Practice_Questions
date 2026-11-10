# 実行手順：CCAR-F と CCAR-P の問題追加

依頼の内容は後半の「依頼文（要点）」のとおり。前半に承認を得た計画と決定事項をまとめる。
試験は1つずつ進め（Phase 1 → CCAR-F → CCAR-P → Phase 4）、各ステップで止まって報告する。進捗は PROGRESS.md に記録する。

## 決定事項（2026-11-07 承認）

| 項目 | 決定 |
|---|---|
| ブランチとタグ | CCDV-F 対応を multi-exam でコミット（2535854）し、タグ `before-architect`（ローカルのみ）。作業はブランチ `architect`。マージ・push はしない |
| 試験の定義 | src/exams.js に `ccar-f` / `ccar-p` を追加。件数 35/15/15/15/40、originalRules は CCDV-F と同じ |
| シナリオのデータ | `data/questions/<試験>/scenarios.json`。項目 `{ id, title: {en, ja}, body: {en, ja}, source: "mock1" など / "guide", source_url, source_note }` |
| 問題との紐づけ | 問題に `scenario_id`（なければ null） |
| 公開ファイル | merge が全試験について `public/questions/<試験>-scenarios.json` を出力（シナリオがなければ空配列）。アプリは選んだ試験の問題とシナリオを読み込む |
| 表示 | 出題画面・復習画面で、問題の上にシナリオのタイトルと本文を折りたたみ表示（出題画面は開いた状態、復習画面は閉じた状態） |
| 出題設定 | シナリオで絞り込み（シナリオがある試験だけ表示）。選択肢は各シナリオと「シナリオなし」 |
| 保存データ | schemaVersion 3。MIGRATIONS[2] で各試験の settings に `scenarios: null`（null は絞り込みなし）を追加。キーは変えない |
| CCAR-F の practice のシナリオ名 | 見出しのシナリオ名は、公開シナリオをもとに作ったシナリオ（guide）に紐づける。問題文は変えない |
| CCAR-F の公開シナリオ | 試験ガイドをもとに自分の言葉で6件を登録（source: "guide"、source_note「公式試験ガイドの公開シナリオをもとに作成」）。mock1 のシナリオ A〜E とは別に登録し、重複の可能性として報告する |
| オリジナル問題の長さ | CCDV-F と同じ：mock 平均の 1.7〜5.0 倍を許容、目標 2.5〜4 倍（シナリオ本文は含めない） |
| 問題ID | CCAR-F：practice AF001–035、mock1 AF036–050、mock2 AF051–065、mock3 AF066–080、難化版 AF081–100、新規 AF101–120。CCAR-P は同じ並びで AP。シナリオは AFS01〜 |

### ドメインの日本語名
| 試験 | # | 英語 | 日本語 | 配点 |
|---|---|---|---|---|
| CCAR-F | 1 | Agentic Architecture & Orchestration | エージェントのアーキテクチャとオーケストレーション | 27% |
| CCAR-F | 2 | Tool Design & MCP Integration | ツール設計と MCP 統合 | 18% |
| CCAR-F | 3 | Claude Code Configuration & Workflows | Claude Code の設定とワークフロー | 20% |
| CCAR-F | 4 | Prompt Engineering & Structured Output | プロンプトエンジニアリングと構造化出力 | 20% |
| CCAR-F | 5 | Context Management & Reliability | コンテキスト管理と信頼性 | 15% |
| CCAR-P | 1 | Solution Design & Architecture | ソリューション設計とアーキテクチャ | 17% |
| CCAR-P | 2 | Claude Models, Prompting & Context Engineering | Claude のモデル、プロンプト、コンテキストエンジニアリング | 13% |
| CCAR-P | 3 | Integration | 統合 | 19% |
| CCAR-P | 4 | Evaluation, Testing & Optimization | 評価、テスト、最適化 | 16% |
| CCAR-P | 5 | Governance, Safety & Risk Management | ガバナンス、安全性、リスク管理 | 14% |
| CCAR-P | 6 | Stakeholder Communication & Lifecycle Management | ステークホルダーとのコミュニケーションとライフサイクル管理 | 14% |
| CCAR-P | 7 | Developer Productivity & Operational Enablement | 開発者の生産性と運用の支援 | 7% |

### 出典の確認結果（2026-11-07）
- CCAR-F：practice 35、mock1 15（シナリオ A〜E の下に 4/3/3/2/3 問）、mock2 15・mock3 15（シナリオなし）。practice の一部の見出しにシナリオ名あり。mock1 のシナリオ A〜E は公開シナリオ 1・2・3・5・6 に相当
- CCAR-P：practice 35（説明文も Thirty-five）、mock1〜3 各15（シナリオなし）
- 両試験とも README のドメイン名・配点は依頼の表と一致。リポジトリに exam-guide.pdf あり

---

## 依頼文（要点）

### 守ること
- 既存の CCAO-F・CCDV-F の問題ID、問題の内容、学習記録は変更しない
- localStorage のキーは変えない。保存データの形を変える場合は schemaVersion を上げ、MIGRATIONS に変換を追加する
- 問題IDは試験をまたいで重ならない（CCAR-F：AF001〜AF120、CCAR-P：AP001〜AP120）

### Phase 1：アプリ側の対応
- 2試験の定義を追加。ドメイン名と配点は出典サイトで再確認。日本語名は用語集に追記
- シナリオ：試験ごとの scenarios.json、問題の scenario_id、出題画面・復習画面での表示（長い本文は折りたたみ）、出題設定での絞り込み（シナリオがある試験だけ）。CCAR-F 専用の分岐を作らない
- 完了条件：既存2試験が今までどおり動き記録が残る。CCAR-F・CCAR-P を選ぶと問題がない旨を表示して止まらない。シナリオ付きのテスト用データでシナリオが表示される

### Phase 2：CCAR-F の問題データ（出典は architect-foundations/*.md を優先）
| 出典 | URL | 問題数 |
|---|---|---|
| practice | https://amey-thakur.github.io/CLAUDE-CERTIFICATIONS/architect-foundations/practice-questions.html | 35 |
| mock1〜3 | https://amey-thakur.github.io/CLAUDE-CERTIFICATIONS/architect-foundations/mock-exam-N.html | 各15 |
| original（難化版 / 新規） | — | 20 / 20 |
- 取り込みは CCDV-F と同じ。mock のシナリオは scenarios.json に取り込み scenario_id を付ける。同じ内容のシナリオが別の mock に出ても別に登録し、重複の可能性を報告
- 参考資料：試験範囲 index.html、公式試験ガイド（6つの公開シナリオを確認）、Claude Code ドキュメント、Anthropic 公式ドキュメント。取得できなければ知らせる
- オリジナル：CCDV-F と同じルール。CCAR-F 独自：新規20問は公開6シナリオのいずれかに紐づけ（本文は自分の言葉で、出典に「公式試験ガイドの公開シナリオをもとに作成」）。難化版は元の問題のシナリオに紐づけてよい。1つのシナリオに偏らない
- ステップ：1 practice / 2 mock1 / 3 mock2 / 4 mock3 / 5 オリジナルの計画（承認） / 6 難化版（10問×2） / 7 新規（10問×2） / 8 merge と validate

### Phase 3：CCAR-P の問題データ（出典は architect-professional/*.md）
- 取り込みは CCDV-F と同じ。mock にシナリオがなければ scenario_id は null
- CCAR-P 独自：設計判断のトレードオフ（精度・遅延・コスト・安全性・運用負荷）、規制や組織の制約、ステークホルダーへの説明を含む状況設定。誤答は技術的には成り立つが組織・規制・運用上の制約の1つを満たさない案。特定の規制の条文の細部を正解の根拠にしない
- ステップは CCAR-F と同じ（シナリオの作業は省く）

### Phase 4：検証・テスト・ドキュメント
- validate：全試験の件数、scenario_id の参照先が同じ試験の scenarios.json にあること、使われていないシナリオがないこと、CCDV-F の検証を CCAR-F・CCAR-P にも適用
- テスト：試験ごとの絞り込み、シナリオでの絞り込み、schemaVersion の変換、既存テスト
- README（対応試験、シナリオファイルの形式）、THIRD_PARTY_NOTICES（architect-foundations・architect-professional）、スキル4つ（quiz-question-writer、question-data-check、react-conventions、ja-en-translation：オーケストレーション、コーディネーター、構造化出力、few-shot、可観測性、RAG、SLA など）

### 中断・再開
- 「続けて」で PROGRESS.md と作成済みファイルを確認し、未完了から再開。作り直し・重複をしない
- 1回で終わらなければきりの良い番号で区切って保存し、PROGRESS.md を更新して止まる

### 完了条件
- 4試験すべてで、試験を選んで 5/10/20 問のクールが最後まで動く
- CCAR-F のシナリオ付き問題で、シナリオが出題画面と復習画面に表示される
- 既存の CCAO-F・CCDV-F の学習記録が引き継がれている
- npm run validate がエラーなしで通り、オリジナルの警告が一覧で確認できる
- npm test と npm run build が通る
