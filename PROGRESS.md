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
| CCAR-P 3 | mock2（15問）AP051–AP065 | 完了（2026-11-10 報告） |
| CCAR-P 4 | mock3（15問）AP066–AP080 | 完了（2026-11-10 報告） |
| CCAR-P 5 | オリジナルの計画（承認が必要） | docs/ccar-p-original-plan.md の配分・40問の論点を2026-11-10にユーザー承認済み |
| CCAR-P 6 前半 | 難化版 AP081–AP090 | 完了（2026-11-10 報告） |
| CCAR-P 6 後半 | 難化版 AP091–AP100 | 完了（2026-11-10 報告） |
| CCAR-P 7 前半 | 新規 AP101–AP110 | 完了（2026-11-10 報告） |
| CCAR-P 7 後半〜8 | 新規 AP111–AP120、merge と validate | 完了（2026-11-10、120問・検証エラー0件・警告0件） |
| Phase 4 | 検証・テスト・ドキュメント・スキル | コード・検証・文書更新完了（2026-11-14）。実画面の最終確認は接続・操作承認タイムアウトにより未完了 |

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

### CCAR-P mock2（2026-11-10）
- 原文：https://raw.githubusercontent.com/Amey-Thakur/CLAUDE-CERTIFICATIONS/main/architect-professional/mock-exam-2.md を取得。AP051〜AP065 の15問を追加。英語の問題文・選択肢・解説、正解、ドメインを保持し、日本語訳を追加。全問 single、scenario_id: null。Why が全誤答を内容で否定しているため補足なし。
- mock2 のドメイン別：D1 3 / D2 2 / D3 3 / D4 2 / D5 2 / D6 2 / D7 1。正解位置 A4 / B4 / C4 / D3。
- 取り込み済み65問のドメイン別：D1 11（16.9%）/ D2 6（9.2%）/ D3 14（21.5%）/ D4 11（16.9%）/ D5 9（13.8%）/ D6 8（12.3%）/ D7 6（9.2%）。D2 は配点より3.8pt少なく、オリジナルの配分案で調整する。
- 既存問題と近い論点：AP051≒AP001（AWS 境界）、AP053≒AP004（共通の統合層）、AP054≒AP005・AP045（要件と複雑さ）、AP057≒AP006（測定する成功基準）、AP059≒AP010（監査とデータ最小化）。原文のまま保持し、オリジナルの重複回避に使う。
- merge 実施。公開データと index.json を65問へ更新。他の3試験に差分なし。
- validate：他の3試験はエラー0件、オリジナル警告0件。CCAR-P は件数不足3件のみ（合計65/120、mock3 0/15、original 0/40）。追加分の構造・英日・正解のエラーなし。試験をまたぐID重複なし。
- npm test：4ファイル86件成功。npm run build 成功。
- docs/architect-plan.md の「各ステップで止まって報告する」に従って区切る。次は mock3 AP066〜AP080。その後、80問を集計してオリジナル40問の配分案の承認を得る。今回はコミット・push は実施していない。

