/**
 * Client half of the DSH status bar bundle.
 *
 * Renders a full-width bar in the `shell.bottom` seat: provider balance chips
 * on the left and an internet radio player on the right. The Host half owns
 * every network call; this module only reads one same-origin JSON snapshot.
 */
window.__ModuleLoader__.load({
  id: '@mineuchi/dsh-status-bar',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const STATE_URL = '/_dsh/statusbar/state'
    const STORAGE = {
      hidden: 'dsh.statusbar.hidden',
      compact: 'dsh.statusbar.compact',
      station: 'dsh.statusbar.station',
      volume: 'dsh.statusbar.volume',
    }

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

    const DEFAULT_LAYOUT = ['deepseek', 'codex', 'kimi', 'openrouter', 'spacer', 'radio']
    const PROVIDERS = ['deepseek', 'codex', 'kimi', 'openrouter']

    const EN = {
      barLabel: 'Status bar',
      refresh: 'Refresh',
      refreshNow: 'Refresh now',
      updated: 'Updated',
      loading: 'Loading…',
      close: 'Close',
      settings: 'Status bar settings',
      chips: 'Chips',
      behavior: 'Behavior',
      compact: 'Compact chips',
      status_ready: 'Ready',
      status_disabled: 'Disabled',
      status_no_credential: 'No credential',
      status_signed_out: 'Sign-in required',
      status_auth: 'Credential rejected',
      status_http: 'Request failed',
      status_network: 'Network error',
      status_parse: 'Unexpected response',
      status_error: 'Lookup failed',
      provider_deepseek: 'DeepSeek',
      provider_codex: 'Codex',
      provider_kimi: 'Kimi',
      provider_openrouter: 'OpenRouter',
      provider_radio: 'Radio',
      credits: 'credits',
      used: 'Used',
      total: 'Total',
      wallet: 'Wallet',
      bonus: 'bonus',
      plan: 'Plan',
      window: 'window',
      resetAt: 'resets',
      details: 'Details',
      radioStations: 'Stations',
      radioVolume: 'Volume',
      radioPlay: 'Play',
      radioPause: 'Pause',
      radioPrev: 'Previous station',
      radioNext: 'Next station',
      radioStop: 'Stop',
      radioLive: 'live',
      radioErrorBlocked: 'The browser blocked playback — press play again.',
      radioErrorStream: 'This station could not be played.',
      noData: '—',
      offline: 'Status bar is unavailable',
      source_account: 'DeepSeek account',
      source_api: 'API key',
      source_credits: 'OpenRouter credits',
      source_chatgpt: 'ChatGPT usage',
      source_billing: 'OpenAI billing',
      source_kimi: 'Kimi Code usage',
    }

    const RU = {
      barLabel: 'Строка состояния',
      refresh: 'Обновить',
      refreshNow: 'Обновить сейчас',
      updated: 'Обновлено',
      loading: 'Загрузка…',
      close: 'Закрыть',
      settings: 'Настройки строки состояния',
      chips: 'Плашки',
      behavior: 'Поведение',
      compact: 'Компактные плашки',
      status_ready: 'Готово',
      status_disabled: 'Выключено',
      status_no_credential: 'Нет ключа',
      status_signed_out: 'Нужен вход',
      status_auth: 'Ключ отклонён',
      status_http: 'Ошибка запроса',
      status_network: 'Нет сети',
      status_parse: 'Неожиданный ответ',
      status_error: 'Ошибка',
      provider_deepseek: 'DeepSeek',
      provider_codex: 'Codex',
      provider_kimi: 'Kimi',
      provider_openrouter: 'OpenRouter',
      provider_radio: 'Радио',
      credits: 'кредитов',
      used: 'Использовано',
      total: 'Всего',
      wallet: 'Кошелёк',
      bonus: 'бонус',
      plan: 'План',
      window: 'окно',
      resetAt: 'сброс',
      details: 'Подробнее',
      radioStations: 'Станции',
      radioVolume: 'Громкость',
      radioPlay: 'Играть',
      radioPause: 'Пауза',
      radioPrev: 'Предыдущая станция',
      radioNext: 'Следующая станция',
      radioStop: 'Стоп',
      radioLive: 'в эфире',
      radioErrorBlocked: 'Браузер заблокировал воспроизведение — нажмите «Играть» ещё раз.',
      radioErrorStream: 'Эту станцию не удалось воспроизвести.',
      noData: '—',
      offline: 'Строка состояния недоступна',
      source_account: 'Аккаунт DeepSeek',
      source_api: 'API-ключ',
      source_credits: 'Кредиты OpenRouter',
      source_chatgpt: 'Использование ChatGPT',
      source_billing: 'Биллинг OpenAI',
      source_kimi: 'Использование Kimi Code',
    }

    const ZH = {
      barLabel: '状态栏',
      refresh: '刷新',
      refreshNow: '立即刷新',
      updated: '已更新',
      loading: '加载中…',
      close: '关闭',
      settings: '状态栏设置',
      chips: '卡片',
      behavior: '行为',
      compact: '紧凑模式',
      status_ready: '正常',
      status_disabled: '已停用',
      status_no_credential: '未配置密钥',
      status_signed_out: '需要登录',
      status_auth: '密钥被拒绝',
      status_http: '请求失败',
      status_network: '网络错误',
      status_parse: '响应异常',
      status_error: '查询失败',
      provider_deepseek: 'DeepSeek',
      provider_codex: 'Codex',
      provider_openrouter: 'OpenRouter',
      provider_radio: '电台',
      credits: '点数',
      used: '已用',
      total: '总额',
      wallet: '钱包',
      bonus: '赠送',
      plan: '套餐',
      window: '窗口',
      resetAt: '重置',
      details: '详情',
      radioStations: '电台',
      radioVolume: '音量',
      radioPlay: '播放',
      radioPause: '暂停',
      radioPrev: '上一个电台',
      radioNext: '下一个电台',
      radioStop: '停止',
      radioLive: '直播',
      radioErrorBlocked: '浏览器阻止了播放，请再按一次播放。',
      radioErrorStream: '该电台无法播放。',
      noData: '—',
      offline: '状态栏暂不可用',
      source_account: 'DeepSeek 账户',
      source_api: 'API 密钥',
      source_credits: 'OpenRouter 额度',
      source_chatgpt: 'ChatGPT 用量',
      source_billing: 'OpenAI 账单',
      source_kimi: 'Kimi Code 用量',
    }

    const CSS = [
      '.dsh-sb{display:flex;align-items:center;gap:6px;width:100%;height:30px;padding:0 10px;box-sizing:border-box;background:var(--dsw-alias-bg-layer-1);border-top:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);font:500 12px/1.2 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;user-select:none;position:relative}',
      '.dsh-sb-spacer{flex:1 1 auto;min-width:4px}',
      '.dsh-sb-chip{display:inline-flex;align-items:center;gap:6px;height:22px;padding:0 8px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);cursor:pointer;font:inherit;white-space:nowrap}',
      '.dsh-sb-chip:hover{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary)}',
      '.dsh-sb-chip.dsh-sb-icon{width:24px;padding:0;justify-content:center}',
      '.dsh-sb-chip.is-open{border-color:var(--dsw-alias-brand-primary)}',
      '.dsh-sb-picon{display:block;flex:0 0 auto}',
      '.dsh-sb-dot{width:7px;height:7px;border-radius:50%;flex:0 0 auto;background:var(--dsw-alias-state-idle-primary)}',
      '.dsh-sb-dot.is-warn{background:var(--dsw-alias-state-warn-primary)}',
      '.dsh-sb-dot.is-error{background:var(--dsw-alias-state-error-primary)}',
      '.dsh-sb-dot.is-live{background:var(--dsw-alias-state-success-primary)}',
      '.dsh-sb-label{color:var(--dsw-alias-label-secondary);max-width:120px;overflow:hidden;text-overflow:ellipsis}',
      '.dsh-sb-value{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}',
      '.dsh-sb-btn{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;flex:0 0 auto}',
      '.dsh-sb-btn:hover{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary)}',
      '.dsh-sb-btn[aria-pressed="true"]{color:var(--dsw-alias-brand-primary)}',
      '.dsh-sb-station{display:inline-flex;align-items:center;gap:6px;max-width:230px;height:20px;padding:0 2px;border:0;background:transparent;color:inherit;font:inherit;cursor:pointer;overflow:hidden}',
      '.dsh-sb-station .dsh-sb-value{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dsh-sb-station:hover .dsh-sb-value{color:var(--dsw-alias-brand-primary)}',
      '.dsh-sb-pop{position:fixed;right:12px;bottom:38px;z-index:2147483000;width:330px;max-height:min(70vh,440px);overflow:auto;box-sizing:border-box;padding:10px;border-radius:10px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:400 12px/1.45 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}',
      '.dsh-sb-pop-head{display:flex;align-items:center;gap:8px;margin-bottom:6px}',
      '.dsh-sb-pop-title{font-weight:600;flex:1 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}',
      '.dsh-sb-pop-value{font-size:22px;font-weight:600;font-variant-numeric:tabular-nums;margin:2px 0 8px}',
      '.dsh-sb-row{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:3px 0;color:var(--dsw-alias-label-secondary)}',
      '.dsh-sb-row b{color:var(--dsw-alias-label-primary);font-weight:500;font-variant-numeric:tabular-nums;text-align:right}',
      '.dsh-sb-note{margin:6px 0;color:var(--dsw-alias-state-warn-primary)}',
      '.dsh-sb-hint{color:var(--dsw-alias-label-secondary);font-size:11px;margin-top:2px}',
      '.dsh-sb-meta{margin-top:8px;padding-top:8px;border-top:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);font-size:11px}',
      '.dsh-sb-actions{display:flex;gap:6px;margin:8px 0}',
      '.dsh-sb-action{flex:1 1 auto;height:26px;border-radius:6px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer}',
      '.dsh-sb-action:hover{border-color:var(--dsw-alias-border-l2)}',
      '.dsh-sb-action:disabled{opacity:.55;cursor:default}',
      '.dsh-sb-station-row{display:flex;align-items:center;width:100%;height:28px;padding:0 8px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;text-align:left;gap:8px;box-sizing:border-box}',
      '.dsh-sb-station-row:hover{background:var(--dsw-alias-bg-layer-1)}',
      '.dsh-sb-station-row.is-active{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-brand-primary)}',
      '.dsh-sb-station-row small{margin-left:auto;color:var(--dsw-alias-label-secondary);font-size:11px}',
      '.dsh-sb-range{width:100%;margin:4px 0 2px;accent-color:var(--dsw-alias-brand-primary)}',
      '.dsh-sb-check{display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer}',
      '.dsh-sb-check input{accent-color:var(--dsw-alias-brand-primary)}',
      '.dsh-sb-check span{flex:1 1 auto}',
      '.dsh-sb-check small{color:var(--dsw-alias-label-secondary);font-size:11px}',
      '.dsh-sb-section{margin:10px 0 2px;color:var(--dsw-alias-label-secondary);font-size:11px;text-transform:uppercase;letter-spacing:.04em}',
      '.dsh-sb-muted{color:var(--dsw-alias-label-secondary);font-size:11px}',
    ].join('')

    function lsGet(key, fallback) {
      try {
        const raw = window.localStorage.getItem(key)
        return raw === null ? fallback : JSON.parse(raw)
      } catch {
        return fallback
      }
    }

    function lsSet(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch {
        // Storage may be unavailable; the bar still works without persistence.
      }
    }

    function clampNumber(value, min, max) {
      const number = Number(value)
      if (!Number.isFinite(number)) return min
      return Math.min(max, Math.max(min, number))
    }

    function formatMoney(amount, currency) {
      if (typeof amount !== 'number' || !Number.isFinite(amount)) return '—'
      try {
        return new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: currency || 'USD',
          maximumFractionDigits: 2,
        }).format(amount)
      } catch {
        return `${amount.toFixed(2)} ${currency || ''}`.trim()
      }
    }

    function formatCredits(amount) {
      if (typeof amount !== 'number' || !Number.isFinite(amount)) return '—'
      try {
        return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(amount)} cr`
      } catch {
        return `${amount} cr`
      }
    }

    function stationTracks(station) {
      if (!station) return []
      if (Array.isArray(station.tracks) && station.tracks.length > 0) {
        return station.tracks.filter((entry) => typeof entry === 'string' && entry.length > 0)
      }
      return typeof station.url === 'string' && station.url ? [station.url] : []
    }

    function stationTrackUrl(station, index) {
      const tracks = stationTracks(station)
      if (tracks.length === 0) return null
      return tracks[Math.min(Math.max(index, 0), tracks.length - 1)]
    }

    function timeOf(value) {
      try {
        return new Date(value).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      } catch {
        return ''
      }
    }

    function glyph(name) {
      const common = { width: 12, height: 12, viewBox: '0 0 12 12', 'aria-hidden': true, focusable: false }
      if (name === 'play') return h('svg', common, h('path', { d: 'M3 1.8 10 6l-7 4.2z', fill: 'currentColor' }))
      if (name === 'pause') {
        return h(
          'svg',
          common,
          h('rect', { x: 2.4, y: 1.8, width: 2.4, height: 8.4, rx: 0.6, fill: 'currentColor' }),
          h('rect', { x: 7.2, y: 1.8, width: 2.4, height: 8.4, rx: 0.6, fill: 'currentColor' }),
        )
      }
      if (name === 'prev') {
        return h('svg', common, h('path', { d: 'M9.8 2.1 4 6l5.8 3.9zM3.2 2v8', stroke: 'currentColor', strokeWidth: 1.3, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }))
      }
      if (name === 'next') {
        return h('svg', common, h('path', { d: 'M2.2 2.1 8 6l-5.8 3.9zM8.8 2v8', stroke: 'currentColor', strokeWidth: 1.3, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }))
      }
      if (name === 'close') {
        return h('svg', common, h('path', { d: 'M2.6 2.6 9.4 9.4M9.4 2.6 2.6 9.4', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' }))
      }
      if (name === 'refresh') {
        return h('svg', common, h('path', { d: 'M10 6a4 4 0 1 1-1.3-3M10 1.6V4.6H7', stroke: 'currentColor', strokeWidth: 1.3, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }))
      }
      // Sliders glyph: the settings seat.
      return h(
        'svg',
        common,
        h('path', { d: 'M1.5 3.4h9M1.5 6h9M1.5 8.6h9', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' }),
        h('circle', { cx: 4.2, cy: 3.4, r: 1.5, fill: 'var(--dsw-alias-bg-layer-1)', stroke: 'currentColor', strokeWidth: 1.2 }),
        h('circle', { cx: 8.2, cy: 8.6, r: 1.5, fill: 'var(--dsw-alias-bg-layer-1)', stroke: 'currentColor', strokeWidth: 1.2 }),
      )
    }

    function statusKey(status) {
      return `status_${status || 'error'}`
    }

    const PROVIDER_COLORS = {
      deepseek: '#4D6BFE',
      codex: '#10A37F',
      kimi: '#F43F5E',
      openrouter: '#8B5CF6',
    }

    function providerTone(id, provider) {
      if (!provider || provider.status === 'loading' || provider.status === 'disabled') return 'var(--dsw-alias-state-idle-primary)'
      if (provider.status === 'ready') return PROVIDER_COLORS[id] || 'var(--dsw-alias-brand-primary)'
      if (provider.status === 'no_credential' || provider.status === 'signed_out') return 'var(--dsw-alias-state-warn-primary)'
      return 'var(--dsw-alias-state-error-primary)'
    }

    function providerGlyph(id, provider, size) {
      const common = {
        width: size || 12,
        height: size || 12,
        viewBox: '0 0 12 12',
        className: 'dsh-sb-picon',
        'aria-hidden': true,
        focusable: false,
        style: { color: providerTone(id, provider) },
      }
      if (id === 'deepseek') {
        // A drop of deep water.
        return h('svg', common, h('path', { d: 'M6 1.3C8.2 4 9.4 5.6 9.4 7.1A3.4 3.4 0 1 1 2.6 7.1C2.6 5.6 3.8 4 6 1.3Z', fill: 'currentColor' }))
      }
      if (id === 'codex') {
        // Code brackets.
        return h('svg', common, h('path', { d: 'M4.1 2.5 1.5 6l2.6 3.5M7.9 2.5 10.5 6 7.9 9.5', stroke: 'currentColor', strokeWidth: 1.4, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }))
      }
      if (id === 'kimi') {
        // A crescent moon (Moonshot).
        return h('svg', common, h('path', { d: 'M9.6 6.9A4.5 4.5 0 1 1 6.9 1.3 3.6 3.6 0 0 0 9.6 6.9Z', fill: 'currentColor' }))
      }
      // One route splitting into two.
      return h(
        'svg',
        common,
        h('path', { d: 'M1.4 6h3M4.4 6l2.7-2.8h2.1M4.4 6l2.7 2.8h2.1', stroke: 'currentColor', strokeWidth: 1.3, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }),
        h('circle', { cx: 10.2, cy: 3.2, r: 1.15, fill: 'currentColor' }),
        h('circle', { cx: 10.2, cy: 8.8, r: 1.15, fill: 'currentColor' }),
      )
    }

    function providerValue(provider, locale) {
      if (!provider || provider.status !== 'ready') return '—'
      if (provider.unit === 'currency') return formatMoney(provider.amount, provider.currency)
      if (provider.unit === 'credits') return formatCredits(provider.amount)
      if (provider.unit === 'percent') return `${Math.round(provider.amount)}%`
      if (provider.unit === 'plan') return provider.plan || '—'
      return '—'
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        const locale = ctx.locale
        const t = locale.bind('statusbar')

        function useLocaleRevision() {
          if (typeof React.useSyncExternalStore !== 'function') return 0
          return React.useSyncExternalStore(
            (notify) => locale.subscribe(notify),
            () => locale.getSnapshot().revision,
          )
        }

        function StatusBar() {
          useLocaleRevision()

          const [snapshot, setSnapshot] = React.useState(null)
          const [busy, setBusy] = React.useState(false)
          const [fetchError, setFetchError] = React.useState(null)
          const [popover, setPopover] = React.useState(null)
          const [hidden, setHidden] = React.useState(() => {
            const stored = lsGet(STORAGE.hidden, [])
            return Array.isArray(stored) ? stored.filter((entry) => typeof entry === 'string') : []
          })
          const [compact, setCompact] = React.useState(() => lsGet(STORAGE.compact, false) === true)
          const compactTouched = React.useRef(false)
          const [volume, setVolume] = React.useState(() => clampNumber(lsGet(STORAGE.volume, 0.6), 0, 1))
          const [stationIndex, setStationIndex] = React.useState(() => {
            const stored = lsGet(STORAGE.station, null)
            const index = DEFAULT_STATIONS.findIndex((entry) => entry.id === stored)
            return index >= 0 ? index : 0
          })
          const [playing, setPlaying] = React.useState(false)
          const [radioError, setRadioError] = React.useState(null)
          const [trackIndex, setTrackIndex] = React.useState(0)
          const [anchorRect, setAnchorRect] = React.useState(null)

          const audioRef = React.useRef(null)
          const barRef = React.useRef(null)
          const popRef = React.useRef(null)
          const anchorRef = React.useRef(null)
          const stationRef = React.useRef(null)
          const trackIndexRef = React.useRef(0)

          const load = React.useCallback(async (force) => {
            setBusy(true)
            const controller = typeof AbortController === 'function' ? new AbortController() : null
            const timer = controller ? window.setTimeout(() => controller.abort(), 15000) : null
            try {
              const response = await window.fetch(`${STATE_URL}${force ? '?refresh=1' : ''}`, {
                headers: { accept: 'application/json' },
                cache: 'no-store',
                signal: controller ? controller.signal : undefined,
              })
              if (!response.ok) throw new Error(`HTTP ${response.status}`)
              const data = await response.json()
              if (!data || typeof data !== 'object') throw new Error('invalid payload')
              setSnapshot(data)
              setFetchError(null)
            } catch (error) {
              setFetchError(error && error.message ? String(error.message) : 'unavailable')
            } finally {
              if (timer !== null) window.clearTimeout(timer)
              setBusy(false)
            }
          }, [])

          const refreshSeconds = snapshot && snapshot.config && Number(snapshot.config.refreshSeconds) > 0 ? Number(snapshot.config.refreshSeconds) : 120

          function openPopover(id, event) {
            if (popover === id) {
              setPopover(null)
              return
            }
            const element = event && event.currentTarget ? event.currentTarget : null
            anchorRef.current = element
            setAnchorRect(element && element.getBoundingClientRect ? element.getBoundingClientRect() : null)
            setPopover(id)
          }

          React.useEffect(() => {
            let cancelled = false
            void load(false)
            const interval = window.setInterval(() => {
              if (!cancelled && !document.hidden) void load(false)
            }, Math.max(15, refreshSeconds) * 1000)
            const onVisible = () => {
              if (!document.hidden) void load(false)
            }
            document.addEventListener('visibilitychange', onVisible)
            return () => {
              cancelled = true
              window.clearInterval(interval)
              document.removeEventListener('visibilitychange', onVisible)
            }
          }, [load, refreshSeconds])

          React.useEffect(() => {
            if (!popover) return undefined
            const onPointerDown = (event) => {
              const target = event.target
              if (popRef.current && popRef.current.contains(target)) return
              if (barRef.current && barRef.current.contains(target)) return
              setPopover(null)
            }
            const onKeyDown = (event) => {
              if (event.key === 'Escape') setPopover(null)
            }
            document.addEventListener('mousedown', onPointerDown)
            document.addEventListener('keydown', onKeyDown)
            return () => {
              document.removeEventListener('mousedown', onPointerDown)
              document.removeEventListener('keydown', onKeyDown)
            }
          }, [popover])

          React.useEffect(() => {
            lsSet(STORAGE.hidden, hidden)
          }, [hidden])

          React.useEffect(() => {
            lsSet(STORAGE.compact, compact)
          }, [compact])

          React.useEffect(() => {
            const fromConfig = snapshot && snapshot.config ? snapshot.config.compact : null
            if (!compactTouched.current && fromConfig === true) setCompact(true)
          }, [snapshot])

          React.useEffect(() => {
            lsSet(STORAGE.volume, volume)
            if (audioRef.current) audioRef.current.volume = volume
          }, [volume])

          React.useEffect(
            () => () => {
              const audio = audioRef.current
              if (audio) {
                try {
                  audio.pause()
                  audio.removeAttribute('src')
                  audio.load()
                } catch {
                  // The element may already be detached.
                }
              }
              audioRef.current = null
            },
            [],
          )

          const config = snapshot && snapshot.config ? snapshot.config : null
          const providers = snapshot && snapshot.providers ? snapshot.providers : {}
          const stations = config && config.radio && Array.isArray(config.radio.stations) && config.radio.stations.length > 0 ? config.radio.stations : DEFAULT_STATIONS
          const stationsKey = stations.map((entry) => entry.id).join('|')
          const safeIndex = stations.length > 0 ? Math.min(Math.max(stationIndex, 0), stations.length - 1) : 0
          const station = stations[safeIndex] || null

          React.useEffect(() => {
            const stored = lsGet(STORAGE.station, null)
            if (!stored) return
            const index = stations.findIndex((entry) => entry.id === stored)
            if (index >= 0 && index !== stationIndex) setStationIndex(index)
          }, [stationsKey])

          React.useEffect(() => {
            if (station) lsSet(STORAGE.station, station.id)
          }, [station ? station.id : null])

          React.useEffect(() => {
            stationRef.current = station
          }, [station])

          React.useEffect(() => {
            trackIndexRef.current = trackIndex
          }, [trackIndex])

          React.useEffect(() => {
            trackIndexRef.current = 0
            setTrackIndex(0)
          }, [station ? station.id : null])

          React.useEffect(() => {
            if (!popover) return undefined
            const reposition = () => {
              const element = anchorRef.current
              setAnchorRect(element && element.getBoundingClientRect ? element.getBoundingClientRect() : null)
            }
            window.addEventListener('resize', reposition)
            const frame = window.requestAnimationFrame(reposition)
            return () => {
              window.removeEventListener('resize', reposition)
              window.cancelAnimationFrame(frame)
            }
          }, [popover, hidden, compact])

          function ensureAudio() {
            if (audioRef.current) return audioRef.current
            const audio = new window.Audio()
            audio.preload = 'none'
            audio.addEventListener('playing', () => setPlaying(true))
            audio.addEventListener('pause', () => setPlaying(false))
            audio.addEventListener('ended', () => {
              const current = stationRef.current
              const tracks = stationTracks(current)
              if (tracks.length > 1) {
                const next = (trackIndexRef.current + 1) % tracks.length
                trackIndexRef.current = next
                setTrackIndex(next)
                audio.src = tracks[next]
                audio.play().catch(() => setRadioError('stream'))
                return
              }
              setPlaying(false)
            })
            audio.addEventListener('error', () => {
              setPlaying(false)
              if (audio.getAttribute('src')) setRadioError('stream')
            })
            audio.volume = volume
            audioRef.current = audio
            return audio
          }

          async function togglePlay() {
            const audio = ensureAudio()
            if (!audio.paused) {
              audio.pause()
              return
            }
            const url = stationTrackUrl(station, trackIndexRef.current)
            if (!url) return
            setRadioError(null)
            try {
              audio.src = url
              audio.volume = volume
              await audio.play()
            } catch (error) {
              setPlaying(false)
              setRadioError(error && error.name === 'NotAllowedError' ? 'blocked' : 'stream')
            }
          }

          function selectStation(index) {
            if (stations.length === 0) return
            const next = ((index % stations.length) + stations.length) % stations.length
            const nextStation = stations[next]
            setStationIndex(next)
            trackIndexRef.current = 0
            setTrackIndex(0)
            setRadioError(null)
            const audio = audioRef.current
            if (audio && !audio.paused) {
              const url = stationTrackUrl(nextStation, 0)
              if (!url) return
              audio.src = url
              audio.play().catch(() => setRadioError('stream'))
            }
          }

          function toggleHidden(id) {
            setHidden((current) => (current.indexOf(id) >= 0 ? current.filter((entry) => entry !== id) : current.concat(id)))
          }

          const isProviderEnabled = (id) => !config || !config.providers || !config.providers[id] || config.providers[id].enabled !== false
          const isVisible = (id) => isProviderEnabled(id) && hidden.indexOf(id) === -1
          const radioEnabled = !config || !config.radio || config.radio.enabled !== false
          const radioVisible = radioEnabled && hidden.indexOf('radio') === -1 && station !== null
          const layout = config && Array.isArray(config.layout) && config.layout.length > 0 ? config.layout : DEFAULT_LAYOUT
          const isCompact = compact

          function providerLabel(id) {
            if (config && config.providers && config.providers[id] && config.providers[id].label) return config.providers[id].label
            return t(`provider_${id}`)
          }

          function providerStateText(provider) {
            if (!provider) return t('loading')
            return t(statusKey(provider.status))
          }

          function providerTitle(id) {
            const provider = providers[id]
            const label = providerLabel(id)
            if (!provider) return label
            const parts = [`${label} · ${providerStateText(provider)}`]
            if (provider.status === 'ready') {
              if (provider.unit === 'percent' && provider.window) parts.push(`${provider.window}: ${provider.amount}%`)
              if (provider.plan) parts.push(provider.plan)
            }
            if (provider.message) parts.push(provider.message)
            if (provider.source) parts.push(providerSource(provider.source))
            return parts.join(' · ')
          }

          function providerSource(source) {
            switch (source) {
              case 'account':
                return t('source_account')
              case 'api':
                return t('source_api')
              case 'credits':
                return t('source_credits')
              case 'chatgpt':
                return t('source_chatgpt')
              case 'billing':
                return t('source_billing')
              case 'kimi':
                return t('source_kimi')
              default:
                return source
            }
          }

          function providerChip(id) {
            const provider = providers[id]
            const label = providerLabel(id)
            const value = providerValue(provider)
            return h(
              'button',
              {
                key: id,
                type: 'button',
                className: `dsh-sb-chip${popover === id ? ' is-open' : ''}`,
                title: providerTitle(id),
                'aria-label': `${label}: ${value}`,
                onClick: (event) => openPopover(id, event),
              },
              providerGlyph(id, provider),
              isCompact ? null : h('span', { className: 'dsh-sb-label' }, label),
              h('span', { className: 'dsh-sb-value' }, value),
            )
          }

          function radioChip() {
            if (!station) return null
            return h(
              'div',
              { key: 'radio', className: `dsh-sb-chip${popover === 'radio' ? ' is-open' : ''}` },
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-sb-btn',
                  title: playing ? t('radioPause') : t('radioPlay'),
                  'aria-label': playing ? t('radioPause') : t('radioPlay'),
                  'aria-pressed': playing,
                  onClick: togglePlay,
                },
                glyph(playing ? 'pause' : 'play'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-sb-station',
                  title: `${station.name}${radioError ? `\n${radioErrorText()}` : ''}`,
                  'aria-label': `${t('provider_radio')}: ${station.name}`,
                  onClick: (event) => openPopover('radio', event),
                },
                h('span', { className: `dsh-sb-dot${playing ? ' is-live' : ''}`, 'aria-hidden': true }),
                h('span', { className: 'dsh-sb-value' }, station.name),
              ),
            )
          }

          function radioErrorText() {
            if (radioError === 'blocked') return t('radioErrorBlocked')
            if (radioError === 'stream') return t('radioErrorStream')
            return ''
          }

          function settingsChip() {
            return h(
              'button',
              {
                key: 'settings',
                type: 'button',
                className: `dsh-sb-chip dsh-sb-icon${popover === 'settings' ? ' is-open' : ''}`,
                title: t('settings'),
                'aria-label': t('settings'),
                onClick: (event) => openPopover('settings', event),
              },
              glyph('settings'),
            )
          }

          function row(key, label, value) {
            return h('div', { key, className: 'dsh-sb-row' }, h('span', null, label), h('b', null, value))
          }

          function providerPopover(id) {
            const provider = providers[id]
            const label = providerLabel(id)
            const rows = []
            if (provider && provider.status === 'ready') {
              if (provider.unit === 'currency' && provider.used !== undefined && provider.used !== null) rows.push(row('used', t('used'), formatMoney(provider.used, provider.currency)))
              if (provider.unit === 'currency' && provider.total !== undefined && provider.total !== null) rows.push(row('total', t('total'), formatMoney(provider.total, provider.currency)))
              if (Array.isArray(provider.wallets)) {
                provider.wallets.forEach((wallet, index) => {
                  rows.push(row(`wallet-${index}`, `${t('wallet')}${wallet.bonus ? ` · ${t('bonus')}` : ''}`, formatMoney(wallet.balance, wallet.currency)))
                })
              }
              if (provider.plan) rows.push(row('plan', t('plan'), provider.plan))
              if (Array.isArray(provider.windows)) {
                provider.windows.forEach((window, index) => {
                  const used = window.usedPercent === null || window.usedPercent === undefined ? '—' : `${window.usedPercent}% ${t('used')}`
                  const reset = window.resetsAt ? ` · ${t('resetAt')} ${timeOf(window.resetsAt)}` : ''
                  rows.push(row(`window-${index}`, `${window.label} ${t('window')}`, `${used}${reset}`))
                })
              }
              if (provider.detail) rows.push(row('detail', t('details'), provider.detail))
            }
            return [
              h(
                'div',
                { key: 'head', className: 'dsh-sb-pop-head' },
                providerGlyph(id, provider, 14),
                h('span', { className: 'dsh-sb-pop-title' }, label),
                h(
                  'button',
                  { type: 'button', className: 'dsh-sb-btn', title: t('close'), 'aria-label': t('close'), onClick: () => setPopover(null) },
                  glyph('close'),
                ),
              ),
              provider && provider.status === 'ready'
                ? h('div', { key: 'value', className: 'dsh-sb-pop-value' }, providerValue(provider))
                : h(
                    'div',
                    { key: 'note', className: 'dsh-sb-note' },
                    providerStateText(provider),
                    provider && provider.message ? h('div', { className: 'dsh-sb-hint' }, provider.message) : null,
                  ),
              rows,
              h(
                'div',
                { key: 'meta', className: 'dsh-sb-meta' },
                provider && provider.source ? `${providerSource(provider.source)} · ` : '',
                t('updated'),
                ' ',
                provider && provider.updatedAt ? timeOf(provider.updatedAt) : '—',
              ),
              h(
                'div',
                { key: 'actions', className: 'dsh-sb-actions' },
                h('button', { type: 'button', className: 'dsh-sb-action', disabled: busy, onClick: () => void load(true) }, t('refreshNow')),
              ),
            ]
          }

          function radioPopover() {
            const tracks = stationTracks(station)
            const currentTrack = tracks.length > 1 ? Math.min(trackIndex, tracks.length - 1) + 1 : 0
            return [
              h(
                'div',
                { key: 'head', className: 'dsh-sb-pop-head' },
                h('span', { className: 'dsh-sb-pop-title' }, t('provider_radio')),
                h(
                  'button',
                  { type: 'button', className: 'dsh-sb-btn', title: t('close'), 'aria-label': t('close'), onClick: () => setPopover(null) },
                  glyph('close'),
                ),
              ),
              station ? h('div', { key: 'now', className: 'dsh-sb-pop-value' }, station.name) : null,
              tracks.length > 1
                ? h('div', { key: 'track', className: 'dsh-sb-muted' }, `${currentTrack} / ${tracks.length}`)
                : null,
              h(
                'div',
                { key: 'actions', className: 'dsh-sb-actions' },
                h('button', { type: 'button', className: 'dsh-sb-action', title: t('radioPrev'), 'aria-label': t('radioPrev'), onClick: () => selectStation(safeIndex - 1) }, glyph('prev')),
                h(
                  'button',
                  { type: 'button', className: 'dsh-sb-action', title: playing ? t('radioPause') : t('radioPlay'), onClick: togglePlay },
                  playing ? t('radioPause') : t('radioPlay'),
                ),
                h('button', { type: 'button', className: 'dsh-sb-action', title: t('radioNext'), 'aria-label': t('radioNext'), onClick: () => selectStation(safeIndex + 1) }, glyph('next')),
              ),
              radioError ? h('div', { key: 'error', className: 'dsh-sb-note' }, radioErrorText()) : null,
              h('div', { key: 'volume-label', className: 'dsh-sb-section' }, `${t('radioVolume')} · ${Math.round(volume * 100)}%`),
              h('input', {
                key: 'volume',
                className: 'dsh-sb-range',
                type: 'range',
                min: 0,
                max: 100,
                step: 1,
                value: Math.round(volume * 100),
                'aria-label': t('radioVolume'),
                onChange: (event) => setVolume(clampNumber(Number(event.target.value) / 100, 0, 1)),
              }),
              h('div', { key: 'stations-label', className: 'dsh-sb-section' }, t('radioStations')),
              stations.map((entry, index) =>
                h(
                  'button',
                  {
                    key: entry.id,
                    type: 'button',
                    className: `dsh-sb-station-row${index === safeIndex ? ' is-active' : ''}`,
                    onClick: () => selectStation(index),
                  },
                  h('span', { className: `dsh-sb-dot${index === safeIndex && playing ? ' is-live' : ''}`, 'aria-hidden': true }),
                  h('span', null, entry.name),
                  entry.tag ? h('small', null, entry.tag) : null,
                ),
              ),
            ]
          }

          function settingsPopover() {
            return [
              h(
                'div',
                { key: 'head', className: 'dsh-sb-pop-head' },
                h('span', { className: 'dsh-sb-pop-title' }, t('settings')),
                h(
                  'button',
                  { type: 'button', className: 'dsh-sb-btn', title: t('close'), 'aria-label': t('close'), onClick: () => setPopover(null) },
                  glyph('close'),
                ),
              ),
              h('div', { key: 'chips-label', className: 'dsh-sb-section' }, t('chips')),
              PROVIDERS.map((id) => {
                const provider = providers[id]
                const enabled = isProviderEnabled(id)
                return h(
                  'label',
                  { key: id, className: 'dsh-sb-check' },
                  h('input', {
                    type: 'checkbox',
                    checked: enabled && isVisible(id),
                    disabled: !enabled,
                    onChange: () => toggleHidden(id),
                  }),
                  h('span', null, providerLabel(id)),
                  h('small', null, enabled ? providerStateText(provider) : t('status_disabled')),
                )
              }),
              h(
                'label',
                { key: 'radio', className: 'dsh-sb-check' },
                h('input', {
                  type: 'checkbox',
                  checked: radioEnabled && hidden.indexOf('radio') === -1,
                  disabled: !radioEnabled,
                  onChange: () => toggleHidden('radio'),
                }),
                h('span', null, t('provider_radio')),
                h('small', null, radioEnabled ? (playing ? t('radioLive') : station ? station.name : '') : t('status_disabled')),
              ),
              h('div', { key: 'behavior-label', className: 'dsh-sb-section' }, t('behavior')),
              h(
                'label',
                { key: 'compact', className: 'dsh-sb-check' },
                h('input', {
                  type: 'checkbox',
                  checked: compact,
                  onChange: (event) => {
                    compactTouched.current = true
                    setCompact(event.target.checked)
                  },
                }),
                h('span', null, t('compact')),
              ),
              h(
                'div',
                { key: 'actions', className: 'dsh-sb-actions' },
                h('button', { type: 'button', className: 'dsh-sb-action', disabled: busy, onClick: () => void load(true) }, busy ? t('loading') : t('refreshNow')),
              ),
              fetchError ? h('div', { key: 'error', className: 'dsh-sb-note' }, `${t('offline')}: ${fetchError}`) : null,
              h('div', { key: 'meta', className: 'dsh-sb-meta' }, `${t('updated')} ${snapshot && snapshot.updatedAt ? timeOf(snapshot.updatedAt) : '—'}`),
            ]
          }

          const items = []
          for (const entry of layout) {
            if (entry === 'spacer') {
              items.push(h('div', { key: 'spacer', className: 'dsh-sb-spacer' }))
              continue
            }
            if (entry === 'radio') {
              if (radioVisible) items.push(radioChip())
              continue
            }
            if (PROVIDERS.indexOf(entry) >= 0) {
              if (isVisible(entry)) items.push(providerChip(entry))
              continue
            }
          }
          if (layout.indexOf('spacer') === -1) items.push(h('div', { key: 'tail-spacer', className: 'dsh-sb-spacer' }))
          items.push(settingsChip())

          let popoverBody = null
          if (popover === 'settings') popoverBody = settingsPopover()
          else if (popover === 'radio') popoverBody = radioPopover()
          else if (popover && PROVIDERS.indexOf(popover) >= 0) popoverBody = providerPopover(popover)

          let popoverStyle
          if (popover) {
            const viewportWidth = window.innerWidth || 1024
            const viewportHeight = window.innerHeight || 768
            const width = Math.min(330, Math.max(200, viewportWidth - 16))
            let left = Math.round((viewportWidth - width) / 2)
            let bottom = 38
            let maxHeight = Math.min(Math.round(viewportHeight * 0.7), 440)
            if (anchorRect) {
              left = Math.round(anchorRect.left + anchorRect.width / 2 - width / 2)
              left = Math.max(8, Math.min(left, viewportWidth - width - 8))
              bottom = Math.max(8, Math.round(viewportHeight - anchorRect.top + 8))
              maxHeight = Math.max(140, Math.min(maxHeight, Math.round(anchorRect.top - 16)))
            }
            popoverStyle = {
              left: `${left}px`,
              right: 'auto',
              bottom: `${bottom}px`,
              width: `${width}px`,
              maxHeight: `${maxHeight}px`,
            }
          }

          if (config && config.enabled === false) return null

          return h(
            'div',
            { className: 'dsh-sb', ref: barRef, role: 'toolbar', 'aria-label': t('barLabel') },
            h('style', { key: 'style' }, CSS),
            items,
            popoverBody
              ? h(
                  'div',
                  {
                    className: 'dsh-sb-pop',
                    style: popoverStyle,
                    ref: popRef,
                    role: 'dialog',
                    'aria-label': popover === 'settings' ? t('settings') : popover === 'radio' ? t('provider_radio') : providerLabel(popover),
                  },
                  popoverBody,
                )
              : null,
          )
        }

        ctx.effect(() => {
          const disposers = [
            locale.register('statusbar', 'en', EN),
            locale.register('statusbar', 'ru', RU),
            locale.register('statusbar', 'zh', ZH),
          ]
          return () => {
            for (const dispose of disposers) dispose()
          }
        })

        ctx.slots.inject('shell.bottom', () =>
          ctx.slots.register(
            { name: 'shell.bottom', id: 'dsh-statusbar', priority: -10 },
            StatusBar,
          ),
        )
      },
    }
  },
})
