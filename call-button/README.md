# 呼び出しボタン

ボタンを押すと Discord に通知が飛ぶだけのシンプルなサイト。

```
index.html      … ボタンのページ（静的）
api/call.js     … Vercel Function。ここから Discord Webhook を叩く
```

## セットアップ

1. **Discord で Webhook を作る**
   通知したいチャンネルの「チャンネルの編集 → 連携サービス → ウェブフック → 新しいウェブフック」→ URL をコピー
2. **GitHub に push**（このフォルダをそのままリポジトリに）
3. **Vercel で Import**
   Framework Preset は「Other」のままでOK。ビルド設定も不要
4. **環境変数を設定**
   Settings → Environment Variables に
   `DISCORD_WEBHOOK_URL` = コピーした Webhook URL
5. **Redeploy**（環境変数は再デプロイ後に反映）

CLI派なら:

```bash
npm i -g vercel
vercel
vercel env add DISCORD_WEBHOOK_URL
vercel --prod
```

## 使い方

- `https://xxx.vercel.app/` … 普通の呼び出し
- `https://xxx.vercel.app/?place=受付` … 通知に場所が付く
  → 場所ごとにQRコードを作って貼ると便利

## 動作確認

```bash
curl -X POST https://xxx.vercel.app/api/call \
  -H "Content-Type: application/json" -d '{"place":"テスト"}'
```

## メモ

- Webhook URL はサーバー側の環境変数にだけ置くので、ページのソースを見ても漏れない
- 連打防止はクライアント30秒・サーバー10秒。サーバー側はインスタンス単位の簡易版なので、
  本気で荒らされるなら Vercel の Firewall（Rate Limiting）や KV を使う
- `@here` でスマホに強く通知したい場合は `api/call.js` の content 先頭に `@here ` を足し、
  `allowed_mentions` を `{ parse: ['everyone'] }` に変える
