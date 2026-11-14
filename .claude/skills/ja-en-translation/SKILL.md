---
name: ja-en-translation
description: 問題文・選択肢・解説・UI文言を英語⇔日本語に翻訳するときに使う。用語集と訳し方のルールで訳語を統一する。
---

# 翻訳ルール

## 基本方針
- 取り込んだ問題の英語原文は変更しない。日本語訳を追加するだけ
- 直訳より、日本の受験者が意味を取り違えない自然な日本語を優先する
- ただし、正解・誤答の判断に関わる限定語（first, most, always, only, never など）は訳から落とさない
- 文体は「です・ます」調。選択肢は体言止めまたは「〜する」で統一する
- 問題文中の選択肢記号（A〜D）は訳さない

## 用語集
### 英語のまま使う（Claudeの機能名・モデル名）
Claude, Anthropic, Projects, Artifacts, Research, Memory, Skills, Connectors,
Haiku, Sonnet, Opus, Claude Code, API, temperature

### 訳語を固定する
| 英語 | 日本語 |
|---|---|
| prompt | プロンプト |
| system prompt | システムプロンプト |
| context window | コンテキストウィンドウ |
| Project（機能名、単数でも） | Project |
| knowledge (Project knowledge) | ナレッジ（Project のナレッジ） |
| instructions (Project instructions) | 指示（Project の指示） |
| hallucination | ハルシネーション |
| fabricate / fabrication | 捏造する / 捏造 |
| verify / verification | 検証する / 検証 |
| human review | 人によるレビュー |
| escalate / escalation | エスカレーションする / エスカレーション |
| stakeholder | ステークホルダー |
| workflow | ワークフロー |
| anonymize | 匿名化する |
| pseudonymize | 仮名化する |
| personal data | 個人データ |
| policy (organizational) | （組織の）ポリシー |
| accountability | 説明責任 |
| decompose / decomposition | 分解する / タスク分解 |
| output | 出力 |
| domain（試験の） | ドメイン |

### CCDV-F で使う用語（開発者向け）
英語のまま使う：Messages API、Message Batches API、Batches API、Files API、Claude Agent SDK、Claude Managed Agents、Claude Code、Skill / Skills、MCP、SDK、Webhook、JSON、XML、CI、および API のフィールド名・パラメータ名・値（stop_reason、max_tokens、tool_use、tool_result、tool_use_id、is_error、custom_id、cache_control、usage、input_tokens、effort、budget_tokens、"end_turn" など）、ファイル名・コマンド（CLAUDE.md、CLAUDE.local.md、.mcp.json、.claude/skills、.claude/agents、/clear、-p、--output-format など）

| 英語 | 日本語 |
|---|---|
| tool use | ツール使用 |
| tool result | ツールの結果（フィールドを指すときは tool_result） |
| tool call / call a tool | ツール呼び出し / ツールを呼び出す |
| parallel tool use | 並列のツール呼び出し |
| tool description | ツールの説明 |
| agent loop / agentic loop | エージェントループ |
| subagent | サブエージェント |
| delegate / delegation | 委任する / 委任 |
| handoff | 引き継ぎ |
| orchestration | オーケストレーション |
| deterministic / non-determinism | 決定的な / 非決定性 |
| workflow（agent と対比） | ワークフロー |
| hook | フック（イベント名は PreToolUse などそのまま） |
| slash command | スラッシュコマンド |
| print mode / headless | print モード / ヘッドレス |
| plan mode | プランモード |
| scope（MCP の local / project / user） | ローカルスコープ / プロジェクトスコープ / ユーザースコープ |
| prompt caching / cache breakpoint | プロンプトキャッシュ / ブレークポイント |
| prefix | プレフィックス |
| cache hit / cache read | キャッシュヒット / キャッシュの読み取り |
| batch processing | バッチ処理 |
| streaming | ストリーミング |
| delta / partial JSON | デルタ / 部分的な JSON |
| stop reason | 停止理由 |
| time to first token | 最初のトークンまでの時間 |
| latency | レイテンシ |
| rate limit | レート制限 |
| exponential backoff / jitter | 指数バックオフ / ジッター |
| retry | 再試行 |
| idempotency / idempotency key | 冪等性 / 冪等キー |
| queue / worker | キュー / ワーカー |
| context engineering | コンテキストエンジニアリング |
| context bloat / drift | コンテキストの肥大化 / ドリフト |
| compaction | 圧縮（コンパクション） |
| context editing | context editing（機能名のまま） |
| extended thinking / adaptive thinking | 拡張思考（extended thinking）/ adaptive thinking |
| few-shot / zero-shot | Few-shot / Zero-shot |
| structured output | 構造化出力 |
| schema / strict tool use | スキーマ / strict tool use |
| citations | 引用（citations） |
| token counting | トークンカウント |
| vision / image block | 画像入力 / 画像ブロック |
| evaluation / eval / held-out set | 評価 / 評価セット / ホールドアウトセット |
| regression suite | 回帰テストのスイート |
| trace | トレース |
| retrieval layer | 検索層 |
| prompt injection | プロンプトインジェクション（文脈が明らかなら「インジェクション」） |
| jailbreak | ジェイルブレイク |
| untrusted input / content | 信頼できない入力 / コンテンツ |
| least privilege | 最小権限 |
| guardrail | ガードレール |
| allowlist | 許可リスト |
| escape / sanitize | エスケープする / サニタイズする |
| secrets manager | シークレットマネージャー |
| rotate (a key) | （キーを）ローテーションする |
| workspace | ワークスペース |
| model version pinning / snapshot / alias | モデルのバージョンの固定 / スナップショット / エイリアス |
| deprecation / retirement | 非推奨化 / 提供終了 |
| self-host | セルフホストする |
| sandbox | サンドボックス |