### CCAR-P mock3（2026-11-10）
- 原文：https://raw.githubusercontent.com/Amey-Thakur/CLAUDE-CERTIFICATIONS/main/architect-professional/mock-exam-3.md を取得。AP066〜AP080 の15問を追加。英語の問題文・選択肢・解説、正解、ドメインを原文どおり保持し、日本語訳を追加した。全問 single、scenario_id: null。Why が各誤答を内容で否定しているため補足なし。
- mock3 のドメイン別：D1 2 / D2 2 / D3 3 / D4 2 / D5 2 / D6 2 / D7 2。正解位置 A4 / B4 / C4 / D3。
- 重複回避の材料：AP067≒AP015（クラウドへの結合と移行）、AP069≒AP009（精度要件の具体化）、AP071≒AP024・AP059（データ保持）、AP074≒AP023（変更時の再評価）、AP076≒AP029（引き継ぎ）、AP078≒AP032（プロンプトの管理）、AP079≒AP034（開発支援の成果）、AP080≒AP035（既存コードのコンテキスト）。原文を変更せず取り込んだ。
- 取り込み80問：D1 13（16.25%）/ D2 8（10%）/ D3 17（21.25%）/ D4 13（16.25%）/ D5 11（13.75%）/ D6 10（12.5%）/ D7 8（10%）。全問 single。D2 は配点より3pt少なく、D7 は3pt多い。残り40問の配分案で調整する。
- mock1〜3 の英語問題文の平均は97.6444文字。オリジナルの許容範囲は166〜488文字（1.7〜5.0倍）、目標245〜390文字（2.5〜4倍）。
- merge 実施。public/questions/ccar-p.json と index.json を80問に更新。他の3試験の公開ファイルに差分なし。
- validate：CCAO-F 100問、CCDV-F 120問、CCAR-F 120問はエラー0件。CCDV-F・CCAR-F のオリジナル警告0件。CCAR-P は件数不足2件のみ（合計80/120、original 0/40）。取り込み80問の構造・英日・正解にエラーなし、試験をまたぐID重複なし。
- npm test：4ファイル86件成功。npm run build 成功。
- 各ステップで報告する既存計画に従い、mock3 完了で区切る。次はオリジナル40問（難化版20・新規20）の論点とドメイン配分の計画を提示し、承認後に10問ずつ作成する。コミット・push はしていない。

### CCAR-P 難化版 AP081〜AP090（2026-11-10）
- ユーザーの「OK」により docs/ccar-p-original-plan.md の40問計画を承認済みとして開始。original.json に日英10問を追加。source: original、source_url/source_number/scenario_id: null、based_on に元ID。既存80問と他試験のデータは変更していない。
- 追加分は D1 4 / D2 4 / D3 2。AP083・AP087 は multiple（各2正解、日英で2つ選ぶ旨を明記）。回答者の立場の設定は5/10問。正解位置は元問題から全問変更。

| ID | 元ID | D | 英語問題文 | mock平均比 | 選択肢の長さの差 | 正解 |
|---|---|---:|---:|---:|---:|---|
| AP081 | AP004 | 1 | 332文字 | 3.40倍 | 2.6% | A |
| AP082 | AP005 | 1 | 346文字 | 3.54倍 | 2.7% | B |
| AP083 | AP018 | 1 | 344文字 | 3.52倍 | 1.8% | B,D |
| AP084 | AP070 | 1 | 319文字 | 3.27倍 | 3.5% | C |
| AP085 | AP030 | 2 | 335文字 | 3.43倍 | 0.9% | D |
| AP086 | AP031 | 2 | 335文字 | 3.43倍 | 2.7% | A |
| AP087 | AP046 | 2 | 330文字 | 3.38倍 | 2.6% | B,C |
| AP088 | AP077 | 2 | 335文字 | 3.43倍 | 6.1% | D |
| AP089 | AP002 | 3 | 328文字 | 3.36倍 | 7.7% | B |
| AP090 | AP014 | 3 | 329文字 | 3.37倍 | 3.6% | C |

