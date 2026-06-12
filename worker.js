/*
 * ╔══════════════════════════════════════════╗
 * ║  VidDown – Cloudflare Workers Video DL  ║
 * ║  Powered by Cobalt (cobalt.tools)        ║
 * ║  Deploy: dash.cloudflare.com/workers     ║
 * ╚══════════════════════════════════════════╝
 *
 *  ✅ সম্পূর্ণ ফ্রি, কোনো API key লাগবে না
 *  ✅ YouTube, TikTok, Instagram, FB সহ 1500+ সাইট
 *  ✅ Android থেকে সরাসরি Cloudflare Dashboard এ deploy করুন
 */

const COBALT_API = "https://api.cobalt.tools/";

/* ─────────────────────── HTML FRONTEND ─────────────────────── */

function buildHTML() {
  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
  <title>VidDown – ভিডিও ডাউনলোডার</title>
  <meta name="description" content="YouTube, TikTok, Instagram সহ যেকোনো সাইট থেকে ভিডিও ডাউনলোড করুন">
  <meta name="theme-color" content="#060b17">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='16' fill='%234f46e5'/><text x='16' y='22' text-anchor='middle' font-size='18'>⬇</text></svg>">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }

    :root {
      --bg:      #060b17;
      --card:    rgba(255,255,255,0.03);
      --border:  rgba(255,255,255,0.07);
      --bfocus:  rgba(99,102,241,0.5);
      --indigo:  #6366f1;
      --indigol: #818cf8;
      --amber:   #f59e0b;
      --amberl:  #fbbf24;
      --cyan:    #22d3ee;
      --green:   #10b981;
      --red:     #f43f5e;
      --warn:    #fb923c;
      --text:    #f1f5f9;
      --muted:   #64748b;
      --soft:    #94a3b8
    }

    html { scroll-behavior: smooth }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans Bengali',
                   'Hind Siliguri', sans-serif;
      min-height: 100vh;
      overflow-x: hidden
    }

    /* ─── Noise + Glow BG ─── */
    body::before {
      content: '';
      position: fixed; inset: 0;
      background:
        radial-gradient(ellipse 60% 40% at 15% 10%, rgba(99,102,241,.10) 0%, transparent 70%),
        radial-gradient(ellipse 50% 50% at 85% 90%, rgba(34,211,238,.06) 0%, transparent 70%);
      pointer-events: none; z-index: 0
    }

    .wrap { max-width: 660px; margin: 0 auto; padding: 1.5rem 1rem; position: relative; z-index: 1 }

    /* ─── Header ─── */
    header { text-align: center; padding: 1.5rem 0 1.8rem }

    .brand {
      display: inline-flex; align-items: center; gap: .65rem;
      border: 1px solid rgba(99,102,241,.25);
      background: rgba(99,102,241,.07);
      border-radius: 14px; padding: .6rem 1.1rem;
      margin-bottom: .9rem
    }

    .brand-icon {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, var(--indigo), var(--cyan));
      border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem
    }

    h1 {
      font-size: 1.65rem; font-weight: 800; letter-spacing: -.03em;
      background: linear-gradient(130deg, #fff 30%, var(--indigol) 70%, var(--cyan));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text
    }

    .tagline { color: var(--soft); font-size: .88rem; margin-bottom: 1rem }

    /* Platform chips */
    .platforms { display: flex; flex-wrap: wrap; gap: .3rem; justify-content: center }
    .chip {
      background: rgba(255,255,255,.04);
      border: 1px solid var(--border);
      color: var(--muted);
      padding: .15rem .6rem; border-radius: 100px; font-size: .7rem
    }

    /* ─── Card ─── */
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 20px; padding: 1.5rem;
      margin-bottom: .9rem;
      backdrop-filter: blur(12px)
    }

    /* ─── Form ─── */
    .field { margin-bottom: .9rem }
    .lbl { display: block; font-size: .77rem; font-weight: 600; color: var(--muted); margin-bottom: .4rem; text-transform: uppercase; letter-spacing: .04em }

    /* URL input */
    .url-wrap { position: relative }
    input[type=url] {
      width: 100%;
      background: rgba(255,255,255,.04);
      border: 1.5px solid var(--border);
      border-radius: 12px;
      padding: .88rem 4.5rem .88rem 1rem;
      color: var(--text); font-size: .93rem;
      outline: none; transition: border-color .2s;
      -webkit-appearance: none
    }
    input[type=url]:focus { border-color: var(--bfocus) }
    input[type=url]::placeholder { color: var(--muted); opacity: .5 }

    /* scanning line on focus */
    input[type=url]:focus { box-shadow: 0 0 0 3px rgba(99,102,241,.12) }

    .paste-btn {
      position: absolute; right: .55rem; top: 50%; transform: translateY(-50%);
      background: rgba(99,102,241,.18);
      border: 1px solid rgba(99,102,241,.3);
      color: var(--indigol); border-radius: 8px;
      padding: .3rem .55rem; font-size: .72rem;
      cursor: pointer; white-space: nowrap;
      transition: background .15s
    }
    .paste-btn:active { background: rgba(99,102,241,.3) }

    /* selects row */
    .row { display: flex; gap: .7rem }
    .row .field { flex: 1; margin-bottom: 0 }

    select {
      width: 100%;
      background: rgba(255,255,255,.04);
      border: 1.5px solid var(--border);
      border-radius: 11px; padding: .76rem .9rem;
      color: var(--text); font-size: .88rem;
      outline: none; cursor: pointer;
      -webkit-appearance: none; appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right .7rem center; background-size: 1.15rem;
      padding-right: 2.4rem; transition: border-color .2s
    }
    select:focus { border-color: var(--bfocus) }
    select option { background: #0e1525 }

    .af-wrap { margin-top: .8rem; display: none }

    /* ─── Download Button ─── */
    .dl-btn {
      width: 100%;
      background: linear-gradient(135deg, var(--amber), var(--amberl));
      border: none; border-radius: 13px; padding: 1rem 1.5rem;
      color: #1a1000; font-size: 1rem; font-weight: 800;
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: .55rem;
      margin-top: 1rem;
      box-shadow: 0 6px 24px rgba(245,158,11,.25);
      transition: opacity .15s, transform .1s, box-shadow .15s
    }
    .dl-btn:hover { box-shadow: 0 8px 30px rgba(245,158,11,.35) }
    .dl-btn:active { transform: scale(.98); opacity: .92 }
    .dl-btn:disabled { opacity: .45; cursor: not-allowed; box-shadow: none }

    /* spinner: cascading dots = "downloading data" signature animation */
    .dots { display: none; gap: 3px; align-items: center }
    .dots span {
      width: 5px; height: 5px;
      background: #1a1000; border-radius: 50%;
      animation: dot-bounce .6s infinite ease-in-out both
    }
    .dots span:nth-child(1) { animation-delay: 0s }
    .dots span:nth-child(2) { animation-delay: .12s }
    .dots span:nth-child(3) { animation-delay: .24s }
    @keyframes dot-bounce {
      0%, 80%, 100% { transform: translateY(0) }
      40% { transform: translateY(-5px) }
    }

    /* ─── Result ─── */
    #res { display: none; border-radius: 18px; padding: 1.3rem; margin-bottom: .9rem; border: 1px solid transparent; animation: fadeSlide .25s ease }
    @keyframes fadeSlide { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }

    .ok-box { background: rgba(16,185,129,.07); border-color: rgba(16,185,129,.22) !important }
    .err-box { background: rgba(244,63,94,.07); border-color: rgba(244,63,94,.22) !important }

    .res-title { font-size: .82rem; font-weight: 700; margin-bottom: .9rem; display: flex; align-items: center; gap: .45rem }
    .ok-clr { color: var(--green) }
    .err-clr { color: var(--red) }

    .dl-links { display: flex; flex-direction: column; gap: .5rem }

    .dl-link {
      background: rgba(16,185,129,.08);
      border: 1px solid rgba(16,185,129,.2);
      border-radius: 12px; padding: .85rem 1rem;
      color: var(--text); text-decoration: none;
      display: flex; align-items: center; gap: .75rem;
      transition: background .2s
    }
    .dl-link:active { background: rgba(16,185,129,.15) }
    .dl-ico { font-size: 1.3rem; flex-shrink: 0 }
    .dl-info { flex: 1; min-width: 0 }
    .dl-name {
      font-size: .85rem; font-weight: 600;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis
    }
    .dl-sub { font-size: .72rem; color: var(--soft); margin-top: .1rem }
    .dl-arr { color: var(--cyan); font-weight: 700 }

    .err-hint { font-size: .78rem; color: var(--muted); margin-top: .4rem; line-height: 1.5 }

    /* ─── Feature grid ─── */
    .feats { display: grid; grid-template-columns: 1fr 1fr; gap: .6rem; margin-top: .9rem }
    .feat {
      background: var(--card); border: 1px solid var(--border);
      border-radius: 14px; padding: .9rem; text-align: center
    }
    .feat-i { font-size: 1.35rem; margin-bottom: .3rem }
    .feat-t { font-size: .8rem; font-weight: 700 }
    .feat-d { font-size: .7rem; color: var(--muted); margin-top: .12rem }

    /* ─── Warning ─── */
    .warn {
      background: rgba(251,146,60,.07); border: 1px solid rgba(251,146,60,.2);
      border-radius: 12px; padding: .75rem 1rem;
      font-size: .77rem; color: var(--warn); margin-top: .8rem; line-height: 1.55
    }

    footer {
      text-align: center; margin-top: 1.5rem;
      color: var(--muted); font-size: .72rem; padding-bottom: 1.5rem
    }
    footer a { color: var(--cyan); text-decoration: none }

    @media (max-width: 400px) {
      .row { flex-direction: column }
    }
  </style>
</head>
<body>
<div class="wrap">

  <!-- ── Header ── -->
  <header>
    <div class="brand">
      <div class="brand-icon">⬇️</div>
      <h1>VidDown</h1>
    </div>
    <p class="tagline">লিংক দিন — যেকোনো প্ল্যাটফর্ম থেকে ডাউনলোড করুন</p>
    <div class="platforms">
      <span class="chip">YouTube</span>
      <span class="chip">TikTok</span>
      <span class="chip">Instagram</span>
      <span class="chip">Twitter / X</span>
      <span class="chip">Facebook</span>
      <span class="chip">Reddit</span>
      <span class="chip">Vimeo</span>
      <span class="chip">SoundCloud</span>
      <span class="chip">Twitch</span>
      <span class="chip">Pinterest</span>
      <span class="chip">+ ১৫০০ সাইট</span>
    </div>
  </header>

  <!-- ── Main Card ── -->
  <div class="card">
    <!-- URL Input -->
    <div class="field">
      <label class="lbl" for="vurl">ভিডিও লিংক</label>
      <div class="url-wrap">
        <input type="url" id="vurl"
          placeholder="https://youtube.com/watch?v=…"
          autocomplete="off" autocorrect="off" spellcheck="false">
        <button class="paste-btn" id="pasteBtn" type="button">📋 পেস্ট</button>
      </div>
    </div>

    <!-- Mode + Quality -->
    <div class="row">
      <div class="field">
        <label class="lbl" for="mode">মোড</label>
        <select id="mode">
          <option value="auto">🎬 ভিডিও + অডিও</option>
          <option value="audio">🎵 শুধু অডিও</option>
          <option value="mute">🔇 ভিডিও (নো সাউন্ড)</option>
        </select>
      </div>
      <div class="field">
        <label class="lbl" for="quality">কোয়ালিটি</label>
        <select id="quality">
          <option value="1080">1080p Full HD</option>
          <option value="720" selected>720p HD</option>
          <option value="480">480p</option>
          <option value="360">360p</option>
          <option value="240">240p</option>
        </select>
      </div>
    </div>

    <!-- Audio Format (shown only in audio mode) -->
    <div class="af-wrap" id="afwrap">
      <label class="lbl" for="afmt">অডিও ফরম্যাট</label>
      <select id="afmt">
        <option value="mp3">MP3 (সবচেয়ে কমপ্যাটিবল)</option>
        <option value="opus">Opus (ভালো কোয়ালিটি)</option>
        <option value="ogg">OGG</option>
        <option value="wav">WAV (Lossless)</option>
        <option value="best">সেরা কোয়ালিটি</option>
      </select>
    </div>

    <!-- CTA -->
    <button class="dl-btn" id="dlbtn" type="button">
      <div class="dots" id="dots"><span></span><span></span><span></span></div>
      <span id="btxt">⬇️  ডাউনলোড করুন</span>
    </button>
  </div>

  <!-- ── Result ── -->
  <div id="res"></div>

  <!-- ── Features ── -->
  <div class="feats">
    <div class="feat"><div class="feat-i">🆓</div><div class="feat-t">সম্পূর্ণ ফ্রি</div><div class="feat-d">কোনো পেমেন্ট নেই</div></div>
    <div class="feat"><div class="feat-i">⚡</div><div class="feat-t">দ্রুত</div><div class="feat-d">Cloudflare CDN</div></div>
    <div class="feat"><div class="feat-i">🌐</div><div class="feat-t">১৫০০+ সাইট</div><div class="feat-d">সব প্ল্যাটফর্ম</div></div>
    <div class="feat"><div class="feat-i">🔒</div><div class="feat-t">প্রাইভেট</div><div class="feat-d">ডেটা সেভ হয় না</div></div>
  </div>

  <div class="warn">⚠️ শুধুমাত্র ব্যক্তিগত ব্যবহারের জন্য। কপিরাইটযুক্ত কন্টেন্ট পুনরায় বিতরণ করা বেআইনি।</div>

  <footer>Powered by <a href="https://cobalt.tools" target="_blank" rel="noopener">Cobalt</a> &amp; <a href="https://workers.cloudflare.com" target="_blank" rel="noopener">Cloudflare Workers</a></footer>

</div><!-- .wrap -->

<script>
/* ── util ── */
const $ = id => document.getElementById(id);

/* ── audio format visibility ── */
$('mode').addEventListener('change', () => {
  $('afwrap').style.display = $('mode').value === 'audio' ? 'block' : 'none';
});

/* ── paste button ── */
$('pasteBtn').addEventListener('click', async () => {
  try {
    const t = await navigator.clipboard.readText();
    if (t && t.startsWith('http')) {
      $('vurl').value = t.trim();
      $('vurl').focus();
    } else {
      $('vurl').focus();
    }
  } catch (_) {
    $('vurl').focus();
  }
});

/* ── enter key ── */
$('vurl').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });

