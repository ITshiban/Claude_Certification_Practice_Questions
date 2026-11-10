---
name: quiz-question-writer
description: Claude 認定試験（CCAO-F / CCDV-F など）の練習問題を新規作成・追加するときに使う。スキーマ準拠、試験ごとのドメイン配分、誤答設計、重複回避、CCDV-F のオリジナル問題（難化版・新規）のルールを定める。
---

# 練習問題の作成ルール

## 共通
### スキーマ
- `data/questions/<試験>/` の出典別JSON（新しい独自問題は original.json）に追加し、スキーマは README の「問題の追加方法」に従う
- source は original、source_url と source_number は null。exam は書かない（merge がフォルダ名から付ける）
- ID は試験をまたいで重複させない（CCAO-F は Q、CCDV-F は DV で始める）
- question / choices / explanation は必ず en と ja の両方を持つ
- 試験のドメイン・配点・出典別件数は [src/exams.js](../../../src/exams.js) が正。ここに書かれた数値と食い違ったら exams.js に従う

### 問題の作り方
- シナリオ型にする（業務上の状況 → 最も適切な対応を問う）
- 4択、正解は1つ（single）。multiple の場合は正解2つで「Choose two / 2つ選べ」と明記
- 誤答は「もっともらしいが、設問の制約を満たさない」ものにする
  - 例：検証せずに信頼する、モデルの自己申告を根拠にする、大きいモデルに替えれば解決すると考える、プロンプト内の指示を制御とみなす
- 正解の位置（A〜D）が偏らないようにする

### 範囲と正確性
- 公式試験ガイドと公式ドキュメントで確認できない製品仕様・料金・制限値を、正解の根拠にしない
- 作成前に既存問題を確認し、論点の単純な言い換えは作らない
- 作成前に既存問題のドメイン別件数を集計し、目標件数との差から配分案を提示して承認を得る

## 試験ごとのドメイン
### CCAO-F（Claude Certified Associate – Foundations）
1. Prompting and Task Execution 14% / 2. Output Evaluation and Validation 21% / 3. Product and Model Selection 12% / 4. Workflow Integration and Solution Design 16% / 5. Configuration and Knowledge Management 12% / 6. Governance, Risk, and Responsible Use 15% / 7. Troubleshooting and Optimization 10%
- 独自問題（original）20問のうち5問程度を multiple にする
- 解説：正解の理由を1〜2文、各誤答がなぜ誤りかを1文ずつ

### CCDV-F（Claude Certified Developer – Foundations）
1. Agents and Workflows 14.7% / 2. Applications and Integration 33.1% / 3. Claude Code 3.1% / 4. Eval, Testing, and Debugging 2.6% / 5. Model Selection and Optimization 16.8% / 6. Prompt and Context Engineering 11.0% / 7. Security and Safety 8.1% / 8. Tools and MCPs 10.6%
- 参考資料：公式試験ガイド（出典リポジトリの developer-foundations/exam-guide.pdf）、Claude Code のドキュメント（https://code.claude.com/docs/ja/overview）、Claude API のドキュメント（https://platform.claude.com/docs 。docs.claude.com から転送される）
- 取得できないページや PDF は推測で埋めず、ユーザーに知らせる

## CCDV-F のオリジナル問題の共通ルール
### 文章量
- 問題文は mock1〜3 の問題文の平均（英語 97.7 文字）の 1.7〜5.0 倍（目標は 2.5〜4 倍）。npm run validate が基準外を警告する
- 長くするのは状況設定（チームの構成、使っているモデルや機能、制約、試したこと、起きた症状）を具体的にするため。論点と関係のない水増しはしない
- 約半数は「あなたは〜です。」（例：CCDV-F の資格を持つ開発リード、AI エンジニア）のように回答者の立場を設定する

### 選択肢
- 4つの選択肢の英語の文字数をそろえる（(最長 − 最短) ÷ 最長 が 20% 以内）
- 正解だけが長い・詳しい・慎重な言い回しにならないようにする。正解が単独で最長の選択肢になる問題は全体の 30% 以下（実績は 0%）。下書きの段階で長さを測り、該当すれば調整する
- always / never / only のような強い言葉を誤答だけに使わない
- 誤答は、それぞれ問題文の制約や状況の1点だけを満たさない、もっともらしい対応にする。一般論としては正しいがこの状況では最善でない選択肢を必ず1つ含める
- 「すべて正しい」「どれも誤り」は使わない
- 正解位置 A〜D はそれぞれ全体の 15〜35% に収める
- 40問中6問程度を multiple にする

### 論点と根拠
- 1問で問う論点は1つ。文章を長くしても論点をぶらさない
- 正解の根拠にした公式ドキュメントのページを、問題ごとに PROGRESS.md に記録する
- 仕様の更新が多い領域（モデル、思考、ベータ機能）は作成時に最新のページで確認する。例：拡張思考（budget_tokens）はレガシー機能で 4.7 以降のモデルでは使えない、新しいモデルでは <thinking> タグで推論を書かせる指示が断られる場合がある

### 解説
- 正解の理由と、各誤答がなぜこの状況では誤りか（問題文のどの条件に合わないか）を日英の両方で書く

### 難化版
- practice / mock の問題から選び、論点とドメインは元の問題と同じにする
- 言い換えではなく状況設定を変え、元の答えを覚えていても解けないようにする。正解の位置と選択肢の構成も変える
- based_on に元の問題の ID を記録する（npm run validate が参照先・同じ試験・同じドメインを確かめる）

### 新規
- サイトの問題と難化版のどれとも論点が重ならないようにする。based_on は null
- 試験全体のドメイン別件数が配点比率に近づくように配分する

## 作成後
- question-data-check の手順で検証する
