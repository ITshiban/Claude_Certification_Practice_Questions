# 進捗

> Phase 1〜3 と「追加対応」は旧 Streamlit 版の記録です。現在は React 版（docs/rebuild-plan.md）に移行済みです。

## 決定事項
- 選択肢は表示順をシャッフルし、上から 1〜4 の番号を振る。正誤判定は元の key で行う
- 解説内の選択肢記号（`(B)` `(B, C)` `**B**`）は、表示時に表示番号へ置き換える
- mock の補足解説は、原文の解説のあとに改行して `[Supplement] …` / `【補足】…` で追記する
- 出典の絞り込みは practice / mock（mock1〜3）/ original の3択
- 出題モード：ランダム / 未回答のみ / 不正解のみ（後者2つは、足りなければある分だけ出題）
- 成績画面のドメイン別正答率は、回答履歴の全回答を母数にする
- 機能名は英語のまま（例：Project、Project のナレッジ）

## Phase 1：問題データ
| Step | 出典 | ID範囲 | 状態 |
|---|---|---|---|
| 1 | practice（35問） | Q001–Q035 | 完了 |
| 2 | mock1（15問） | Q036–Q050 | 完了 |
| 3 | mock2（15問） | Q051–Q065 | 完了 |
| 4 | mock3（15問） | Q066–Q080 | 完了 |
| 5 | original（20問） | Q081–Q100 | 完了（配分案は承認済み） |
| 6 | merge と validate | — | 完了（エラー0件） |

### メモ
- 原文の取り込み元：GitHub の `associate-foundations/*.md`
- practice Q5 は解説の冒頭に答えの記号がない。本文の「**B** aligns … which is the tested judgment」から正解を B とした（承認済み）
- mock の Why は原文のまま（末尾にピリオドがないものもそのまま）。補足は、Why で触れていない誤答だけを対象にする（記号なしでも内容で否定されていれば対象外）。日本語の解説は「。」で終える
- mock2・mock3 は Why がすべての誤答に触れているため、補足なし
- original の配分：D1 2 / D2 4 / D3 3 / D4 3 / D5 2 / D6 4 / D7 2（100問で配点比率と一致）。multiple は Q083, Q091, Q095, Q097, Q099
- 取り込み80問は、77問で正解の選択肢が最も長い（原文のまま）。original では誤答を長めにして、この手がかりを減らした

## Phase 2：アプリ本体
- 完了：app.py / quiz.py / db.py / i18n.py / requirements.txt / .gitignore / README.md
- 仮想環境は .venv（Streamlit 1.66.0）。DB は data/user.sqlite3（git 対象外）
- AppTest で確認済み：5/10/20問クールの通し、single/multiple の採点、二重登録防止、日英切替、不正解のみモードと件数不足時の表示、復習画面での手動ステータス変更、リセット
- 未確認：問題一覧の表（data_editor）でのステータス変更は、実際の画面で確認が必要

## Phase 3：テスト
- 完了：tests/test_quiz.py（採点・出題・絞り込み・番号置き換え・集計）、tests/test_db.py（履歴・ステータス・再接続後の永続化・リセット）
- pytest 26件すべて成功、validate_questions.py エラー0件

## 追加対応
- ニックネーム：profile テーブル（key/value）に1件保存。ホームで入力、サイドバーに表示。履歴の分離はしない（将来 answers/status にニックネーム列を追加して対応）。リセットしてもニックネームは残す
- pytest 27件すべて成功

## React 版への作り直し（docs/rebuild-plan.md）
- Phase 0〜4 完了。Streamlit 版はタグ `streamlit-final` に保存
- 公開：https://itshiban.github.io/claude_cert_prac_public/（リポジトリ ITshiban/claude_cert_prac_public、Public、GitHub Pages）
- 公開前の対応：出典元の MIT License 表記（public/THIRD_PARTY_NOTICES.txt）、コミット履歴のメール・名前を匿名アドレスに書き換えてリポジトリを作り直し
- Python 版を削除（app.py ほか、旧 data/questions.json）。スキルを react-conventions と npm run merge / validate の手順に書き換え

## 次にやること
- 複数試験対応（下記）の確認後、multi-exam ブランチをコミットして main にマージするか判断する

---

# 複数試験への対応と CCDV-F の問題追加（docs/multi-exam-plan.md）

- ブランチ `multi-exam` で作業中。作業前の `main` にタグ `ccao-only-final`（ローカルのみ、push しない）
- 決定事項は docs/multi-exam-plan.md の「決定事項」を参照

| Phase / Step | 内容 | 状態 |
|---|---|---|
| Phase 1 | 複数試験への対応（アプリ側） | 完了（承認済み。コミットはまだ） |
| Phase 2-1 | CCDV-F practice（35問）DV001–DV035 | 完了（承認済み） |
| Phase 2-2 | mock1（15問）DV036–DV050 | 完了（承認済み） |
| Phase 2-3 | mock2（15問）DV051–DV065 | 完了（承認済み） |
| Phase 2-4 | mock3（15問）DV066–DV080 | 完了（承認済み） |
| Phase 2-5 | オリジナルの計画（承認が必要） | 完了（承認済み） |
| Phase 2-6 | 難化版 DV081–DV090 / DV091–DV100 | 完了（承認済み） |
| Phase 2-7 | 新規 DV101–DV110 / DV111–DV120 | 完了（承認済み） |
| Phase 2-8 | merge と validate | 完了（承認済み。CCDV-F 120問・エラー0件） |
| Phase 3 | 検証の追加・テスト・ドキュメント・スキル | 完了（報告済み・承認待ち） |