根拠（2026-11-10に公式資料を閲覧。業務上の制約と数値は設問固有の仮定）：
- AP081：https://www.anthropic.com/research/building-effective-agents （必要最小限の構成、検索で拡張した単一呼び出し、ワークフローとエージェントの区別）。
- AP082：同資料の事前に定めたコード経路によるワークフローと、既知の手順に対する予測可能性。決定的なのは段階の制御であり、生成文そのものではない。
- AP083：https://code.claude.com/docs/en/agent-sdk/permissions （実行前の許可・拒否というアプリ側の制御の例）、https://www.postgresql.org/docs/current/transaction-iso.html （同時トランザクションと整合性）。特定のSDKやDBを正解に要求せず、必須の承認・上限を実行層で保証する一般設計を問う。合計の確認と確定の間に別の送金が割り込む競合を含めた。
- AP084：https://json-schema.org/understanding-json-schema/reference/null （null の明示的な意味）、https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools （入力スキーマと動作の説明）、https://learn.microsoft.com/en-us/azure/architecture/patterns/asynchronous-request-reply （再送・重複処理を含む非同期の契約）。システム境界の契約への適用は設計上の推論。
- AP085：https://platform.claude.com/docs/en/about-claude/models/choosing-a-model （能力・速度・費用を基準に実データで評価して選ぶ）。S/L と費用単位は架空の測定結果。1+8=9 の組合せが品質・予算を満たすことを確認。
- AP086：https://www.anthropic.com/research/effective-context-engineering-for-ai-agents （コンテキストを有限の資源として扱い、関連情報を選別する）。
- AP087：https://platform.claude.com/docs/en/build-with-claude/prompt-caching （完全一致のプレフィックス、安定した内容を先頭に置く、可変部分より前の明示的なブレークポイント）。最小量・有効期間を設問で満たすことにして論点を限定。
- AP088：https://platform.claude.com/docs/en/test-and-evaluate/develop-tests （実タスクを反映した評価データと代表性）。固定スナップショット・未変更の構成・従来データの合格を示し、単なる自然劣化ではなく入力の変化を検証する設計上の判断を問う。
- AP089：https://www.anthropic.com/research/contextual-retrieval （文書のチャンク分割・埋め込み・検索と、根拠を加える生成というRAGの構成）。更新後の誤検索に対して変更された検索層を優先調査するという既存AP002の論点を難化。復旧版の整合性確認は一般的な変更管理上の判断。
- AP090：https://learn.microsoft.com/en-us/azure/architecture/patterns/asynchronous-request-reply （受付と長時間処理の分離、状態照会）。コールバック不可・固定タイムアウトを明示し、ストリーミングや短縮回答との違いを問う。

- merge 後の CCAR-P は90問：practice 35 / mock1 15 / mock2 15 / mock3 15 / original 10。ドメイン別 D1 17（18.9%）/ D2 12（13.3%）/ D3 19（21.1%）/ D4 13（14.4%）/ D5 11（12.2%）/ D6 10（11.1%）/ D7 8（8.9%）。残り30問を計画どおり追加して最終比率を調整する。
- validate：CCAR-P は件数不足2件のみ（合計90/120、original 10/40）。オリジナルの警告0件、正解が単独で最長は1/10（10%）、正解位置 A2/B4/C3/D3（12正解枠中16.7%/33.3%/25%/25%）。based_on・同一ドメイン・英日参照記号・ID重複のエラーなし。
- 他の3試験は検証エラー0件、CCDV-F・CCAR-F のオリジナル警告0件。他の3試験の公開データに差分なし。npm test は4ファイル86件成功、npm run build 成功、git diff --check 成功。
- 承認済み計画の10問単位の報告に従い、ここで区切る。次は AP091〜AP100。コミット・push は実施していない。

### CCAR-P 難化版 AP091〜AP100（2026-11-10）
- original.json に日英10問を追加。全問 scenario_id: null、based_on は計画どおり、元と同じドメイン。AP091 は multiple（2正解、日英で2つ選ぶ旨を明記）、他9問は single。元の正解位置を全問で変更し、回答者の立場を5/10問に設定した。
- 難化版20問のドメイン別は D1 4 / D2 4 / D3 3 / D4 3 / D5 3 / D6 3 / D7 0。承認済み配分どおり。既存80問の内容・正解と、他試験のデータに変更なし。

| ID | 元ID | D | 英語問題文 | mock平均比 | 選択肢の長さの差 | 正解 |
|---|---|---:|---:|---:|---:|---|
| AP091 | AP050 | 3 | 361文字 | 3.70倍 | 3.6% | C,D |
| AP092 | AP006 | 4 | 349文字 | 3.57倍 | 2.7% | B |
| AP093 | AP007 | 4 | 315文字 | 3.23倍 | 3.6% | D |
| AP094 | AP048 | 4 | 328文字 | 3.36倍 | 1.8% | A |
| AP095 | AP008 | 5 | 355文字 | 3.64倍 | 1.8% | B |
| AP096 | AP025 | 5 | 341文字 | 3.49倍 | 4.5% | C |
| AP097 | AP072 | 5 | 347文字 | 3.55倍 | 2.7% | D |
| AP098 | AP009 | 6 | 330文字 | 3.38倍 | 3.6% | A |
| AP099 | AP028 | 6 | 313文字 | 3.21倍 | 4.3% | B |
| AP100 | AP047 | 6 | 335文字 | 3.43倍 | 4.2% | C |

