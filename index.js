/**
 * Host half of the DSH status bar bundle.
 *
 * Owns the only stateful part of the feature: provider balance lookups and the
 * sanitized snapshot the Client half renders. Balances are cached for
 * `refreshSeconds` and fetched lazily, so an idle page performs no network I/O.
 *
 * The HTTP route returns derived numbers and fixed status codes only. API keys
 * and OAuth tokens never leave the Host process except to the provider origin
 * that issued them.
 */
import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

/** The 2004 EVE Online soundtrack (Jón Hallur Haraldsson), streamed from the Internet Archive. */
const EVE_TRACKS = [
  'https://archive.org/download/eve-online-soundtrack/01%20Surplus%20of%20Rare%20Artifacts.mp3',
  'https://archive.org/download/eve-online-soundtrack/02%20Below%20the%20Asteroids.mp3',
  'https://archive.org/download/eve-online-soundtrack/03%20The%20Green%20Nebula.mp3',
  'https://archive.org/download/eve-online-soundtrack/04%20Primordial%20Star%20Clouds.mp3',
  'https://archive.org/download/eve-online-soundtrack/05%20Merchants%2C%20Looters%20and%20Ghosts.mp3',
  'https://archive.org/download/eve-online-soundtrack/06%20Nouvelle%20Rouvenor%20Hero.mp3',
  'https://archive.org/download/eve-online-soundtrack/07%20Do%20You%20Know%20Where%20You%20Are.mp3',
  'https://archive.org/download/eve-online-soundtrack/08%20I%20Saw%20Your%20Ship.mp3',
  'https://archive.org/download/eve-online-soundtrack/09%20We%20Fight%20Proud%20for%20The%20Holder.mp3',
  'https://archive.org/download/eve-online-soundtrack/10%20Rose%20of%20Victory.mp3',
  'https://archive.org/download/eve-online-soundtrack/11%20Love%2C%20Honour%20and%20Obey.mp3',
  'https://archive.org/download/eve-online-soundtrack/12%20Gallentean%20Refuge.mp3',
  'https://archive.org/download/eve-online-soundtrack/13%20Omens.mp3',
  'https://archive.org/download/eve-online-soundtrack/14%20All%20Which%20Was%20Lost%20Has%20Now%20Been%20Regained.mp3',
]

/** Default radio catalogue; override with `config.radio.stations`. */
const DEFAULT_STATIONS = [
  { id: 'groove', name: 'SomaFM · Groove Salad', url: 'https://ice1.somafm.com/groovesalad-128-mp3', tag: 'Ambient' },
  { id: 'drone', name: 'SomaFM · Drone Zone', url: 'https://ice1.somafm.com/dronezone-128-mp3', tag: 'Ambient' },
  { id: 'lush', name: 'SomaFM · Lush', url: 'https://ice1.somafm.com/lush-128-mp3', tag: 'Vocal' },
  { id: 'deep', name: 'SomaFM · Deep Space One', url: 'https://ice1.somafm.com/deepspaceone-128-mp3', tag: 'Space' },
  { id: 'secret', name: 'SomaFM · Secret Agent', url: 'https://ice1.somafm.com/secretagent-128-mp3', tag: 'Lounge' },
  { id: 'indie', name: 'SomaFM · Indie Pop Rocks', url: 'https://ice1.somafm.com/indiepop-128-mp3', tag: 'Indie' },
  { id: 'rp', name: 'Radio Paradise · Main Mix', url: 'https://stream.radioparadise.com/aac-128', tag: 'Eclectic' },
  { id: 'eve', name: 'EVE Online · Original Soundtrack', tag: 'EVE', tracks: EVE_TRACKS },
]

