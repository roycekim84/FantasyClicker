# Pixel Mercenary Clicker (v0.44)

A small, local-only medieval fantasy clicker with a pixel-art vibe. Click monsters to earn gold, collect gear and runes, complete quests, and prestige for Honor.

## Run

Open `index.html` in any modern browser. No build step or dependencies.

## v0.44 UI Polish

- Runes and Quests tabs now use internal scroll sections to avoid page overflow.
- Quest layout is compact with progress bars and fixed weekly/chain blocks.
- Button reliability preserved with global delegation.

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
- Optional Compact mode toggle in the header.

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
