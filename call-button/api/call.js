// Vercel Function: POST /api/call
// Webhook URL は環境変数 DISCORD_WEBHOOK_URL に入れる（ブラウザには出さない）

const COOLDOWN_MS = 10 * 1000; // サーバー側の連打防止（ベストエフォート）
let lastSent = 0;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(500).json({ ok: false, error: 'DISCORD_WEBHOOK_URL is not set' });
  }

  // インスタンス内での簡易レート制限（インスタンスが複数立つと完全ではない）
  const now = Date.now();
  if (now - lastSent < COOLDOWN_MS) {
    return res.status(429).json({ ok: false, error: 'Too Many Requests' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const place = String(body.place || '')
    .replace(/[\r\n`*_~|>@]/g, '') // 改行・Markdown・メンションを除去
    .slice(0, 30)
    .trim();

  const time = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const content = `🔔 **呼び出しがありました**${place ? `（${place}）` : ''}\n${time}`;

  try {
    const r = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        allowed_mentions: { parse: [] }, // 意図しない @everyone 等を防ぐ
      }),
    });
    if (!r.ok) {
      console.error('Discord error', r.status, await r.text());
      return res.status(502).json({ ok: false, error: 'Discord webhook failed' });
    }
    lastSent = now;
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ ok: false, error: 'Network error' });
  }
};
