# 実行手順：複数試験への対応と CCDV-F の問題追加

依頼の内容は、この文書の後半にある「依頼文」のとおり。前半には、承認を得た計画と決定事項をまとめる。
フェーズとステップごとに止まって報告し、承認を得てから次に進む。進捗は PROGRESS.md に記録する。

## 決定事項

| 項目 | 決定 |
|---|---|
| ブランチ | `multi-exam` で作業する。全フェーズの確認後に `main` へマージする（`main` への push で公開サイトにデプロイされるため） |
| タグ | 作業前の `main` に `ccao-only-final` を付けた（ローカルのみ。push しない） |
| 試験の定義 | `src/exams.js` に集約し、アプリと `scripts/*.mjs` の両方から import する |
| 問題データ | `data/questions/<exam>/*.json` を正とする。merge で `public/questions/<exam>.json` と `public/questions/index.json`（試験ごとの問題数）を生成する |
| exam フィールド | 出典別JSONには書かず、merge のときにフォルダ名から付ける（CCAO-F の出典別JSONを変更しないため） |
| based_on | CCDV-F の original にだけ持たせる（難化版は元の問題ID、新規は null） |
| 起動時の画面 | 毎回、試験選択画面から始める。前回選んだ試験を強調表示する |
| 保存データ | キー `ccaof-quiz:v1` のまま schemaVersion 2。`{ schemaVersion, lang, currentExam, exams: { <exam>: { settings, statuses, history, currentSession } } }` |
| v1→v2 | settings.lang → lang、それ以外 → exams["ccao-f"]。currentExam は "ccao-f" |
| インポート | v1・v2 とも記録全体を上書きする（v1 は変換後に上書き） |
| 未知・追加された試験 | 読み込み時に、定義にある試験の記録がなければ初期値で補う |
| 出典の絞り込み（CCDV-F） | Practice questions / Mock exam / オリジナル（難化版）/ オリジナル（新規）の4つ |
| リセット | 「この試験の記録だけ」「すべての記録」。どちらも出題設定は残す |
| validate の件数不足 | 問題の件数不足はエラーのまま進める（ステップ8で解消する） |
| 警告のしきい値 | 問題文の長さ：mock 平均（CCDV-F mock1〜3 の question.en 45問、97.7 文字）の 1.7〜5.0 倍の範囲外（2026-11-07 に上限を 2.5 倍から 5 倍に変更。目標は 2.5〜4 倍） / 選択肢の長さ：(最長−最短)÷最長 > 20% / 正解が最長の選択肢である問題の割合 > 30% / 正解位置 A〜D のいずれかが 15% 未満または 35% 超 |
| オリジナル問題の立場設定 | 長くするだけでなく、「あなたは〜です。」のように回答者の立場（CCDV-F 保持者、AI エンジニアなど）を設定した問題を含める |
| 名前 | アプリ名「Claude 認定試験 練習問題」/「Claude Certification Practice」。package.json の name は `claude-cert-quiz`。エクスポートのファイル名は `claude-cert-quiz-backup-YYYY-MM-DD.json` |

### ドメインの日本語名
| 試験 | # | 英語 | 日本語 | 配点 |
|---|---|---|---|---|
| CCAO-F | 1 | Prompting and Task Execution | プロンプトとタスク実行 | 14% |
| CCAO-F | 2 | Output Evaluation and Validation | 出力の評価と検証 | 21% |
| CCAO-F | 3 | Product and Model Selection | 製品とモデルの選択 | 12% |
| CCAO-F | 4 | Workflow Integration and Solution Design | ワークフロー統合とソリューション設計 | 16% |
| CCAO-F | 5 | Configuration and Knowledge Management | 設定とナレッジ管理 | 12% |
| CCAO-F | 6 | Governance, Risk, and Responsible Use | ガバナンス、リスク、責任ある利用 | 15% |
| CCAO-F | 7 | Troubleshooting and Optimization | トラブルシューティングと最適化 | 10% |
| CCDV-F | 1 | Agents and Workflows | エージェントとワークフロー | 14.7% |
| CCDV-F | 2 | Applications and Integration | アプリケーションと統合 | 33.1% |
| CCDV-F | 3 | Claude Code | Claude Code | 3.1% |
| CCDV-F | 4 | Eval, Testing, and Debugging | 評価、テスト、デバッグ | 2.6% |
| CCDV-F | 5 | Model Selection and Optimization | モデルの選択と最適化 | 16.8% |
| CCDV-F | 6 | Prompt and Context Engineering | プロンプト・コンテキストエンジニアリング | 11.0% |
| CCDV-F | 7 | Security and Safety | セキュリティと安全性 | 8.1% |
| CCDV-F | 8 | Tools and MCPs | ツールと MCP | 10.6% |