const DEFAULTS = {
  enabled: true,
  compact: false,
  refreshSeconds: 120,
  layout: ['deepseek', 'codex', 'kimi', 'openrouter', 'spacer', 'radio'],
  providers: {
    deepseek: {
      enabled: true,
      label: 'DeepSeek',
      useAccount: true,
      apiKey: '',
      apiKeyEnv: 'DEEPSEEK_API_KEY',
      baseUrl: 'https://api.deepseek.com',
    },
    codex: {
      enabled: true,
      label: 'Codex',
      authFile: '',
      baseUrl: 'https://chatgpt.com',
      billingBaseUrl: 'https://api.openai.com',
      apiKey: '',
      apiKeyEnv: 'OPENAI_API_KEY',
    },
    kimi: {
      enabled: true,
      label: 'Kimi',
      apiKey: '',
      apiKeyEnv: 'KIMI_SUB_API_KEY',
      baseUrl: 'https://api.kimi.ai',
    },
    openrouter: {
      enabled: true,
      label: 'OpenRouter',
      apiKey: '',
      apiKeyEnv: 'OPENROUTER_API_KEY',
      baseUrl: 'https://openrouter.ai',
    },
  },
  radio: {
    enabled: true,
    volume: 0.6,
    stations: DEFAULT_STATIONS,
  },
}

const PLAN_LABELS = {
  free: 'Free',
  basic: 'Basic',
  plus: 'Plus',
  pro: 'Pro',
  advanced: 'Advanced',
  prolite: 'Pro 100',
  promax: 'Pro 500',
  team: 'Team',
  business: 'Business',
  enterprise: 'Enterprise',
  edu: 'Edu',
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function clamp(value, min, max, fallback) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, number))
}

function merge(base, patch) {
  if (!isObject(patch)) return base
  const out = { ...base }
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue
    if (isObject(value) && isObject(out[key])) out[key] = merge(out[key], value)
    else if (Array.isArray(value)) out[key] = value.slice()
    else out[key] = value
  }
  return out
}

function normalizeConfig(raw) {
  const config = merge(DEFAULTS, isObject(raw) ? raw : {})
  config.enabled = config.enabled !== false
  config.compact = config.compact === true
  config.refreshSeconds = Math.round(clamp(config.refreshSeconds, 15, 3600, 120))
  const layout = Array.isArray(config.layout) ? config.layout : DEFAULTS.layout
  config.layout = layout.map((entry) => String(entry)).filter(Boolean)

  const providers = {}
  for (const id of ['deepseek', 'codex', 'kimi', 'openrouter']) {
    const base = DEFAULTS.providers[id]
    const given = isObject(config.providers) && isObject(config.providers[id]) ? config.providers[id] : {}
    providers[id] = { ...base, ...given, enabled: given.enabled !== false }
  }
  config.providers = providers

  const radio = { ...DEFAULTS.radio, ...(isObject(config.radio) ? config.radio : {}) }
  const stations = Array.isArray(radio.stations) ? radio.stations : DEFAULT_STATIONS
  const isHttpUrl = (value) => typeof value === 'string' && /^https?:\/\//i.test(value)
  radio.stations = stations
    .filter((station) => isObject(station))
    .map((station, index) => {
      const tracks = Array.isArray(station.tracks) ? station.tracks.filter(isHttpUrl) : []
      const url = isHttpUrl(station.url) ? station.url : tracks[0]
      if (!url) return null
      const entry = {
        id: String(station.id || `station-${index}`),
        name: String(station.name || station.id || `Radio ${index + 1}`),
        url,
        tag: station.tag ? String(station.tag) : '',
      }
      if (tracks.length > 0) entry.tracks = tracks
      return entry
    })
    .filter(Boolean)
  if (radio.stations.length === 0) radio.stations = DEFAULT_STATIONS.slice()
  radio.volume = clamp(radio.volume, 0, 1, 0.6)
  radio.enabled = radio.enabled !== false
  config.radio = radio
  return config
}

function publicConfig(config) {
  return {
    enabled: config.enabled,
    compact: config.compact,
    refreshSeconds: config.refreshSeconds,
    layout: config.layout,
    providers: {
      deepseek: { enabled: config.providers.deepseek.enabled, label: config.providers.deepseek.label },
      codex: { enabled: config.providers.codex.enabled, label: config.providers.codex.label },
      kimi: { enabled: config.providers.kimi.enabled, label: config.providers.kimi.label },
      openrouter: { enabled: config.providers.openrouter.enabled, label: config.providers.openrouter.label },
    },
    radio: {
      enabled: config.radio.enabled,
      volume: config.radio.volume,
      stations: config.radio.stations,
    },
  }
}

