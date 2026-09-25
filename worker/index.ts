// Anonymous usage counters for securephotoblur.com.
//
// This Worker only runs for "/", "/models/*.bin" and "/api/*" (run_worker_first in
// wrangler.json). It serves the static asset exactly as before and, in the background,
// adds +1 to a few daily counters in D1 (schema in worker/schema.sql). It never stores IP
// addresses, user agents or any identifier, and each dimension (country, device, source)
// is a separate counter that is never crossed with the others. Photos never reach it.

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
  DB: D1Database
}

interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch(statements: D1PreparedStatement[]): Promise<unknown>
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void
}

interface CfProperties {
  country?: string | null
  asn?: number
  asOrganization?: string
}

type EventName = 'landing' | 'photo' | 'feedback'
type Kind = 'human' | 'vpn' | 'bot' | '-'
type Row = [day: string, event: EventName, kind: Kind, dim: string, value: string]

const UPSERT = `INSERT INTO counts (day, event, kind, dim, value, n) VALUES (?1, ?2, ?3, ?4, ?5, 1)
  ON CONFLICT (day, event, kind, dim, value) DO UPDATE SET n = n + 1`

// The only three choices the feedback dialog can send (src/components/feedback-prompt.tsx)
const FEEDBACK_ANSWERS = new Set(['all-good', 'suggestion', 'dismissed'])

const BOT_UA = /bot\b|spider|crawl|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|meta-externalagent|whatsapp|embedly|curl|wget|python|httpx|aiohttp|go-http|okhttp|java\/|axios|node-fetch|undici|libwww/i

// Cloud, hosting, VPN and relay networks (iCloud Private Relay exits through Cloudflare,
// Akamai and Fastly). request.cf.asn and asOrganization are available on every plan.
const DATACENTER_ASN = new Set([
  16509, 14618, // Amazon
  15169, 396982, // Google
  8075, // Microsoft
  14061, // DigitalOcean
  63949, // Linode
  16276, // OVH
  24940, // Hetzner
  51167, // Contabo
  20473, // Vultr
  31898, // Oracle
  45102, // Alibaba
  132203, // Tencent
  12876, // Scaleway
  60781, // Leaseweb
  9009, // M247
  60068, 212238, // Datacamp, CDN77
  13335, // Cloudflare
  54113, // Fastly
  36183, // Akamai
])
const DATACENTER_ORG = /amazon|aws|google cloud|microsoft|azure|digitalocean|linode|akamai|ovh|hetzner|contabo|vultr|choopa|oracle|alibaba|tencent|scaleway|leaseweb|m247|datacamp|cdn77|cloudflare|fastly|g-?core|hostinger|ionos|hosting|data ?cent(er|re)|\bvps\b/i

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/api/feedback') return handleFeedback(request, env, ctx)

    const response = withStaticHeaders(url.pathname, await env.ASSETS.fetch(request))
    try {
      const rows = rowsFor(request, url, response.status)
      if (rows.length > 0) ctx.waitUntil(record(env, rows))
    } catch {
      // Counting must never change what the visitor gets
    }
    return response
  },
}

// public/_headers rules may not be applied to responses that go through a Worker, so the
// same values are set here for the routes this Worker handles (keep in sync with _headers)
function withStaticHeaders(pathname: string, response: Response): Response {
  const res = new Response(response.body, response)
  res.headers.set('X-Robots-Tag', 'index, follow')
  if (pathname.startsWith('/models/') && response.status < 400) {
    res.headers.set('Cache-Control', 'public, max-age=2592000')
  }
  return res
}

