# Claude 認定試験 練習問題アプリ

Claude の認定試験の練習用に作った、1問1答形式の Web アプリです。日本語と英語に対応しています。ブラウザだけで動き、サーバーやデータベースは使いません。

非公式の練習アプリであり、Anthropic とは関係ありません。問題の一部は Amey Thakur 氏の [CLAUDE-CERTIFICATIONS](https://github.com/Amey-Thakur/CLAUDE-CERTIFICATIONS)（MIT License）に由来します。著作権表示とライセンス本文は [public/THIRD_PARTY_NOTICES.txt](public/THIRD_PARTY_NOTICES.txt) にあり、公開したサイトのフッターからも参照できます。

## 対応している試験

| 試験 | コード | 問題数 | 内訳 |
|---|---|---|---|
| Claude Certified Associate – Foundations | CCAO-F | 100問（Q001〜Q100） | サイト由来 80問、オリジナル 20問 |
| Claude Certified Developer – Foundations | CCDV-F | 120問（DV001〜DV120） | サイト由来 80問、オリジナル 40問（難化版 20問・新規 20問） |

CCDV-F の「難化版」は、サイトの問題と同じ論点で状況設定を変えて難しくした問題、「新規」はサイトの問題と論点が重ならない問題です。

## 使い方

### アクセス

**https://itshiban.github.io/claude_cert_prac_public/** をブラウザで開くだけで使えます。登録やログインは不要で、パソコンでもスマートフォンでも利用できます。右上のボタンで日本語と英語を切り替えられます。

### 学習方法

1. **試験を選ぶ**：開くと最初に試験の選択画面が出ます。前回選んだ試験は枠で強調されます。学習中もヘッダーの「試験を切り替え」で戻れます
2. **ホームで条件を選んで「開始」**：出題数（5 / 10 / 20問）、出題モード、ドメイン、出典を選びます。設定は試験ごとに保存されます
3. **1問ずつ回答**：回答するとすぐに正誤と解説が表示されます。「2つ選べ」の問題は、2つとも合っていれば正解です
4. **結果画面で復習**：最後にスコアと全問題の解説を確認できます

出題モードは「ランダム」「未回答のみ」「不正解のみ」の3種類です。まず「未回答のみ」で全問をひととおり解き、そのあと「不正解のみ」でまちがえた問題を繰り返すと効率的です。苦手な分野は「成績」画面のドメイン別正答率で確認できます。問題一覧・成績・リセットは、選んでいる試験の記録だけが対象です。

### 学習記録の保存

- 記録は、使っているブラウザに自動で保存されます（サーバーには送信されません）。同じブラウザで開けば、続きから学習できます
- 別の端末やブラウザには引き継がれず、ブラウザの閲覧データを削除すると消えます。バックアップや端末の移行には、設定画面の「エクスポート」と「インポート」を使います（CCAO-F だけだったころのエクスポートファイルも読み込めます）
- 設定画面のリセットは「この試験の記録だけ」と「すべての試験の記録」を選べます

---

以下は、アプリを改修・運用する人向けの情報です。

## ローカルで動かす

Node.js 20 以上（LTS 推奨）が必要です。

```bash
npm install
npm run dev
```

http://localhost:5173/claude_cert_prac_public/ で開けます。

同じ Wi-Fi のスマートフォンから確認したいときは、`npm run dev:lan` で起動し、表示される Network の URL を開きます。同じネットワーク内の誰でも開ける状態になるので、確認が終わったら止めてください。

## テストと問題データの検証

```bash
npm test           # Vitest（採点・出題・試験ごとの絞り込み・保存・データ検証）
npm run validate   # 全試験の問題データ（public/questions/*.json）の検証
```

`validate` は試験ごとに、出典別件数、ID の重複（試験をまたいだ重複も含む）、ドメインの範囲、日英の欠落、based_on の参照先などを確かめ、エラーがあれば終了コード1で止まります。CCDV-F のオリジナル問題は、作成ルール（問題文の長さ、選択肢の長さの差、正解が最長の選択肢になっている割合、正解位置の分布）から外れたものを**警告**として一覧表示します（エラーにはしません）。

## 問題データのフォルダ構成

```
data/questions/                 # 出典別の問題データ（編集するのはこちら）
├── ccao-f/
│   ├── practice.json           # Q001〜Q035
│   ├── mock1.json / mock2.json / mock3.json   # Q036〜Q080
│   └── original.json           # Q081〜Q100
└── ccdv-f/
    ├── practice.json           # DV001〜DV035
    ├── mock1.json / mock2.json / mock3.json   # DV036〜DV080
    └── original.json           # DV081〜DV100（難化版）、DV101〜DV120（新規）
public/questions/               # npm run merge で生成（直接編集しない）
├── ccao-f.json / ccdv-f.json   # 試験ごとの結合ファイル。アプリは選んだ試験のファイルだけを読み込む
└── index.json                  # 試験ごとの問題数（試験選択画面で使う）
```

## 問題の追加方法

1. `data/questions/<試験>/` の該当ファイル（新しい独自問題なら `original.json`）に、次の形式で1問を追加します。

   ```json
   {
     "id": "DV121",
     "source": "original",
     "source_url": null,
     "source_number": null,
     "based_on": null,
     "domain": 2,
     "type": "single",
     "question": { "en": "...", "ja": "..." },
     "choices": [
       { "key": "A", "en": "...", "ja": "..." },
       { "key": "B", "en": "...", "ja": "..." },
       { "key": "C", "en": "...", "ja": "..." },
       { "key": "D", "en": "...", "ja": "..." }
     ],
     "answer": ["A"],
     "explanation": { "en": "...", "ja": "..." }
   }
   ```

   - `id`：試験をまたいで重複しない値（CCAO-F は `Q`、CCDV-F は `DV` で始める）
   - `source`：practice / mock1 / mock2 / mock3 / original
   - `based_on`：CCDV-F の original にだけ付ける。難化版は元の問題の ID、新規は null。ほかの問題には付けない
   - `exam`：書かない（`npm run merge` がフォルダ名から付ける）
   - `domain`：その試験のドメイン番号（CCAO-F は 1〜7、CCDV-F は 1〜8。[src/exams.js](src/exams.js) を参照）
   - `type`：single（正解1つ）/ multiple（正解2つ。問題文に「(Choose two.)」「（2つ選べ）」を入れる）
   - 解説で選択肢に触れるときは `(B)`、`(B, C)`、`**B**` の形式で書きます。表示時に表示番号へ置き換わります

2. 結合して検証します。

   ```bash
   npm run merge      # data/questions/<試験>/*.json → public/questions/<試験>.json と index.json
   npm run validate
   ```

   問題数を増やす場合は、[src/exams.js](src/exams.js) のその試験の `expectedSources` も更新してください。

## 試験の追加方法

1. [src/exams.js](src/exams.js) の `EXAMS` に1項目追加します（試験コード、表示名、問題ファイルのパス、出典のリンク、ドメインと配点、出典グループ、出典別の件数）
2. `data/questions/<試験のキー>/` を作り、出典別の JSON を置きます
3. `npm run merge` と `npm run validate` を実行します

アプリの画面・出題・保存データは `EXAMS` を参照して動くので、コードの変更は不要です。保存データには追加した試験の記録が自動で補われ、既存の学習記録はそのまま残ります。UI に新しい文言が必要な場合だけ [src/i18n.js](src/i18n.js) に日英を追加します。

## 保存データ

localStorage のキー `ccaof-quiz:v1` に、次の形で保存します（キーは CCAO-F 専用だったころのまま）。

```json
{
  "schemaVersion": 2,
  "lang": "ja",
  "currentExam": "ccao-f",
  "exams": {
    "ccao-f": { "settings": {}, "statuses": {}, "history": [], "currentSession": null },
    "ccdv-f": { "settings": {}, "statuses": {}, "history": [], "currentSession": null }
  }
}
```

schemaVersion 1（CCAO-F だけの記録）のデータやエクスポートファイルは、読み込み時に [src/storage.js](src/storage.js) の `MIGRATIONS` で v2 に変換し、CCAO-F の記録として引き継ぎます。

## デプロイ（GitHub Pages）

`.github/workflows/deploy.yml` で、次のように動きます。

- すべてのブランチへの push で `npm test` → `npm run validate` → `npm run build` を実行します
- `main` への push（または Actions 画面からの手動実行）のときだけ、ビルド結果を GitHub Pages に公開します。リポジトリが Private の間は、公開のジョブは自動でスキップされます

初回だけ、GitHub で次の設定が必要です。

1. リポジトリを Public にする（Settings > General > Danger Zone > Change visibility）。無料プランでは Private のリポジトリから Pages を公開できません
2. Settings > Pages の Source を「GitHub Actions」にする
3. `main` に push するか、Actions 画面から「Test, build and deploy」を手動実行する

リポジトリ名を変える場合は、`vite.config.js` の `base`（現在は `/claude_cert_prac_public/`）も同じ名前に変えてください。

## ディレクトリ構成

```
├── index.html
├── package.json
├── vite.config.js              # base: /claude_cert_prac_public/
├── public/questions/           # アプリが読み込む問題データ（npm run merge で生成）
├── src/
│   ├── main.jsx
│   ├── App.jsx                 # 状態の保持、画面の切替、保存の呼び出し
│   ├── exams.js                # 試験の定義（ドメイン・配点・問題ファイル・出典）
│   ├── i18n.js                 # UI 文言の辞書（ja / en）
│   ├── quiz.js                 # 出題・採点・集計（React に依存しない）
│   ├── storage.js              # localStorage の読み書き、スキーマ確認と変換、インポートの検証
│   ├── components.jsx          # 複数の画面で使う部品
│   ├── screens/                # ExamSelect / Home / Quiz / Result / List / Stats / Settings
│   └── styles.css
├── data/questions/<試験>/      # 出典別の問題データ（編集するのはこちら）
├── scripts/
│   ├── merge-questions.mjs     # npm run merge
│   └── validate-questions.mjs  # npm run validate
├── tests/                      # Vitest
├── docs/                       # 要件、作り直しの手順書、複数試験対応の手順書
└── .github/workflows/deploy.yml
```