function round2(value) {
  return Math.round(value * 100) / 100
}

function failure(status, message) {
  return { status, message, updatedAt: Date.now() }
}

async function requestJson(url, init = {}, timeoutMs = 9000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { ...init, signal: controller.signal, redirect: 'follow' })
    let data = null
    try {
      const text = await response.text()
      data = text ? JSON.parse(text) : null
    } catch {
      data = null
    }
    return { ok: response.ok, status: response.status, data, network: null }
  } catch (error) {
    const aborted = error && (error.name === 'AbortError' || error.name === 'TimeoutError')
    return { ok: false, status: 0, data: null, network: aborted ? 'timeout' : 'network' }
  } finally {
    clearTimeout(timer)
  }
}

function networkFailure(result) {
  return failure('network', result.network === 'timeout' ? 'The provider did not answer in time' : 'The provider could not be reached')
}

async function resolveKey(ctx, explicit, envName) {
  if (typeof explicit === 'string' && explicit.trim()) return explicit.trim()
  const name = typeof envName === 'string' && envName.trim() ? envName.trim() : ''
  if (!name) return undefined
  const credentials = ctx.get('credentials')
  if (credentials) {
    try {
      const resolved = await credentials.resolve(name)
      if (resolved && typeof resolved.value === 'string' && resolved.value) return resolved.value
    } catch {
      // Fall through to the ambient process environment.
    }
  }
  const ambient = process.env[name]
  return typeof ambient === 'string' && ambient.trim() ? ambient.trim() : undefined
}

function planLabel(plan) {
  if (!plan) return null
  const key = String(plan).toLowerCase()
  return PLAN_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1)
}

function windowLabel(seconds) {
  const value = Number(seconds)
  if (!Number.isFinite(value) || value <= 0) return 'window'
  if (value % 86400 === 0) return `${value / 86400}d`
  if (value % 3600 === 0) return `${value / 3600}h`
  if (value % 60 === 0) return `${value / 60}m`
  return `${value}s`
}

function readWindows(rateLimit) {
  const windows = []
  for (const window of [rateLimit && rateLimit.primary_window, rateLimit && rateLimit.secondary_window]) {
    if (!isObject(window)) continue
    const seconds = Number(window.limit_window_seconds)
    windows.push({
      label: windowLabel(seconds),
      usedPercent: clamp(window.used_percent, 0, 100, null),
      resetsAt: Number.isFinite(Number(window.reset_at)) ? Number(window.reset_at) * 1000 : null,
    })
  }
  return windows
}