/* ── main download ── */
$('dlbtn').addEventListener('click', go);

async function go() {
  const url = $('vurl').value.trim();

  if (!url)               return showErr('দয়া করে একটি ভিডিও লিংক দিন');
  if (!url.startsWith('http')) return showErr('সঠিক URL দিন — http:// বা https:// দিয়ে শুরু হতে হবে');

  setLoading(true);
  $('res').style.display = 'none';

  try {
    const r = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        quality:     $('quality').value,
        mode:        $('mode').value,
        audioFormat: $('afmt').value
      })
    });

    if (!r.ok) return showErr('সার্ভার রেসপন্স দিচ্ছে না (HTTP ' + r.status + ')');
    const d = await r.json();
    handleData(d);

  } catch (e) {
    showErr('নেটওয়ার্ক সমস্যা: ' + (e.message || 'অজানা এরর'));
  } finally {
    setLoading(false);
  }
}

function handleData(d) {
  /* error */
  if (d.status === 'error') {
    const code = (d.error && d.error.code) || '';
    const lookup = {
      'error.api.link.invalid':          'লিংকটি ভুল বা সাপোর্ট নেই',
      'error.api.link.unsupported':       'এই ওয়েবসাইট সাপোর্ট করে না',
      'error.api.content.too_long':       'ভিডিওটি অনেক বড় (সময় বেশি)',
      'error.api.youtube.login':          'YouTube: লগইন প্রয়োজন (age-restricted হতে পারে)',
      'error.api.youtube.age':            'YouTube: বয়স-সীমাবদ্ধ ভিডিও',
      'error.api.content.private':        'প্রাইভেট কন্টেন্ট, ডাউনলোড সম্ভব নয়',
      'error.api.rate_exceeded':          'অনেক বেশি রিকোয়েস্ট — কিছুক্ষণ পর আবার চেষ্টা করুন',
      'error.api.service.unavailable':    'Cobalt সার্ভিস এই মুহূর্তে বন্ধ',
      'error.api.fetch.fail':             'ভিডিও ফেচ করতে পারেনি — লিংক কি সঠিক?',
      'error.api.tiktok.auth':            'TikTok: এই ভিডিওতে অ্যাক্সেস নেই',
      'error.api.twitter.space':          'Twitter Space ডাউনলোড সাপোর্ট নেই',
    };
    const ctx = (d.error && d.error.context) || '';
    const msg = lookup[code] || ctx || d.error || 'অজানা সমস্যা হয়েছে';
    return showErr(msg);
  }

  /* single file — redirect or tunnel */
  if (d.status === 'redirect' || d.status === 'tunnel') {
    return showLinks([{
      url:  d.url,
      name: d.filename || 'ডাউনলোড',
      type: 'video'
    }]);
  }

  /* multiple items — carousel, playlist slice etc. */
  if (d.status === 'picker') {
    const items = (d.picker || []).map((p, i) => ({
      url:  p.url,
      name: p.filename || ('আইটেম ' + (i + 1)),
      type: p.type || 'video'
    }));
    // also include audio track if provided separately
    if (d.audio) items.push({ url: d.audio, name: 'Audio Track', type: 'audio' });
    return showLinks(items);
  }

  showErr('অপ্রত্যাশিত রেসপন্স পেলাম — আবার চেষ্টা করুন');
}