### CCDV-F の問題ID
| 出典 | ID |
|---|---|
| practice（35） | DV001–DV035 |
| mock1（15） | DV036–DV050 |
| mock2（15） | DV051–DV065 |
| mock3（15） | DV066–DV080 |
| original 難化版（20） | DV081–DV100 |
| original 新規（20） | DV101–DV120 |

---

## 依頼文（要点）

### 守ること（既存データの互換性）
- 既存の CCAO-F の問題ID（Q001〜Q100）、問題の内容、出典別JSONの中身は変更しない
- localStorage のキー（ccaof-quiz:v1）は変えない。schemaVersion を 2 に上げ、MIGRATIONS に 1→2 を追加する。v1 のデータは CCAO-F の記録として引き継ぐ。v1 形式のエクスポートファイルもインポートできる
- CCDV-F の問題IDは CCAO-F と重ならない

### Phase 1：複数試験への対応（アプリ側）
- 試験ごとの情報（コード、表示名（日英）、ドメイン（番号・英語名・日本語名・配点）、問題ファイルのパス）を1ファイルにまとめる。quiz.js の DOMAINS / DOMAIN_IDS は選択中の試験の定義から取る。試験を追加するときは定義と問題ファイルを足すだけで済む構成にする
- 出典別JSONを試験ごとのフォルダに分ける。公開用の結合ファイルも試験ごとに分け、アプリは選んだ試験のファイルだけを読み込む。npm run merge / validate は全試験をまとめて処理する
- 画面：最初に試験選択画面（試験名、問題数、自分の進捗）。前回の試験を覚えておく。どの画面からでも試験を切り替えられる。出題設定・問題一覧・成績・リセットは選んでいる試験だけが対象。リセットは「この試験の記録だけ」「すべての記録」（確認付き）。進行中のクールがあるときに試験を切り替えたら確認する（クールは試験ごとに1つ）。出題設定は試験ごとに覚える。CCDV-F の出典の絞り込みは original を「難化版」「新規」に分ける。UI文言は i18n に日英を追加する
- 完了条件：CCAO-F が今までどおり動く。v1 の保存データを読み込んで CCAO-F の記録が残っている。CCDV-F を選ぶと、問題がまだない旨を表示して止まらない

### Phase 2：CCDV-F の問題データ（合計120問）
| 出典 | URL | 問題数 |
|---|---|---|
| practice | https://amey-thakur.github.io/CLAUDE-CERTIFICATIONS/developer-foundations/practice-questions.html | 35 |
| mock1 | https://amey-thakur.github.io/CLAUDE-CERTIFICATIONS/developer-foundations/mock-exam-1.html | 15 |
| mock2 | https://amey-thakur.github.io/CLAUDE-CERTIFICATIONS/developer-foundations/mock-exam-2.html | 15 |
| mock3 | https://amey-thakur.github.io/CLAUDE-CERTIFICATIONS/developer-foundations/mock-exam-3.html | 15 |
| original（難化版） | — | 20 |
| original（新規） | — | 20 |