## Phase 1 のメモ
- 追加：src/exams.js（試験の定義）、src/screens/ExamSelect.jsx（試験選択画面）
- 変更：quiz.js（DOMAINS / DOMAIN_IDS / SOURCE_GROUPS を削除し、exams.js から取る。sourceGroup が original_hard / original_new を返す）、storage.js（schemaVersion 2、MIGRATIONS[1]、resetExam / resetAll、試験ごとの dropUnknownSession）、App.jsx、各画面、components.jsx、i18n.js、styles.css、index.html の title
- データ：data/questions/*.json を data/questions/ccao-f/ に git mv（中身は変更なし）。public/questions.json を削除し、merge で public/questions/{ccao-f,ccdv-f,index}.json を生成。exam フィールドは merge で付与（exam を除けば旧 public/questions.json と完全一致を確認）
- validate：試験ごとの検証と、試験をまたいだ ID 重複の確認まで。CCDV-F は問題数0のため件数不足のエラー6件（了承済み。Phase 2 で解消）。Phase 3 の追加検証（based_on、長さ・位置の警告）は未実装
- npm test 61件成功、npm run build 成功
- ブラウザ確認（Chrome、375px 幅）：v1 の保存データ → v2 の CCAO-F に移行、試験選択画面の表示、進行中のクールがあるときの切り替え確認、CCDV-F の0問表示（一覧・成績・設定も止まらない）、CCAO-F の 5/10/20 問クール、試験ごとの出題設定、日英のドメイン名、この試験だけのリセット、再読み込み後の試験選択画面
- `/favicon.ico` の 404 は以前からあるもの（今回の変更とは無関係）
- Phase 3 で対応すること：README・THIRD_PARTY_NOTICES のパス（public/questions.json → public/questions/）、package.json の name、スキル

## Phase 2 のメモ
- 原文の取り込み元：GitHub の `developer-foundations/*.md`（main ブランチ、2026-11-07 取得）
- practice：35問（依頼の件数と一致）。問題文の先頭のドメイン名と、解説の先頭の正解記号（**B.**）は除いて取り込む（CCAO-F と同じ）。全問 single
- practice のドメイン別：D1 6 / D2 11 / D3 0 / D4 2 / D5 5 / D6 4 / D7 3 / D8 4。正解位置 A8 / B9 / C9 / D9。正解が最長の選択肢である問題は 33/35（原文のまま）
- practice Q20 の解説は誤答を記号で挙げず「The other three are …」とまとめている。原文のまま（practice には補足を付けない方針）
- 新しく使った訳語（Phase 3 で用語集に追記する）：プロンプトキャッシュ、ツール使用（tool use）、ツールの結果、エージェントループ、サブエージェント、圧縮（コンパクション）、インジェクション、最小権限、ガードレール、レート制限、指数バックオフ、ストリーミング、停止理由、最初のトークンまでの時間、ホールドアウトセット、評価セット、決定的な（deterministic）、オーケストレーション、MCP サーバー、引き継ぎ（handoff）、検索層（retrieval layer）。Messages API / Message Batches API / Skill / stop_reason / max_tokens / custom_id は英語のまま
- mock1：15問（依頼の件数と一致）。Answer key 表から番号で正解・ドメイン・Why を対応付け。Why は原文のまま（末尾のピリオドなしもそのまま）
- mock1 のドメイン別：D1 3 / D2 3 / D3 1 / D4 1 / D5 1 / D6 3 / D7 2 / D8 1。正解は原文で A→B→C→D の順に循環している（原文のまま）
- mock1 の補足：15問すべてに追記（Why が誤答に触れていないため）。内容で否定済みの誤答は対象外（例：Q1 の B・D、Q3 の A、Q7 の A・B、Q9 の B、Q13 の B・C、Q14 の A・C、Q15 の A・B）
- 補足の事実確認（2026-11-07）：Messages API はステートレス（platform.claude.com/docs/en/build-with-claude/working-with-messages）、MCP サーバーは stdio でローカル・HTTP でリモート（code.claude.com/docs/en/mcp）。「エイリアスが最新スナップショットに切り替わる」は 4.6 世代以降では誤り（platform.claude.com/docs/en/about-claude/models/model-ids-and-versions）のため、Q8 の補足には書かない
- mock2：15問（依頼の件数と一致）。Why がすべての誤答に記号付きで触れているため補足なし。ドメイン別：D1 2 / D2 5 / D3 0 / D4 1 / D5 3 / D6 2 / D7 1 / D8 1。Q6（バッチ）は原文どおり Model Selection and Optimization
- mock3：15問（依頼の件数と一致）。Why がすべての誤答に記号付きで触れているため補足なし。ドメイン別：D1 2 / D2 5 / D3 0 / D4 1 / D5 2 / D6 2 / D7 1 / D8 2
- 取り込み80問の合計：D1 13 / D2 24 / D3 1 / D4 5 / D5 11 / D6 11 / D7 7 / D8 8。全問 single
- mock1〜3（45問）の問題文の平均：英語 97.7 文字 → オリジナルの目標は 166〜244 文字（1.7〜2.5 倍）

## オリジナル問題の計画（2026-11-07 承認）
- 問題文の長さ：mock 平均 97.7 文字の 1.7〜5.0 倍（166〜488 文字）を許容、目標 2.5〜4 倍。選択肢の長さの差は 20% 以内
- 配分（難化版 / 新規）：D1 2/2、D2 7/8、D3 1/2、D4 0/0、D5 4/4、D6 1/1、D7 2/1、D8 3/2。120問で D1 17 / D2 39 / D3 4 / D4 5 / D5 19 / D6 13 / D7 10 / D8 13
- 立場の設定（「あなたは〜です。」）を約半数に入れる。難化版は元の問題と正解位置を変える
- 複数選択（6問）：難化版 DV052・DV021・DV008 の難化版、新規 Files API・冪等性・並列ツールの結果

### 難化版（DV081〜DV100、元の問題 → 論点）
| ID | 元 | D | 論点 |
|---|---|---|---|
| DV081 | DV005 | 1 | stop_reason "tool_use" のあとのループ処理 |
| DV082 | DV025 | 1 | サブエージェントへの引き継ぎでのコンテキストの欠落 |
| DV083 | DV001 | 2 | 固定部分を先頭に置いてプロンプトキャッシュ |
| DV084 | DV002 | 2 | 遅延を許容できる大量処理は Message Batches API |
| DV085 | DV003 | 2 | スキーマ強制＋検証＋エラーを返して再試行 |
| DV086 | DV014 | 2 | レート制限は上限付き指数バックオフ |
| DV087 | DV018 | 2 | 出力の打ち切りと max_tokens での停止 |
| DV088 | DV052 | 2 | ★受付と完了を切り離す |
| DV089 | DV069 | 2 | キューで急な負荷を吸収 |
| DV090 | DV049 | 3 | Claude Code の CI での非対話実行と構造化出力 |
| DV091 | DV006 | 5 | モデルのバージョンを固定し、評価してから上げる |
| DV092 | DV019 | 5 | 要件を満たす最小のモデルを評価 |
| DV093 | DV021 | 5 | ★コスト増の原因をトークン使用量から調べる |
| DV094 | DV022 | 5 | モデルの選択は代表サンプルで実測 |
| DV095 | DV007 | 6 | コンテキストの肥大化に削減・圧縮・分離 |
| DV096 | DV008 | 7 | ★間接プロンプトインジェクションへの構造的防御 |
| DV097 | DV079 | 7 | 出力を信頼せずエスケープ |
| DV098 | DV031 | 8 | 重なったツールの統合 |
| DV099 | DV032 | 8 | ツールのエラーを tool_result で返す |
| DV100 | DV077 | 8 | 大きなオブジェクトの代わりに識別子を返す |

### 新規（DV101〜DV120、論点）
DV101 D1 フックで決定的な処理 / DV102 D1 Agent SDK の自前運用とマネージドエージェント / DV103 D2 画像入力 / DV104 D2 ストリーミングの部分 JSON / DV105 D2 ★Files API / DV106 D2 Token counting / DV107 D2 Citations / DV108 D2 CLAUDE.md の置き場所 / DV109 D2 ★冪等性 / DV110 D2 /clear / DV111 D3 Skill の共有 / DV112 D3 .claude/agents のサブエージェント / DV113 D5 拡張思考 / DV114 D5 非決定性と複数回の評価 / DV115 D5 usage でキャッシュ確認 / DV116 D5 SDK の再試行の重複 / DV117 D6 XML タグで推論と回答を分ける / DV118 D7 API キーをサーバーで中継 / DV119 D8 ★並列ツールの結果 / DV120 D8 .mcp.json の共有

### 参考資料の確認（2026-11-07）
- 公式試験ガイド：リポジトリの developer-foundations/exam-guide.pdf（Version 1.0, July 2026）を pdfjs でテキスト化して確認。53問、multiple-choice / multiple-response（各問で選ぶ数を明記）、120分、合格 720/1000。ドメインの細目はサイトのまとめと一致
- 確認で誤りと分かったため使わない記述：「Batches の結果は24時間以内に返る」（正しくは全件完了時か24時間後の早いほうで取得、24時間で終わらなければ期限切れ）、「429 には必ず retry-after が付く」（付かない場合がある）、「400 は再試行しない」（明記なし）

### 難化版 DV081〜DV090 の根拠ページ
| ID | 問題文の長さ | 選択肢の差 | 正解（元→新） | 確認したページ |
|---|---|---|---|---|
| DV081 | 428字 4.38倍 | 3.5% | B→D | platform.claude.com/docs/en/agents-and-tools/tool-use/overview, …/tool-use/handle-tool-calls |
| DV082 | 438字 4.48倍 | 3.6% | B→A | code.claude.com/docs/en/sub-agents（サブエージェントは新しいコンテキストで始まり、委任メッセージから作業する） |
| DV083 | 399字 4.08倍 | 4.9% | B→C | platform.claude.com/docs/en/build-with-claude/prompt-caching（tools→system→messages の順でプレフィックスを照合、前の変更で以降が無効）, …/working-with-messages（ステートレス） |
| DV084 | 379字 3.88倍 | 2.1% | C→A | platform.claude.com/docs/en/build-with-claude/batch-processing（50%、多くは1時間以内、完了時か24時間後に取得） |
| DV085 | 412字 4.22倍 | 4.3% | D→B | platform.claude.com/docs/en/build-with-claude/structured-outputs（strict tool use） |
| DV086 | 362字 3.71倍 | 4.1% | C→B | platform.claude.com/docs/en/api/rate-limits（retry-after がある場合は待つ）, …/api/errors |
| DV087 | 359字 3.67倍 | 2.2% | C→A | platform.claude.com/docs/en/build-with-claude/handling-stop-reasons（max_tokens：上限を上げるか続ける） |
| DV088 | 388字 3.97倍 | 2.2% | A→B,D | 一般的な非同期設計（Claude 固有の仕様は根拠にしていない） |
| DV089 | 372字 3.81倍 | 0.0% | B→C | platform.claude.com/docs/en/api/rate-limits（キューは一般的な設計） |
| DV090 | 352字 3.60倍 | 4.3% | B→A | code.claude.com/docs/en/headless, …/cli-reference（-p、--output-format json、--json-schema） |
- 立場の設定あり：DV081, DV083, DV085, DV087, DV090

### 難化版 DV091〜DV100 の根拠ページ
| ID | 問題文の長さ | 選択肢の差 | 正解（元→新） | 確認したページ |
|---|---|---|---|---|
| DV091 | 453字 4.64倍 | 3.4% | C→D | platform.claude.com/docs/en/models/overview（全モデルIDは固定スナップショット）, …/about-claude/model-deprecations（提供終了前に新モデルでテスト） |
| DV092 | 390字 3.99倍 | 4.9% | D→C | platform.claude.com/docs/en/about-claude/models/choosing-a-model |
| DV093 | 404字 4.14倍 | 4.3% | B→A,C | platform.claude.com/docs/en/build-with-claude/prompt-caching（usage のフィールド）, …/working-with-messages（履歴を毎回送る） |
| DV094 | 399字 4.08倍 | 6.4% | C→B | platform.claude.com/docs/en/about-claude/models/choosing-a-model（自分のユースケースのベンチマーク、実際のプロンプトとデータで）, …/test-and-evaluate/develop-tests |
| DV095 | 419字 4.29倍 | 3.5% | D→C | platform.claude.com/docs/en/build-with-claude/context-editing, …/compaction, code.claude.com/docs/en/sub-agents |
| DV096 | 380字 3.89倍 | 7.0% | A→B,D | platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks（信頼できないコンテンツは tool_result に、最小権限）, 試験ガイドのサンプル問題2（指示に従うモデルほど影響を受けやすいことがある） |
| DV097 | 395字 4.04倍 | 1.4% | B→C | 一般的な Web セキュリティ（出力のエスケープ）。mock3 Q14 と同じ原則 |
| DV098 | 397字 4.06倍 | 4.1% | D→A | platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools（関連操作の統合、詳しい説明、名前空間） |
| DV099 | 401字 4.10倍 | 8.1% | A→D | platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls（is_error） |
| DV100 | 390字 3.99倍 | 4.3% | A→B | platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools（安定した識別子と必要なフィールドだけ返す） |
- 立場の設定あり：DV091, DV093, DV095, DV097, DV099
- 難化版20問の正解位置：A6 / B6 / C6 / D5（複数選択は両方を数える）。正解だけが最長の選択肢になっている問題：0問

### 新規 DV101〜DV110 の根拠ページ
| ID | 問題文の長さ | 選択肢の差 | 正解 | 確認したページ |
|---|---|---|---|---|
| DV101 | 422字 4.32倍 | 4.1% | C | code.claude.com/docs/en/hooks-guide（決定的な制御、編集後の自動フォーマットの例）, …/memory（CLAUDE.md は強制ではなくコンテキスト） |
| DV102 | 388字 3.97倍 | 4.0% | B | code.claude.com/docs/en/agent-sdk/hosting（自前で動かす必要がなければ Managed Agents）, platform.claude.com/docs/en/managed-agents/overview（ベータ） |
| DV103 | 408字 4.18倍 | 7.4% | D | platform.claude.com/docs/en/build-with-claude/vision（base64 は毎ターン再送、上限超えは縮小、送る前のリサイズ推奨、画像はテキストの前） |
| DV104 | 408字 4.18倍 | 4.2% | A | platform.claude.com/docs/en/build-with-claude/streaming（input_json_delta を蓄積し content_block_stop で解析） |
| DV105 | 423字 4.33倍 | 9.3% | A,D | platform.claude.com/docs/en/build-with-claude/files（一度アップロードして file_id で参照、ワークスペース全体が範囲、利用者からの file_id を受け付けない。ベータではない） |
| DV106 | 387字 3.96倍 | 2.1% | C | platform.claude.com/docs/en/build-with-claude/token-counting（無料、専用のレート制限、見積もり） |
| DV107 | 403字 4.12倍 | 6.8% | B | platform.claude.com/docs/en/build-with-claude/citations（citations.enabled、PDF は page_location） |
| DV108 | 459字 4.70倍 | 2.1% | D | code.claude.com/docs/en/memory（./CLAUDE.md は共有、~/.claude/CLAUDE.md は個人、CLAUDE.local.md は個人のプロジェクト用で git 管理外） |
| DV109 | 482字 4.93倍 | 4.2% | B,C | 一般的な冪等性の設計（Claude 固有の仕様は根拠にしていない） |
| DV110 | 400字 4.09倍 | 1.4% | A | code.claude.com/docs/en/best-practices（無関係なタスクの間に /clear） |
- 立場の設定あり：DV101, DV103, DV105, DV107, DV109
- SDK の自動再試行（DV116 用に先に確認）：platform.claude.com/docs/en/api/errors「接続エラー、レート制限、5xx をデフォルト2回、指数バックオフで再試行、retry-after を尊重、max_retries で変更・無効化」

### 新規 DV111〜DV120 の根拠ページ
| ID | 問題文の長さ | 選択肢の差 | 正解 | 確認したページ |
|---|---|---|---|---|
| DV111 | 471字 4.82倍 | 2.1% | D | code.claude.com/docs/en/skills（.claude/skills はコミットで共有、本文は使うときだけ読み込む） |
| DV112 | 377字 3.86倍 | 5.3% | A | code.claude.com/docs/en/sub-agents（.claude/agents、tools で制限、description で委任） |
| DV113 | 467字 4.78倍 | 2.7% | B | platform.claude.com/docs/en/build-with-claude/effort, …/extended-thinking（レガシー、4.7 以降は拒否）, …/thinking-steering-and-cost（思考トークンは出力として課金） |
| DV114 | 393字 4.02倍 | 3.6% | C | platform.claude.com/docs/en/about-claude/glossary（temperature 0 でも完全には決定的でない） |
| DV115 | 459字 4.70倍 | 2.8% | D | platform.claude.com/docs/en/build-with-claude/prompt-caching（既定5分、使うたびに延長、短いプロンプトはキャッシュ不可） |
| DV116 | 440字 4.50倍 | 2.1% | A | platform.claude.com/docs/en/api/errors（SDK は既定2回、指数バックオフ、max_retries） |
| DV117 | 430字 4.40倍 | 2.1% | B | platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices（XML タグであいまいさなく解析） |
| DV118 | 359字 3.67倍 | 3.4% | D | platform.claude.com/docs/en/manage-claude/authentication（ブラウザではなく自分のバックエンドから、シークレットマネージャー、ワークスペースに限定） |
| DV119 | 436字 4.46倍 | 5.8% | A,C | platform.claude.com/docs/en/agents-and-tools/tool-use/parallel-tool-use（全 tool_result を次のユーザーメッセージにまとめ、tool_use_id で対応） |
| DV120 | 399字 4.08倍 | 3.4% | B | code.claude.com/docs/en/mcp（プロジェクトスコープは .mcp.json でバージョン管理に、環境変数の展開） |
- 計画からの変更：DV113 は「拡張思考」がレガシー機能（4.7 以降は 400）のため、論点を effort パラメータによる調整に変更。DV117 は新しいモデルで <thinking> タグでの推論の指示が断られる場合があるため、論点を「XML タグで指示・例・入力を区切る」に変更
- 立場の設定あり：DV111, DV113, DV115, DV117, DV119（オリジナル40問中20問）
- original 40問：正解位置 A12 / B12 / C11 / D11、multiple 6問（DV088, DV093, DV096, DV105, DV109, DV119）、正解だけが最長の問題 0問
- merge と validate：CCDV-F 120問・エラー0件（CCAO-F もエラー0件）

## Phase 3 のメモ
- validate：based_on の検証（CCDV-F の original に必須、参照先が同じ試験・original 以外・同じドメイン、ほかの問題には付けない）と、オリジナル問題の作成ルールの警告（基準は src/exams.js の originalRules：長さ 1.7〜5.0 倍、選択肢の差 20%、正解が単独で最長 30%、正解位置 15〜35%）を追加。現在の警告 0 件
- テスト：tests/exams.test.js（試験ごとの問題ファイルにその試験の問題だけ、index.json の件数、CCDV-F で 5/10/20 問出題して CCDV-F の問題だけ、難化版・新規の絞り込み）、tests/validate.test.js（CCDV-F のエラーなし、based_on、警告、試験をまたいだ重複）。npm test 79件成功
- ドキュメント：README（対応試験、試験の追加方法、問題データのフォルダ構成、保存データ）、THIRD_PARTY_NOTICES（developer-foundations の取り込み問題と、DV081〜DV120 が独自問題であること）、package.json / package-lock.json の name を claude-cert-quiz に
- スキル：quiz-question-writer（試験ごとのドメイン、CCDV-F のオリジナル問題のルール）、question-data-check（試験ごとの件数、追加した検証）、react-conventions（exams.js を使う、直書きしない、保存データ v2）、ja-en-translation（CCDV-F の用語集）
- ブラウザ確認（Chrome、375px）：試験選択（100問・120問・引き継いだ進捗）、CCDV-F の 5/10/20 問クール、難化版だけの出題、問題一覧・成績が CCDV-F のみ、切り替えの確認、フッターの出典の切り替え、CCAO-F だけのリセットで CCDV-F は残る、英語表示。コンソールのエラーなし
- コード内で試験のキーを直書きしているのは storage.js の v1→v2 変換だけ（意図どおり）

---

# CCAR-F と CCAR-P の追加（docs/architect-plan.md）

- ブランチ `architect` で作業中。作業前の状態（CCDV-F 対応のコミット 2535854）にタグ `before-architect`（ローカルのみ）
- 決定事項は docs/architect-plan.md の「決定事項」を参照

| Phase / Step | 内容 | 状態 |
|---|---|---|
| Phase 1 | アプリ側の対応（試験の定義、シナリオ、schemaVersion 3） | 完了（承認済み。コミットはまだ） |
| CCAR-F 1 | practice（35問）AF001–AF035 | 完了（承認済み） |
| CCAR-F 2 | mock1（15問とシナリオ）AF036–AF050 | 完了（承認済み） |
| CCAR-F 3 | mock2（15問）AF051–AF065 | 完了（承認済み） |
| CCAR-F 4 | mock3（15問）AF066–AF080 | 完了（承認済み） |
| CCAR-F 5 | オリジナルの計画（承認が必要） | 完了（承認済み） |
| CCAR-F 6 | 難化版 AF081–AF090 / AF091–AF100 | 完了（承認済み） |
| CCAR-F 7 | 新規 AF101–AF110 / AF111–AF120 | 完了（承認済み） |
| CCAR-F 8 | merge と validate | 完了（承認済み。CCAR-F 120問・エラー0件・警告0件） |
| CCAR-P 1 | practice（35問）AP001–AP035 | 完了（承認済み） |
| CCAR-P 2 | mock1（15問）AP036–AP050 | 完了（報告済み・承認待ち） |
| CCAR-P 3〜4 | mock2・mock3（各15問）AP051–AP080 | 未着手 |
| CCAR-P 5 | オリジナルの計画（承認が必要） | 未着手 |
| CCAR-P 6〜8 | 難化版 AP081–AP100、新規 AP101–AP120、merge と validate | 未着手 |
| Phase 4 | 検証・テスト・ドキュメント・スキル | 未着手 |

## Architect Phase 1 のメモ
- src/exams.js：ccar-f・ccar-p を追加（originalRules は CCDV-F と共通の ORIGINAL_RULES）。scenarioFile(exam) を追加
- merge：全試験について public/questions/<試験>-scenarios.json を出力（シナリオがなければ空配列）。scenario_id がない問題には null を入れる（CCAO-F・CCDV-F の出典別JSONは変更しない。結合ファイルにだけ scenario_id: null が付く）
- quiz.js：filterQuestions に scenarios（null は絞り込みなし、NO_SCENARIO = "none" はシナリオのない問題）を追加
- storage.js：schemaVersion 3、MIGRATIONS[2] で各試験の settings に scenarios: null。v1 → v2 → v3 の順に変換
- 画面：components.jsx に ScenarioBox（details で折りたたみ）。出題画面は開いた状態、復習画面は閉じた状態。ホームにシナリオの絞り込み（シナリオがある試験だけ。全部選ぶと null に戻す）
- i18n：filter_scenario / scenario_none / scenario。用語集に CCAR-F・CCAR-P のドメイン名を追記
- npm test 86件成功、npm run build 成功。validate は CCAR-F・CCAR-P の件数不足のエラーのみ（CCDV-F と同じく問題ができるまで残る）
- ブラウザ確認（Chrome、375px、CCAR-F の問題とシナリオはリクエストを差し替えたテスト用データ）：v2 → v3 の引き継ぎ、4試験の表示、CCDV-F ではシナリオの絞り込み・表示が出ない、CCAR-P の0問表示、シナリオの絞り込みと保存、出題画面のシナリオ表示と折りたたみ、シナリオで絞った5問クール、復習画面のシナリオ表示、英語表示。コンソールのエラーなし

## CCAR-F のメモ
- 原文：GitHub の architect-foundations/*.md（2026-11-07 取得）。公式試験ガイド（architect-foundations/exam-guide.pdf）を pdfjs でテキスト化して確認：60問、multiple-choice / multiple-response、120分、合格 720、「6つのシナリオから4つ」。ドメイン名・配点は依頼の表と一致。公開シナリオ6件（Scenario 1〜6）の本文を確認
- scenarios.json：公開シナリオ6件を AFS01〜AFS06（source: "guide"、本文はガイドをもとに自分の言葉で書いた。source_note「公式試験ガイドの公開シナリオをもとに作成（Scenario N）」）。mock1 のシナリオ A〜E は次のステップで AFS07 以降に別途登録する
- practice：35問（依頼の件数と一致）。Q1〜Q10 の見出しのシナリオ名を公開シナリオに紐づけ（Support resolution agent→AFS01、Claude Code for development→AFS02、Multi-agent research→AFS03、Developer productivity agent→AFS04、Claude Code in CI→AFS05、Structured data extraction→AFS06）。Q11〜Q35 は scenario_id: null。見出しのシナリオ名とドメイン名は問題文から除く。全問 single
- practice のドメイン別：D1 9 / D2 6 / D3 7 / D4 7 / D5 6。正解位置 A9 / B8 / C9 / D9。正解が最長（同じ長さを含む）の選択肢：35/35（原文のまま）
- mock1：15問（依頼の件数と一致）。シナリオ A〜E を AFS07〜AFS11 として登録（source: "mock1"、タイトル・本文の英語は原文のまま、日本語訳を追加、source_note「Mock exam 1 Scenario X」）。A→AF036–039、B→AF040–042、C→AF043–045、D→AF046–047、E→AF048–050
- 重複の可能性（別のシナリオとして登録済み）：AFS07≒AFS01（サポート）、AFS08≒AFS02（Claude Code の開発チーム）、AFS09≒AFS03（マルチエージェントのリサーチ）、AFS10≒AFS05（CI/CD）、AFS11≒AFS06（構造化データの抽出）。mock1 には公開シナリオ4（開発者の生産性）に当たるものはない
- mock1 の補足：15問すべてに追記（Why が誤答にほとんど触れていないため）。内容で否定済みの誤答は対象外（Q1 の A、Q3 の B・C、Q6 の A、Q7 の A・B、Q11 の A・B、Q13 の A）
- mock1 のドメイン別：D1 0 / D2 2 / D3 4 / D4 3 / D5 6（原文の Answer key のまま。D1 がなく D5 が多い）。正解は A→B→C→D の順に循環（原文のまま）
- mock2：15問（依頼の件数と一致）。シナリオのまとまりなし（scenario_id: null）。Why がすべての誤答に触れているため補足なし。ドメイン別：D1 4 / D2 3 / D3 3 / D4 3 / D5 2
- mock2 は practice と論点がほぼ同じ問題が多い（例：AF051≒AF011 固定順序はワークフロー、AF054≒AF017 トレース、AF057≒AF021 フック、AF058≒AF023 スキーマ、AF059≒AF025 値がないことの表現、AF060≒AF024 まれな形式、AF061≒AF028、AF062≒AF029、AF064≒AF032、AF065≒AF033）。原文のまま取り込み、オリジナルの計画で論点の重複を避ける材料にする
- mock3：15問（依頼の件数と一致）。シナリオなし、Why がすべての誤答に触れているため補足なし。ドメイン別：D1 3 / D2 3 / D3 3 / D4 3 / D5 3
- 取り込み80問の合計：D1 16 / D2 14 / D3 17 / D4 16 / D5 17。全問 single。シナリオ付き 25問（practice 10、mock1 15）
- mock1〜3（45問）の問題文の平均：英語 87.6 文字（mock1 は 103.1）→ オリジナルの許容範囲 149〜438 文字（1.7〜5.0 倍）、目標 219〜350 文字（2.5〜4 倍）

### CCAR-F オリジナル問題の計画（2026-11-07 承認）
- 長さ：mock 平均 87.6 文字の 1.7〜5.0 倍（149〜438 文字）、目標 2.5〜4 倍（219〜350 文字）
- 配分（難化版 / 新規）：D1 8/8、D2 4/4、D3 3/4、D4 4/4、D5 1/0 → 120問で D1 32 / D2 22 / D3 24 / D4 24 / D5 18
- ガイドとの食い違い：ガイド 1.1 は「恣意的な反復回数の上限をループ終了の主な仕組みにする」ことを避けるべきパターンとしているが、取り込み済みの AF001・AF013 の正解には上限が含まれる。取り込み問題は原文のまま。難化版 AF081 はガイドに合わせる
- 難化版（元 → 論点、シナリオ）：AF081←AF001 stop_reason で続行・終了（AFS01）/ AF082←AF003 主張と出典を構造化して渡す（AFS03）/ AF083←AF011 固定順序はワークフロー / AF084←AF012 サブエージェントの理由はコンテキスト分離 / AF085←AF015 検証できない結果は人の確認 / AF086←AF017 トレース / AF087←AF066 同一呼び出しの繰り返しは状態の設計 / AF088←AF068 ★元に戻せる・確認の関門 / AF089←AF002 ★上限はツール層で強制（AFS01）/ AF090←AF037 構造化エラー（AFS07）/ AF091←AF030 必要なものだけ返す / AF092←AF063 汎用クエリツールと最小権限 / AF093←AF041 プランモード（AFS08）/ AF094←AF020 スキルとサブエージェント / AF095←AF069 肥大化した CLAUDE.md / AF096←AF007 基準と Few-shot で誤検知削減（AFS05）/ AF097←AF008 ★null 許容と条件付き検証（AFS06）/ AF098←AF026 プロンプト・スキーマ・モデルの固定と記録 / AF099←AF074 出所のフィールド / AF100←AF036 顧客ごとにコンテキストを区切る（AFS07）
- 新規（論点、シナリオ、ガイドの項目）：AF101 本人確認の前提条件の関門（AFS01, 1.4）/ AF102 引き継ぎの構造化サマリー（AFS01, 1.4）/ AF103 PostToolUse でデータ形式を正規化（AFS01, 1.5）/ AF104 複雑さに応じてサブエージェントを選ぶ（AFS03, 1.2）/ AF105 分解が狭すぎる・範囲の分担（AFS03, 1.2）/ AF106 ★並列の Task 呼び出しと allowedTools（AFS03, 1.3）/ AF107 再開と新規開始の使い分け（AFS04, 1.7）/ AF108 fork_session（AFS04, 1.7）/ AF109 アクセス失敗と結果0件の区別（AFS01, 2.2）/ AF110 ★役割ごとのツール、verify_fact（AFS03, 2.3）/ AF111 Grep・Glob と Edit 失敗時の Read＋Write（AFS04, 2.5）/ AF112 MCP リソース（AFS04, 2.4）/ AF113 context: fork（AFS02, 3.2）/ AF114 テスト先行の反復（AFS02, 3.5）/ AF115 @import（AFS02, 3.1）/ AF116 再レビューで前回の指摘を含める（AFS05, 3.6）/ AF117 独立したインスタンスでレビュー（AFS05, 4.6）/ AF118 tool_choice（AFS06, 4.3）/ AF119 ★再試行の限界（AFS06, 4.4）/ AF120 calculated_total と stated_total（AFS06, 4.4）

### CCAR-F 難化版 AF081〜AF090
| ID | 元 | シナリオ | 問題文の長さ | 選択肢の差 | 正解 |
|---|---|---|---|---|---|
| AF081 | AF001 | AFS01 | 407字 4.65倍 | 3.6% | A |
| AF082 | AF003 | AFS03 | 349字 3.98倍 | 3.9% | D |
| AF083 | AF011 | — | 399字 4.55倍 | 4.5% | C |
| AF084 | AF012 | — | 364字 4.16倍 | 0.8% | D |
| AF085 | AF015 | — | 357字 4.08倍 | 9.0% | B |
| AF086 | AF017 | — | 329字 3.76倍 | 12.2% | B |
| AF087 | AF066 | — | 341字 3.89倍 | 3.9% | A |
| AF088 | AF068 | — | 383字 4.37倍 | 3.3% | A,C |
| AF089 | AF002 | AFS01 | 352字 4.02倍 | 4.9% | B,C |
| AF090 | AF037 | AFS07 | 341字 3.89倍 | 6.2% | D |
- 根拠：AF081 試験ガイド 1.1（stop_reason で続行・終了、自然言語の解析・恣意的な上限・テキストを完了とみなすのは避けるべきパターン）、platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls / AF082 ガイド 1.3（構造化データで内容とメタデータを分ける）/ AF083 ガイド 1.6（固定の順序はプロンプトチェーン）/ AF084 ガイド 1.2・1.3（サブエージェントはコンテキストを分離）/ AF085 一般的な human-in-the-loop の原則（AF015 と同じ）/ AF086 platform.claude.com/docs/en/about-claude/glossary（temperature 0 でも完全には決定的でない）/ AF087 ガイド 5.1（ツール結果と事実を保持する）/ AF088 一般的な可逆性・承認の原則（AF068 と同じ）/ AF089 ガイド 1.4・1.5（フックで上限超えの返金を止める）・2.2（retriable: false と説明）/ AF090 ガイド 2.2（isError、errorCategory、retryable）
- 正解の位置：元の問題と全問で変えた（C→A、A→D、A→C、B→D、A→B、C→B、C→A、D→A,C、D→B,C、C→D）。立場の設定：AF081, AF083, AF085, AF087, AF089

### CCAR-F 難化版 AF091〜AF100
| ID | 元 | シナリオ | 問題文の長さ | 選択肢の差 | 正解 |
|---|---|---|---|---|---|
| AF091 | AF030 | — | 334字 3.81倍 | 3.0% | B |
| AF092 | AF063 | — | 366字 4.18倍 | 3.1% | C |
| AF093 | AF041 | AFS08 | 386字 4.41倍 | 3.2% | D |
| AF094 | AF020 | — | 396字 4.52倍 | 3.8% | A |
| AF095 | AF069 | — | 336字 3.84倍 | 4.6% | C |
| AF096 | AF007 | AFS05 | 330字 3.77倍 | 3.1% | D |
| AF097 | AF008 | AFS06 | 391字 4.46倍 | 3.5% | A,C |
| AF098 | AF026 | — | 363字 4.14倍 | 3.1% | B |
| AF099 | AF074 | — | 384字 4.38倍 | 4.7% | A |
| AF100 | AF036 | AFS07 | 334字 3.81倍 | 6.2% | D |
- 根拠：AF091 ガイド 5.1（ツールの出力を必要なフィールドに絞る）、platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools / AF092 ガイド 2.3（制約した代替ツール）・最小権限 / AF093 ガイド 3.4（プランモードと直接実行）/ AF094 ガイド 3.2（スキルと CLAUDE.md・サブエージェント）、code.claude.com/docs/en/skills・sub-agents / AF095 ガイド 3.1・3.3（.claude/rules、パス限定のルール）/ AF096 ガイド 4.1（「控えめに」は効かない、明示的な基準）/ AF097 ガイド 4.3（null 許容）・4.4 / AF098 platform.claude.com/docs/en/models/overview（固定スナップショット）、AF026 と同じ原則 / AF099 ガイド 1.3・5.1（出所のメタデータ）/ AF100 ガイド 5.1（顧客ごとの case facts）
- 正解の位置：元の問題と全問で変えた（D→B、A→C、C→D、B→A、B→C、A→D、B→A,C、D→B、D→A、B→D）。立場の設定：AF091, AF093, AF095, AF097, AF099
- 難化版20問：D1 8 / D2 4 / D3 3 / D4 4 / D5 1（計画どおり）

### CCAR-F 新規 AF101〜AF110
| ID | シナリオ | 問題文の長さ | 選択肢の差 | 正解 |
|---|---|---|---|---|
| AF101 | AFS01 | 380字 4.34倍 | 5.9% | B |
| AF102 | AFS01 | 388字 4.43倍 | 7.4% | D |
| AF103 | AFS01 | 403字 4.60倍 | 3.9% | A |
| AF104 | AFS03 | 345字 3.94倍 | 5.3% | C |
| AF105 | AFS03 | 409字 4.67倍 | 9.8% | B |
| AF106 | AFS03 | 407字 4.65倍 | 2.3% | A,B |
| AF107 | AFS04 | 389字 4.44倍 | 0.8% | D |
| AF108 | AFS04 | 355字 4.05倍 | 3.0% | C |
| AF109 | AFS01 | 372字 4.25倍 | 9.0% | D |
| AF110 | AFS03 | 360字 4.11倍 | 3.1% | A,B |
- ドキュメントの確認（2026-11-07）：サブエージェントを起動するツール名は現在 "Agent"（tool_use ブロック。v2.1.63 より前は "Task"、system:init の一覧では "Task"）。allowedTools に含めることが必須とは書かれていない。並行実行は可能（code.claude.com/docs/en/agent-sdk/subagents）。AgentDefinition は description・prompt が必須、tools・model などは任意。セッションは resume（ID）、--resume は ID か名前、forkSession / --fork-session（code.claude.com/docs/en/agent-sdk/sessions、cli-reference）。PostToolUse は updatedToolOutput で出力を置き換え、additionalContext で追記（code.claude.com/docs/en/agent-sdk/hooks）。MCP の isError（modelcontextprotocol.io/specification/2026-07-28/server/tools）
- 計画からの変更：AF106 は「allowedTools に Task を含める」を正解の根拠にせず（ツール名が変わり、必須とも書かれていないため）、「独立したサブタスクの並行実行」と「サブエージェントの定義でモデルを指定」を正解にした
- 根拠：AF101 ガイド 1.4（プログラムによる前提条件）/ AF102 ガイド 1.4（構造化された引き継ぎ）/ AF103 ガイド 1.5、agent-sdk/hooks（updatedToolOutput）/ AF104 ガイド 1.2（複雑さに応じて選ぶ）/ AF105 ガイド 1.2（狭すぎる分解、範囲の分担）/ AF106 agent-sdk/subagents（並行実行、model）/ AF107 ガイド 1.7、cli-reference（名前で再開）/ AF108 ガイド 1.7、agent-sdk/sessions（fork）/ AF109 ガイド 2.2（アクセス失敗と正当な空の結果）/ AF110 ガイド 2.3（役割ごとのツール、verify_fact）
- 立場の設定：AF101, AF103, AF105, AF107, AF109

### CCAR-F 新規 AF111〜AF120
| ID | シナリオ | 問題文の長さ | 選択肢の差 | 正解 |
|---|---|---|---|---|
| AF111 | AFS04 | 391字 4.46倍 | 4.5% | C |
| AF112 | AFS04 | 418字 4.77倍 | 2.3% | A |
| AF113 | AFS02 | 387字 4.42倍 | 4.6% | D |
| AF114 | AFS02 | 348字 3.97倍 | 1.6% | B |
| AF115 | AFS02 | 411字 4.69倍 | 7.0% | C |
| AF116 | AFS05 | 312字 3.56倍 | 2.4% | A |
| AF117 | AFS05 | 362字 4.13倍 | 8.1% | D |
| AF118 | AFS06 | 382字 4.36倍 | 4.7% | B |
| AF119 | AFS06 | 377字 4.30倍 | 4.6% | A,C |
| AF120 | AFS06 | 352字 4.02倍 | 0.8% | B |
- ドキュメントの確認（2026-11-07）：tool_choice の "any" と "tool" は Opus 5.5・Sonnet 5.5・Fable 5.1 などでは 400 エラー（platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools）→ AF118 は計画の「tool_choice」から、ガイド 4.3 の「enum に other＋詳細、unclear」に差し替え。スキルの allowed-tools は「確認なしで使える」の意味で制限ではない（AF113 では使わない）。context: fork（code.claude.com/docs/en/skills）、@path の読み込み（…/memory）、Grep・Glob・Edit の一意性（…/tools-reference）、MCP のリソース（…/mcp、MCP 仕様 server/resources）。再レビュー時の前回の指摘・独立したインスタンスでのレビューは Claude Code のドキュメントに記述なし → ガイド 3.6・4.6 を根拠にした
- 根拠：AF111 ガイド 2.5、tools-reference / AF112 ガイド 2.4、MCP リソース / AF113 ガイド 3.2、skills（context: fork）/ AF114 ガイド 3.5（テスト先行の反復）/ AF115 ガイド 3.1、memory（@import）/ AF116 ガイド 3.6 / AF117 ガイド 4.6 / AF118 ガイド 4.3（enum の other＋詳細・unclear）/ AF119 ガイド 4.4（再試行の限界）・4.3（null 許容）/ AF120 ガイド 4.4（calculated_total と stated_total）
- 立場の設定：AF111, AF113, AF115, AF117, AF119（オリジナル40問中20問）
- CCAR-F オリジナル40問：正解位置 A12 / B12 / C11 / D11、multiple 6問（AF088, AF089, AF097, AF106, AF110, AF119）、正解だけが最長 0問、警告 0件。シナリオ別（オリジナル）：AFS01 6 / AFS03 5 / AFS04 4 / AFS06 4 / AFS02 3 / AFS05 3 / AFS07 2 / AFS08 1 / なし 12
- CCAR-F 120問：D1 32 / D2 22 / D3 24 / D4 24 / D5 18（配点との差は最大 0.3pt）。シナリオ付き 53問、すべてのシナリオ（AFS01〜AFS11）が使われている

## CCAR-P のメモ
- 原文：GitHub の architect-professional/*.md（2026-11-07 取得）。公式試験ガイド（architect-professional/exam-guide.pdf）を pdfjs でテキスト化して確認：63問、multiple-choice / multiple-response、120分、合格 720。ドメイン名・配点は依頼の表と一致。各ドメインの目標（例：D3 の RAG・チャンク分割、progressive discovery、MCP/API/agent-to-agent、D5 の GDPR・HIPAA・FedRAMP への準拠）を確認。シナリオの記載はない
- practice：35問（説明文も Thirty-five で、依頼の件数と一致）。見出しにシナリオ名はなく、全問 scenario_id: null。全問 single
- practice のドメイン別：D1 6 / D2 3 / D3 8 / D4 6 / D5 4 / D6 4 / D7 4。正解位置 A9 / B9 / C8 / D9。正解が最長（同じ長さを含む）：35/35（原文のまま）
- 新しく使った訳語（Phase 4 で用語集に追記）：段階的な発見（progressive discovery）、チャンク分割、埋め込み（embedding）、非識別化（de-identification）、保護対象の保健情報（PHI）、トークン化する、データの所在（residency）、コントロールプレーン、ルーブリック、補完的な制御（compensating control）、横断的な関心事
- mock1：15問（依頼の件数と一致）。シナリオなし（scenario_id: null）。Why が短いため14問に補足（Q13 は Why が全誤答を内容で否定しているため補足なし）。内容で否定済みの誤答は対象外（Q1 の A・B、Q6 の A・B、Q7 の B、Q8 の A・D、Q12 の A、Q15 の B）
- mock1 のドメイン別：D1 2 / D2 1 / D3 3 / D4 3 / D5 3 / D6 2 / D7 1。正解は A→B→C→D の順に循環（原文のまま）
- mock1 は practice と論点が近い問題が多い（例：AP039≒AP006 ルーブリック、AP040≒AP007 回帰と A/B、AP041≒AP008 PHI の非識別化、AP045≒AP005 ワークフロー）。原文のまま取り込み、オリジナルの計画で重複を避ける材料にする
