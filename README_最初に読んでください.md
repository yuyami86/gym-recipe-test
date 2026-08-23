# Personal gym Recipe — GitHub Pages版

現在の公開先は次のGitHub Pagesです。

https://yuyami86.github.io/gym-recipe-test/

## 現在できること

- パソコン用メニューと、スマホ用の右側メニュー
- トレーナー紹介、指導の流れ、導入器具、料金、アクセス、ブログ、Q&A
- Instagram・公式LINEへのリンク
- Web3Formsを使ったお問い合わせ送信（アクセスキー設定後）
- `/gym-recipe-test/admin/` からGitHub専用キーでブログ記事を追加・編集・削除
- 記事画像のアップロードと、ブログページの自動生成

## 公開用ファイルを作る

Node.jsが入っている環境で、プロジェクトフォルダ内から実行します。

```bash
npm run build
```

公開用ファイルは `docs` に作成されます。GitHub Pagesの公開元は、`main` ブランチの `/docs` に設定します。

## ブログを更新する

詳しい手順は `管理画面の使い方.md` を参照してください。GitHub専用キーはブラウザーを閉じるまでの一時領域だけに保存され、サイトやGitHubのファイルには保存されません。

## お問い合わせを設定する

`Web3Forms設定手順.md` を参照してください。Netlify Formsは使用しません。

## 器具やQ&Aを追加する

`サイト内容の更新方法.md` を参照してください。未確認の器具や経路は、公開ページには表示しない構成です。

## 「参考になった」ボタン

GitHub Pagesにはデータベース機能がないため、押した記録は各ブラウザー内だけに保存します。訪問者全体の合計数ではありません。追加サービスや費用は発生しません。

## 旧Netlifyファイルについて

`netlify/` と `netlify.toml` は以前のデータを削除しないために残していますが、現在の公開・管理画面・お問い合わせでは使用しません。GitHub Pagesが公開する `docs` にも含まれません。

## 主なファイル

- `src/data/site.json`：プロフィール、料金、住所、Q&Aなど
- `src/posts/*.json`：ブログ記事
- `src/admin/`：ブログ管理画面
- `src/assets/`：画像、CSS、JavaScript
- `build.mjs`：`docs` を生成する処理
- `docs/`：GitHub Pages公開用ファイル
