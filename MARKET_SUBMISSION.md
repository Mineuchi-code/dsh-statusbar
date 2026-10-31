# Publishing @mineuchi/dsh-status-bar

The package is publish-ready. What remains needs your accounts (npm and GitHub).

## npm

Package name: `@mineuchi/dsh-status-bar` (npm rejected the unscoped name as too similar to
the existing `dsh-statusbar`).
Version: `1.0.0`, license MIT, `engines.dsh: >=0.2.0-rc.1 <0.3.0-0`.

After `npm login` in this machine:

```powershell
cd E:\DeepSeekProjects\Test2\dsh-statusbar
npm publish --access public
```

Check before publishing:

```powershell
npm publish --dry-run
```

## Public source

Repository: https://github.com/Mineuchi-code/dsh-statusbar (public, MIT).

Push the local commit after `npm login` or from a machine with GitHub credentials:

```powershell
cd E:\DeepSeekProjects\Test2\dsh-statusbar
git remote add origin https://github.com/Mineuchi-code/dsh-statusbar.git
git push -u origin main
```

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
- npm: @mineuchi/dsh-status-bar@1.0.0
- Repository: https://github.com/Mineuchi-code/dsh-statusbar
- License: MIT
- Requires DSH: >=0.2.0-rc.1 <0.3.0-0
- Category: interface
- Icon: icon.svg inside the package (also ./icon export)
- Install: dsh plugin --profile desktop add @mineuchi/dsh-status-bar
- Providers: DeepSeek account balance, Codex ChatGPT usage, OpenRouter credits
- Radio: 7 stations, playlist stations supported via `tracks`
```

The index is rebuilt every 6 hours; after the issue is accepted the plugin appears in the
Discover tab of the Open Plugin Market.

## After publication

Add the badge to the README (replace `<package>` with `%40mineuchi/dsh-status-bar`):

```md
[![Open Plugin Market](https://img.shields.io/endpoint?url=https%3A%2F%2Fdshopen.org%2Fbadge%2F%40mineuchi%2Fdsh-status-bar.json)](https://dshopen.org/zh/plugins/@mineuchi/dsh-status-bar/)
```
