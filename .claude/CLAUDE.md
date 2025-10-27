# AI-facing only（人間向け説明は含めない）
# layers: MUST（変更不可） / PROJECT（各プロジェクトで上書き可）

<must.behavior>
- すべて日本語で回答する。
- ユーザの指示に対する翻訳・Web検索は英語で実行する。
- main/develop への直接コミットは禁止。
- 既存コードを削除してエラー解消してはならない（型エラー等でも削除禁止）。
- 設定ファイル（package.json/tsconfig/eslint/docker/.env 等）は明示指示がある場合のみ変更可。
- 目的達成に必要な最小限の変更に限定する（過剰な抽象化や不要な修正を避ける）。
- ボーイスカウトルール：実装箇所のコードは見つけた時よりも良い状態で残す（リファクタリング推奨）。
</must.behavior>

<must.error-handling> 
- エラーは抑制（@ts-ignore、try-catchで握りつぶす等）ではなく根本原因を修正。
- 外部API/ネットワーク通信は必ず失敗を考慮したエラーハンドリングを実装。
- 早期リターン（early return）を活用してネストを減らす。
</must.error-handling>

<must.code-quality>
- 使用されていないコード（デッドコード）は削除。
- 重複を避け単一の信頼できる情報源を維持（DRY原則）。
- 意味のある変数名・関数名で意図を明確に伝える。
- コメントは「なぜ（WHY）」を説明し、「何を（WHAT）」はコードで表現。
</must.code-quality>

<must.security>
- 個人情報/顧客情報/機密情報を外部送信しない。
- 外部送信機能（Ask AI/ファイルアップロード等）は顧客コードでは無効化。
- 生成物は必ず人間のレビューを経て採用する。
- APIキー・パスワード等は環境変数で管理（ハードコード禁止）。
- すべての外部入力を検証（サニタイズ）。
</must.security>

<must.change-guard>
- 既存ファイル50行超または5ファイル超の変更は着手前に要確認。
- 依存関係（dependencies/devDependencies）の追加/削除は要確認。
</must.change-guard>

<project.git>
- commit: `<type>(<scope>): <説明>`（type: feat/fix/docs/style/refactor/perf/test/build/ci/chore）
- 説明は変更の理由と影響を明確に（英語推奨）。
- コミットは原子的で単一の変更に焦点を当てる。
- scope 例: frontend/backend/infra/shared/config
- branch: `<type>/<scope>-<description>`
- すべての変更は適切なブランチで実施し、developへはPRを経由してマージ。
</project.git>

<project.testing>
- テストをスキップせず、問題があれば修正する。
- テスト間の依存を避け任意の順序で実行可能に。 
- AAA パターン（Arrange/Act/Assert）を推奨。
</project.testing>

<project.pull-request> 
- 変更内容を明確に説明する。
- レビューしやすい単位に分割する。
- テストが通ることを確認する。
- 自己レビューを実施してから提出する。
</project.pull-request>

<project.imports>
- `@shared` はリポジトリ直下の `shared` を指す。
- backend 内共通は相対パス参照。
# ↑プロジェクト構成に合わせてこのブロックを下位の CLAUDE.md で上書きしてよい
</project.imports>

<project.db>
- マイグレーションの手動 `.sql` 作成/編集は禁止（スキーマ定義 → 自動生成 → migrate）。
- すべての CREATE/UPDATE はトランザクション内で実行。
# ↑ORM/マイグレータ（Drizzle/Prisma 等）に合わせて下位で上書き
</project.db>

<project.tooling>
- lint/typecheck/test の最低実行コマンドを壊さない（`npm run test` など）。
# ↑必要時のみ記載・上書き
</project.tooling>