根拠（2026-11-10に公式・一次資料を閲覧。規制の細かな条文には依存させず、組織の制約は設問で定義）：
- AP091：https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html （最小権限・リクエストごとの認可）、https://code.claude.com/docs/en/agent-sdk/permissions （実行前の許可と拒否の例）。SDK固有の設定ではなく、禁止された削除の排除と正確な変更への監督者承認を問う。
- AP092：https://platform.claude.com/docs/en/test-and-evaluate/develop-tests （定義した定性的尺度、ルーブリック、コード・人・モデルの採点手段）。許容できる言い換えと致命的な省略を区別する例を合意して、人の判断に採点を合わせる設計。
- AP093：同評価資料（事前の成功基準、実タスク・例外ケース、A/Bによる比較）。既存AP007のオフライン回帰→限定した本番比較という論点を、安全性・遅延・事前基準の制約で難化した。重大な承認に対する保護策が本番テストにも必要であることを解説。
- AP094：https://opentelemetry.io/docs/concepts/signals/traces/ （処理単位、時間、親子関係、属性による分散トレース）。元AP048の検索・ツール・判断点の追跡を、生の顧客文を保存できない制約下に適用。保持できる参照や秘匿処理もポリシーを満たす必要がある。
- AP095：https://presidio.dataprivacystack.org/ （PIIの検出・非識別化、自動検出だけではすべての識別情報を発見できないこと）。旧 https://microsoft.github.io/presidio/ から転送先を確認。設問では製品を指定せず、モデル送信前の検証・不確かな入力の保留・院内の対応表を問う。通信の暗号化や出力だけの除去では入力の開示を防げない。
- AP096：https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks （間接的なインジェクション、ツール結果は信頼できないデータ、最小権限）。関連する出典でも社内の権限境界を変更できず、一般的な確認操作でも禁止された送信は許可されない。
- AP097：https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations （出典の根拠に照らした主張の検証）、既存AP072の独立した照合という論点。モデル同士の一致は独立した事実の裏付けにならない。正とする購入・保証記録への照合と不一致の実行前エスカレーションは、この設問の高影響な業務に適用した設計上の判断。
- AP098：https://platform.claude.com/docs/en/test-and-evaluate/develop-tests （具体的・測定可能・達成可能・関連性のある成功基準、複数次元の測定）。既存AP009に沿い、測定した工程全体の成果と費用を示して基準を合意する。人の確認も完全ではないと明示し、自動化対象だけへの分母の変更や将来改善の保証を誤答とした。
- AP099：https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/performance-test （本番に近い条件での処理能力・負荷・性能の検証）、上記評価資料の実際の入力分布。既存AP028の入力・支援・例外の前提を再確認する判断を、部門追加とヘルプデスクへの移行に適用。段階展開と責任分担はその運用制約に対する設計案。
- AP100：https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record （文脈、代替案、理由、制約、トレードオフ）。配置の選択そのものの優劣ではなく、同品質の2案で社内ポリシーがコストより優先された理由を記録する判断。

- merge 後の CCAR-P は100問：practice 35 / mock1 15 / mock2 15 / mock3 15 / original 20。ドメイン別 D1 17（17%）/ D2 12（12%）/ D3 20（20%）/ D4 16（16%）/ D5 14（14%）/ D6 13（13%）/ D7 8（8%）。完成時の配分は計画を維持。
- validate：CCAR-P は件数不足2件のみ（合計100/120、original 20/40）。オリジナル警告0件、正解が単独で最長は1/20（5%）。正解位置 A4/B7/C6/D6（23正解枠中17.4%/30.4%/26.1%/26.1%）。ID重複、日英の欠落・参照記号、based_on・同一ドメインのエラーなし。
- CCAO-F 100問・CCDV-F 120問・CCAR-F 120問は検証エラー0件、CCDV-F・CCAR-F のオリジナル警告0件。他の3試験の公開ファイルに差分なし。npm test は4ファイル86件成功、npm run build と git diff --check 成功。
- 計画の10問単位の報告に従ってここで区切る。次は新規 AP101〜AP110（based_on: null）。コミット・push は実施していない。