async function readDeepseek(ctx, config) {
  const provider = config.providers.deepseek
  const baseUrl = provider.baseUrl || 'https://api.deepseek.com'
  let accountState = null

  const account = provider.useAccount === false ? undefined : ctx.get('deepseekAccount')
  if (account) {
    try {
      accountState = await account.getState()
    } catch {
      accountState = null
    }
    if (accountState && accountState.status === 'credential-stored') {
      try {
        const details = await account.getBalance({
          version: '1.0.0',
          locale: 'en',
          timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
        })
        if (details && details.status === 'ready') {
          const wallets = []
          for (const wallet of details.value || []) {
            wallets.push({ currency: wallet.currency, balance: Number(wallet.balance) || 0, bonus: false })
          }
          for (const wallet of details.bonusWallets || []) {
            wallets.push({ currency: wallet.currency, balance: Number(wallet.balance) || 0, bonus: true })
          }
          const totals = new Map()
          for (const wallet of wallets) {
            if (wallet.bonus) continue
            totals.set(wallet.currency, (totals.get(wallet.currency) || 0) + wallet.balance)
          }
          for (const wallet of wallets) {
            if (!wallet.bonus) continue
            totals.set(wallet.currency, (totals.get(wallet.currency) || 0) + wallet.balance)
          }
          const currencies = [...totals.keys()].filter((currency) => Number.isFinite(totals.get(currency)))
          if (currencies.length > 0) {
            // Show the wallet that actually carries money: a zero USD wallet must not
            // hide a funded CNY bonus wallet.
            currencies.sort((left, right) => Math.abs(totals.get(right)) - Math.abs(totals.get(left)))
            const currency = currencies[0]
            return {
              status: 'ready',
              unit: 'currency',
              amount: round2(totals.get(currency)),
              currency,
              wallets,
              source: 'account',
              updatedAt: Date.now(),
            }
          }
        }
      } catch {
        // Fall back to the public API balance when the account query fails.
      }
    }
  }

  const key = await resolveKey(ctx, provider.apiKey, provider.apiKeyEnv)
  if (!key) {
    if (accountState && accountState.status === 'signed-out') {
      return failure('signed_out', 'The DeepSeek account is not signed in and no API key is configured')
    }
    return failure('no_credential', 'Set DEEPSEEK_API_KEY (or config.providers.deepseek.apiKey)')
  }
  const result = await requestJson(new URL('/user/balance', baseUrl), {
    headers: { authorization: `Bearer ${key}`, accept: 'application/json' },
  })
  if (result.network) return networkFailure(result)
  if (result.status === 401 || result.status === 403) return failure('auth', 'The DeepSeek API key was rejected')
  if (!result.ok) return failure('http', `DeepSeek answered HTTP ${result.status}`)
  const infos = result.data && Array.isArray(result.data.balance_infos) ? result.data.balance_infos : null
  const info = infos && infos[0]
  if (!info || !Number.isFinite(Number(info.total_balance))) return failure('parse', 'DeepSeek returned an unexpected balance payload')
  return {
    status: 'ready',
    unit: 'currency',
    amount: round2(Number(info.total_balance)),
    currency: typeof info.currency === 'string' ? info.currency : 'CNY',
    wallets: [{ currency: info.currency || 'CNY', balance: round2(Number(info.total_balance)), bonus: false }],
    detail: Number.isFinite(Number(info.topped_up_balance)) ? `topped up ${round2(Number(info.topped_up_balance))}` : null,
    source: 'api',
    updatedAt: Date.now(),
  }
}

async function readOpenrouter(ctx, config) {
  const provider = config.providers.openrouter
  const key = await resolveKey(ctx, provider.apiKey, provider.apiKeyEnv)
  if (!key) return failure('no_credential', 'Set OPENROUTER_API_KEY (or config.providers.openrouter.apiKey)')
  const result = await requestJson(new URL('/api/v1/credits', provider.baseUrl || 'https://openrouter.ai'), {
    headers: { authorization: `Bearer ${key}`, accept: 'application/json' },
  })
  if (result.network) return networkFailure(result)
  if (result.status === 401 || result.status === 403) return failure('auth', 'The OpenRouter API key was rejected')
  if (!result.ok) return failure('http', `OpenRouter answered HTTP ${result.status}`)
  const data = result.data && isObject(result.data.data) ? result.data.data : null
  const total = data ? Number(data.total_credits) : NaN
  const used = data ? Number(data.total_usage) : NaN
  if (!Number.isFinite(total) || !Number.isFinite(used)) return failure('parse', 'OpenRouter returned an unexpected credits payload')
  return {
    status: 'ready',
    unit: 'currency',
    amount: round2(Math.max(0, total - used)),
    currency: 'USD',
    used: round2(used),
    total: round2(total),
    source: 'credits',
    updatedAt: Date.now(),
  }
}

async function readCodexAuth(provider) {
  const candidates = []
  if (typeof provider.authFile === 'string' && provider.authFile.trim()) {
    candidates.push(provider.authFile.trim().replace(/^~(?=$|[\\/])/, homedir()))
  }
  if (process.env.CODEX_HOME) candidates.push(join(process.env.CODEX_HOME, 'auth.json'))
  candidates.push(join(homedir(), '.codex', 'auth.json'))
  candidates.push(join(homedir(), '.config', 'codex', 'auth.json'))
  for (const file of candidates) {
    try {
      const text = await readFile(file, 'utf8')
      const parsed = JSON.parse(text)
      if (isObject(parsed)) return parsed
    } catch {
      // Try the next candidate.
    }
  }
  return null
}

