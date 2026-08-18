# Personal gym Recipe — 管理画面つき完全版

今公開しているRecipeのデザインを、そのまま継続運用できる形にしたパッケージです。

## 完成版でできること
- `/admin/` からブログ記事を追加・編集・削除
- 管理画面から記事画像をアップロード
- 公開するとトップの「Recipe Journal」に自動追加
- 記事ごとに `/journal/記事名/` の専用ページを自動生成
- JournalはPCで最大4枚、矢印で横スライド。スマホは1枚
- 👍はNetlify Blobsへ保存し、訪問者全体で同じ数を表示
- お問い合わせはNetlify Formsで実際に受信
- 管理画面から料金・住所・アクセス・トップ画像・問い合わせメールなども変更

## 大事：最初の1回だけ必要な設定
管理画面で「公開」を押して自動更新するには、今の手動ZIP公開から **GitHub連携公開** に切り替えます。

1. このフォルダ一式をGitHubの新しいリポジトリへ入れる
2. Netlifyで、そのGitHubリポジトリを接続
3. Build command は `npm run build`
4. Publish directory は `_site`
5. Netlify → Project configuration → Identity → Identityを有効化
6. Registrationは `Invite only` 推奨
7. Identity → Services → Git Gateway → Enable
8. Identityから管理者メールを招待
9. `https://gym-recipe-test.netlify.app/admin/` を開いてログイン

Decap CMSはGit Gateway経由でGitHubのデータを書き換えます。記事を公開するとGitHubが更新され、Netlifyが自動で再公開します。

## ブログ更新の流れ
`/admin/` → ブログ記事 → 新規作成 → タイトル・本文・画像を入力 → 公開

これだけでJournalと記事専用ページに反映されます。

## お問い合わせ
フォームはNetlify Forms対応済みです。NetlifyのForms画面に送信内容が入ります。
メール通知を受ける場合は Netlify → Project configuration → Notifications → Form submission notifications でメールを設定してください。

## 👍について
Netlify Functions + Netlify Blobsを使います。同じブラウザでは2回押せないようにしています。ただし会員ログイン方式ではないため、別端末・別ブラウザからは再度押せます。

## ファイル構成
- `src/data/site.json`：料金、住所、トップ文言など
- `src/posts/*.json`：ブログ記事
- `src/admin/`：管理画面
- `src/assets/`：画像・CSS・JavaScript
- `build.mjs`：サイトを自動生成する仕組み
- `netlify/functions/like.mjs`：👍保存
- `netlify.toml`：Netlify設定

## 自分のMacで完成HTMLを作る場合
Node.jsが入っていれば、プロジェクトフォルダで：

```bash
npm run build
```

`_site/` に完成版ができます。管理画面の投稿機能と👍の本番保存はNetlify上で動作します。