- 件数が違っていたら取り込む前に報告する。原文は GitHub（developer-foundations/*.md）を優先する。取り込みのルールは CCAO-F と同じ（本文・選択肢・正解は変えず日本語訳を追加。mock は Answer key 表から番号で対応付け。解説で触れていない誤答は【補足】/ [Supplement] で追記）
- 参考資料：試験範囲 https://amey-thakur.github.io/CLAUDE-CERTIFICATIONS/developer-foundations/index.html 、公式試験ガイド（PDF）、Claude Code のドキュメント https://code.claude.com/docs/ja/overview 、Claude API は https://docs.claude.com 。取得できない場合は推測で埋めず知らせる

#### オリジナル問題の共通ルール（40問すべて）
- 問題文は CCDV-F の mock 1〜3 の問題文の平均の約2倍（英語の文字数で 1.7〜2.5 倍）。作成前に mock の平均文字数を測って報告する。長くするのは状況設定（チームの構成、使っているモデルや機能、制約、試したこと、起きた症状）を具体的にするためで、水増ししない。「あなたは〜です。」のように回答者の立場を設定した問題を含める
- 4つの選択肢の長さをそろえる（英語の文字数で最長と最短の差が 20% 以内）。正解だけが長い・詳しい・慎重、という手がかりを作らない。always / never / only を誤答だけに使わない
- 誤答は、それぞれ問題文の制約や状況の1点だけを満たさない、もっともらしい対応にする。一般論としては正しいがこの状況では最善でない選択肢を必ず含める。「すべて正しい」「どれも誤り」は使わない。正解位置を偏らせない。40問中6問程度は複数選択（正解2つ、Choose two / 2つ選べ）
- 1問で問う論点は1つ。公式ガイドとドキュメントで確認できない仕様を正解の根拠にしない。確認したページを問題ごとに PROGRESS.md に記録する
- 解説は正解の理由と、各誤答がこの状況でなぜ誤りか（問題文のどの条件に合わないか）を日英で書く

#### 難化版（20問）
- practice / mock の80問から20問を選び、論点は同じまま共通ルールで難しくする。言い換えではなく状況設定を変え、元の答えを覚えていても解けないようにする（正解位置や選択肢の構成も変える）。元と同じドメイン。based_on に元のIDを記録する

#### 新規（20問）
- 80問と難化版20問のどれとも論点が重ならない。120問全体のドメイン別件数が配点比率に近づくように配分する

#### ステップ（各ステップで止まって報告）
1. practice 2. mock1 3. mock2 4. mock3 5. オリジナルの計画（mock 平均文字数、難化版20問と論点、新規20問の論点とドメイン配分、複数選択の問題）→ 承認後に作成 6. 難化版（10問ずつ2回） 7. 新規（10問ずつ2回） 8. merge と validate
- 報告には件数とドメイン別件数。オリジナルでは問題文の長さ（mock 平均との倍率）と選択肢の長さの差も示す

### Phase 3：検証・テスト・ドキュメント
- validate：出典別件数（CCAO-F 35/15/15/15/20、CCDV-F 35/15/15/15/40）、試験をまたいだ ID 重複、domain の範囲、based_on の参照先（存在・同じ試験・同じドメイン）、CCDV-F original の長さ・選択肢の差・正解が最長の割合・正解位置の分布（警告として一覧表示）、ドメイン別件数と配点比率の差
- テスト：試験ごとの絞り込み、v1→v2 変換と v1 ファイルのインポート、試験ごとのリセットが他の試験の記録を消さない、既存テストがすべて通る
- README（対応試験、試験の追加方法、フォルダ構成）、THIRD_PARTY_NOTICES（developer-foundations も同じリポジトリ由来）、フッターの出典表示、アプリのタイトル・package.json の name
- スキル：quiz-question-writer、question-data-check、react-conventions、ja-en-translation を更新する

### 中断・再開
- 「続けて」と送られたら、PROGRESS.md と作成済みファイルを確認して未完了の箇所から再開する。作成済みの問題を作り直したり重複させたりしない
- 1回の応答で終えられない場合は、きりの良い問題番号で区切って保存し、PROGRESS.md を更新してから止まる

### 完了条件
- 最初に試験を選び、選んだ試験の問題だけで 5/10/20 問のクールが最後まで動く
- CCAO-F の既存の学習記録が引き継がれている
- 試験ごとに成績・問題一覧・リセットが独立している
- npm run validate がエラーなしで通り、CCDV-F のオリジナルの警告が一覧で確認できる
- npm test と npm run build が通る
