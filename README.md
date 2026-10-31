# Status Bar

A full-width bar at the bottom of the DSH window with provider balance chips and an
internet radio player. It is an ordinary persistent DSH bundle: the Host half talks to
the provider APIs and serves one cached JSON snapshot, the Client half renders it in the
`shell.bottom` seat.

## Install

From npm:

```bash
dsh plugin --profile desktop add dsh-status-bar
```

Or point DSH at this directory with Plugin Manager → Add plugin → local package.

Requires DSH `>=0.2.0-rc.1 <0.3.0-0`. License: MIT.
Source: https://github.com/Mineuchi-code/dsh-statusbar

## Chips

| Chip | Source | Credential |
|---|---|---|
| DeepSeek | `deepseekAccount` balance (recharge + bonus wallets); fallback to `GET /user/balance` | signed-in DeepSeek account, else `DEEPSEEK_API_KEY` |
| Codex | `GET https://chatgpt.com/backend-api/wham/usage` (plan, 5h/7d windows, credits) | native Codex login in `~/.codex/auth.json` |
| OpenRouter | `GET https://openrouter.ai/api/v1/credits` (`total_credits - total_usage`) | `OPENROUTER_API_KEY` |

When a chip is not ready it still renders: the mini icon turns amber or red and the tooltip /
popover names the reason (`No credential`, `Credential rejected`, `Network error`, …).

The Host reads credentials from the plugin config first, then from the Harness credential
store (the same place Settings stores provider keys), then from the process environment.
API keys and OAuth tokens never appear in the snapshot the page receives.

## Radio

Click the station name to open the player above the chip: station list, volume, previous /
play-pause / next. Playback starts only on a click (browser autoplay policy). A station is
either a plain stream URL (`url`) or a playlist of audio files (`tracks`) that plays in
order and loops, so albums behave like a station.

Defaults are SomaFM and Radio Paradise streams plus the 2004 **EVE Online – Original
Soundtrack** by Jón Hallur Haraldsson (14 tracks streamed from the Internet Archive), listed
as `EVE Online · Original Soundtrack`. Playback of that entry starts with
"Surplus of Rare Artifacts" and continues through the album.

A playlist station looks like this:

```yaml
stations:
  - id: eve
    name: EVE Online · Original Soundtrack
    tracks:
      - https://archive.org/download/eve-online-soundtrack/01%20Surplus%20of%20Rare%20Artifacts.mp3
      - https://archive.org/download/eve-online-soundtrack/02%20Below%20the%20Asteroids.mp3
```

## Configuration

Edit the profile patch (`cordis.patch.yml`) and add `config` to the `dsh-statusbar` row:

```yaml
- id: dsh-statusbar
  name: 'dsh-status-bar'
  config:
    refreshSeconds: 120        # 15..3600, lazy cache TTL
    compact: false             # hide chip labels
    layout: [deepseek, codex, openrouter, spacer, radio]
    providers:
      deepseek:
        enabled: true
        label: DeepSeek
        useAccount: true       # false = always use the API key
        apiKeyEnv: DEEPSEEK_API_KEY
        baseUrl: https://api.deepseek.com
      codex:
        enabled: true
        label: Codex
        authFile: ''           # default: $CODEX_HOME/auth.json, ~/.codex/auth.json
        baseUrl: https://chatgpt.com
        billingBaseUrl: https://api.openai.com
        apiKeyEnv: OPENAI_API_KEY
      openrouter:
        enabled: true
        label: OpenRouter
        apiKeyEnv: OPENROUTER_API_KEY
        baseUrl: https://openrouter.ai
    radio:
      enabled: true
      volume: 0.6
      stations:
        - id: groove
          name: SomaFM · Groove Salad
          url: https://ice1.somafm.com/groovesalad-128-mp3
          tag: Ambient
```

`layout` accepts `deepseek`, `codex`, `openrouter`, `radio`, and `spacer` (the flexible
gap that pushes the radio and the settings button to the right).

The bar itself is customizable without editing YAML: the sliders button opens local
toggles for every chip, a compact mode, and a manual refresh. Those choices are stored in
the browser (`localStorage`), so they are per page profile.

## Notes

- `shell.bottom` is a single-occupant seat and the lowest `priority` wins, so this bundle
  registers with `priority: -10`. While it is enabled the experimental DevTools bottom
  panel (`@deepseek-ai/dsh-experimental-inspector`) does not render. Disable that bundle,
  or disable this one, to get it back.
- The Host performs network requests only while a page polls the snapshot. Closing the
  window stops all lookups; the radio keeps playing only while its page is alive.
- Codex tokens are read from disk and sent only to the `baseUrl` origin (`chatgpt.com` by
  default). No token is written back.