### CCAR-P 新規 AP101〜AP110（2026-11-10）
- original.json に新規10問を日英で追加。全問 based_on: null、scenario_id: null。D1 3 / D2 4 / D3 3、計画どおり。AP101・AP108 は multiple（2正解、日英で2つ選ぶ旨を明記）。回答者の立場を5/10問に設定。既存問題と他試験の内容は変更していない。
- 出典リポジトリの architect-professional/exam-guide.pdf を再取得し、pypdf でテキスト抽出して Section 6 を再確認。D1 の複数エージェント・分解・業務価値とSLA、D2 のプロンプト・コンテキスト管理、D3 の認証と認可・検索方式とデータ形状・MCP/API等のプロトコル選択に対応。抽出は成功、初回のコンソール表示だけが文字コードの制約で失敗したため、保存済みテキストを rg で確認した。PDFの見た目は変更していない。

| ID | D | 英語問題文 | mock平均比 | 選択肢の長さの差 | 正解 | 既存論点との区別 |
|---|---:|---:|---:|---:|---|---|
| AP101 | 1 | 322文字 | 3.30倍 | 2.7% | A,C | 独立した並行調査の分担と、根拠・矛盾を保った合流 |
| AP102 | 1 | 346文字 | 3.54倍 | 7.7% | D | 依存先の障害を隔離し、正常機能を維持する縮退設計 |
| AP103 | 1 | 344文字 | 3.52倍 | 5.1% | A | 期限内の必須成果と、遅くてもよい任意機能の分解。全処理の非同期受付ではない |
| AP104 | 2 | 351文字 | 3.59倍 | 8.2% | B | 正当な利用者の文体要求と免除不可のルールの整合。外部文書の攻撃とは別 |
| AP105 | 2 | 352文字 | 3.60倍 | 7.8% | D | 推論時に与えるFew-shotの例の偏り。評価セットの代表性とは別 |
| AP106 | 2 | 316文字 | 3.24倍 | 4.3% | C | 型だけのスキーマ適合と、フィールド間の業務的意味の検証を区別 |
| AP107 | 2 | 316文字 | 3.24倍 | 3.5% | A | 圧縮時の状態の忠実性。コンテキストの容量配分とは別 |
| AP108 | 3 | 348文字 | 3.56倍 | 5.2% | A,D | 読取対象の文書認可と信頼できる範囲の決定。更新ツールの権限とは別 |
| AP109 | 3 | 326文字 | 3.34倍 | 5.2% | C | IDの一致と意味検索の組合せ。更新障害の調査とは別 |
| AP110 | 3 | 328文字 | 3.36倍 | 0.9% | B | 既存APIの責任を保つMCPアダプター。ツール数の削減ではなく連携方式の選択 |

根拠（2026-11-10に公式・一次資料を閲覧。業務の制約・数値は設問固有）：
- AP101：https://www.anthropic.com/research/building-effective-agents （並行化、分担と統合）、https://www.anthropic.com/research/effective-context-engineering-for-ai-agents （専門サブエージェントと統合）。未解消の矛盾の保持は設問の報告要件。モデルの多数決を事実の裏付けとしない。
- AP102：https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker （失敗する依存先への繰り返し呼び出しを遮断し、他機能への連鎖を防ぐ）。現行在庫確認がない予約の保留は設問の制約から導く。
- AP103：上記 building-effective-agents の分解と遅延・費用のトレードオフ、https://learn.microsoft.com/en-us/azure/architecture/patterns/priority-queue （業務上の優先度・サービスレベルに応じた処理）。任意の調査を応答経路から外す案は、この設問の独立性・期限・利用者の合意から導く設計。
- AP104：https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices （明確な指示、役割とプロンプトの構造）、上記 context-engineering の明確なシステム指示。必須ルールと可変の文体の区別を明示する。プロンプトだけでの強制保証は主張しない。
- AP105：上記 prompting-best-practices の Use examples effectively （実タスクに関連し、例外を含めて多様で、意図しないパターンを避ける例）。急ぐ単語と業務影響を分ける境界例を問う。
- AP106：https://platform.claude.com/docs/en/build-with-claude/structured-outputs （JSONとスキーマに沿った出力）。設問が定めた型だけのスキーマは金額の算術や日付順を保証しないため、コードで業務ルールを検査するという設計上の推論。矛盾を通すための値の捏造は認めない。
- AP107：上記 context-engineering の Compaction と Structured note-taking （重要な決定・未解決事項を保ち、過度な圧縮による情報損失に注意する）。更新済み値・仮説・検証済みの事実を状態つきで区別し、忠実性を照合する。
- AP108：https://learn.microsoft.com/en-us/azure/search/search-security-trimming-for-azure-search （文書単位の検索フィルター）、https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html （各リクエストの認可と信頼できる実行場所）。検索フィルターに渡すID文字列だけでは認証・認可にならないことに注意。モデルの引数を信頼せず、検索と結果キャッシュの双方に認可範囲を適用する設計。
- AP109：https://www.anthropic.com/research/contextual-retrieval （識別子に対する字句検索と、意味検索の組合せ）。特定の精度や取得件数を保証せず、両クエリ群で実測する。
- AP110：https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro （AIアプリと外部システムをつなぐ共通プロトコル）、上記 OWASP の認可。MCPで既存APIを包むのは、既存クライアントを維持し業務ルールを複製しないという設問の制約に適用した設計案。MCP自体が利用者のアクセス権を付与すると主張しない。

