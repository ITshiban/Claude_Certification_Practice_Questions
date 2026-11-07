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