async function readOpenAiBilling(key, provider) {
  const result = await requestJson(new URL('/v1/dashboard/billing/credit_grants', provider.billingBaseUrl || 'https://api.openai.com'), {
    headers: { authorization: `Bearer ${key}`, accept: 'application/json' },
  })
  if (result.network) return networkFailure(result)
  if (result.status === 401 || result.status === 403) return failure('auth', 'The OpenAI API key was rejected')
  if (!result.ok) return failure('http', `OpenAI billing answered HTTP ${result.status}`)
  const available = result.data ? Number(result.data.total_available) : NaN
  if (!Number.isFinite(available)) return failure('parse', 'OpenAI billing returned an unexpected payload')
  return {
    status: 'ready',
    unit: 'currency',
    amount: round2(available),
    currency: 'USD',
    source: 'billing',
    updatedAt: Date.now(),
  }
}

async function readCodex(ctx, config) {
  const provider = config.providers.codex
  const auth = await readCodexAuth(provider)
  const tokens = auth && isObject(auth.tokens) ? auth.tokens : null
  const apiKeyFromConfig = await resolveKey(ctx, provider.apiKey, '')
  const fallbackKey = apiKeyFromConfig || (auth && typeof auth.OPENAI_API_KEY === 'string' && auth.OPENAI_API_KEY.trim()) || undefined

  if (tokens && typeof tokens.access_token === 'string' && tokens.access_token) {
    const headers = { authorization: `Bearer ${tokens.access_token}`, accept: 'application/json' }
    if (typeof tokens.account_id === 'string' && tokens.account_id) headers['chatgpt-account-id'] = tokens.account_id
    const result = await requestJson(new URL('/backend-api/wham/usage', provider.baseUrl || 'https://chatgpt.com'), { headers })
    if (result.network) return networkFailure(result)
    if (result.ok && isObject(result.data)) {
      const data = result.data
      const plan = planLabel(data.plan_type)
      const windows = readWindows(data.rate_limit)
      const credits = isObject(data.credits) ? data.credits : null
      if (credits && credits.has_credits === true && credits.unlimited !== true && Number.isFinite(Number(credits.balance))) {
        return {
          status: 'ready',
          unit: 'credits',
          amount: round2(Number(credits.balance)),
          plan,
          windows,
          source: 'chatgpt',
          updatedAt: Date.now(),
        }
      }
      if (windows.length > 0) {
        // Headroom is the narrowest window: report the one closest to its limit.
        let tightest = null
        for (const window of windows) {
          if (window.usedPercent === null) continue
          if (tightest === null || window.usedPercent > tightest.usedPercent) tightest = window
        }
        if (tightest !== null) {
          return {
            status: 'ready',
            unit: 'percent',
            amount: round2(Math.max(0, 100 - tightest.usedPercent)),
            window: tightest.label,
            plan,
            windows,
            source: 'chatgpt',
            updatedAt: Date.now(),
          }
        }
      }
      if (plan) {
        return {
          status: 'ready',
          unit: 'plan',
          amount: null,
          plan,
          windows,
          source: 'chatgpt',
          updatedAt: Date.now(),
        }
      }
      return failure('parse', 'Codex usage returned no plan, window, or credits')
    }
    if (result.status !== 401 && result.status !== 403) {
      return failure('http', `Codex usage answered HTTP ${result.status}`)
    }
    if (fallbackKey) return readOpenAiBilling(fallbackKey, provider)
    return failure('auth', 'The Codex session was rejected; run `codex login` and try again')
  }

  if (fallbackKey) return readOpenAiBilling(fallbackKey, provider)
  return failure('no_credential', 'Codex is not signed in and no OpenAI API key is configured')
}

function rollingSeconds(window) {
  if (!isObject(window)) return null
  const duration = Number(window.duration)
  if (!Number.isFinite(duration) || duration <= 0) return null
  const unit = String(window.timeUnit || '').toUpperCase()
  if (unit.includes('DAY')) return duration * 86400
  if (unit.includes('HOUR')) return duration * 3600
  if (unit.includes('MINUTE')) return duration * 60
  if (unit.includes('SECOND')) return duration
  return null
}

