(() => {
  "use strict";

  const SAVE_KEY = "pixel-mercenary-clicker-v0.1";
  const UI_COMPACT_KEY = "ui_compact";
  const BASE_HP = 30;
  const BASE_GOLD = 5;
  const ZONE_KILLS = 25;
  const BOSS_EVERY = 10;
  const AUTOSAVE_MS = 5000;
  const DPS_TICK_MS = 100;
  const PRESTIGE_ZONE = 10;
  const INVENTORY_MAX = 12;
  const RUNE_MAX = 18;
  const RUNE_REFRESH_COST = 300;
  const SKILL_COOLDOWN_MS = 12000;
  const SKILL_DURATION_MS = 4000;
  const CRY_COOLDOWN_MS = 18000;
  const CRY_DURATION_MS = 6000;
  const OFFLINE_CAP_SECONDS = 6 * 60 * 60;
  const OFFLINE_KILL_CAP = 500;

  const MONSTER_TYPES = [
    { id: "grunt", label: "Grunt", hpMult: 1, goldMult: 1, dodge: 0 },
    { id: "tank", label: "Tank", hpMult: 2.2, goldMult: 1.6, dodge: 0 },
    { id: "runner", label: "Runner", hpMult: 0.7, goldMult: 0.9, dodge: 0.08 },
  ];

  const REGIONS = [
    {
      id: "greenfields",
      start: 1,
      end: 10,
      name: "Greenfields",
      subtitle: "Breezy fields and soft hills",
      enemies: [
        "Wandering Slime",
        "Meadow Imp",
        "Twig Sprout",
        "Rustling Boar",
        "Thornling",
        "Moss Beetle",
        "Bramble Rat",
        "Hollow Crow",
      ],
    },
    {
      id: "ashen-ruins",
      start: 11,
      end: 20,
      name: "Ashen Ruins",
      subtitle: "Broken stone and ember dust",
      enemies: [
        "Cinder Wight",
        "Ashling",
        "Rubble Troll",
        "Smolder Bat",
        "Coal Wisp",
        "Ruins Bandit",
        "Scorchling",
        "Burnt Golem",
      ],
    },
    {
      id: "crypt-depths",
      start: 21,
      end: 30,
      name: "Crypt Depths",
      subtitle: "Cold echoes and ancient bones",
      enemies: [
        "Graveling",
        "Bone Skulker",
        "Crypt Moth",
        "Ghoul Pike",
        "Mire Spirit",
        "Rot Hound",
        "Dust Lich",
        "Tomb Guard",
      ],
    },
    {
      id: "frost-peaks",
      start: 31,
      end: 40,
      name: "Frost Peaks",
      subtitle: "Wind-cut ice and biting chill",
      enemies: [
        "Ice Gnarl",
        "Frost Hare",
        "Glacier Whelp",
        "Snow Stalker",
        "Rime Boar",
        "Peak Ravager",
        "Shiver Drake",
        "Hoarfang",
      ],
    },
    {
      id: "void-gate",
      start: 41,
      end: 50,
      name: "Void Gate",
      subtitle: "Whispering dark beyond the veil",
      enemies: [
        "Voidling",
        "Warped Knight",
        "Shade Weaver",
        "Abyss Echo",
        "Night Marauder",
        "Null Seraph",
        "Grim Oracle",
        "Gate Sentinel",
      ],
    },
  ];

  const RUNE_EFFECTS = [
    { id: "boss", label: "Boss Slayer", desc: "+% damage vs bosses" },
    { id: "greed", label: "Greed", desc: "+% gold gain" },
    { id: "precision", label: "Precision", desc: "+% crit chance" },
    { id: "swiftness", label: "Swiftness", desc: "-% skill cooldown" },
    { id: "fury", label: "Fury", desc: "+% click damage" },
    { id: "tinker", label: "Tinker", desc: "+% auto DPS" },
  ];

  const EVENT_TYPES = [
    { id: "gold", name: "Gold Rush", duration: 10, goldPct: 100 },
    { id: "frenzy", name: "Frenzy", duration: 10, clickPct: 100 },
    { id: "overclock", name: "Overclock", duration: 10, autoPct: 100 },
    { id: "lucky", name: "Lucky Crits", duration: 12, critPct: 15 },
    { id: "weakness", name: "Weakness Exposed", duration: 10, typePct: 50 },
  ];

  const ACHIEVEMENTS = [
    {
      id: "kills_100",
      title: "First Blood",
      desc: "Defeat 100 monsters",
      titleReward: "Monster Scout",
      check: (s) => s.meta.lifetimeKills >= 100,
    },
    {
      id: "kills_1000",
      title: "Grim Reaper",
      desc: "Defeat 1,000 monsters",
      titleReward: "Grim Reaper",
      check: (s) => s.meta.lifetimeKills >= 1000,
    },
    {
      id: "kills_10000",
      title: "Storm of Steel",
      desc: "Defeat 10,000 monsters",
      titleReward: "Storm of Steel",
      check: (s) => s.meta.lifetimeKills >= 10000,
    },
    {
      id: "boss_50",
      title: "Boss Hunter",
      desc: "Defeat 50 bosses",
      titleReward: "Boss Hunter",
      check: (s) => s.meta.lifetimeBossKills >= 50,
    },
    {
      id: "boss_200",
      title: "Boss Bane",
      desc: "Defeat 200 bosses",
      titleReward: "Boss Bane",
      check: (s) => s.meta.lifetimeBossKills >= 200,
    },
    {
      id: "chapter_1",
      title: "Chapter Breaker",
      desc: "Defeat 1 chapter boss",
      titleReward: "Chapter Breaker",
      check: (s) => s.meta.lifetimeChapterBossKills >= 1,
    },
    {
      id: "chapter_5",
      title: "Saga Ender",
      desc: "Defeat 5 chapter bosses",
      titleReward: "Saga Ender",
      check: (s) => s.meta.lifetimeChapterBossKills >= 5,
    },
    {
      id: "prestige_1",
      title: "Ascended",
      desc: "Prestige once",
      titleReward: "Ascended",
      check: (s) => s.meta.lifetimePrestiges >= 1,
    },
    {
      id: "prestige_5",
      title: "Reborn Veteran",
      desc: "Prestige 5 times",
      titleReward: "Reborn Veteran",
      check: (s) => s.meta.lifetimePrestiges >= 5,
    },
    {
      id: "honor_10",
      title: "Honored",
      desc: "Earn 10 Honor",
      titleReward: "Honored",
      check: (s) => s.meta.totalHonor >= 10,
    },
    {
      id: "honor_50",
      title: "Noble",
      desc: "Earn 50 Honor",
      titleReward: "Noble",
      check: (s) => s.meta.totalHonor >= 50,
    },
    {
      id: "rare_relic",
      title: "Rare Find",
      desc: "Obtain a Rare relic",
      titleReward: "Relic Seeker",
      check: (s) => s.meta.foundRareRelic,
    },
    {
      id: "epic_relic",
      title: "Epic Find",
      desc: "Obtain an Epic relic",
      titleReward: "Artifact Hunter",
      check: (s) => s.meta.foundEpicRelic,
    },
    {
      id: "rare_rune",
      title: "Rune Collector",
      desc: "Obtain a Rare rune",
      titleReward: "Rune Collector",
      check: (s) => s.meta.foundRareRune,
    },
    {
      id: "epic_rune",
      title: "Rune Sage",
      desc: "Obtain an Epic rune",
      titleReward: "Rune Sage",
      check: (s) => s.meta.foundEpicRune,
    },
    {
      id: "quests_10",
      title: "Taskmaster",
      desc: "Complete 10 quests",
      titleReward: "Taskmaster",
      check: (s) => s.meta.lifetimeQuestClaims >= 10,
    },
    {
      id: "quests_50",
      title: "Quest Lord",
      desc: "Complete 50 quests",
      titleReward: "Quest Lord",
      check: (s) => s.meta.lifetimeQuestClaims >= 50,
    },
    {
      id: "region_ruins",
      title: "Ash Walker",
      desc: "Enter Ashen Ruins",
      titleReward: "Ash Walker",
      check: (s) => s.meta.regionsReached.includes("ashen-ruins"),
    },
    {
      id: "region_crypt",
      title: "Crypt Delver",
      desc: "Enter Crypt Depths",
      titleReward: "Crypt Delver",
      check: (s) => s.meta.regionsReached.includes("crypt-depths"),
    },
    {
      id: "region_void",
      title: "Void Touched",
      desc: "Enter Void Gate",
      titleReward: "Void Touched",
      check: (s) => s.meta.regionsReached.includes("void-gate"),
    },
    {
      id: "skills_50",
      title: "Commander",
      desc: "Use a skill 50 times",
      titleReward: "Commander",
      check: (s) => s.meta.lifetimeSkillUses >= 50,
    },
    {
      id: "skills_200",
      title: "Tactician",
      desc: "Use a skill 200 times",
      titleReward: "Tactician",
      check: (s) => s.meta.lifetimeSkillUses >= 200,
    },
  ];

  const QUEST_TEMPLATES = [
    {
      id: "kill_basic",
      title: "Cull the Wilds",
      desc: (t) => `Defeat ${t} monsters`,
      type: "kill",
      target: () => randInt(25, 60),
      reward: () => ({ type: "gold", amount: randInt(120, 280) }),
    },
    {
      id: "kill_bosses",
      title: "Break the Siege",
      desc: (t) => `Defeat ${t} bosses`,
      type: "boss_kill",
      target: () => randInt(2, 5),
      reward: () => ({ type: "gold", amount: randInt(220, 380) }),
    },
    {
      id: "click_damage",
      title: "Sharpen Your Strikes",
      desc: (t) => `Deal ${formatNumber(t)} click damage`,
      type: "click_damage",
      target: () => randInt(250, 900),
      reward: () => ({ type: "gold", amount: randInt(160, 320) }),
    },
    {
      id: "crit_hits",
      title: "Lucky Blows",
      desc: (t) => `Land ${t} critical hits`,
      type: "crit",
      target: () => randInt(6, 18),
      reward: () => ({ type: "gold", amount: randInt(180, 300) }),
    },
    {
      id: "earn_gold",
      title: "Pouch Filler",
      desc: (t) => `Earn ${formatNumber(t)} gold`,
      type: "gold_earned",
      target: () => randInt(300, 900),
      reward: () => ({ type: "gold", amount: randInt(180, 350) }),
    },
    {
      id: "reach_zone",
      title: "Scout the Frontier",
      desc: (t) => `Reach zone ${t}`,
      type: "zone_reach",
      target: () => randInt(4, 8),
      reward: () => ({ type: "honor", amount: 1 }),
    },
    {
      id: "boss_hunt",
      title: "Warlord Bounty",
      desc: (t) => `Defeat ${t} bosses this run`,
      type: "boss_kill",
      target: () => randInt(3, 6),
      reward: () => ({ type: "honor", amount: 1 }),
    },
    {
      id: "rapid_kills",
      title: "Fast Hands",
      desc: (t) => `Defeat ${t} monsters`,
      type: "kill",
      target: () => randInt(45, 90),
      reward: () => ({ type: "gold", amount: randInt(250, 420) }),
    },
    {
      id: "crit_spree",
      title: "Edge of Fate",
      desc: (t) => `Trigger ${t} critical hits`,
      type: "crit",
      target: () => randInt(12, 25),
      reward: () => ({ type: "gold", amount: randInt(240, 420) }),
    },
    {
      id: "click_master",
      title: "Hammer Time",
      desc: (t) => `Deal ${formatNumber(t)} click damage`,
      type: "click_damage",
      target: () => randInt(600, 1400),
      reward: () => ({ type: "honor", amount: 1 }),
    },
    {
      id: "rune_favor",
      title: "Rune Favor",
      desc: (t) => `Defeat ${t} monsters`,
      type: "kill",
      target: () => randInt(35, 70),
      reward: () => ({ type: "rune", amount: 1 }),
    },
  ];

  const el = {
    gold: document.getElementById("gold"),
    honor: document.getElementById("honor"),
    dmgMult: document.getElementById("dmg-mult"),
    zone: document.getElementById("zone"),
    kills: document.getElementById("kills"),
    titleDisplay: document.getElementById("title-display"),
    bossIndicator: document.getElementById("boss-indicator"),
    regionName: document.getElementById("region-name"),
    regionSub: document.getElementById("region-sub"),
    chapterNext: document.getElementById("chapter-next"),
    eventBanner: document.getElementById("event-banner"),
    eventName: document.getElementById("event-name"),
    eventTimer: document.getElementById("event-timer"),
    monster: document.getElementById("monster"),
    monsterName: document.getElementById("monster-name"),
    monsterType: document.getElementById("monster-type"),
    hpText: document.getElementById("hp-text"),
    hpFill: document.getElementById("hp-fill"),
    floatingLayer: document.getElementById("floating-layer"),
    clickDmg: document.getElementById("click-dmg"),
    autoDps: document.getElementById("auto-dps"),
    critChance: document.getElementById("crit-chance"),
    critMulti: document.getElementById("crit-multi"),
    goldBonus: document.getElementById("gold-bonus"),
    zoneProgress: document.getElementById("zone-progress"),
    lvlClick: document.getElementById("lvl-click"),
    lvlAuto: document.getElementById("lvl-auto"),
    lvlCrit: document.getElementById("lvl-crit"),
    lvlMulti: document.getElementById("lvl-multi"),
    costClick: document.getElementById("cost-click"),
    costAuto: document.getElementById("cost-auto"),
    costCrit: document.getElementById("cost-crit"),
    costMulti: document.getElementById("cost-multi"),
    buyClick: document.getElementById("buy-click"),
    buyAuto: document.getElementById("buy-auto"),
    buyCrit: document.getElementById("buy-crit"),
    buyMulti: document.getElementById("buy-multi"),
    skillTitle: document.getElementById("skill-title"),
    skillDesc: document.getElementById("skill-desc"),
    skillActivate: document.getElementById("skill-activate"),
    skillTimer: document.getElementById("skill-timer"),
    skillSelect: document.querySelector(".skill-select"),
    prestige: document.getElementById("prestige"),
    compactToggle: document.getElementById("compact-toggle"),
    equippedName: document.getElementById("equipped-name"),
    equippedStat: document.getElementById("equipped-stat"),
    unequip: document.getElementById("unequip"),
    equippedRuneName: document.getElementById("equipped-rune-name"),
    equippedRuneStat: document.getElementById("equipped-rune-stat"),
    unequipRune: document.getElementById("unequip-rune"),
    inventoryList: document.getElementById("inventory-list"),
    runeShopList: document.getElementById("rune-shop-list"),
    runeRefresh: document.getElementById("rune-refresh"),
    runeInventoryList: document.getElementById("rune-inventory-list"),
    questList: document.getElementById("quest-list"),
    reroll: document.getElementById("reroll"),
    achievementList: document.getElementById("achievement-list"),
    achievementFilters: document.querySelector(".achievement-filters"),
    titleSelect: document.getElementById("title-select"),
    logList: document.getElementById("log-list"),
    save: document.getElementById("save"),
    reset: document.getElementById("reset"),
    offlineModal: document.getElementById("offline-modal"),
    offlineText: document.getElementById("offline-text"),
    offlineClose: document.getElementById("offline-close"),
  };

  function getDefaultState() {
    return {
      meta: {
        totalHonor: 0,
        lifetimeKills: 0,
        lifetimeGold: 0,
        lifetimeBossKills: 0,
        lifetimeChapterBossKills: 0,
        lifetimeClickDamage: 0,
        lifetimeCrits: 0,
        lifetimePrestiges: 0,
        lifetimeQuestClaims: 0,
        lifetimeSkillUses: 0,
        foundRareRelic: false,
        foundEpicRelic: false,
        foundRareRune: false,
        foundEpicRune: false,
        regionsReached: ["greenfields"],
        achievements: {},
        titlesUnlocked: [],
        equippedTitle: "None",
      },
      run: {
        gold: 0,
        zone: 1,
        killsTotal: 0,
        killsInZone: 0,
        highestZone: 1,
        totalKillsThisRun: 0,
        goldEarnedThisRun: 0,
        clickDamageBase: 1,
        autoDpsBase: 0,
        critChanceBase: 0.05,
        critMultiplierBase: 1.5,
        isBoss: false,
        isChapterBoss: false,
        monsterHp: 30,
        monsterMaxHp: 30,
        monsterTypeId: "grunt",
        monsterName: "Wandering Slime",
        skills: {
          selected: "power",
          power: { lastUsed: 0, activeUntil: 0 },
          cry: { lastUsed: 0, activeUntil: 0 },
        },
        inventory: [],
        equippedRelicId: null,
        runes: [],
        equippedRuneId: null,
        runeShop: [],
        freeRuneRefreshUsed: false,
        quests: [],
        freeRerollUsed: false,
        event: null,
        lastActiveAt: Date.now(),
      },
      upgrades: {
        click: { level: 0, baseCost: 12 },
        auto: { level: 0, baseCost: 24 },
        crit: { level: 0, baseCost: 36 },
        multi: { level: 0, baseCost: 48 },
      },
      log: [],
      achievementFilter: "all",
    };
  }

  let state = getDefaultState();
  let dpsInterval = null;
  let autosaveInterval = null;
  let autoCarry = 0;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function chance(prob) {
    return Math.random() < prob;
  }

  function formatNumber(value) {
    return Math.max(0, Math.floor(value)).toLocaleString("en-US");
  }

  function formatTimer(value) {
    return `${Math.max(0, Math.ceil(value))}s`;
  }

  function getHonorMultiplier() {
    return 1 + state.meta.totalHonor * 0.02;
  }

  function getUpgradeCost(upgrade) {
    return Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.level));
  }

  function getMonsterType(id) {
    return MONSTER_TYPES.find((type) => type.id === id) || MONSTER_TYPES[0];
  }

  function rollMonsterType() {
    const index = randInt(0, MONSTER_TYPES.length - 1);
    return MONSTER_TYPES[index].id;
  }

  function getRegionForZone(zone) {
    return REGIONS.find((region) => zone >= region.start && zone <= region.end) || REGIONS[0];
  }

  function getRegionEnemyName(region) {
    const idx = randInt(0, region.enemies.length - 1);
    return region.enemies[idx];
  }

  function isChapterZone(zone) {
    return zone % 10 === 0;
  }

  function getMonsterStats(zone, typeId, isBoss, isChapterBoss) {
    const baseHp = BASE_HP * Math.pow(1.25, zone - 1);
    const baseGold = BASE_GOLD * Math.pow(1.18, zone - 1);
    const type = getMonsterType(typeId);
    let hp = Math.floor(baseHp * type.hpMult);
    let gold = Math.floor(baseGold * type.goldMult);

    if (isBoss) {
      hp = Math.floor(hp * 8);
      gold = Math.floor(gold * 10);
    }

    if (isChapterBoss) {
      hp = Math.floor(hp * 20);
      gold = Math.floor(gold * 25);
    }

    const name = isChapterBoss ? "Chapter Boss" : isBoss ? `${type.label} Boss` : "Wanderer";

    return {
      name,
      hp,
      gold,
      typeLabel: type.label,
      dodge: type.dodge,
    };
  }

  function spawnMonster(isBoss, typeId = null) {
    const region = getRegionForZone(state.run.zone);
    const chapter = isBoss && isChapterZone(state.run.zone);

    state.run.isBoss = isBoss;
    state.run.isChapterBoss = chapter;
    state.run.monsterTypeId = typeId || rollMonsterType();
    state.run.monsterName = chapter ? "Chapter Boss" : getRegionEnemyName(region);

    const stats = getMonsterStats(state.run.zone, state.run.monsterTypeId, isBoss, chapter);
    state.run.monsterMaxHp = stats.hp;
    state.run.monsterHp = stats.hp;

    el.monsterName.textContent = chapter
      ? "CHAPTER BOSS"
      : `${state.run.monsterName}`;
    el.monsterType.textContent = stats.typeLabel;
    el.bossIndicator.classList.toggle("active", isBoss || chapter);
    el.bossIndicator.textContent = chapter ? "CHAPTER BOSS" : "Boss";
    updateRegionUi();
    updateHpUi();
  }

  function updateRegionUi() {
    const region = getRegionForZone(state.run.zone);
    el.regionName.textContent = region.name;
    el.regionSub.textContent = region.subtitle;
    const nextChapter = Math.ceil(state.run.zone / 10) * 10;
    el.chapterNext.textContent = `Chapter boss at zone ${nextChapter}`;
    document.body.classList.remove(
      "region-greenfields",
      "region-ashen-ruins",
      "region-crypt-depths",
      "region-frost-peaks",
      "region-void-gate"
    );
    document.body.classList.add(`region-${region.id}`);

    if (!state.meta.regionsReached.includes(region.id)) {
      state.meta.regionsReached.push(region.id);
      addLog(`Region reached: ${region.name}`);
    }
  }

  function updateHpUi() {
    el.hpText.textContent = `${formatNumber(state.run.monsterHp)} / ${formatNumber(
      state.run.monsterMaxHp
    )}`;
    const pct = Math.max(0, state.run.monsterHp / state.run.monsterMaxHp);
    el.hpFill.style.width = `${Math.floor(pct * 100)}%`;
  }

  function addFloatingText(label, isCrit, isMiss) {
    const text = document.createElement("div");
    text.className = `floating-text${isCrit ? " crit" : ""}${isMiss ? " miss" : ""}`;
    text.textContent = label;
    const x = Math.random() * 120 + 20;
    const y = Math.random() * 60 + 40;
    text.style.left = `${x}px`;
    text.style.top = `${y}px`;
    el.floatingLayer.appendChild(text);
    text.addEventListener("animationend", () => text.remove());
  }

  function hitEffects() {
    el.monster.classList.add("shake");
    el.monster.classList.add("hit");
    setTimeout(() => {
      el.monster.classList.remove("shake");
      el.monster.classList.remove("hit");
    }, 180);
  }

  function getEquippedRelic() {
    if (!state.run.equippedRelicId) {
      return null;
    }
    return state.run.inventory.find((item) => item.id === state.run.equippedRelicId) || null;
  }

  function getEquippedRune() {
    if (!state.run.equippedRuneId) {
      return null;
    }
    return state.run.runes.find((rune) => rune.id === state.run.equippedRuneId) || null;
  }

  function getEquipmentBonuses() {
    const relic = getEquippedRelic();
    const bonuses = { click: 0, auto: 0, crit: 0, gold: 0 };
    if (!relic) {
      return bonuses;
    }

    if (relic.statType === "click") {
      bonuses.click = relic.statValue;
    } else if (relic.statType === "auto") {
      bonuses.auto = relic.statValue;
    } else if (relic.statType === "crit") {
      bonuses.crit = relic.statValue;
    } else if (relic.statType === "gold") {
      bonuses.gold = relic.statValue;
    }

    return bonuses;
  }

  function getRuneBonuses() {
    const relic = getEquippedRelic();
    const rune = getEquippedRune();
    const bonuses = {
      bossPct: 0,
      goldPct: 0,
      critPct: 0,
      cooldownPct: 0,
      clickPct: 0,
      autoPct: 0,
    };

    if (!relic || !rune) {
      return bonuses;
    }

    if (rune.effect === "boss") {
      bonuses.bossPct = rune.value;
    } else if (rune.effect === "greed") {
      bonuses.goldPct = rune.value;
    } else if (rune.effect === "precision") {
      bonuses.critPct = rune.value;
    } else if (rune.effect === "swiftness") {
      bonuses.cooldownPct = rune.value;
    } else if (rune.effect === "fury") {
      bonuses.clickPct = rune.value;
    } else if (rune.effect === "tinker") {
      bonuses.autoPct = rune.value;
    }

    return bonuses;
  }

  function getEventState() {
    const event = state.run.event;
    if (!event) {
      return null;
    }
    if (Date.now() > event.endAt) {
      state.run.event = null;
      updateEventUi();
      return null;
    }
    return event;
  }

  function getEffectiveCritChance(includeEvent = true) {
    const bonus = getEquipmentBonuses();
    const rune = getRuneBonuses();
    const event = includeEvent ? getEventState() : null;
    const eventBonus = event && event.id === "lucky" ? event.critPct : 0;
    return clamp(
      state.run.critChanceBase + bonus.crit / 100 + rune.critPct / 100 + eventBonus / 100,
      0,
      0.5
    );
  }

  function isSkillActive(skillId) {
    return Date.now() < state.run.skills[skillId].activeUntil;
  }

  function getEffectiveClickDamage(includeSkill = true, includeEvent = true) {
    const equip = getEquipmentBonuses();
    const rune = getRuneBonuses();
    const event = includeEvent ? getEventState() : null;
    const base = Math.max(1, state.run.clickDamageBase + equip.click);
    const clickPct = 1 + rune.clickPct / 100 + (event && event.id === "frenzy" ? 1 : 0);
    const skillMult = includeSkill && state.run.skills.selected === "power" && isSkillActive("power") ? 3 : 1;
    return Math.floor(base * clickPct * getHonorMultiplier() * skillMult);
  }

  function getEffectiveAutoDps(includeSkill = true, includeEvent = true) {
    const equip = getEquipmentBonuses();
    const rune = getRuneBonuses();
    const event = includeEvent ? getEventState() : null;
    const base = Math.max(0, state.run.autoDpsBase + equip.auto);
    const autoPct = 1 + rune.autoPct / 100 + (event && event.id === "overclock" ? 1 : 0);
    const skillMult = includeSkill && state.run.skills.selected === "cry" && isSkillActive("cry") ? 2 : 1;
    return base * autoPct * getHonorMultiplier() * skillMult;
  }

  function getGoldBonusPercent(includeEvent = true) {
    const equip = getEquipmentBonuses();
    const rune = getRuneBonuses();
    const event = includeEvent ? getEventState() : null;
    const eventGold = event && event.id === "gold" ? 100 : 0;
    const skillGold = state.run.skills.selected === "cry" && isSkillActive("cry") ? 20 : 0;
    return equip.gold + rune.goldPct + eventGold + skillGold;
  }

  function getBossDamageMultiplier() {
    const rune = getRuneBonuses();
    if (state.run.isBoss || state.run.isChapterBoss) {
      return 1 + rune.bossPct / 100;
    }
    return 1;
  }

  function getTypeDamageMultiplier() {
    const event = getEventState();
    if (event && event.id === "weakness" && event.targetType === state.run.monsterTypeId) {
      return 1 + event.typePct / 100;
    }
    return 1;
  }

  function addLog(message) {
    state.log.unshift(message);
    state.log = state.log.slice(0, 6);
    updateLogUi();
  }

  function updateLogUi() {
    el.logList.innerHTML = "";
    state.log.forEach((line) => {
      const div = document.createElement("div");
      div.className = "log-line";
      div.textContent = line;
      el.logList.appendChild(div);
    });
  }

  function updateEventUi() {
    const event = getEventState();
    if (!event) {
      el.eventBanner.classList.remove("active");
      return;
    }
    const remaining = Math.max(0, Math.ceil((event.endAt - Date.now()) / 1000));
    el.eventBanner.classList.add("active");
    el.eventName.textContent = event.name;
    el.eventTimer.textContent = formatTimer(remaining);
  }

  function updateQuests(eventType, amount) {
    let updated = false;
    state.run.quests.forEach((quest) => {
      if (quest.completed) {
        return;
      }

      if (quest.type === "zone_reach" && eventType === "zone_reach") {
        quest.progress = Math.max(quest.progress, amount);
        updated = true;
      } else if (quest.type === eventType) {
        quest.progress += amount;
        updated = true;
      }

      if (quest.progress >= quest.target && !quest.completed) {
        quest.completed = true;
        addLog(`Quest complete: ${quest.title}`);
      }
    });

    if (updated) {
      updateQuestUi();
    }
  }

  function maybeTriggerEvent() {
    if (state.run.event) {
      return;
    }
    if (!chance(0.025)) {
      return;
    }

    const event = EVENT_TYPES[randInt(0, EVENT_TYPES.length - 1)];
    state.run.event = {
      id: event.id,
      name: event.name,
      endAt: Date.now() + event.duration * 1000,
      targetType: state.run.monsterTypeId,
      critPct: event.critPct || 0,
      goldPct: event.goldPct || 0,
      clickPct: event.clickPct || 0,
      autoPct: event.autoPct || 0,
      typePct: event.typePct || 0,
    };
    addLog(`Event started: ${event.name}`);
    updateEventUi();
  }

  function grantRewards() {
    const stats = getMonsterStats(
      state.run.zone,
      state.run.monsterTypeId,
      state.run.isBoss,
      state.run.isChapterBoss
    );
    const goldBonus = getGoldBonusPercent();
    const goldGain = Math.floor(stats.gold * (1 + goldBonus / 100));

    state.run.gold += goldGain;
    state.run.killsTotal += 1;
    state.run.killsInZone += 1;
    state.run.totalKillsThisRun += 1;
    state.run.goldEarnedThisRun += goldGain;

    state.meta.lifetimeKills += 1;
    state.meta.lifetimeGold += goldGain;

    if (state.run.isBoss || state.run.isChapterBoss) {
      state.meta.lifetimeBossKills += 1;
      updateQuests("boss_kill", 1);
    }

    if (state.run.isChapterBoss) {
      state.meta.lifetimeChapterBossKills += 1;
      addLog("Chapter boss defeated!");
    }

    updateQuests("kill", 1);
    updateQuests("gold_earned", goldGain);

    if (state.run.killsInZone >= ZONE_KILLS) {
      state.run.zone += 1;
      state.run.killsInZone = 0;
      state.run.highestZone = Math.max(state.run.highestZone, state.run.zone);
      updateQuests("zone_reach", state.run.zone);
    }

    tryDropEquipment();
    maybeTriggerEvent();

    const nextIsBoss = state.run.killsTotal % BOSS_EVERY === 0;
    spawnMonster(nextIsBoss);
  }

  function dealDamage(amount, isCrit = false) {
    if (state.run.monsterHp <= 0) {
      return;
    }

    state.run.monsterHp = Math.max(0, state.run.monsterHp - amount);
    addFloatingText(`-${formatNumber(amount)}`, isCrit, false);
    updateHpUi();

    if (state.run.monsterHp <= 0) {
      grantRewards();
    }

    updateUi();
  }

  function handleClick() {
    if (state.run.monsterHp <= 0) {
      return;
    }

    const monsterType = getMonsterType(state.run.monsterTypeId);
    if (monsterType.dodge > 0 && chance(monsterType.dodge)) {
      addFloatingText("MISS", false, true);
      hitEffects();
      addLog("The runner dodged your strike.");
      return;
    }

    const critChance = getEffectiveCritChance();
    const isCrit = Math.random() < critChance;
    let damage = getEffectiveClickDamage(true);
    damage = Math.floor(damage * getBossDamageMultiplier() * getTypeDamageMultiplier());
    damage = isCrit ? Math.floor(damage * state.run.critMultiplierBase) : damage;

    dealDamage(damage, isCrit);
    hitEffects();

    state.meta.lifetimeClickDamage += damage;
    updateQuests("click_damage", damage);

    if (isCrit) {
      state.meta.lifetimeCrits += 1;
      updateQuests("crit", 1);
    }
  }

  function handleAutoDps() {
    const effectiveAuto = getEffectiveAutoDps(true);
    if (effectiveAuto <= 0 || state.run.monsterHp <= 0) {
      return;
    }

    const tickDamage = effectiveAuto / (1000 / DPS_TICK_MS);
    autoCarry += tickDamage;
    const intDamage = Math.floor(autoCarry);
    if (intDamage >= 1) {
      const damage = Math.floor(intDamage * getBossDamageMultiplier() * getTypeDamageMultiplier());
      dealDamage(damage, false);
      autoCarry -= intDamage;
    }
  }

  function getSkillCooldown(skillId) {
    const rune = getRuneBonuses();
    const base = skillId === "power" ? SKILL_COOLDOWN_MS : CRY_COOLDOWN_MS;
    const pct = clamp(rune.cooldownPct, 0, 50);
    return Math.floor(base * (1 - pct / 100));
  }

  function updateSkillUi() {
    const selected = state.run.skills.selected;
    const now = Date.now();
    const skill = state.run.skills[selected];
    const cooldown = getSkillCooldown(selected);
    const cooldownRemaining = Math.max(0, cooldown - (now - skill.lastUsed));
    const activeRemaining = Math.max(0, skill.activeUntil - now);

    if (selected === "power") {
      el.skillTitle.textContent = "Power Strike";
      el.skillDesc.textContent = "Click damage x3 for 4s";
    } else {
      el.skillTitle.textContent = "Battle Cry";
      el.skillDesc.textContent = "Auto DPS x2 +20% gold for 6s";
    }

    if (activeRemaining > 0) {
      el.skillTimer.textContent = `Active ${formatTimer(activeRemaining / 1000)}`;
      el.skillActivate.classList.add("active");
    } else if (cooldownRemaining > 0) {
      el.skillTimer.textContent = `Cooldown ${formatTimer(cooldownRemaining / 1000)}`;
      el.skillActivate.classList.remove("active");
    } else {
      el.skillTimer.textContent = "Ready";
      el.skillActivate.classList.remove("active");
    }

    el.skillActivate.disabled = cooldownRemaining > 0;

    Array.from(el.skillSelect.querySelectorAll("button")).forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.skill === selected);
    });
  }

  function updatePrestigeUi() {
    const canPrestige = state.run.zone >= PRESTIGE_ZONE;
    el.prestige.disabled = !canPrestige;
  }

  function updateInventoryUi() {
    const relic = getEquippedRelic();
    if (relic) {
      el.equippedName.textContent = `${relic.name} (${relic.rarity})`;
      el.equippedName.className = `equipped-name rarity-${relic.rarity.toLowerCase()}`;
      el.equippedStat.textContent = describeRelicStat(relic);
      el.unequip.disabled = false;
    } else {
      el.equippedName.textContent = "None";
      el.equippedName.className = "equipped-name";
      el.equippedStat.textContent = "No bonus";
      el.unequip.disabled = true;
    }

    const rune = getEquippedRune();
    if (rune && relic) {
      el.equippedRuneName.textContent = `Rune: ${rune.name} (${rune.rarity})`;
      el.equippedRuneName.className = `equipped-name rarity-${rune.rarity.toLowerCase()}`;
      el.equippedRuneStat.textContent = describeRuneStat(rune);
      el.unequipRune.disabled = false;
    } else if (!relic) {
      el.equippedRuneName.textContent = "Rune: None";
      el.equippedRuneName.className = "equipped-name";
      el.equippedRuneStat.textContent = "Equip a relic to socket a rune";
      el.unequipRune.disabled = true;
    } else {
      el.equippedRuneName.textContent = "Rune: None";
      el.equippedRuneName.className = "equipped-name";
      el.equippedRuneStat.textContent = "No rune socketed";
      el.unequipRune.disabled = true;
    }

    el.inventoryList.innerHTML = "";
    state.run.inventory.forEach((item) => {
      const wrap = document.createElement("div");
      wrap.className = "item";

      const name = document.createElement("div");
      name.className = `name rarity-${item.rarity.toLowerCase()}`;
      name.textContent = `${item.name} (${item.rarity})`;

      const stat = document.createElement("div");
      stat.className = "stat";
      stat.textContent = describeRelicStat(item);

      const button = document.createElement("button");
      button.className = "small";
      button.textContent = item.id === state.run.equippedRelicId ? "Equipped" : "Equip";
      button.disabled = item.id === state.run.equippedRelicId;
      button.dataset.equipId = item.id;

      wrap.appendChild(name);
      wrap.appendChild(stat);
      wrap.appendChild(button);
      el.inventoryList.appendChild(wrap);
    });
  }

  function updateRuneUi() {
    el.runeShopList.innerHTML = "";
    state.run.runeShop.forEach((rune) => {
      const wrap = document.createElement("div");
      wrap.className = "rune-item";

      const name = document.createElement("div");
      name.className = `name rarity-${rune.rarity.toLowerCase()}`;
      name.textContent = `${rune.name} (${rune.rarity})`;

      const stat = document.createElement("div");
      stat.className = "stat";
      stat.textContent = describeRuneStat(rune);

      const cost = document.createElement("div");
      cost.className = "stat";
      cost.textContent = `Cost: ${formatNumber(rune.cost)} gold`;

      const button = document.createElement("button");
      button.className = "small";
      button.textContent = "Buy";
      button.disabled = state.run.gold < rune.cost || state.run.runes.length >= RUNE_MAX;
      button.dataset.buyRuneId = rune.id;

      wrap.appendChild(name);
      wrap.appendChild(stat);
      wrap.appendChild(cost);
      wrap.appendChild(button);
      el.runeShopList.appendChild(wrap);
    });

    el.runeInventoryList.innerHTML = "";
    state.run.runes.forEach((rune) => {
      const wrap = document.createElement("div");
      wrap.className = "rune-item";

      const name = document.createElement("div");
      name.className = `name rarity-${rune.rarity.toLowerCase()}`;
      name.textContent = `${rune.name} (${rune.rarity})`;

      const stat = document.createElement("div");
      stat.className = "stat";
      stat.textContent = describeRuneStat(rune);

      const button = document.createElement("button");
      button.className = "small";
      button.textContent = rune.id === state.run.equippedRuneId ? "Socketed" : "Socket";
      button.disabled = rune.id === state.run.equippedRuneId || !getEquippedRelic();
      button.dataset.socketRuneId = rune.id;

      wrap.appendChild(name);
      wrap.appendChild(stat);
      wrap.appendChild(button);
      el.runeInventoryList.appendChild(wrap);
    });

    const refreshCost = state.run.freeRuneRefreshUsed ? RUNE_REFRESH_COST : 0;
    el.runeRefresh.textContent = refreshCost === 0 ? "Refresh (Free)" : `Refresh (${refreshCost}g)`;
    el.runeRefresh.disabled = state.run.freeRuneRefreshUsed && state.run.gold < refreshCost;
  }

  function updateQuestUi() {
    el.questList.innerHTML = "";
    state.run.quests.forEach((quest) => {
      const card = document.createElement("div");
      card.className = "quest";

      const title = document.createElement("div");
      title.className = "title";
      title.textContent = quest.title;

      const desc = document.createElement("div");
      desc.textContent = quest.description;

      const progress = document.createElement("div");
      progress.className = "progress";
      progress.textContent = `${formatNumber(quest.progress)} / ${formatNumber(quest.target)}`;

      const reward = document.createElement("div");
      const rewardLabel = quest.rewardType === "honor" ? "Honor" : quest.rewardType === "rune" ? "Rune" : "Gold";
      reward.textContent = `Reward: ${formatNumber(quest.rewardAmount)} ${rewardLabel}`;

      const button = document.createElement("button");
      button.className = "small";
      if (quest.completed) {
        button.textContent = "Claim";
        button.dataset.claimId = quest.id;
      } else {
        button.textContent = "In Progress";
        button.disabled = true;
      }

      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(progress);
      card.appendChild(reward);
      card.appendChild(button);
      el.questList.appendChild(card);
    });
  }

  function updateAchievementsUi() {
    const filter = state.achievementFilter;
    el.achievementList.innerHTML = "";

    ACHIEVEMENTS.forEach((ach) => {
      const unlocked = !!state.meta.achievements[ach.id];
      if (filter === "unlocked" && !unlocked) {
        return;
      }
      if (filter === "locked" && unlocked) {
        return;
      }

      const card = document.createElement("div");
      card.className = `achievement-card${unlocked ? "" : " locked"}`;
      const title = document.createElement("div");
      title.textContent = ach.title;
      const desc = document.createElement("div");
      desc.textContent = ach.desc;
      const status = document.createElement("div");
      status.className = "stat";
      status.textContent = unlocked
        ? `Unlocked: ${new Date(state.meta.achievements[ach.id]).toLocaleDateString()}`
        : "Locked";
      const reward = document.createElement("div");
      reward.className = "stat";
      reward.textContent = `Title: ${ach.titleReward}`;

      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(status);
      card.appendChild(reward);
      el.achievementList.appendChild(card);
    });

    updateTitleSelect();
  }

  function updateTitleSelect() {
    const titles = ["None", ...state.meta.titlesUnlocked];
    el.titleSelect.innerHTML = "";
    titles.forEach((title) => {
      const option = document.createElement("option");
      option.value = title;
      option.textContent = title;
      if (title === state.meta.equippedTitle) {
        option.selected = true;
      }
      el.titleSelect.appendChild(option);
    });
  }

  function checkAchievements() {
    ACHIEVEMENTS.forEach((ach) => {
      if (state.meta.achievements[ach.id]) {
        return;
      }
      if (ach.check(state)) {
        state.meta.achievements[ach.id] = Date.now();
        if (!state.meta.titlesUnlocked.includes(ach.titleReward)) {
          state.meta.titlesUnlocked.push(ach.titleReward);
        }
        addLog(`Achievement unlocked: ${ach.title}`);
      }
    });
  }

  function updateUi() {
    el.gold.textContent = formatNumber(state.run.gold);
    el.honor.textContent = formatNumber(state.meta.totalHonor);
    el.dmgMult.textContent = `${getHonorMultiplier().toFixed(2)}x`;
    el.zone.textContent = formatNumber(state.run.zone);
    el.kills.textContent = formatNumber(state.run.killsTotal);
    el.titleDisplay.textContent = state.meta.equippedTitle || "None";

    el.clickDmg.textContent = formatNumber(getEffectiveClickDamage(true));
    el.autoDps.textContent = formatNumber(getEffectiveAutoDps(true));
    el.critChance.textContent = `${Math.floor(getEffectiveCritChance() * 100)}%`;
    el.critMulti.textContent = `${state.run.critMultiplierBase.toFixed(1)}x`;
    el.goldBonus.textContent = `${formatNumber(getGoldBonusPercent())}%`;
    el.zoneProgress.textContent = `${formatNumber(state.run.killsInZone)} / ${ZONE_KILLS}`;

    el.lvlClick.textContent = formatNumber(state.upgrades.click.level);
    el.lvlAuto.textContent = formatNumber(state.upgrades.auto.level);
    el.lvlCrit.textContent = formatNumber(state.upgrades.crit.level);
    el.lvlMulti.textContent = formatNumber(state.upgrades.multi.level);

    const costClick = getUpgradeCost(state.upgrades.click);
    const costAuto = getUpgradeCost(state.upgrades.auto);
    const costCrit = getUpgradeCost(state.upgrades.crit);
    const costMulti = getUpgradeCost(state.upgrades.multi);

    el.costClick.textContent = formatNumber(costClick);
    el.costAuto.textContent = formatNumber(costAuto);
    el.costCrit.textContent = formatNumber(costCrit);
    el.costMulti.textContent = formatNumber(costMulti);

    el.buyClick.disabled = state.run.gold < costClick;
    el.buyAuto.disabled = state.run.gold < costAuto;
    el.buyCrit.disabled = state.run.gold < costCrit || getEffectiveCritChance() >= 0.5;
    el.buyMulti.disabled = state.run.gold < costMulti || state.run.critMultiplierBase >= 3.0;

    const rerollCost = state.run.freeRerollUsed ? 500 : 0;
    el.reroll.textContent = rerollCost === 0 ? "Reroll (Free)" : "Reroll (500g)";
    el.reroll.disabled = state.run.freeRerollUsed && state.run.gold < 500;

    checkAchievements();
    updateSkillUi();
    updatePrestigeUi();
    updateInventoryUi();
    updateRuneUi();
    updateQuestUi();
    updateAchievementsUi();
    updateEventUi();
    updateLogUi();
  }

  function buyUpgrade(type) {
    const upgrade = state.upgrades[type];
    const cost = getUpgradeCost(upgrade);

    if (state.run.gold < cost) {
      return;
    }

    if (type === "crit" && getEffectiveCritChance() >= 0.5) {
      return;
    }

    if (type === "multi" && state.run.critMultiplierBase >= 3.0) {
      return;
    }

    state.run.gold -= cost;
    upgrade.level += 1;

    if (type === "click") {
      state.run.clickDamageBase += 1;
    } else if (type === "auto") {
      state.run.autoDpsBase += 1;
    } else if (type === "crit") {
      state.run.critChanceBase = clamp(state.run.critChanceBase + 0.02, 0, 0.5);
    } else if (type === "multi") {
      state.run.critMultiplierBase = clamp(state.run.critMultiplierBase + 0.1, 1.5, 3.0);
    }

    updateUi();
  }

  function tryDropEquipment() {
    const dropChance = state.run.isBoss || state.run.isChapterBoss ? 0.12 : 0.03;
    if (!chance(dropChance)) {
      return;
    }

    if (state.run.inventory.length >= INVENTORY_MAX) {
      addLog("Inventory full. Relic discarded.");
      return;
    }

    const rarityRoll = randInt(1, 100);
    let rarity = "Common";
    if (rarityRoll > 95) {
      rarity = "Epic";
    } else if (rarityRoll > 70) {
      rarity = "Rare";
    }

    const statType = ["click", "auto", "crit", "gold"][randInt(0, 3)];
    const zone = state.run.zone;
    let statValue = 1;

    if (rarity === "Common") {
      statValue = Math.floor(1 + zone * 0.5);
    } else if (rarity === "Rare") {
      statValue = Math.floor(2 + zone * 0.9);
    } else {
      statValue = Math.floor(4 + zone * 1.5);
    }

    if (statType === "crit") {
      statValue = Math.min(statValue, 50);
    }

    const name = generateItemName(rarity);
    const item = {
      id: `relic-${Date.now()}-${randInt(1000, 9999)}`,
      name,
      rarity,
      statType,
      statValue,
    };

    state.run.inventory.push(item);
    if (rarity === "Rare") {
      state.meta.foundRareRelic = true;
    }
    if (rarity === "Epic") {
      state.meta.foundEpicRelic = true;
    }
    addLog(`Found ${rarity} relic: ${name}.`);
    updateInventoryUi();
  }

  function generateItemName(rarity) {
    const prefix = ["Old", "Runed", "Gleaming", "Cursed", "Ancient", "Sturdy"];
    const relics = ["Relic", "Talisman", "Sigil", "Charm", "Emblem", "Token"];
    const p = prefix[randInt(0, prefix.length - 1)];
    const r = relics[randInt(0, relics.length - 1)];
    return `${p} ${rarity} ${r}`;
  }

  function describeRelicStat(item) {
    if (item.statType === "click") {
      return `+${formatNumber(item.statValue)} Click Damage`;
    }
    if (item.statType === "auto") {
      return `+${formatNumber(item.statValue)} Auto DPS`;
    }
    if (item.statType === "crit") {
      return `+${formatNumber(item.statValue)}% Crit Chance`;
    }
    if (item.statType === "gold") {
      return `+${formatNumber(item.statValue)}% Gold`;
    }
    return "";
  }

  function describeRuneStat(rune) {
    return `${rune.effectLabel} ${formatNumber(rune.value)}%`;
  }

  function equipRelic(itemId) {
    const item = state.run.inventory.find((entry) => entry.id === itemId);
    if (!item) {
      return;
    }

    state.run.equippedRelicId = item.id;
    addLog(`Equipped ${item.name}.`);
    updateUi();
  }

  function unequipRelic() {
    if (!state.run.equippedRelicId) {
      return;
    }
    state.run.equippedRelicId = null;
    addLog("Relic unequipped.");
    updateUi();
  }

  function generateRune() {
    const rarityRoll = randInt(1, 100);
    let rarity = "Common";
    if (rarityRoll > 95) {
      rarity = "Epic";
    } else if (rarityRoll > 70) {
      rarity = "Rare";
    }

    const effect = RUNE_EFFECTS[randInt(0, RUNE_EFFECTS.length - 1)];
    let value = 3;
    if (rarity === "Common") {
      value = randInt(3, 6);
    } else if (rarity === "Rare") {
      value = randInt(7, 12);
    } else {
      value = randInt(13, 20);
    }

    if (effect.id === "swiftness") {
      value = Math.min(value, 20);
    }

    const rune = {
      id: `rune-${Date.now()}-${randInt(1000, 9999)}`,
      name: `${rarity} ${effect.label}`,
      rarity,
      effect: effect.id,
      effectLabel: effect.label,
      value,
      cost: Math.floor(120 + value * 20),
    };

    return rune;
  }

  function refreshRuneShop(forceFree = false) {
    if (!forceFree) {
      const cost = state.run.freeRuneRefreshUsed ? RUNE_REFRESH_COST : 0;
      if (cost > 0) {
        if (state.run.gold < cost) {
          return;
        }
        state.run.gold -= cost;
      } else {
        state.run.freeRuneRefreshUsed = true;
      }
    }

    state.run.runeShop = [generateRune(), generateRune(), generateRune(), generateRune()];
    addLog("Rune shop refreshed.");
    updateUi();
  }

  function addRuneToInventory(rune) {
    if (state.run.runes.length >= RUNE_MAX) {
      addLog("Rune pouch full. Rune discarded.");
      return false;
    }
    state.run.runes.push(rune);
    if (rune.rarity === "Rare") {
      state.meta.foundRareRune = true;
    }
    if (rune.rarity === "Epic") {
      state.meta.foundEpicRune = true;
    }
    return true;
  }

  function buyRune(runeId) {
    const runeIndex = state.run.runeShop.findIndex((r) => r.id === runeId);
    if (runeIndex === -1) {
      return;
    }

    const rune = state.run.runeShop[runeIndex];
    if (state.run.gold < rune.cost || state.run.runes.length >= RUNE_MAX) {
      return;
    }

    state.run.gold -= rune.cost;
    const purchased = addRuneToInventory({ ...rune, cost: undefined });
    if (purchased) {
      addLog(`Purchased rune: ${rune.name}.`);
      state.run.runeShop.splice(runeIndex, 1, generateRune());
      updateUi();
    }
  }

  function socketRune(runeId) {
    if (!getEquippedRelic()) {
      return;
    }
    const rune = state.run.runes.find((r) => r.id === runeId);
    if (!rune) {
      return;
    }

    state.run.equippedRuneId = rune.id;
    addLog(`Socketed rune: ${rune.name}.`);
    updateUi();
  }

  function removeRune() {
    if (!state.run.equippedRuneId) {
      return;
    }
    const rune = getEquippedRune();
    state.run.equippedRuneId = null;
    if (rune) {
      addLog(`Rune removed: ${rune.name}.`);
    }
    updateUi();
  }

  function createQuest() {
    const template = QUEST_TEMPLATES[randInt(0, QUEST_TEMPLATES.length - 1)];
    const target = template.target();
    const reward = template.reward();
    return {
      id: `quest-${Date.now()}-${randInt(1000, 9999)}`,
      templateId: template.id,
      title: template.title,
      description: template.desc(target),
      type: template.type,
      target,
      progress: 0,
      completed: false,
      rewardType: reward.type,
      rewardAmount: reward.amount,
    };
  }

  function ensureQuests() {
    if (state.run.quests.length >= 3) {
      return;
    }
    while (state.run.quests.length < 3) {
      state.run.quests.push(createQuest());
    }
  }

  function claimQuest(questId) {
    const questIndex = state.run.quests.findIndex((quest) => quest.id === questId);
    if (questIndex === -1) {
      return;
    }

    const quest = state.run.quests[questIndex];
    if (!quest.completed) {
      return;
    }

    if (quest.rewardType === "honor") {
      state.meta.totalHonor += quest.rewardAmount;
    } else if (quest.rewardType === "rune") {
      const rune = generateRune();
      addRuneToInventory(rune);
      addLog(`Quest reward: ${rune.name}.`);
    } else {
      state.run.gold += quest.rewardAmount;
    }

    state.meta.lifetimeQuestClaims += 1;
    addLog(`Quest claimed: ${quest.title}.`);
    state.run.quests.splice(questIndex, 1, createQuest());
    updateUi();
  }

  function rerollQuests() {
    const rerollCost = state.run.freeRerollUsed ? 500 : 0;
    if (rerollCost > 0 && state.run.gold < rerollCost) {
      return;
    }

    if (rerollCost > 0) {
      state.run.gold -= rerollCost;
    } else {
      state.run.freeRerollUsed = true;
    }

    state.run.quests = [createQuest(), createQuest(), createQuest()];
    addLog("Quests rerolled.");
    updateUi();
  }

  function activateSkill() {
    const selected = state.run.skills.selected;
    const now = Date.now();
    const cooldown = getSkillCooldown(selected);
    const skill = state.run.skills[selected];
    const cooldownRemaining = cooldown - (now - skill.lastUsed);
    if (cooldownRemaining > 0) {
      addLog("Skill is on cooldown.");
      return;
    }

    skill.lastUsed = now;
    if (selected === "power") {
      skill.activeUntil = now + SKILL_DURATION_MS;
      addLog("Power Strike activated.");
    } else {
      skill.activeUntil = now + CRY_DURATION_MS;
      addLog("Battle Cry activated.");
    }
    state.meta.lifetimeSkillUses += 1;
    updateUi();
  }

  function selectSkill(skillId) {
    state.run.skills.selected = skillId;
    updateUi();
  }

  function prestige() {
    if (state.run.zone < PRESTIGE_ZONE) {
      return;
    }

    const ok = window.confirm("Prestige and reset this run for Honor?");
    if (!ok) {
      return;
    }

    const honorGained = Math.max(
      1,
      Math.floor((state.run.highestZone - 9) * 2 + state.run.totalKillsThisRun / 50)
    );

    state.meta.totalHonor += honorGained;
    state.meta.lifetimePrestiges += 1;
    addLog(`Prestiged for ${honorGained} Honor.`);
    resetRun();
    saveGame();
    updateUi();
  }

  function resetRun() {
    const base = getDefaultState();
    state.run = base.run;
    state.upgrades.click.level = 0;
    state.upgrades.auto.level = 0;
    state.upgrades.crit.level = 0;
    state.upgrades.multi.level = 0;
    autoCarry = 0;
    spawnMonster(false);
    ensureQuests();
    refreshRuneShop(true);
  }

  function applyOfflineProgress() {
    const last = state.run.lastActiveAt || Date.now();
    const now = Date.now();
    const offlineSeconds = clamp(Math.floor((now - last) / 1000), 0, OFFLINE_CAP_SECONDS);

    state.run.lastActiveAt = now;
    if (offlineSeconds <= 10) {
      return;
    }

    const effectiveAuto = getEffectiveAutoDps(false, false);
    const zoneGoldFactor = getMonsterStats(
      state.run.zone,
      state.run.monsterTypeId,
      false,
      false
    ).gold / BASE_GOLD;

    const goldGain = Math.floor(offlineSeconds * (effectiveAuto * 0.15) * zoneGoldFactor);
    const rawKills = Math.floor(offlineSeconds * (effectiveAuto / state.run.monsterMaxHp) * 0.15);
    const killsGain = clamp(rawKills, 0, OFFLINE_KILL_CAP);

    if (goldGain <= 0 && killsGain <= 0) {
      return;
    }

    state.run.gold += goldGain;
    state.run.killsTotal += killsGain;
    state.run.killsInZone += killsGain;
    state.run.totalKillsThisRun += killsGain;
    state.run.goldEarnedThisRun += goldGain;
    state.meta.lifetimeKills += killsGain;
    state.meta.lifetimeGold += goldGain;

    while (state.run.killsInZone >= ZONE_KILLS) {
      state.run.zone += 1;
      state.run.killsInZone -= ZONE_KILLS;
      state.run.highestZone = Math.max(state.run.highestZone, state.run.zone);
    }

    showOfflineModal(goldGain, killsGain);
  }

  function showOfflineModal(goldGain, killsGain) {
    el.offlineText.textContent = `While you were away: +${formatNumber(
      goldGain
    )} gold, +${formatNumber(killsGain)} kills.`;
    el.offlineModal.classList.add("active");
  }

  function saveGame() {
    state.run.lastActiveAt = Date.now();
    const payload = {
      version: "v0.3",
      meta: state.meta,
      run: state.run,
      upgrades: state.upgrades,
      log: state.log,
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  }

  function loadState() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      spawnMonster(false);
      ensureQuests();
      refreshRuneShop(true);
      return;
    }

    try {
      const data = JSON.parse(raw);
      const defaults = getDefaultState();

      if (data.meta) {
        state.meta = { ...defaults.meta, ...data.meta };
        state.meta.achievements = { ...defaults.meta.achievements, ...data.meta.achievements };
        state.meta.titlesUnlocked = data.meta.titlesUnlocked || [];
        state.meta.regionsReached = data.meta.regionsReached || ["greenfields"];
      }

      if (data.run) {
        state.run = { ...defaults.run, ...data.run };
        state.run.skills = { ...defaults.run.skills, ...data.run.skills };
      }

      if (data.upgrades) {
        state.upgrades = { ...defaults.upgrades, ...data.upgrades };
        Object.keys(state.upgrades).forEach((key) => {
          state.upgrades[key].baseCost = defaults.upgrades[key].baseCost;
          state.upgrades[key].level = Math.max(0, state.upgrades[key].level || 0);
        });
      }

      if (!data.meta && typeof data.gold === "number") {
        state.run.gold = data.gold;
        state.run.zone = data.zone ?? state.run.zone;
        state.run.killsTotal = data.killsTotal ?? state.run.killsTotal;
        state.run.killsInZone = data.killsInZone ?? state.run.killsInZone;
        state.run.clickDamageBase = data.clickDamage ?? state.run.clickDamageBase;
        state.run.autoDpsBase = data.autoDps ?? state.run.autoDpsBase;
        state.run.critChanceBase = data.critChance ?? state.run.critChanceBase;
        state.run.critMultiplierBase = data.critMultiplier ?? state.run.critMultiplierBase;
        state.run.isBoss = data.isBoss ?? state.run.isBoss;
        state.run.monsterHp = data.monsterHp ?? state.run.monsterHp;
        state.run.monsterMaxHp = data.monsterMaxHp ?? state.run.monsterMaxHp;
        state.upgrades = data.upgrades ?? state.upgrades;
      }

      state.run.critChanceBase = clamp(state.run.critChanceBase, 0, 0.5);
      state.run.critMultiplierBase = clamp(state.run.critMultiplierBase, 1.5, 3.0);
      state.run.gold = Math.max(0, state.run.gold || 0);
      state.run.zone = Math.max(1, state.run.zone || 1);
      state.run.highestZone = Math.max(state.run.zone, state.run.highestZone || state.run.zone);

      if (!Array.isArray(state.run.inventory)) {
        state.run.inventory = [];
      }
      state.run.inventory = state.run.inventory.slice(0, INVENTORY_MAX);
      if (!state.run.inventory.find((item) => item.id === state.run.equippedRelicId)) {
        state.run.equippedRelicId = null;
      }

      if (!Array.isArray(state.run.runes)) {
        state.run.runes = [];
      }
      state.run.runes = state.run.runes.slice(0, RUNE_MAX);
      if (!state.run.runes.find((rune) => rune.id === state.run.equippedRuneId)) {
        state.run.equippedRuneId = null;
      }
      if (!Array.isArray(state.run.runeShop) || state.run.runeShop.length === 0) {
        state.run.runeShop = [generateRune(), generateRune(), generateRune(), generateRune()];
      }

      if (!Array.isArray(state.run.quests) || state.run.quests.length === 0) {
        state.run.quests = [];
      }

      spawnMonster(state.run.isBoss, state.run.monsterTypeId);
      if (typeof state.run.monsterMaxHp === "number") {
        state.run.monsterMaxHp = Math.max(1, state.run.monsterMaxHp);
      }
      if (typeof state.run.monsterHp === "number") {
        state.run.monsterHp = clamp(state.run.monsterHp, 0, state.run.monsterMaxHp);
      }
      updateHpUi();
      ensureQuests();
    } catch (error) {
      spawnMonster(false);
      ensureQuests();
      refreshRuneShop(true);
    }
  }

  function resetGame() {
    const ok = window.confirm("Reset all progress?");
    if (!ok) {
      return;
    }

    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
  }

  function setCompactMode(enabled) {
    if (enabled) {
      document.body.classList.add("compact");
    } else {
      document.body.classList.remove("compact");
    }
    localStorage.setItem(UI_COMPACT_KEY, enabled ? "1" : "0");
    el.compactToggle.textContent = enabled ? "Compact: On" : "Compact: Off";
  }

  function initCompactMode() {
    const stored = localStorage.getItem(UI_COMPACT_KEY);
    const enabled = stored === "1";
    setCompactMode(enabled);
  }

  function initTabs() {
    const buttons = Array.from(document.querySelectorAll(".tab-button"));
    const panels = Array.from(document.querySelectorAll(".tab-panel"));

    const setActive = (tab) => {
      buttons.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.tab === tab));
      panels.forEach((panel) =>
        panel.classList.toggle("is-active", panel.dataset.tabPanel === tab)
      );
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => setActive(button.dataset.tab));
    });

    setActive("shop");
  }

  function initAchievementFilters() {
    el.achievementFilters.addEventListener("click", (event) => {
      const target = event.target;
      if (!target.dataset.filter) {
        return;
      }
      state.achievementFilter = target.dataset.filter;
      Array.from(el.achievementFilters.querySelectorAll("button")).forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.filter === state.achievementFilter);
      });
      updateAchievementsUi();
    });
  }

  function startIntervals() {
    if (dpsInterval) {
      clearInterval(dpsInterval);
    }
    if (autosaveInterval) {
      clearInterval(autosaveInterval);
    }

    dpsInterval = setInterval(() => {
      handleAutoDps();
      updateUi();
    }, DPS_TICK_MS);

    autosaveInterval = setInterval(saveGame, AUTOSAVE_MS);
  }

  function init() {
    loadState();
    initTabs();
    initCompactMode();
    initAchievementFilters();
    applyOfflineProgress();
    updateUi();

    el.monster.addEventListener("click", handleClick);
    el.buyClick.addEventListener("click", () => buyUpgrade("click"));
    el.buyAuto.addEventListener("click", () => buyUpgrade("auto"));
    el.buyCrit.addEventListener("click", () => buyUpgrade("crit"));
    el.buyMulti.addEventListener("click", () => buyUpgrade("multi"));
    el.skillActivate.addEventListener("click", activateSkill);
    el.skillSelect.addEventListener("click", (event) => {
      const target = event.target;
      if (target.dataset.skill) {
        selectSkill(target.dataset.skill);
      }
    });
    el.prestige.addEventListener("click", prestige);
    el.compactToggle.addEventListener("click", () => {
      const enabled = document.body.classList.contains("compact");
      setCompactMode(!enabled);
    });
    el.unequip.addEventListener("click", unequipRelic);
    el.unequipRune.addEventListener("click", removeRune);
    el.inventoryList.addEventListener("click", (event) => {
      const target = event.target;
      if (target && target.dataset.equipId) {
        equipRelic(target.dataset.equipId);
      }
    });
    el.runeShopList.addEventListener("click", (event) => {
      const target = event.target;
      if (target && target.dataset.buyRuneId) {
        buyRune(target.dataset.buyRuneId);
      }
    });
    el.runeInventoryList.addEventListener("click", (event) => {
      const target = event.target;
      if (target && target.dataset.socketRuneId) {
        socketRune(target.dataset.socketRuneId);
      }
    });
    el.runeRefresh.addEventListener("click", () => refreshRuneShop(false));
    el.questList.addEventListener("click", (event) => {
      const target = event.target;
      if (target && target.dataset.claimId) {
        claimQuest(target.dataset.claimId);
      }
    });
    el.reroll.addEventListener("click", rerollQuests);
    el.titleSelect.addEventListener("change", (event) => {
      state.meta.equippedTitle = event.target.value;
      updateUi();
    });
    el.save.addEventListener("click", () => {
      saveGame();
      updateUi();
    });
    el.reset.addEventListener("click", resetGame);
    el.offlineClose.addEventListener("click", () => {
      el.offlineModal.classList.remove("active");
    });

    startIntervals();
  }

  window.addEventListener("beforeunload", saveGame);
  init();
})();
