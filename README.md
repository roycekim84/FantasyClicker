# Pixel Mercenary Clicker (v0.71)

A small, local-only medieval fantasy clicker with a pixel-art vibe. Click monsters to earn gold, collect gear and runes, complete quests, and prestige for Honor.

## Run

Open `index.html` in any modern browser. No build step or dependencies.

## v0.6 Highlights

- SFX via Web Audio (toggle + volume in Settings).
- Feedback polish: crit/weak effects, boss/victory banners.
- Rune Fusion: combine 3 runes to upgrade rarity.
- Inventory and Rune Pouch are now grid tiles with tooltips + double-click equip/socket.
- Bugfixes for rune buy enablement and socketed rune sync.

## v0.61 UI

- Inventory tab compacted into a 2-column equipped summary with an embedded rune line for clearer, denser layout.

## v0.71 UI/UX

- Runes are managed only in the Runes tab; Inventory focuses on gear only.
- New Sell actions for gear and runes, plus clearer equip/socket action bars.

## v0.72.1 Hotfix

- Restores a stable Runes tab layout and keeps rune management strictly within the Runes tab.

## v0.73 UI

- Rune Shop now uses icon tiles with hover tooltips and a focused purchase bar.
- Rune Fusion removed from UI and logic.

## v0.73.5 UI

- Rune Shop compact row with small tiles, no fusion leftovers, and no reserved height.

## v0.8 Highlights

- Logs include timestamps and show as a compact list with higher history cap.
- Chapter theming adds subtle UI color shifts and a chapter badge.
- Inventory slots can be expanded with gold (starting at 10).
- Gear can roll a small affix bonus; tooltips show the affix line.
- New chapter reward options: refresh discount, rune rare chance, sell bonus.
- Selling is instant (no confirm).

## v0.50.1 Hotfix

- Fixes content.js integration crash (`split` of undefined) with safer i18n and content guards.
- Adds defensive defaults for missing content sections and invalid saves.

## v0.5 Highlights

- EN/KO language toggle (header + Settings) with full UI translation.
- First-time tutorial guiding early steps (click, upgrade, skill, rune).
- Settings tab for language, number format, reduce effects, compact UI, dev mode.
- Number formatting modes: full commas or abbreviated K/M/B/T.
- Content data moved to `content.js` for easier editing.

## v0.4 Features

- Weak point hit spot and combo bonus for faster clicking.
- Two equipment slots (Weapon + Relic) with separate stat pools.
- Collections based on region sets with cosmetic/tiny rewards.
- Quests v2: weekly quest + 3-step quest chain.
- Dev tools, session report, and export/import save.
- Optional UI click validation harness in the Dev panel.

## UI

- One-screen layout with tabs (Shop, Inventory, Runes, Quests, Achievements, Collections, Log).
- No page scrolling; long lists scroll inside panels.
- Compact mode toggle lives in Settings.

## How to Play

- Click the monster to deal damage. Auto DPS ticks every 100ms.
- Weak points appear periodically for bonus damage and gold.
- Every 10 kills is a boss; every 10 zones is a chapter boss.
- Every 25 kills in a zone moves you to the next zone.
- Spend gold in the shop to upgrade damage, auto DPS, and critical hits.

## Saving

- Autosaves every 5 seconds.
- Use the Save button for a manual save.
- Reset wipes local storage after confirmation.

## Tutorial + Language

- Tutorial shows only for new saves. Reset to see it again.
- Language can be switched anytime; UI updates immediately.