function rowsFor(request: Request, url: URL, status: number): Row[] {
  if (request.method !== 'GET' || status >= 400) return []
  const path = url.pathname
  const event: EventName | null =
    path === '/' ? 'landing'
    : path.startsWith('/models/') && path.endsWith('.bin') ? 'photo'
    : null
  if (!event) return []

  const cf = (request as Request & { cf?: CfProperties }).cf
  const kind = classify(request.headers, event, cf)
  if (!kind) return []

  const day = new Date().toISOString().slice(0, 10)
  const rows: Row[] = [[day, event, kind, 'total', 'all']]
  // Bots only get the total: their country, device and referrer are noise
  if (kind !== 'bot') {
    rows.push([day, event, kind, 'country', cf?.country || 'XX'])
    rows.push([day, event, kind, 'device', device(request.headers)])
    if (event === 'landing') {
      rows.push([day, event, kind, 'source', source(request.headers.get('referer'), url.hostname)])
    }
  }
  return rows
}

// human: a real browser on a home or mobile network
// vpn:   looks like a browser but comes from a datacenter (VPN, relay, Tor or a disguised bot)
// bot:   anything that does not look like a browser
function classify(headers: Headers, event: EventName, cf?: CfProperties): Kind | null {
  if (event === 'landing') {
    // Requests made by the app itself are not visits: the service worker precaches
    // index.html, which redirects to "/" (Sec-Fetch-Dest: empty, Sec-Fetch-Site: same-origin)
    const dest = headers.get('sec-fetch-dest')
    if ((dest && dest !== 'document') || headers.get('sec-fetch-site') === 'same-origin') return null
    if (!isBrowser(headers) || !headers.has('accept-language') || headers.get('sec-fetch-mode') !== 'navigate') {
      return 'bot'
    }
  } else if (!isBrowser(headers) || !headers.has('sec-fetch-mode')) {
    return 'bot'
  }
  return isDatacenter(cf) ? 'vpn' : 'human'
}

function isBrowser(headers: Headers): boolean {
  const ua = headers.get('user-agent') ?? ''
  return ua.startsWith('Mozilla/5.0 (') && /(Chrome|CriOS|Firefox|FxiOS|Safari|Edg|OPR)\//.test(ua) && !BOT_UA.test(ua)
}

function isDatacenter(cf?: CfProperties): boolean {
  if (!cf) return false
  return cf.country === 'T1'
    || (cf.asn !== undefined && DATACENTER_ASN.has(cf.asn))
    || DATACENTER_ORG.test(cf.asOrganization ?? '')
}

function device(headers: Headers): 'mobile' | 'desktop' {
  const ua = headers.get('user-agent') ?? ''
  return headers.get('sec-ch-ua-mobile') === '?1' || /Mobi|iPhone|iPad|iPod|Android/i.test(ua) ? 'mobile' : 'desktop'
}

// Only the referring site's domain is kept, never the full address
function source(referer: string | null, ownHost: string): string {
  if (!referer) return '(direct)'
  let host: string
  try {
    host = new URL(referer).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return '(other)'
  }
  if (!host || host === ownHost.replace(/^www\./, '')) return '(direct)'
  // Keep plain domain names only: no IP addresses, no junk
  const isDomain = host.length <= 80 && /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host) && !/^[\d.]+$/.test(host)
  return isDomain ? host : '(other)'
}

async function record(env: Env, rows: Row[]): Promise<void> {
  try {
    const statement = env.DB.prepare(UPSERT)
    await env.DB.batch(rows.map(row => statement.bind(...row)))
  } catch {
    // A lost count is acceptable: the visitor never notices
  }
}

// Receives the choice made in the post-export dialog: one of three fixed words, sent only
// when the user clicks. It is not an upload endpoint: anything else is rejected.
async function handleFeedback(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== 'POST') return reply(405)
  if (request.headers.get('sec-fetch-site') !== 'same-origin') return reply(403)
  if (Number(request.headers.get('content-length') ?? 0) > 32) return reply(400)

  let answer = ''
  try {
    answer = (await request.text()).trim()
  } catch {
    return reply(400)
  }
  if (!FEEDBACK_ANSWERS.has(answer)) return reply(400)

  const day = new Date().toISOString().slice(0, 10)
  ctx.waitUntil(record(env, [[day, 'feedback', '-', 'answer', answer]]))
  return reply(204)
}

function reply(status: number): Response {
  const headers: Record<string, string> = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' }
  if (status === 405) headers.Allow = 'POST'
  return new Response(null, { status, headers })
}