- merge 後の CCAR-P は110問：practice 35 / mock1 15 / mock2 15 / mock3 15 / original 30（難化版20、新規10）。D1 20（18.2%）/ D2 16（14.5%）/ D3 23（20.9%）/ D4 16（14.5%）/ D5 14（12.7%）/ D6 13（11.8%）/ D7 8（7.3%）。残りはD4 3 / D5 3 / D6 4で計画どおり120問となる。
- validate：CCAR-P は件数不足2件のみ（合計110/120、original 30/40）。オリジナル警告0件、正解が単独で最長は3/30（10%）、正解位置A8/B9/C9/D9（35正解枠中22.9%/25.7%/25.7%/25.7%）。ID重複、日英・解説参照記号、based_on のエラーなし。
- 他3試験は検証エラー0件、CCDV-F・CCAR-F のオリジナル警告0件。他3試験の公開データに差分なし。npm test は4ファイル86件成功、npm run build と git diff --check 成功。
- 計画の10問単位の報告に従って区切る。次は最後の新規 AP111〜AP120。コミット・push は実施していない。

### CCAR-P 新規 AP111〜AP120・Phase 3 完了（2026-11-10）
- 最後の新規10問を日英で追加。based_on: null、scenario_id: null、D4 3 / D5 3 / D6 4。AP115 は multiple（2正解、日英で2つ選ぶ旨を明記）。この10問は回答者の立場を5問に設定し、オリジナル全体で20/40問となった。
- 前回取得した試験ガイド Section 6 の D4（評価・性能指標）、D5（公平性・リスク・ガバナンス）、D6（要件探索・期待値とSLA・ライフサイクル）を再確認。下記論点は既存問題と中心となる判断を分けた。

| ID | D | 英語問題文 | mock平均比 | 選択肢の長さの差 | 正解 | 中心論点 |
|---|---:|---:|---:|---:|---|---|
| AP111 | 4 | 325文字 | 3.33倍 | 6.0% | A | 調整用データと未使用の最終評価データの分離 |
| AP112 | 4 | 301文字 | 3.08倍 | 6.0% | D | タスク構成を合わせた遅延分布と費用の測定 |
| AP113 | 4 | 321文字 | 3.29倍 | 5.3% | B | 検証済み根拠を使う生成テストと検索テストの分離 |
| AP114 | 5 | 347文字 | 3.55倍 | 4.2% | C | 小集団の不利益と不確実性を考慮した公平性の調査 |
| AP115 | 5 | 332文字 | 3.40倍 | 7.8% | A,C | 漏えいした権限の失効・隔離と、証拠保全・責任者への引き継ぎ |
| AP116 | 5 | 324文字 | 3.32倍 | 2.6% | D | 保持期間と区別した、二次利用目的の承認 |
| AP117 | 6 | 318文字 | 3.26倍 | 3.3% | B | 相反する要件を責任者と整理し、成果の定義を合意 |
| AP118 | 6 | 321文字 | 3.29倍 | 4.2% | A | 言語追加の影響評価と、範囲・費用・日程の変更管理 |
| AP119 | 6 | 309文字 | 3.16倍 | 8.3% | C | 廃止期限を前提とした責任者・検証・段階移行・終了条件 |
| AP120 | 6 | 299文字 | 3.06倍 | 5.9% | D | 測定範囲・95%目標・失敗の扱い・責任分担を含むSLAの合意 |

