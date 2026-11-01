# Publishing @mineuchi/dsh-status-bar

Status: **npm published** as `@mineuchi/dsh-status-bar@1.0.1` (2026-11-01). Source pushed to
GitHub. Listed on dshopen.org with the `verified` label. Version 1.0.1 answers the review
note: the snapshot route now applies DSH Connection admission (`requestRejection`), so
unauthenticated clients receive 401 instead of open balances.

## npm

Package name: `@mineuchi/dsh-status-bar` (npm rejected the unscoped name as too similar to
the existing `dsh-statusbar`).
Published: https://www.npmjs.com/package/@mineuchi/dsh-status-bar
Version: `1.0.1`, license MIT, `engines.dsh: >=0.2.0-rc.1 <0.3.0-0`.

For the next release bump the version, then:

```powershell
cd E:\DeepSeekProjects\Test2\dsh-statusbar
npm publish --access public
```

Check before publishing:

```powershell
npm publish --dry-run
```

## Public source

Repository: https://github.com/Mineuchi-code/dsh-statusbar (public, MIT). Pushed.

## Market submission (dshopen.org)

Open https://github.com/polang233/dsh-plugin-index/issues/new?template=plugin-add.yml
and paste the values below.

**Plugin link**

```
https://www.npmjs.com/package/@mineuchi/dsh-status-bar
```

or the source repository: https://github.com/Mineuchi-code/dsh-statusbar

**Summary**

```
@mineuchi/dsh-status-bar — full-width status bar for DeepSeek Harness: DeepSeek, Codex and
OpenRouter balance chips with mini icons, compact mode, 5h/7d Codex quota tooltips, and
an internet radio player (SomaFM, Radio Paradise, and the EVE Online original soundtrack).
MIT, no telemetry, keys stay on the Host.
```

**Additional details**

```
- npm: @mineuchi/dsh-status-bar@1.0.1
- 1.0.1: snapshot route now behind DSH Connection admission (requestRejection); unauthenticated clients get 401
- Repository: https://github.com/Mineuchi-code/dsh-statusbar
- License: MIT
- Requires DSH: >=0.2.0-rc.1 <0.3.0-0
- Category: interface
- Icon: icon.svg inside the package (also ./icon export)
- Install: dsh plugin --profile desktop add @mineuchi/dsh-status-bar
- Providers: DeepSeek account balance, Codex ChatGPT usage, Kimi For Coding quota, OpenRouter credits
- Radio: 8 stations, playlist stations supported via `tracks`
```

The index is rebuilt every 6 hours; after the issue is accepted the plugin appears in the
Discover tab of the Open Plugin Market.

## After publication

Add the badge to the README (replace `<package>` with `%40mineuchi/dsh-status-bar`):

```md
[![Open Plugin Market](https://img.shields.io/endpoint?url=https%3A%2F%2Fdshopen.org%2Fbadge%2F%40mineuchi%2Fdsh-status-bar.json)](https://dshopen.org/zh/plugins/@mineuchi/dsh-status-bar/)
```