function kimiQuotaWindow(label, quota) {
  const limit = Number(quota && quota.limit)
  const used = Number(quota && quota.used)
  const usedPercent = Number.isFinite(limit) && limit > 0 && Number.isFinite(used)
    ? clamp((used / limit) * 100, 0, 100, null)
    : null
  const resetsAt = quota && quota.resetTime ? Date.parse(quota.resetTime) : NaN
  return { label, usedPercent, resetsAt: Number.isFinite(resetsAt) ? resetsAt : null }
}

async function readKimi(ctx, config) {
  const provider = config.providers.kimi
  let key = typeof provider.apiKey === 'string' && provider.apiKey.trim() ? provider.apiKey.trim() : undefined
  if (!key) {
    // The Kimi Code subscription key: DSH credential store first, then ambient env fallbacks.
    const envNames = [provider.apiKeyEnv || 'KIMI_SUB_API_KEY', 'KIMI_CODE_API_KEY', 'KIMI_API_KEY', 'MOONSHOT_API_KEY']
    for (const name of envNames) {
      key = await resolveKey(ctx, '', name)
      if (key) break
    }
  }
  if (!key) return failure('no_credential', 'Set KIMI_SUB_API_KEY (or config.providers.kimi.apiKey)')

  // The connection to this Cloudflare front occasionally hangs mid-handshake;
  // re-resolve DNS and retry a few times before giving up.
  const usagesUrl = new URL('/coding/v1/usages', provider.baseUrl || 'https://api.kimi.ai')
  let result = null
  for (let attempt = 0; attempt < 3; attempt++) {
    result = await requestJson(usagesUrl, {
      headers: { authorization: `Bearer ${key}`, accept: 'application/json' },
    }, 8000)
    if (!result.network) break
  }
  if (result.network) return networkFailure(result)
  if (result.status === 401 || result.status === 403) return failure('auth', 'The Kimi subscription key was rejected')
  if (!result.ok) return failure('http', `Kimi usage answered HTTP ${result.status}`)
  const data = isObject(result.data) ? result.data : null
  if (!data) return failure('parse', 'Kimi returned an unexpected usage payload')

  const rawLevel = data.user && isObject(data.user.membership) ? data.user.membership.level : null
  const plan = rawLevel ? planLabel(String(rawLevel).replace(/^level_/i, '')) : null
  const windows = []
  // Rolling limit windows, including the 5h (300 minute) window.
  if (Array.isArray(data.limits)) {
    for (const limit of data.limits) {
      if (!isObject(limit) || !isObject(limit.detail)) continue
      windows.push(kimiQuotaWindow(windowLabel(rollingSeconds(limit.window)), limit.detail))
    }
  }
  // Scheme B (current api.kimi.ai): named usage ratios, e.g. limit_5h / limit_month_total.
  if (isObject(data.usages)) {
    const USAGE_LABELS = { limit_5h: '5h', limit_week: '7d', limit_month_total: '30d', limit_month_code: '30d code' }
    for (const [name, value] of Object.entries(data.usages)) {
      if (!isObject(value)) continue
      const usedPercent = clamp(Number(value.used_ratio) * 100, 0, 100, null)
      const resetsAt = value.reset_time ? Date.parse(value.reset_time) : NaN
      windows.push({ label: USAGE_LABELS[name] || name, usedPercent, resetsAt: Number.isFinite(resetsAt) ? resetsAt : null })
    }
  }
  // Scheme A (pi-kimi-usage): weekly Quota of the 7-day subscription period.
  if (isObject(data.usage)) windows.push(kimiQuotaWindow('7d', data.usage))
  const booster = isObject(data.boosterWallet) ? data.boosterWallet : null
  const monthlyLimit = booster && isObject(booster.monthlyChargeLimit) ? booster.monthlyChargeLimit : null
  const monthlyUsed = booster && isObject(booster.monthlyUsed) ? booster.monthlyUsed : null
  const detail = monthlyLimit && Number.isFinite(Number(monthlyLimit.priceInCents))
    ? `booster ¥${(Number(monthlyUsed && monthlyUsed.priceInCents) || 0) / 100} / ¥${Number(monthlyLimit.priceInCents) / 100}`
    : null

  // Headroom is the tightest window: report the one closest to its limit.
  let tightest = null
  for (const window of windows) {
    if (window.usedPercent === null) continue
    if (tightest === null || window.usedPercent > tightest.usedPercent) tightest = window
  }
  if (tightest !== null) {
    return {
      status: 'ready',
      unit: 'percent',
      amount: round2(Math.max(0, 100 - tightest.usedPercent)),
      window: tightest.label,
      plan,
      windows,
      detail,
      source: 'kimi',
      updatedAt: Date.now(),
    }
  }
  if (plan) {
    return { status: 'ready', unit: 'plan', amount: null, plan, windows, detail, source: 'kimi', updatedAt: Date.now() }
  }
  return failure('parse', 'Kimi usage returned no plan or quota')
}