根拠（2026-11-10に公式・一次資料を確認。業務条件と数値は設問固有）：
- AP111：https://platform.claude.com/docs/en/test-and-evaluate/develop-tests （ホールドアウトセットと代表性）。調整に繰り返し使った評価の点数を、独立した最終判定の証拠としないという評価設計。並べ替えや採点者変更では未使用データにならない。
- AP112：同評価資料の品質・遅延・費用の多次元測定、https://sre.google/sre-book/service-level-objectives/ （平均と分布・パーセンタイル）。AP120の約束の定義とは区別し、設計候補を比較する測定方法を問う。
- AP113：https://www.anthropic.com/research/contextual-retrieval （検索と生成の構成、検索性能の評価）、上記評価資料のタスク別評価。既知の正しいコンテキストで生成を測る実験は、検索段階と生成段階の原因を切り分けるための設計上の推論。最近の更新に原因を限定した既存AP089とは別。
- AP114：https://airc.nist.gov/airmf-resources/airmf/5-sec-core/ の MEASURE 2.11、https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf の MS-2.11-002 （集団・小集団ごとの性能と不利益の評価。検索結果で一次資料の該当記述を確認）。初めに試した characteristics ページは取得できなかったため根拠に使っていない。少ない標本から差別を断定せず、十分なデータと原因調査・軽減策の測定を行う。
- AP115：https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html （侵害が疑われる秘密の失効、露出後の対応）。公開コピーの削除だけでは失効にならない。証拠は保護して保全し、実行中の攻撃経路を残したまま新しい認証情報を発行するだけでは不十分。
- AP116：https://www.nist.gov/privacy-framework （組織のプライバシーリスク管理）、試験ガイドD5。具体的な承認手順の結論は、設問で定めた新目的のレビュー義務から導く。法令の条文や保持期間内なら二次利用自由という仮定には依存しない。
- AP117：試験ガイドD6の structured discovery / requirement gathering と期待値の合意、上記評価資料の達成可能で関連性のある成功基準。異なる責任者が持つ制約を、実装前に明示して合意するという設計上の判断。
- AP118：試験ガイドD6の feedback loops・反復、https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record （制約・選択肢・影響）、https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/safe-deployments （品質で判定する変更）。一般的なモデルの多言語能力と、業務の評価・支援体制の準備を区別する。
- AP119：試験ガイドD6の lifecycle、上記 safe-deployments の段階的変更とリスク管理。期限と互換性変更は設問の仮定であり、特定製品の廃止情報ではない。依存先廃止後に旧版へのロールバックはできないため、実行可能な代替手順を合意する。
- AP120：https://sre.google/sre-book/service-level-objectives/ 、https://learn.microsoft.com/en-us/azure/well-architected/reliability/metrics （業務関係者との測定可能な目標）。提供元の推論平均とユーザーの工程全体の95%目標を区別し、測定期間・失敗・担当責任を合意する。

完成結果：

| 試験 | 合計 | practice/mock1/mock2/mock3/original | 検証エラー | オリジナル警告 |
|---|---:|---|---:|---:|
| CCAO-F | 100 | 35/15/15/15/20 | 0 | 対象外 |
| CCDV-F | 120 | 35/15/15/15/40 | 0 | 0 |
| CCAR-F | 120 | 35/15/15/15/40 | 0 | 0 |
| CCAR-P | 120 | 35/15/15/15/40 | 0 | 0 |

