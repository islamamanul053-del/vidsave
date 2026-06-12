/**
 * VidGet — Cloudflare Pages Function
 * Route: POST /api/download
 *
 * Proxies video info requests to cobalt.tools API.
 * cobalt.tools is an open-source video downloader (https://cobalt.tools).
 *
 * For production / high traffic: host your own cobalt instance
 * and replace COBALT_API with your own endpoint.
 * Docker: https://github.com/imputnet/cobalt
 */

const COBALT_API = 'https://api.cobalt.tools/';
const TIMEOUT_MS = 25_000;

export async function onRequestPost({ request }) {
  /* Parse body */
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ status: 'error', error: { text: 'Invalid JSON body.' } }, 400);
  }

  const {
    url,
    downloadMode  = 'auto',
    videoQuality  = 'max',
    audioFormat   = 'mp3',
    audioBitrate  = '320',
  } = body;

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return json({ status: 'error', error: { text: 'সঠিক URL দিন।' } }, 400);
  }

  /* Forward to cobalt */
  try {
    const cobaltRes = await fetch(COBALT_API, {
      method : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept'       : 'application/json',
      },
      body: JSON.stringify({
        url,
        videoQuality      : videoQuality === 'max' ? '9000' : videoQuality,
        audioFormat,
        audioBitrate,
        downloadMode,
        youtubeVideoCodec : 'h264',
        youtubeHLS        : false,
        tiktokFullAudio   : true,
        alwaysProxy       : false,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const data = await cobaltRes.json();
    return json(data, cobaltRes.ok ? 200 : cobaltRes.status);

  } catch (err) {
    if (err.name === 'TimeoutError') {
      return json({ status: 'error', error: { text: 'রিকোয়েস্ট টাইমআউট। আবার চেষ্টা করুন।' } }, 504);
    }
    console.error('[VidGet] cobalt fetch error:', err);
    return json({ status: 'error', error: { text: 'সার্ভার সমস্যা হয়েছে।' } }, 500);
  }
}

/* CORS preflight */
export function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

/* ── Helpers ── */
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
