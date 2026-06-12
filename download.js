/**
 * Cloudflare Pages Function
 * Route: POST /api/download
 *
 * Proxies requests to cobalt.tools API (free, no API key needed).
 * cobalt supports: YouTube, Facebook, Instagram, TikTok, Twitter/X,
 *                  Reddit, Vimeo, Twitch, Pinterest, SoundCloud, and more.
 */

const COBALT_API = 'https://api.cobalt.tools/';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/* ── CORS preflight ───────────────────────────────── */
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

/* ── Main handler ─────────────────────────────────── */
export async function onRequestPost(context) {
  const { request } = context;

  /* 1. Parse request body */
  let body;
  try {
    body = await request.json();
  } catch {
    return err('link.invalid', 400);
  }

  const { url, quality, audioOnly } = body;

  /* 2. Basic validation */
  if (!url || typeof url !== 'string') {
    return err('link.invalid', 400);
  }
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return err('link.invalid', 400);
  }

  /* 3. Build cobalt payload */
  const payload = {
    url:              trimmed,
    videoQuality:     quality || '1080',   // max | 4320 | 2160 | 1440 | 1080 | 720 | 480 | 360
    downloadMode:     audioOnly ? 'audio' : 'auto',  // auto | audio | mute
    filenameStyle:    'pretty',
    youtubeVideoCodec: 'h264',             // h264 | av1 | vp9  (h264 = widest compat)
    twitterGif:       false,
    youtubeHLS:       false,
  };

  /* 4. Call cobalt */
  let cobaltRes;
  try {
    cobaltRes = await fetch(COBALT_API, {
      method:  'POST',
      headers: {
        'Accept':       'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      // Cloudflare Workers support AbortSignal in newer compat dates
      signal: AbortSignal.timeout?.(25_000),
    });
  } catch (e) {
    console.error('cobalt fetch error:', e);
    return err('server.error', 502);
  }

  /* 5. Handle cobalt HTTP errors */
  if (cobaltRes.status === 429) return err('rate.limit', 429);
  if (!cobaltRes.ok) {
    console.error('cobalt non-ok status:', cobaltRes.status);
    return err('server.error', 502);
  }

  /* 6. Parse cobalt response and forward to client */
  let data;
  try {
    data = await cobaltRes.json();
  } catch {
    return err('server.error', 502);
  }

  return json(data);
}

/* ── Helpers ──────────────────────────────────────── */
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

function err(code, status = 500) {
  return json({ status: 'error', error: { code } }, status);
}