- CCAR-P最終配分：D1 20（16.67%）/ D2 16（13.33%）/ D3 23（19.17%）/ D4 19（15.83%）/ D5 17（14.17%）/ D6 17（14.17%）/ D7 8（6.67%）。承認済み計画どおりで、配点比率との差は最大0.34pt未満。
- オリジナル40問：難化版20・新規20、複数選択6問（AP083/087/091/101/108/115）。正解位置A11/B11/C12/D12（全46枠の23.9%/23.9%/26.1%/26.1%）。正解が単独で最長は8/40（20%）、基準30%以下。全40問の文章量・選択肢の長さ・正解位置の警告0件。
- 全試験のID重複0件。based_on の参照、ドメイン、英日・解説の選択肢記号の検証エラー0件。CCAR-Pは114問 single / 6問 multiple。merge で公開ファイルとindexを120問へ更新し、他3試験の公開データに差分なし。
- npm run validate 全体成功（エラー合計0件）、npm test は4ファイル86件成功、npm run build と git diff --check 成功。
- CCAR-P問題データの作成（Phase 3）は完了。計画のステップ報告としてここで区切る。次は Phase 4 の未完了作業（シナリオ参照の検証拡充、画面の完了条件確認、README・出典表示・スキル更新など）。今回の成功だけでPhase 4全体が完了したとは扱わない。コミット・push は実施していない。

### Architect Phase 4（2026-11-14）
- scripts/validate-questions.mjs にシナリオの検証を追加。結合問題の scenario_id を必須とし、null または同じ試験のIDだけを許可。シナリオの配列・オブジェクト形式、ID重複、日英のタイトル・本文、source/source_url/source_note、未使用シナリオを検出する。CLIは各試験の scenarioFile を読み込み、問題と一緒に検証する。
- tests/validate.test.js を4試験へ拡張。実データの全件検証、3試験のオリジナル警告、全試験をまたぐID重複、他試験シナリオ参照・重複・未使用・日英と出典の欠落・参照の不正な型の回帰テストを追加。
- tests/exams.test.js を4試験×5/10/20問の12通りに拡張。出題と採点に加え、回答ごとに実データのクールを保存形式へ変換・読み戻し、選択肢順・進行状態・履歴が保たれ、他試験の記録が変わらないことを確認。これはロジックの統合テストであり、実画面の操作確認ではない。
- 実データの全11シナリオで、シナリオ単独およびドメイン・出典との組合せの絞り込みを確認。難化版・新規の絞り込みもCCDV-F・CCAR-F・CCAR-Pで検証。既存のv1→v2→v3、v2→v3の記録・インポートの引き継ぎテストは維持し、成功。
- READMEを4試験・シナリオ形式・絞り込み・schemaVersion 3・保存移行・検証内容に更新。public/THIRD_PARTY_NOTICES.txtにArchitect両試験、mock1由来のシナリオ、独自問題、公式ガイドを自分の言葉で書いたシナリオの区別を追記。MITライセンス本文は維持。
- ローカルの4スキル（quiz-question-writer / question-data-check / react-conventions / ja-en-translation）を更新。Architectの範囲とID、シナリオ、3試験共通のoriginalルール、schemaVersion 3、用語集を反映。将来変わるモデル仕様の断定例は、作成時に公式資料を確認する指示へ整理した。
- 最終チェック：npm test は4ファイル105件成功、npm run validate は全4試験エラー0件・オリジナル警告0件、npm run build 成功、git diff --check 成功。CCAO-F 100 / CCDV-F 120 / CCAR-F 120 / CCAR-P 120。問題本文・選択肢・正解や保存データの形式・キーはこのPhaseで変更していない。
- 実画面の確認は未完了。ローカル開発サーバーを127.0.0.1:5174で起動し、CUAのChromeタブ作成を試みたが「The browser access host is unavailable」。利用可能なChromeウィンドウを選び直しても「Computer Use app approval timed out」で操作できなかった。接続が復旧するまで画面の完了条件を確認済みと扱わない。作業用サーバーは停止した。
- 次に残る確認：実際のブラウザで4試験×5/10/20問を最後まで操作、CCAR-Fのシナリオ本文の出題中の表示・折りたたみと復習での閉じた表示、日本語/英語・375px幅、既存記録を引き継いだ画面。以前のPhase 1の画面確認記録はあるが、完成データでの今回の確認の代わりにはしない。
- 作業内容はローカルに保存済み。Phase 4全体は実画面確認を残す。コミット・push は実施していない。