### 試験のドメイン名（src/exams.js と同じ）
| 試験 | 英語 | 日本語 |
|---|---|---|
| CCAO-F | Prompting and Task Execution | プロンプトとタスク実行 |
| CCAO-F | Output Evaluation and Validation | 出力の評価と検証 |
| CCAO-F | Product and Model Selection | 製品とモデルの選択 |
| CCAO-F | Workflow Integration and Solution Design | ワークフロー統合とソリューション設計 |
| CCAO-F | Configuration and Knowledge Management | 設定とナレッジ管理 |
| CCAO-F | Governance, Risk, and Responsible Use | ガバナンス、リスク、責任ある利用 |
| CCAO-F | Troubleshooting and Optimization | トラブルシューティングと最適化 |
| CCDV-F | Agents and Workflows | エージェントとワークフロー |
| CCDV-F | Applications and Integration | アプリケーションと統合 |
| CCDV-F | Claude Code | Claude Code |
| CCDV-F | Eval, Testing, and Debugging | 評価、テスト、デバッグ |
| CCDV-F | Model Selection and Optimization | モデルの選択と最適化 |
| CCDV-F | Prompt and Context Engineering | プロンプト・コンテキストエンジニアリング |
| CCDV-F | Security and Safety | セキュリティと安全性 |
| CCDV-F | Tools and MCPs | ツールと MCP |
| CCAR-F | Agentic Architecture & Orchestration | エージェントのアーキテクチャとオーケストレーション |
| CCAR-F | Tool Design & MCP Integration | ツール設計と MCP 統合 |
| CCAR-F | Claude Code Configuration & Workflows | Claude Code の設定とワークフロー |
| CCAR-F | Prompt Engineering & Structured Output | プロンプトエンジニアリングと構造化出力 |
| CCAR-F | Context Management & Reliability | コンテキスト管理と信頼性 |
| CCAR-P | Solution Design & Architecture | ソリューション設計とアーキテクチャ |
| CCAR-P | Claude Models, Prompting & Context Engineering | Claude のモデル、プロンプト、コンテキストエンジニアリング |
| CCAR-P | Integration | 統合 |
| CCAR-P | Evaluation, Testing & Optimization | 評価、テスト、最適化 |
| CCAR-P | Governance, Safety & Risk Management | ガバナンス、安全性、リスク管理 |
| CCAR-P | Stakeholder Communication & Lifecycle Management | ステークホルダーとのコミュニケーションとライフサイクル管理 |
| CCAR-P | Developer Productivity & Operational Enablement | 開発者の生産性と運用の支援 |

### Architect で使う用語
| 英語 | 日本語 |
|---|---|
| coordinator / orchestrator | コーディネーター / オーケストレーター |
| observability | 可観測性 |
| retrieval-augmented generation / RAG | 検索拡張生成（RAG）。以降は RAG |
| service-level agreement / SLA | サービスレベル合意（SLA）。以降は SLA |
| progressive discovery | 段階的な発見 |
| chunking | チャンク分割 |
| embedding | 埋め込み |
| de-identification | 非識別化 |
| protected health information / PHI | 保護対象の保健情報（PHI） |
| tokenize (identifiers) | トークン化する |
| data residency | データの所在 |
| control plane | コントロールプレーン |
| rubric | ルーブリック |
| compensating control | 補完的な制御 |
| cross-cutting concerns | 横断的な関心事 |

オーケストレーション、構造化出力、Few-shot、コンテキストエンジニアリングなどは上の共通表の訳語をそのまま使う。問題とシナリオのタイトル・本文を日英でそろえ、出典から取り込む英語は変更しない。

## 新しい用語が出たとき
- 上の表にない専門用語は、訳語案を提示してから使う
- 採用した訳語はこの用語集に追記する

## UI文言
- UI文言は i18n 辞書に ja / en の両方を必ず登録する
- ボタンは短く（例：「次へ」「回答する」「復習する」）
