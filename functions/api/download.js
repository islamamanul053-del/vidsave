/**
 * VidGet — Cloudflare Pages Function
 * Route: POST /api/download
 *
 * TikTok  → tikwm.com API  (reliable, no watermark, HD)
 * Others  → cobalt.tools API
 */

const COBALT_API = 'https://api.cobalt.tools/';
const TIKWM_API  = 'https://www.tikwm.com/api/';
const TIMEOUT_MS = 25_000;

export async function onRequestPost({ request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ status: 'error', error: { text: 'Invalid request.' } }, 400);
  }

  const {
    url,
    downloadMode = 'auto',
    videoQuality = 'max',
    audioFormat  = 'mp3',
    audioBitrate = '320',
  } = body;

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return json({ status: 'error', error: { text: 'সঠিক URL দিন।' } }, 400);
  }

  try {
    if (isTikTok(url)) {
      return await fromTikWM(url, downloadMode);
    }
    return await fromCobalt(url, videoQuality, audioFormat, audioBitrate, downloadMode);
  } catch (err) {
    if (err.name === 'TimeoutError') {
      return json({ status: 'error', error: { text: 'রিকোয়েস্ট টাইমআউট। আবার চেষ্টা করুন।' } });
    }
    console.error('[VidGet]', err);
    return json({ status: 'error', error: { text: 'সার্ভার সমস্যা হয়েছে। আবার চেষ্টা করুন।' } });
  }
}

/* ── TikTok via tikwm.com ────────────────────────────── */
function isTikTok(url) {
  try {
    const h = new URL(url).hostname.replace('www.', '');
    return ['tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'].some(d => h === d || h.endsWith('.' + d));
  } catch { return false; }
}

async function fromTikWM(url, mode) {
  const qs = new URLSearchParams({ url, hd: '1' });
  const res = await fetch(`${TIKWM_API}?${qs}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VidGet/1.0)' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  const raw = await res.json();

  if (raw.code !== 0 || !raw.data) {
    return json({
      status: 'error',
      error: { text: raw.msg || 'TikTok ভিডিও লিংক পাওয়া যায়নি। ভিডিওটি পাবলিক কিনা চেক করুন।' }
    });
  }

  const d = raw.data;

  /* Audio only mode */
  if (mode === 'audio') {
    const audioUrl = d.music || d.music_info?.play;
    if (!audioUrl) return json({ status: 'error', error: { text: 'অডিও লিংক পাওয়া যায়নি।' } });
    return json({ status: 'stream', url: audioUrl, filename: `tiktok_${d.id || 'audio'}.mp3` });
  }

  /* Build picker with HD / SD / Audio options */
  const options = [];
  if (d.hdplay) options.push({ type: 'HD', url: d.hdplay });
  if (d.play)   options.push({ type: 'SD', url: d.play });
  if (d.music)  options.push({ type: 'Audio (MP3)', url: d.music });

  if (options.length === 0) {
    return json({ status: 'error', error: { text: 'ভিডিও লিংক পাওয়া যায়নি।' } });
  }

  /* Single option → stream directly */
  if (options.length === 1) {
    return json({
      status  : 'stream',
      url     : options[0].url,
      filename: `tiktok_${d.id || Date.now()}.mp4`,
    });
  }

  return json({ status: 'picker', picker: options });
}

/* ── Everything else via cobalt.tools ───────────────── */
async function fromCobalt(url, videoQuality, audioFormat, audioBitrate, downloadMode) {
  const res = await fetch(COBALT_API, {
    method : 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept'       : 'application/json',
    },
    body: JSON.stringify({
      url,
      videoQuality,
      audioFormat,
      audioBitrate,
      downloadMode,
      youtubeVideoCodec: 'h264',
      youtubeHLS        : false,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  const data = await res.json();
  return json(data);
}

/* ── CORS preflight ──────────────────────────────────── */
export function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

/* ── Helpers ─────────────────────────────────────────── */
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