function showLinks(items) {
  const r = $('res');
  r.className = 'ok-box';
  r.innerHTML =
    '<div class="res-title ok-clr">✅ রেডি! নিচের লিংকে ট্যাপ করুন</div>' +
    '<div class="dl-links">' +
    items.map(it => {
      const nm = it.name.length > 52 ? it.name.slice(0, 49) + '…' : it.name;
      const ico = it.type === 'audio' ? '🎵' : it.type === 'photo' ? '🖼️' : '📥';
      return (
        '<a href="' + esc(it.url) + '" class="dl-link" target="_blank" rel="noopener noreferrer" download>' +
          '<span class="dl-ico">' + ico + '</span>' +
          '<div class="dl-info">' +
            '<div class="dl-name">' + esc(nm) + '</div>' +
            '<div class="dl-sub">ডাউনলোড করতে এখানে ট্যাপ করুন</div>' +
          '</div>' +
          '<span class="dl-arr">↓</span>' +
        '</a>'
      );
    }).join('') +
    '</div>';
  r.style.display = 'block';
  r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showErr(msg) {
  const r = $('res');
  r.className = 'err-box';
  r.innerHTML =
    '<div class="res-title err-clr">❌ ' + esc(msg) + '</div>' +
    '<div class="err-hint">লিংকটি সঠিক কিনা চেক করুন। প্রাইভেট বা বয়স-সীমাবদ্ধ ভিডিও কাজ নাও করতে পারে।</div>';
  r.style.display = 'block';
  r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function setLoading(on) {
  $('dlbtn').disabled = on;
  $('dots').style.display  = on ? 'flex' : 'none';
  $('btxt').textContent = on ? 'লোড হচ্ছে…' : '⬇️  ডাউনলোড করুন';
}

/* basic XSS escape for dynamic text */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
</script>
</body>
</html>`;
}

/* ─────────────────────── WORKER LOGIC ─────────────────────── */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    /* ── CORS preflight ── */
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin":  "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Accept",
          "Access-Control-Max-Age":       "86400",
        },
      });
    }

    /* ── Serve frontend ── */
    if (request.method === "GET") {
      return new Response(buildHTML(), {
        headers: {
          "Content-Type":           "text/html; charset=UTF-8",
          "X-Content-Type-Options": "nosniff",
          "Cache-Control":          "no-cache",
        },
      });
    }

    /* ── API proxy ── */
    if (request.method === "POST" && url.pathname === "/api/download") {
      return await handleDownload(request);
    }

    return new Response("Not Found", { status: 404 });
  },
};

/* ── Proxy to Cobalt API ── */
async function handleDownload(request) {
  try {
    const body = await request.json();
    const {
      url:         videoUrl,
      quality      = "720",
      mode         = "auto",
      audioFormat  = "mp3",
    } = body;

    if (!videoUrl || typeof videoUrl !== "string" || !videoUrl.startsWith("http")) {
      return apiRes({ status: "error", error: "সঠিক URL দেওয়া হয়নি" });
    }

    /* call cobalt */
    const cobaltRes = await fetch(COBALT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept":        "application/json",
      },
      body: JSON.stringify({
        url:              videoUrl,
        videoQuality:     quality,
        downloadMode:     mode,       // "auto" | "audio" | "mute"
        audioFormat:      audioFormat,
        filenameStyle:    "pretty",
        youtubeVideoCodec:"h264",     // broadest device compatibility
        twitterGif:       true,
      }),
    });

    /* handle non-OK from cobalt */
    if (!cobaltRes.ok) {
      const errorText = await cobaltRes.text().catch(() => "");
      console.error("Cobalt HTTP error:", cobaltRes.status, errorText);
      return apiRes({
        status: "error",
        error:  {
          code:    "error.api.service.unavailable",
          context: `Cobalt returned HTTP ${cobaltRes.status}`,
        },
      });
    }

    const data = await cobaltRes.json();
    return apiRes(data);

  } catch (err) {
    console.error("Worker error:", err);
    return apiRes({
      status: "error",
      error:  err.message || "ওয়ার্কারে অজানা এরর হয়েছে",
    });
  }
}

/* ── JSON response helper ── */
function apiRes(data) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type":            "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
