---
name: question-data-check
description: 問題データ（data/questions/<試験>/ の出典別JSON や public/questions/*.json）を追加・修正したときに使う。結合・検証スクリプトの実行と結果の確認手順を定める。
---

# 問題データの検証手順

## いつ実行するか
- 問題を追加・修正・翻訳したあと
- 問題データを含む変更をコミットする前

## 手順
1. 編集するのは `data/questions/<試験>/` の出典別JSON（public/questions/ は直接編集しない）
2. `npm run merge` を実行し、全試験の public/questions/<試験>.json と index.json を更新する
3. `npm run validate` を実行する（全試験をまとめて検証する）
4. 試験ごとに、以下がすべて満たされているか確認する
   - 出典別件数（期待値は src/exams.js の expectedSources）
     - CCAO-F：practice 35 / mock1 15 / mock2 15 / mock3 15 / original 20、合計100
     - CCDV-F：practice 35 / mock1 15 / mock2 15 / mock3 15 / original 40、合計120
   - CCAR-F・CCAR-P：practice 35 / mock1 15 / mock2 15 / mock3 15 / original 40、各120
   - scenario_id：結合ファイルには必須。null または同じ試験のシナリオID。別試験への参照・空文字・不正な型はエラー
   - シナリオ：ID重複なし、日英のタイトルと本文・出典・URL・注記あり、少なくとも1問から参照される。シナリオなしの試験の公開ファイルは空配列
   - ID 重複なし（試験の中と、試験をまたいだ重複の両方）
   - exam がフォルダ名と一致している
   - answer がすべて choices の key に存在する
   - single は answer 1つ、multiple は answer 2つ（multiple は問題文に Choose two / 2つ選べ）
   - question / choices / explanation に en と ja の欠落がない
   - domain がその試験のドメイン番号の範囲内（CCAO-F 1〜7、CCDV-F 1〜8、CCAR-F 1〜5、CCAR-P 1〜7）
   - 解説の選択肢記号（(B) / (B, C) / **B**）が英日で一致している
   - based_on：CCDV-F・CCAR-F・CCAR-P の original には必須（難化版は元の ID、新規は null）。参照先が同じ試験に存在し、original ではなく、同じドメインである。それ以外の問題には付いていない
5. ドメイン別件数と配点比率の差を確認し、差が大きいドメインがあれば報告する
6. CCDV-F・CCAR-F・CCAR-P のオリジナル問題の警告一覧を確認する（エラーにはならない）
   - 問題文の長さが mock 平均の 1.7〜5.0 倍の範囲外
   - 選択肢の長さの差が 20% 超
   - 正解が単独で最長の選択肢になっている問題の割合が 30% 超
   - 正解位置 A〜D のいずれかが 15% 未満または 35% 超
7. `npm test` も実行する（データ検証と、試験ごとの問題ファイルのテストを含む）

## エラーが出たとき
- エラー内容と該当IDを報告する
- 取り込み問題（original 以外）の本文・正解は勝手に直さない。原文と照合して、取り込みミスか確認してから修正する
- 修正後は再度 merge と validate を実行し、エラーがなくなるまで繰り返す
- 問題数を増やす場合は src/exams.js の expectedSources も更新する
- 警告は、意図したものか（例：状況設定に必要な長さ）を確認し、意図しないものは問題を直す

## 報告の形式
- 試験ごとに、合計件数、出典別件数、ドメイン別件数（比率付き）、エラー件数、警告件数を短く表で示す