async function readProviders(ctx, config) {
  const jobs = {
    deepseek: config.providers.deepseek.enabled ? readDeepseek(ctx, config) : Promise.resolve({ status: 'disabled' }),
    openrouter: config.providers.openrouter.enabled ? readOpenrouter(ctx, config) : Promise.resolve({ status: 'disabled' }),
    codex: config.providers.codex.enabled ? readCodex(ctx, config) : Promise.resolve({ status: 'disabled' }),
    kimi: config.providers.kimi.enabled ? readKimi(ctx, config) : Promise.resolve({ status: 'disabled' }),
  }
  const entries = await Promise.all(
    Object.entries(jobs).map(async ([id, job]) => {
      try {
        return [id, await job]
      } catch (error) {
        return [id, failure('error', error && error.message ? String(error.message) : 'Balance lookup failed')]
      }
    }),
  )
  return Object.fromEntries(entries)
}

function sendJson(response, status, value, headOnly) {
  const body = JSON.stringify(value)
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
  })
  response.end(headOnly ? undefined : body)
}

export const inject = ['webServer']

export function apply(ctx, rawConfig) {
  const config = normalizeConfig(rawConfig)
  const ttl = config.refreshSeconds * 1000
  // Optional DSH admission: Host/Origin checks plus browser authentication, applied to this
  // plugin's Web route through Connection's own trust policy (open-market review note).
  const connection = ctx.get('connection')
  const requestRejection =
    connection && typeof connection.requestRejection === 'function'
      ? (headers) => {
          try {
            return connection.requestRejection({ headers })
          } catch {
            return 403
          }
        }
      : null
  let cache = null
  let cachedAt = 0
  let inflight = null

  async function snapshot(force) {
    const now = Date.now()
    if (!force && cache && now - cachedAt < ttl) return cache
    if (!inflight) {
      inflight = readProviders(ctx, config)
        .then((providers) => {
          cache = {
            ok: true,
            updatedAt: Date.now(),
            refreshSeconds: config.refreshSeconds,
            config: publicConfig(config),
            providers,
          }
          cachedAt = Date.now()
          return cache
        })
        .finally(() => {
          inflight = null
        })
    }
    return inflight
  }

  const handler = async (req, res) => {
    try {
      const requestUrl = new URL(req.url || '/', 'http://127.0.0.1')
      if (requestRejection) {
        const rejection = requestRejection(req.headers)
        if (rejection) {
          sendJson(res, rejection, { ok: false, error: 'request_rejected' }, req.method === 'HEAD')
          return
        }
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        sendJson(res, 405, { ok: false, error: 'method_not_allowed' })
        return
      }
      const force = requestUrl.searchParams.get('refresh') === '1'
      const value = await snapshot(force)
      sendJson(res, 200, value, req.method === 'HEAD')
    } catch {
      sendJson(res, 500, { ok: false, error: 'internal_error' })
    }
  }

  ctx.effect(() => ctx.webServer.register({ kind: 'exact', path: '/_dsh/statusbar/state', handler }))
}
