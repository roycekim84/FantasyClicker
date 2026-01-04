(() => {
  "use strict";

  const CONTENT = window.CONTENT || {};
  const I18N = window.I18N || { en: {}, ko: {} };
  if (!window.CONTENT) {
    window.CONTENT = CONTENT;
  }
  if (!window.I18N) {
    window.I18N = I18N;
  }

  function validateContent() {
    if (!I18N.en || typeof I18N.en !== "object") {
      I18N.en = {};
    }
    if (!I18N.ko || typeof I18N.ko !== "object") {
      I18N.ko = {};
    }
    if (!CONTENT.monsters || typeof CONTENT.monsters !== "object") {
      CONTENT.monsters = {};
    }
    if (!Array.isArray(CONTENT.monsters.types) || CONTENT.monsters.types.length === 0) {
      CONTENT.monsters.types = [
        { id: "grunt", labelKey: "monster.type.grunt", hpMult: 1, goldMult: 1, dodge: 0 },
      ];
      console.warn("CONTENT.monsters.types missing; using defaults.");
    }
    if (!Array.isArray(CONTENT.regions) || CONTENT.regions.length === 0) {
      CONTENT.regions = [
        {
          id: "greenfields",
          start: 1,
          end: 10,
          nameKey: "region.greenfields.name",
          subtitleKey: "region.greenfields.sub",
          setKey: "collection.greenfields",
          enemies: ["region.greenfields.enemy1"],
        },
      ];
      console.warn("CONTENT.regions missing; using defaults.");
    }
    if (!Array.isArray(CONTENT.runeEffects)) {
      CONTENT.runeEffects = [];
      console.warn("CONTENT.runeEffects missing; using empty list.");
    }
    if (CONTENT.runeEffects.length === 0) {
      CONTENT.runeEffects.push({ id: "boss", labelKey: "rune.effect.boss" });
    }
    if (!Array.isArray(CONTENT.events)) {
      CONTENT.events = [];
      console.warn("CONTENT.events missing; using empty list.");
    }
    if (CONTENT.events.length === 0) {
      CONTENT.events.push({ id: "gold", nameKey: "event.gold", duration: 10, goldPct: 100 });
    }
    if (!CONTENT.quests || typeof CONTENT.quests !== "object") {
      CONTENT.quests = {};
    }
    if (!Array.isArray(CONTENT.quests.templates)) {
      CONTENT.quests.templates = [];
      console.warn("CONTENT.quests.templates missing; using empty list.");
    }
    if (!Array.isArray(CONTENT.quests.weekly)) {
      CONTENT.quests.weekly = [];
      console.warn("CONTENT.quests.weekly missing; using empty list.");
    }
    if (!Array.isArray(CONTENT.quests.chains)) {
      CONTENT.quests.chains = [];
      console.warn("CONTENT.quests.chains missing; using empty list.");
    }
    if (!Array.isArray(CONTENT.achievements)) {
      CONTENT.achievements = [];
      console.warn("CONTENT.achievements missing; using empty list.");
    }
    if (!CONTENT.itemNames || typeof CONTENT.itemNames !== "object") {
      CONTENT.itemNames = { prefixes: [], weapons: [], relics: [] };
    }
    if (!Array.isArray(CONTENT.itemNames.prefixes) || CONTENT.itemNames.prefixes.length === 0) {
      CONTENT.itemNames.prefixes = ["item.prefix.old"];
    }
    if (!Array.isArray(CONTENT.itemNames.weapons) || CONTENT.itemNames.weapons.length === 0) {
      CONTENT.itemNames.weapons = ["item.weapon.blade"];
    }
    if (!Array.isArray(CONTENT.itemNames.relics) || CONTENT.itemNames.relics.length === 0) {
      CONTENT.itemNames.relics = ["item.relic.relic"];
    }
  }

  validateContent();

  const SAVE_KEY = "pixel-mercenary-clicker-v0.1";
  const UI_COMPACT_KEY = "fc_compact";
  const UI_LANG_KEY = "fc_lang";
  const UI_NUMFMT_KEY = "fc_numfmt";
  const UI_FX_KEY = "fc_fx_reduced";
  const UI_SFX_KEY = "fc_sfx_enabled";
  const UI_SFX_VOL_KEY = "fc_sfx_volume";

  const BASE_HP = 30;
  const BASE_GOLD = 5;
  const ZONE_KILLS = 25;
  const BOSS_EVERY = 10;
  const AUTOSAVE_MS = 5000;
  const DPS_TICK_MS = 100;
  const PRESTIGE_ZONE = 10;
  const BASE_INVENTORY_SLOTS = 10;
  const RUNE_MAX = 18;
  const RUNE_REFRESH_COST = 300;
  const MAX_RUNE_OFFERS = 5;
  const LOG_MAX = 200;
  const SKILL_COOLDOWN_MS = 12000;
  const SKILL_DURATION_MS = 4000;
  const CRY_COOLDOWN_MS = 18000;
  const CRY_DURATION_MS = 6000;
  const OFFLINE_CAP_SECONDS = 6 * 60 * 60;
  const OFFLINE_KILL_CAP = 500;
  const COMBO_WINDOW_MS = 850;
  const WEAK_POINT_MIN_MS = 1200;
  const WEAK_POINT_MAX_MS = 2200;
  const BOSS_PATTERNS = ["guard", "evasion", "enrage"];
  const CHAPTER_ZONES = [10, 20, 30, 40, 50];

  const MONSTER_TYPES = CONTENT.monsters.types;
  const REGIONS = CONTENT.regions;
  const RUNE_EFFECTS = CONTENT.runeEffects;
  const EVENT_TYPES = CONTENT.events;
  const QUEST_TEMPLATES = CONTENT.quests.templates;
  const WEEKLY_TEMPLATES = CONTENT.quests.weekly;
  const CHAIN_TEMPLATES = CONTENT.quests.chains;
  const ACHIEVEMENTS = CONTENT.achievements;
  const TITLE_MAP = (() => {
    const map = {};
    const add = (entries) => {
      if (!entries) {
        return;
      }
      Object.keys(entries).forEach((key) => {
        map[entries[key]] = `title.${key}`;
      });
    };
    add(I18N.en?.title);
    add(I18N.ko?.title);
    return map;
  })();

  const CHAPTER_REWARDS = {
    10: [
      { id: "greed", titleKey: "reward.greedTitle", descKey: "reward.greedDesc", bonus: { goldPct: 3 } },
      { id: "slayer", titleKey: "reward.slayerTitle", descKey: "reward.slayerDesc", bonus: { bossDamagePct: 5 } },
      { id: "focus", titleKey: "reward.focusTitle", descKey: "reward.focusDesc", bonus: { skillCdrPct: 3 } },
      {
        id: "refresh",
        titleKey: "reward.refreshTitle",
        descKey: "reward.refreshDesc",
        bonus: { refreshDiscountPct: 10 },
      },
      {
        id: "runeRare",
        titleKey: "reward.runeRareTitle",
        descKey: "reward.runeRareDesc",
        bonus: { runeShopRarePct: 2 },
      },
      {
        id: "sellBonus",
        titleKey: "reward.sellTitle",
        descKey: "reward.sellDesc",
        bonus: { sellBonusPct: 10 },
      },
    ],
    20: [
      { id: "spark", titleKey: "reward.sparkTitle", descKey: "reward.sparkDesc", bonus: { clickPct: 2 } },
      { id: "greed", titleKey: "reward.greedTitle", descKey: "reward.greedDesc", bonus: { goldPct: 3 } },
      { id: "focus", titleKey: "reward.focusTitle", descKey: "reward.focusDesc", bonus: { skillCdrPct: 3 } },
      {
        id: "refresh",
        titleKey: "reward.refreshTitle",
        descKey: "reward.refreshDesc",
        bonus: { refreshDiscountPct: 10 },
      },
      {
        id: "runeRare",
        titleKey: "reward.runeRareTitle",
        descKey: "reward.runeRareDesc",
        bonus: { runeShopRarePct: 2 },
      },
      {
        id: "sellBonus",
        titleKey: "reward.sellTitle",
        descKey: "reward.sellDesc",
        bonus: { sellBonusPct: 10 },
      },
    ],
    30: [
      { id: "engine", titleKey: "reward.engineTitle", descKey: "reward.engineDesc", bonus: { autoPct: 2 } },
      { id: "slayer", titleKey: "reward.slayerTitle", descKey: "reward.slayerDesc", bonus: { bossDamagePct: 5 } },
      { id: "greed", titleKey: "reward.greedTitle", descKey: "reward.greedDesc", bonus: { goldPct: 3 } },
      {
        id: "refresh",
        titleKey: "reward.refreshTitle",
        descKey: "reward.refreshDesc",
        bonus: { refreshDiscountPct: 10 },
      },
      {
        id: "runeRare",
        titleKey: "reward.runeRareTitle",
        descKey: "reward.runeRareDesc",
        bonus: { runeShopRarePct: 2 },
      },
      {
        id: "sellBonus",
        titleKey: "reward.sellTitle",
        descKey: "reward.sellDesc",
        bonus: { sellBonusPct: 10 },
      },
    ],
    40: [
      { id: "spark", titleKey: "reward.sparkTitle", descKey: "reward.sparkDesc", bonus: { clickPct: 2 } },
      { id: "engine", titleKey: "reward.engineTitle", descKey: "reward.engineDesc", bonus: { autoPct: 2 } },
      { id: "focus", titleKey: "reward.focusTitle", descKey: "reward.focusDesc", bonus: { skillCdrPct: 3 } },
      {
        id: "refresh",
        titleKey: "reward.refreshTitle",
        descKey: "reward.refreshDesc",
        bonus: { refreshDiscountPct: 10 },
      },
      {
        id: "runeRare",
        titleKey: "reward.runeRareTitle",
        descKey: "reward.runeRareDesc",
        bonus: { runeShopRarePct: 2 },
      },
      {
        id: "sellBonus",
        titleKey: "reward.sellTitle",
        descKey: "reward.sellDesc",
        bonus: { sellBonusPct: 10 },
      },
    ],
    50: [
      { id: "slayer", titleKey: "reward.slayerTitle", descKey: "reward.slayerDesc", bonus: { bossDamagePct: 5 } },
      { id: "greed", titleKey: "reward.greedTitle", descKey: "reward.greedDesc", bonus: { goldPct: 3 } },
      { id: "engine", titleKey: "reward.engineTitle", descKey: "reward.engineDesc", bonus: { autoPct: 2 } },
      {
        id: "refresh",
        titleKey: "reward.refreshTitle",
        descKey: "reward.refreshDesc",
        bonus: { refreshDiscountPct: 10 },
      },
      {
        id: "runeRare",
        titleKey: "reward.runeRareTitle",
        descKey: "reward.runeRareDesc",
        bonus: { runeShopRarePct: 2 },
      },
      {
        id: "sellBonus",
        titleKey: "reward.sellTitle",
        descKey: "reward.sellDesc",
        bonus: { sellBonusPct: 10 },
      },
    ],
  };

  const el = {
    gold: document.getElementById("gold"),
    honor: document.getElementById("honor"),
    dmgMult: document.getElementById("dmg-mult"),
    zone: document.getElementById("zone"),
    chapterBadge: document.getElementById("chapter-badge"),
    kills: document.getElementById("kills"),
    titleDisplay: document.getElementById("title-display"),
    bossIndicator: document.getElementById("boss-indicator"),
    regionName: document.getElementById("region-name"),
    regionSub: document.getElementById("region-sub"),
    chapterNext: document.getElementById("chapter-next"),
    comboDisplay: document.getElementById("combo-display"),
    eventBanner: document.getElementById("event-banner"),
    eventName: document.getElementById("event-name"),
    eventTimer: document.getElementById("event-timer"),
    monsterPanel: document.getElementById("monster-panel"),
    banner: document.getElementById("banner"),
    monster: document.getElementById("monster"),
    monsterArea: document.getElementById("monster-area"),
    weakPoint: document.getElementById("weak-point"),
    fxLayer: document.getElementById("fx-layer"),
    monsterName: document.getElementById("monster-name"),
    monsterType: document.getElementById("monster-type"),
    bossPattern: document.getElementById("boss-pattern"),
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
    sessionReport: document.getElementById("session-report"),
    equippedWeaponName: document.getElementById("equipped-weapon-name"),
    equippedWeaponStat: document.getElementById("equipped-weapon-stat"),
    equippedWeaponTile: document.getElementById("equipped-weapon-tile"),
    equippedWeaponState: document.getElementById("equipped-weapon-state"),
    unequipWeapon: document.getElementById("unequip-weapon"),
    equippedRelicName: document.getElementById("equipped-relic-name"),
    equippedRelicStat: document.getElementById("equipped-relic-stat"),
    equippedRelicTile: document.getElementById("equipped-relic-tile"),
    equippedRelicState: document.getElementById("equipped-relic-state"),
    unequipRelic: document.getElementById("unequip-relic"),
    unequipRune: document.getElementById("unequip-rune"),
    manageRunes: document.getElementById("manage-runes"),
    inventorySelected: document.getElementById("inventory-selected"),
    inventoryEquip: document.getElementById("inventory-equip"),
    inventorySell: document.getElementById("inventory-sell"),
    inventorySlots: document.getElementById("inventory-slots"),
    inventoryExpand: document.getElementById("inventory-expand"),
    inventoryList: document.getElementById("inventory-list"),
    runeShopList: document.getElementById("runeShopRow"),
    runeRefresh: document.getElementById("rune-refresh"),
    runeOfferSelected: document.getElementById("rune-offer-selected"),
    runeOfferBuy: document.getElementById("rune-offer-buy"),
    runeStatus: document.getElementById("rune-status"),
    socketedRuneTile: document.getElementById("socketed-rune-tile"),
    socketedRuneName: document.getElementById("socketed-rune-name"),
    socketedRuneStat: document.getElementById("socketed-rune-stat"),
    runeSelected: document.getElementById("rune-selected"),
    runeSocket: document.getElementById("rune-socket"),
    runeSell: document.getElementById("rune-sell"),
    runeInventoryList: document.getElementById("rune-inventory-list"),
    questList: document.getElementById("quest-list"),
    weeklyQuest: document.getElementById("weekly-quest"),
    weeklyReset: document.getElementById("weekly-reset"),
    chainQuest: document.getElementById("chain-quest"),
    reroll: document.getElementById("reroll"),
    achievementList: document.getElementById("achievement-list"),
    achievementFilters: document.querySelector(".achievement-filters"),
    titleSelect: document.getElementById("title-select"),
    collectionSummary: document.getElementById("collection-summary"),
    collectionBonus: document.getElementById("collection-bonus"),
    collectionList: document.getElementById("collection-list"),
    metaBonusList: document.getElementById("meta-bonus-list"),
    logList: document.getElementById("log-list"),
    devPanel: document.getElementById("dev-panel"),
    devInfo: document.getElementById("dev-info"),
    devErrors: document.getElementById("dev-errors"),
    copyErrors: document.getElementById("copy-errors"),
    devGold: document.getElementById("dev-gold"),
    devZone: document.getElementById("dev-zone"),
    devBoss: document.getElementById("dev-boss"),
    exportSave: document.getElementById("export-save"),
    importSave: document.getElementById("import-save"),
    runTests: document.getElementById("run-tests"),
    testResults: document.getElementById("test-results"),
    clickCheck: document.getElementById("click-check"),
    save: document.getElementById("save"),
    reset: document.getElementById("reset"),
    sfxToggle: document.getElementById("sfx-toggle"),
    sfxVolume: document.getElementById("sfx-volume"),
    offlineModal: document.getElementById("offline-modal"),
    offlineText: document.getElementById("offline-text"),
    offlineClose: document.getElementById("offline-close"),
    sessionModal: document.getElementById("session-modal"),
    sessionContent: document.getElementById("session-content"),
    sessionClose: document.getElementById("session-close"),
    saveModal: document.getElementById("save-modal"),
    saveText: document.getElementById("save-text"),
    saveCopy: document.getElementById("save-copy"),
    saveApply: document.getElementById("save-apply"),
    saveClose: document.getElementById("save-close"),
    chapterModal: document.getElementById("chapter-modal"),
    chapterOptions: document.getElementById("chapter-options"),
    chapterRewardSub: document.getElementById("chapter-reward-sub"),
    tutorialBox: document.getElementById("tutorial-box"),
    tutorialTitle: document.getElementById("tutorial-title"),
    tutorialText: document.getElementById("tutorial-text"),
    tutorialNext: document.getElementById("tutorial-next"),
    tutorialSkip: document.getElementById("tutorial-skip"),
    tooltip: document.getElementById("tooltip"),
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
        foundRareWeapon: false,
        foundEpicWeapon: false,
        foundRareRelic: false,
        foundEpicRelic: false,
        foundRareRune: false,
        foundEpicRune: false,
        regionsReached: ["greenfields"],
        achievements: {},
        titlesUnlocked: [],
        equippedTitle: "",
        collections: {},
        chapterClears: {},
        inventoryMaxSlots: BASE_INVENTORY_SLOTS,
        metaBonuses: {
          goldPct: 0,
          bossDamagePct: 0,
          skillCdrPct: 0,
          clickPct: 0,
          autoPct: 0,
          refreshDiscountPct: 0,
          runeShopRarePct: 0,
          sellBonusPct: 0,
        },
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
        monsterNameKey: "region.greenfields.enemy1",
        currentBossPattern: null,
        rewardLock: false,
        pendingChapterReward: null,
        skills: {
          selected: "power",
          power: { lastUsed: 0, activeUntil: 0 },
          cry: { lastUsed: 0, activeUntil: 0 },
        },
        inventory: [],
        equippedWeaponId: null,
        equippedRelicId: null,
        runes: [],
        equippedRuneId: null,
        runeShop: [],
        freeRuneRefreshUsed: false,
        quests: [],
        freeRerollUsed: false,
        weeklyQuest: null,
        weeklyResetAt: 0,
        chainQuest: null,
        chainCompletedAt: 0,
        event: null,
        lastActiveAt: Date.now(),
        comboCount: 0,
        comboLastAt: 0,
      },
      upgrades: {
        click: { level: 0, baseCost: 12 },
        auto: { level: 0, baseCost: 24 },
        crit: { level: 0, baseCost: 36 },
        multi: { level: 0, baseCost: 48 },
      },
      session: {
        startAt: Date.now(),
        goldEarned: 0,
        kills: 0,
        bossKills: 0,
        chapterBossKills: 0,
        honorGained: 0,
        drops: { Common: 0, Rare: 0, Epic: 0 },
        questsCompleted: 0,
      },
      sessionHistory: [],
      log: [],
      achievementFilter: "all",
      ui: {
        lang: localStorage.getItem(UI_LANG_KEY) || "en",
        numFormat: localStorage.getItem(UI_NUMFMT_KEY) || "full",
        reducedFx: localStorage.getItem(UI_FX_KEY) === "1",
        compact: localStorage.getItem(UI_COMPACT_KEY) === "1",
        sfxEnabled: localStorage.getItem(UI_SFX_KEY) !== "0",
        sfxVolume: Number(localStorage.getItem(UI_SFX_VOL_KEY) || 60),
        tutorialStep: 0,
        tutorialDone: false,
        tutorialClicks: 0,
        tutorialSkillUsed: false,
        tutorialRunesOpened: false,
        tutorialRuneBought: false,
        selectedInventoryItemId: null,
        selectedRuneId: null,
        selectedRuneOfferId: null,
      },
    };
  }

  let state = getDefaultState();
  let dpsInterval = null;
  let autosaveInterval = null;
  let weakPointTimeout = null;
  let autoCarry = 0;
  let devMode = false;
  let testMode = false;
  let clickCheckEnabled = false;
  let setActiveTab = null;
  let audioContext = null;
  let audioUnlocked = false;
  let errorLog = [];
  const dirty = {
    inventory: true,
    runes: true,
    quests: true,
    achievements: true,
    collections: true,
    i18n: true,
  };

  function getByPath(obj, key) {
    if (!obj || typeof key !== "string") {
      return undefined;
    }
    return key.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), obj);
  }

  function t(key, params = {}) {
    if (typeof key !== "string") {
      console.warn("t() invalid key", key);
      return "<?>";
    }
    const lang = state.ui.lang || "en";
    const fallback = getByPath(I18N.en, key) ?? key;
    const raw = getByPath(I18N[lang] || I18N.en, key) ?? fallback;
    if (typeof raw !== "string") {
      return fallback;
    }
    return raw.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? params[k] : `{${k}}`));
  }

  function normalizeTitleKey(value) {
    if (!value || typeof value !== "string" || value === "None") {
      return "";
    }
    if (value.startsWith("title.")) {
      return value;
    }
    return TITLE_MAP[value] || value;
  }

  function getTitleLabel(value) {
    if (!value || typeof value !== "string") {
      return t("ui.none");
    }
    if (value.startsWith("title.")) {
      return t(value);
    }
    return value;
  }

  function applyI18n() {
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    document.documentElement.lang = state.ui.lang === "ko" ? "ko" : "en";
    el.skillSelect.querySelector("[data-skill='power']").textContent = t("ui.skillPower");
    el.skillSelect.querySelector("[data-skill='cry']").textContent = t("ui.skillCry");
    el.runeRefresh.textContent = t("ui.refresh");
    el.reroll.textContent = t("ui.reroll");
    el.tutorialNext.textContent = t("tutorial.next");
    el.tutorialSkip.textContent = t("tutorial.skip");
    updateSettingsButtons();
    dirty.i18n = false;
  }

  function unlockAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    audioUnlocked = true;
  }

  function playSfx(type) {
    if (!state.ui.sfxEnabled || !audioUnlocked) {
      return;
    }
    if (!audioContext) {
      return;
    }
    const volume = clamp(Number(state.ui.sfxVolume) || 0, 0, 100) / 100;
    if (volume <= 0) {
      return;
    }

    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const base = 0.08 * volume;
    let freq = 440;
    let duration = 0.08;
    let typeWave = "square";

    if (type === "crit") {
      freq = 700;
      duration = 0.12;
    } else if (type === "weak") {
      freq = 520;
      duration = 0.1;
    } else if (type === "confirm") {
      freq = 360;
      duration = 0.07;
      typeWave = "triangle";
    } else if (type === "boss") {
      freq = 180;
      duration = 0.18;
      typeWave = "sawtooth";
    } else if (type === "victory") {
      freq = 520;
      duration = 0.25;
      typeWave = "triangle";
    }

    osc.type = typeWave;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(base, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain).connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

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
    if (!Number.isFinite(value)) {
      return "0";
    }
    const num = Math.max(0, Math.floor(value));
    if (state.ui.numFormat === "abbr") {
      const units = [
        { v: 1e12, s: "T" },
        { v: 1e9, s: "B" },
        { v: 1e6, s: "M" },
        { v: 1e3, s: "K" },
      ];
      for (const unit of units) {
        if (num >= unit.v) {
          const raw = num / unit.v;
          const rounded = raw % 1 === 0 ? raw.toFixed(0) : raw.toFixed(1);
          return `${rounded}${unit.s}`;
        }
      }
    }
    return num.toLocaleString("en-US");
  }

  function formatTimer(value) {
    return `${Math.max(0, Math.ceil(value))}s`;
  }

  function formatLogTimestamp(date) {
    const pad = (value) => String(value).padStart(2, "0");
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  function getHonorMultiplier() {
    return 1 + state.meta.totalHonor * 0.02;
  }

  function getInventoryMaxSlots() {
    const max = Number(state.meta.inventoryMaxSlots) || BASE_INVENTORY_SLOTS;
    return Math.max(BASE_INVENTORY_SLOTS, Math.floor(max));
  }

  function getInventoryExpandCost() {
    const current = getInventoryMaxSlots();
    if (current <= BASE_INVENTORY_SLOTS) {
      return Math.floor(200 * 1);
    }
    return Math.floor(200 * Math.pow(1.35, current - BASE_INVENTORY_SLOTS));
  }

  function getMetaBonuses() {
    const defaults = {
      goldPct: 0,
      bossDamagePct: 0,
      skillCdrPct: 0,
      clickPct: 0,
      autoPct: 0,
      refreshDiscountPct: 0,
      runeShopRarePct: 0,
      sellBonusPct: 0,
    };
    return { ...defaults, ...(state.meta.metaBonuses || {}) };
  }

  function getTotalSkillCdrPct() {
    const rune = getRuneBonuses();
    const meta = getMetaBonuses();
    return clamp(rune.cooldownPct + meta.skillCdrPct, 0, 30);
  }

  function getRuneRefreshCost() {
    const meta = getMetaBonuses();
    const discount = clamp(meta.refreshDiscountPct || 0, 0, 50);
    return Math.max(0, Math.floor(RUNE_REFRESH_COST * (1 - discount / 100)));
  }

  function getSellBonusPct() {
    const meta = getMetaBonuses();
    return clamp(meta.sellBonusPct || 0, 0, 100);
  }

  function getRuneShopRarity() {
    const meta = getMetaBonuses();
    const bonus = clamp(meta.runeShopRarePct || 0, 0, 20);
    const epicChance = 5;
    const rareChance = 25 + bonus;
    const commonChance = Math.max(0, 70 - bonus);
    const roll = randInt(1, 100);
    if (roll <= epicChance) {
      return "Epic";
    }
    if (roll <= epicChance + rareChance) {
      return "Rare";
    }
    if (roll <= epicChance + rareChance + commonChance) {
      return "Common";
    }
    return "Common";
  }

  function rollBossPattern() {
    return BOSS_PATTERNS[randInt(0, BOSS_PATTERNS.length - 1)];
  }

  function getChapterIndex(zone) {
    const index = Math.floor((zone - 1) / 10) + 1;
    return Math.min(6, Math.max(1, index));
  }

  function initBossPattern() {
    const id = rollBossPattern();
    const now = Date.now();
    if (id === "guard") {
      state.run.currentBossPattern = {
        id,
        nextGuardAt: now + 6000,
        guardUntil: 0,
      };
    } else if (id === "enrage") {
      state.run.currentBossPattern = { id, enraged: false };
    } else {
      state.run.currentBossPattern = { id };
    }
  }

  function normalizeBossPattern(pattern) {
    if (!pattern || typeof pattern !== "object") {
      return null;
    }
    const now = Date.now();
    if (pattern.id === "guard") {
      return {
        id: "guard",
        nextGuardAt: Number(pattern.nextGuardAt) || now + 6000,
        guardUntil: Number(pattern.guardUntil) || 0,
      };
    }
    if (pattern.id === "enrage") {
      return { id: "enrage", enraged: !!pattern.enraged };
    }
    if (pattern.id === "evasion") {
      return { id: "evasion" };
    }
    return null;
  }

  function updateBossPatternState() {
    const pattern = state.run.currentBossPattern;
    if (!pattern || (!state.run.isBoss && !state.run.isChapterBoss)) {
      return null;
    }
    if (pattern.id === "guard") {
      const now = Date.now();
      if (!pattern.guardUntil && now >= pattern.nextGuardAt) {
        pattern.guardUntil = now + 2500;
        pattern.nextGuardAt = now + 6000;
      }
      if (pattern.guardUntil && now >= pattern.guardUntil) {
        pattern.guardUntil = 0;
      }
    } else if (pattern.id === "enrage" && !pattern.enraged) {
      if (state.run.monsterMaxHp > 0 && state.run.monsterHp / state.run.monsterMaxHp <= 0.3) {
        pattern.enraged = true;
        flashMonster("crit");
      }
    }
    return pattern;
  }

  function updateBossPatternUi() {
    const pattern = updateBossPatternState();
    if (!el.bossPattern) {
      return;
    }
    if (!pattern || (!state.run.isBoss && !state.run.isChapterBoss)) {
      el.bossPattern.textContent = "-";
      el.bossPattern.dataset.tooltip = "";
      return;
    }
    if (pattern.id === "guard") {
      const now = Date.now();
      const remaining = pattern.guardUntil ? Math.max(0, pattern.guardUntil - now) : Math.max(0, pattern.nextGuardAt - now);
      const label = pattern.guardUntil ? t("ui.guard") : t("ui.guard");
      el.bossPattern.textContent = `${label} ${formatTimer(remaining / 1000)}`;
      el.bossPattern.dataset.tooltip = t("boss.guardDesc");
    } else if (pattern.id === "evasion") {
      el.bossPattern.textContent = t("ui.evasion");
      el.bossPattern.dataset.tooltip = t("boss.evasionDesc");
    } else {
      el.bossPattern.textContent = t("ui.enrage");
      el.bossPattern.dataset.tooltip = t("boss.enrageDesc");
    }
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

  function getRegionEnemyKey(region) {
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

    return {
      hp,
      gold,
      typeLabel: t(type.labelKey),
      dodge: type.dodge,
    };
  }

  function spawnMonster(isBoss, typeId = null) {
    const region = getRegionForZone(state.run.zone);
    const chapter = isBoss && isChapterZone(state.run.zone);

    state.run.isBoss = isBoss;
    state.run.isChapterBoss = chapter;
    state.run.monsterTypeId = typeId || rollMonsterType();
    state.run.monsterNameKey = chapter ? "ui.chapterBoss" : getRegionEnemyKey(region);

    const stats = getMonsterStats(state.run.zone, state.run.monsterTypeId, isBoss, chapter);
    state.run.monsterMaxHp = stats.hp;
    state.run.monsterHp = stats.hp;

    el.monsterName.textContent = chapter ? t("ui.chapterBoss") : t(state.run.monsterNameKey);
    el.monsterType.textContent = stats.typeLabel;
    el.bossIndicator.classList.toggle("active", isBoss || chapter);
    el.bossIndicator.textContent = chapter ? t("ui.chapterBoss") : t("ui.boss");
    updateRegionUi();
    updateHpUi();
    resetWeakPoint();
    if (isBoss) {
      initBossPattern();
      showBanner(chapter ? t("ui.chapterBoss") : t("ui.bossAlert"));
      playSfx("boss");
    } else {
      state.run.currentBossPattern = null;
    }
  }

  function updateRegionUi() {
    const region = getRegionForZone(state.run.zone);
    el.regionName.textContent = t(region.nameKey);
    el.regionSub.textContent = t(region.subtitleKey);
    const nextChapter = Math.ceil(state.run.zone / 10) * 10;
    el.chapterNext.textContent = t("ui.nextChapter", { zone: formatNumber(nextChapter) });
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
      addLog(t("log.regionReached", { name: t(region.nameKey) }));
    }
  }

  function updateHpUi() {
    el.hpText.textContent = `${formatNumber(state.run.monsterHp)} / ${formatNumber(
      state.run.monsterMaxHp
    )}`;
    const pct = Math.max(0, state.run.monsterHp / state.run.monsterMaxHp);
    el.hpFill.style.width = `${Math.floor(pct * 100)}%`;
  }

  function addFloatingText(label, style) {
    if (state.ui.reducedFx && style === "") {
      return;
    }
    const text = document.createElement("div");
    text.className = `floating-text${style ? ` ${style}` : ""}`;
    text.textContent = label;
    const x = Math.random() * 120 + 20;
    const y = Math.random() * 60 + 40;
    text.style.left = `${x}px`;
    text.style.top = `${y}px`;
    el.floatingLayer.appendChild(text);
    text.addEventListener("animationend", () => text.remove());
  }

  function hitEffects() {
    if (state.ui.reducedFx) {
      return;
    }
    el.monster.classList.add("shake");
    el.monster.classList.add("hit");
    setTimeout(() => {
      el.monster.classList.remove("shake");
      el.monster.classList.remove("hit");
    }, 180);
  }

  function flashMonster(kind) {
    if (state.ui.reducedFx) {
      return;
    }
    const cls = kind === "crit" ? "flash-crit" : "flash";
    el.monsterPanel.classList.add(cls);
    setTimeout(() => {
      el.monsterPanel.classList.remove(cls);
    }, 180);
  }

  function showBanner(text) {
    el.banner.textContent = text;
    el.banner.classList.add("active");
    setTimeout(() => {
      el.banner.classList.remove("active");
    }, 900);
  }

  function spawnWeakParticles() {
    if (state.ui.reducedFx) {
      return;
    }
    const rect = el.monsterArea.getBoundingClientRect();
    const count = 8;
    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement("div");
      particle.className = "particle";
      const angle = (Math.PI * 2 * i) / count;
      const dx = Math.cos(angle) * 28;
      const dy = Math.sin(angle) * 28;
      particle.style.setProperty("--dx", `${dx}px`);
      particle.style.setProperty("--dy", `${dy}px`);
      particle.style.left = `${rect.width / 2 + dx * 0.2}px`;
      particle.style.top = `${rect.height / 2 + dy * 0.2}px`;
      el.fxLayer.appendChild(particle);
      particle.addEventListener("animationend", () => particle.remove());
    }
  }

  function getEquippedWeapon() {
    if (!state.run.equippedWeaponId) {
      return null;
    }
    return state.run.inventory.find((item) => item.id === state.run.equippedWeaponId) || null;
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
    const weapon = getEquippedWeapon();
    const relic = getEquippedRelic();
    const bonuses = { click: 0, auto: 0, crit: 0, gold: 0, critMult: 0 };

    if (weapon) {
      if (weapon.statType === "click") {
        bonuses.click += weapon.statValue;
      } else if (weapon.statType === "crit") {
        bonuses.crit += weapon.statValue;
      } else if (weapon.statType === "critMult") {
        bonuses.critMult += weapon.statValue;
      }
    }

    if (relic) {
      if (relic.statType === "auto") {
        bonuses.auto += relic.statValue;
      } else if (relic.statType === "gold") {
        bonuses.gold += relic.statValue;
      } else if (relic.statType === "crit") {
        bonuses.crit += relic.statValue;
      }
    }

    if (weapon?.affix) {
      applyAffixBonus(weapon.affix, bonuses);
    }
    if (relic?.affix) {
      applyAffixBonus(relic.affix, bonuses);
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

  function getComboBonusPercent() {
    const now = Date.now();
    if (state.run.comboCount > 0 && now - state.run.comboLastAt > COMBO_WINDOW_MS) {
      state.run.comboCount = 0;
    }
    const bonus = Math.min(30, Math.floor(state.run.comboCount / 10) * 2);
    return bonus;
  }

  function getCollectionBonusPercent() {
    const completed = REGIONS.filter((region) => state.meta.collections[region.id]).length;
    return Math.min(5, completed);
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

  function getEffectiveCritMultiplier() {
    const bonus = getEquipmentBonuses();
    return clamp(state.run.critMultiplierBase + bonus.critMult, 1.5, 3.0);
  }

  function isSkillActive(skillId) {
    return Date.now() < state.run.skills[skillId].activeUntil;
  }

  function getEffectiveClickDamage(includeSkill = true, includeEvent = true) {
    const equip = getEquipmentBonuses();
    const rune = getRuneBonuses();
    const meta = getMetaBonuses();
    const event = includeEvent ? getEventState() : null;
    const comboBonus = getComboBonusPercent();
    const base = Math.max(1, state.run.clickDamageBase + equip.click);
    const clickPct =
      1 + rune.clickPct / 100 + meta.clickPct / 100 + comboBonus / 100 + (event && event.id === "frenzy" ? 1 : 0);
    const skillMult = includeSkill && state.run.skills.selected === "power" && isSkillActive("power") ? 3 : 1;
    return Math.floor(base * clickPct * getHonorMultiplier() * skillMult);
  }

  function getEffectiveAutoDps(includeSkill = true, includeEvent = true) {
    const equip = getEquipmentBonuses();
    const rune = getRuneBonuses();
    const meta = getMetaBonuses();
    const event = includeEvent ? getEventState() : null;
    const base = Math.max(0, state.run.autoDpsBase + equip.auto);
    const autoPct = 1 + rune.autoPct / 100 + meta.autoPct / 100 + (event && event.id === "overclock" ? 1 : 0);
    const skillMult = includeSkill && state.run.skills.selected === "cry" && isSkillActive("cry") ? 2 : 1;
    return base * autoPct * getHonorMultiplier() * skillMult;
  }

  function getGoldBonusPercent(includeEvent = true) {
    const equip = getEquipmentBonuses();
    const rune = getRuneBonuses();
    const meta = getMetaBonuses();
    const event = includeEvent ? getEventState() : null;
    const eventGold = event && event.id === "gold" ? 100 : 0;
    const skillGold = state.run.skills.selected === "cry" && isSkillActive("cry") ? 20 : 0;
    return equip.gold + rune.goldPct + meta.goldPct + getCollectionBonusPercent() + eventGold + skillGold;
  }

  function getBossDamageMultiplier() {
    const rune = getRuneBonuses();
    const meta = getMetaBonuses();
    const enrageBonus =
      state.run.currentBossPattern && state.run.currentBossPattern.id === "enrage" && state.run.currentBossPattern.enraged
        ? 0.15
        : 0;
    if (state.run.isBoss || state.run.isChapterBoss) {
      return 1 + rune.bossPct / 100 + meta.bossDamagePct / 100 + enrageBonus;
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
    const stamp = formatLogTimestamp(new Date());
    state.log.unshift(`${stamp} ${message}`);
    state.log = state.log.slice(0, LOG_MAX);
    updateLogUi();
  }

  function updateLogUi() {
    el.logList.innerHTML = "";
    const frag = document.createDocumentFragment();
    state.log.forEach((line) => {
      const item = document.createElement("li");
      item.textContent = line;
      frag.appendChild(item);
    });
    el.logList.appendChild(frag);
  }

  function showTooltip(text, x, y) {
    if (!text) {
      el.tooltip.classList.remove("active");
      return;
    }
    el.tooltip.textContent = text;
    const pad = 12;
    const width = el.tooltip.offsetWidth || 160;
    const height = el.tooltip.offsetHeight || 60;
    const left = Math.min(window.innerWidth - width - pad, x + pad);
    const top = Math.min(window.innerHeight - height - pad, y + pad);
    el.tooltip.style.left = `${Math.max(pad, left)}px`;
    el.tooltip.style.top = `${Math.max(pad, top)}px`;
    el.tooltip.classList.add("active");
  }

  function hideTooltip() {
    el.tooltip.classList.remove("active");
  }

  function handleTooltipMove(event) {
    const target = event.target.closest("[data-tooltip]");
    if (!target || !target.dataset.tooltip) {
      hideTooltip();
      return;
    }
    showTooltip(target.dataset.tooltip, event.clientX, event.clientY);
  }

  function updateEventUi() {
    const event = getEventState();
    if (!event) {
      el.eventBanner.classList.remove("active");
      return;
    }
    const remaining = Math.max(0, Math.ceil((event.endAt - Date.now()) / 1000));
    el.eventBanner.classList.add("active");
    el.eventName.textContent = t(event.nameKey);
    el.eventTimer.textContent = formatTimer(remaining);
  }

  function updateComboUi() {
    const bonus = getComboBonusPercent();
    el.comboDisplay.textContent = t("ui.combo", { count: formatNumber(state.run.comboCount), bonus });
    el.comboDisplay.classList.toggle("active", bonus > 0 && !state.ui.reducedFx);
    el.monsterArea.classList.toggle("combo-glow", bonus > 0 && !state.ui.reducedFx);
  }

  function updateCollectionsUi() {
    const completed = REGIONS.filter((region) => state.meta.collections[region.id]).length;
    el.collectionSummary.textContent = t("ui.setsCompleted", { count: completed });
    el.collectionBonus.textContent = t("ui.collectionBonus", { bonus: getCollectionBonusPercent() });
    el.collectionList.innerHTML = "";
    REGIONS.forEach((region) => {
      const card = document.createElement("div");
      card.className = "collection-card";
      const name = document.createElement("div");
      name.textContent = t(region.setKey);
      const status = document.createElement("div");
      status.className = "stat";
      status.textContent = state.meta.collections[region.id] ? t("collection.completed") : t("collection.missing");
      card.appendChild(name);
      card.appendChild(status);
      el.collectionList.appendChild(card);
    });
    dirty.collections = false;
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
        addLog(t("log.questComplete", { title: t(quest.titleKey) }));
        dirty.quests = true;
      }
    });

    updateWeeklyQuestProgress(eventType, amount);
    updateChainProgress(eventType, amount);

    if (updated) {
      dirty.quests = true;
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
      nameKey: event.nameKey,
      endAt: Date.now() + event.duration * 1000,
      targetType: state.run.monsterTypeId,
      critPct: event.critPct || 0,
      goldPct: event.goldPct || 0,
      clickPct: event.clickPct || 0,
      autoPct: event.autoPct || 0,
      typePct: event.typePct || 0,
    };
    addLog(t("log.eventStart", { name: t(event.nameKey) }));
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

    state.session.goldEarned += goldGain;
    state.session.kills += 1;

    if (state.run.isBoss || state.run.isChapterBoss) {
      state.meta.lifetimeBossKills += 1;
      state.session.bossKills += 1;
      updateQuests("boss_kill", 1);
    }

    if (state.run.isChapterBoss) {
      state.meta.lifetimeChapterBossKills += 1;
      state.session.chapterBossKills += 1;
      addLog(t("log.chapterDefeat"));
      showBanner(t("ui.victory"));
      playSfx("victory");
      const chapterZone = state.run.zone;
      if (CHAPTER_ZONES.includes(chapterZone) && !state.meta.chapterClears[chapterZone]) {
        openChapterRewardModal(chapterZone);
      }
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

  function openChapterRewardModal(chapterZone, optionsOverride = null) {
    if (!el.chapterModal || !el.chapterOptions) {
      return;
    }
    const pool = CHAPTER_REWARDS[chapterZone] || CHAPTER_REWARDS[10];
    const options = optionsOverride || pickChapterRewards(pool);
    state.run.rewardLock = true;
    state.run.pendingChapterReward = { chapterZone, options };
    el.chapterOptions.innerHTML = "";
    el.chapterRewardSub.textContent = t("ui.chapterRewardSub");
    options.forEach((option, index) => {
      const card = document.createElement("div");
      card.className = "chapter-option";
      card.setAttribute("role", "button");
      card.dataset.action = "select-chapter-reward";
      card.dataset.rewardIndex = String(index);
      const title = document.createElement("div");
      title.className = "chapter-option-title";
      title.textContent = t(option.titleKey);
      const desc = document.createElement("div");
      desc.className = "chapter-option-desc";
      desc.textContent = t(option.descKey);
      card.appendChild(title);
      card.appendChild(desc);
      el.chapterOptions.appendChild(card);
    });
    el.chapterModal.classList.add("active");
  }

  function pickChapterRewards(pool) {
    if (!Array.isArray(pool) || pool.length <= 3) {
      return pool || [];
    }
    const available = [...pool];
    const selected = [];
    while (selected.length < 3 && available.length > 0) {
      const idx = randInt(0, available.length - 1);
      selected.push(available.splice(idx, 1)[0]);
    }
    return selected;
  }

  function applyChapterReward(index) {
    const pending = state.run.pendingChapterReward;
    if (!pending) {
      return;
    }
    const option = pending.options[index];
    if (!option) {
      return;
    }
    const meta = getMetaBonuses();
    Object.keys(option.bonus).forEach((key) => {
      meta[key] = (meta[key] || 0) + option.bonus[key];
    });
    meta.skillCdrPct = clamp(meta.skillCdrPct, 0, 30);
    meta.refreshDiscountPct = clamp(meta.refreshDiscountPct, 0, 50);
    meta.runeShopRarePct = clamp(meta.runeShopRarePct, 0, 20);
    meta.sellBonusPct = clamp(meta.sellBonusPct, 0, 100);
    state.meta.metaBonuses = meta;
    state.meta.chapterClears[pending.chapterZone] = true;
    state.run.rewardLock = false;
    state.run.pendingChapterReward = null;
    if (el.chapterModal) {
      el.chapterModal.classList.remove("active");
    }
    updateUi();
  }

  function dealDamage(amount, style) {
    if (state.run.monsterHp <= 0) {
      return;
    }

    state.run.monsterHp = Math.max(0, state.run.monsterHp - amount);
    addFloatingText(`-${formatNumber(amount)}`, style);
    updateHpUi();

    if (state.run.monsterHp <= 0) {
      grantRewards();
    }

    updateUi();
  }

  function registerCombo() {
    const now = Date.now();
    if (now - state.run.comboLastAt <= COMBO_WINDOW_MS) {
      state.run.comboCount += 1;
    } else {
      state.run.comboCount = 1;
    }
    state.run.comboLastAt = now;
  }

  function handleClick(isWeak = false) {
    unlockAudio();
    if (state.run.rewardLock) {
      return;
    }
    if (state.run.monsterHp <= 0) {
      return;
    }

    const bossPattern = updateBossPatternState();
    const monsterType = getMonsterType(state.run.monsterTypeId);
    if (!isWeak && monsterType.dodge > 0 && chance(monsterType.dodge)) {
      addFloatingText(t("ui.miss"), "miss");
      hitEffects();
      addLog(t("log.runnerDodge"));
      return;
    }
    if ((state.run.isBoss || state.run.isChapterBoss) && bossPattern && bossPattern.id === "evasion") {
      if (chance(0.2)) {
        addFloatingText(t("ui.miss"), "miss");
        hitEffects();
        return;
      }
    }

    registerCombo();
    state.ui.tutorialClicks += 1;

    const critChance = getEffectiveCritChance();
    const isCrit = Math.random() < critChance;
    let damage = getEffectiveClickDamage(true);
    damage = Math.floor(damage * getBossDamageMultiplier() * getTypeDamageMultiplier());
    damage = isCrit ? Math.floor(damage * getEffectiveCritMultiplier()) : damage;
    if ((state.run.isBoss || state.run.isChapterBoss) && bossPattern && bossPattern.id === "guard") {
      if (bossPattern.guardUntil && Date.now() < bossPattern.guardUntil) {
        damage = Math.floor(damage * 0.5);
      }
    }

    dealDamage(damage, isCrit ? "crit" : "");
    hitEffects();
    if (isCrit) {
      playSfx("crit");
      flashMonster("crit");
    } else {
      playSfx("click");
    }

    state.meta.lifetimeClickDamage += damage;
    updateQuests("click_damage", damage);

    if (isCrit) {
      state.meta.lifetimeCrits += 1;
      updateQuests("crit", 1);
    }

    if (isWeak) {
      const weakBase = getEffectiveClickDamage(true);
      const weakMultiplier = state.run.isChapterBoss ? 1.25 : 2.5;
      let weakDamage = Math.floor(weakBase * weakMultiplier);
      if ((state.run.isBoss || state.run.isChapterBoss) && bossPattern && bossPattern.id === "guard") {
        if (bossPattern.guardUntil && Date.now() < bossPattern.guardUntil) {
          weakDamage = Math.floor(weakDamage * 0.5);
        }
      }
      dealDamage(weakDamage, "weak");

      const stats = getMonsterStats(
        state.run.zone,
        state.run.monsterTypeId,
        state.run.isBoss,
        state.run.isChapterBoss
      );
      const bonusGold = Math.floor(stats.gold * 0.5);
      state.run.gold += bonusGold;
      state.run.goldEarnedThisRun += bonusGold;
      state.meta.lifetimeGold += bonusGold;
      state.session.goldEarned += bonusGold;
      addFloatingText("WEAK!", "weak");
      addFloatingText(`+${formatNumber(bonusGold)} ${t("ui.gold")}`, "weak");
      spawnWeakParticles();
      flashMonster("weak");
      playSfx("weak");
      addLog(t("log.weakHit"));
    }

    updateTutorial();
  }

  function handleAutoDps() {
    if (state.run.rewardLock) {
      return;
    }
    const effectiveAuto = getEffectiveAutoDps(true);
    if (effectiveAuto <= 0 || state.run.monsterHp <= 0) {
      return;
    }

    const tickDamage = effectiveAuto / (1000 / DPS_TICK_MS);
    autoCarry += tickDamage;
    const intDamage = Math.floor(autoCarry);
    if (intDamage >= 1) {
      const damage = Math.floor(intDamage * getBossDamageMultiplier() * getTypeDamageMultiplier());
      dealDamage(damage, "");
      autoCarry -= intDamage;
    }
  }

  function getSkillCooldown(skillId) {
    const base = skillId === "power" ? SKILL_COOLDOWN_MS : CRY_COOLDOWN_MS;
    const pct = getTotalSkillCdrPct();
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
      el.skillTitle.textContent = t("ui.skillPower");
      el.skillDesc.textContent = t("skill.powerDesc");
    } else {
      el.skillTitle.textContent = t("ui.skillCry");
      el.skillDesc.textContent = t("skill.cryDesc");
    }

    if (activeRemaining > 0) {
      el.skillTimer.textContent = t("ui.skillActive", { time: formatTimer(activeRemaining / 1000) });
      el.skillActivate.classList.add("active");
    } else if (cooldownRemaining > 0) {
      el.skillTimer.textContent = t("ui.skillCooldown", { time: formatTimer(cooldownRemaining / 1000) });
      el.skillActivate.classList.remove("active");
    } else {
      el.skillTimer.textContent = t("ui.skillReady");
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

  function getItemName(item) {
    const prefix = t(item.nameParts.prefixKey);
    const base = t(item.nameParts.baseKey);
    const baseName = `${prefix} ${base}`.trim();
    if (!item.affix) {
      return baseName;
    }
    const affixName = t(item.affix.nameKey);
    return item.affix.kind === "suffix" ? `${baseName} ${affixName}`.trim() : `${affixName} ${baseName}`.trim();
  }

  function getRuneName(rune) {
    const rarity = t(`rarity.${rune.rarity.toLowerCase()}`);
    return `${rarity} ${t(rune.effectLabelKey)}`.trim();
  }

  function getRuneGlyph(rune) {
    const effectId = rune.effect || rune.effectId;
    if (!effectId) {
      return "?";
    }
    const glyph = t(`rune.glyph.${effectId}`);
    return glyph !== `rune.glyph.${effectId}` ? glyph : effectId.slice(0, 1).toUpperCase();
  }

  function getItemGlyph(item) {
    return item.slot === "weapon" ? t("ui.glyphWeapon") : t("ui.glyphRelic");
  }

  function buildItemTooltip(item) {
    const rarity = t(`rarity.${item.rarity.toLowerCase()}`);
    const region = REGIONS.find((entry) => entry.id === item.setId);
    const setLabel = region ? t(region.setKey) : t("ui.none");
    const lines = [
      getItemName(item),
      `${t("ui.rarity")}: ${rarity}`,
      `${t("ui.type")}: ${t(`ui.${item.slot}`)}`,
      `${t("ui.effect")}: ${describeItemStat(item)}`,
      `${t("ui.set")}: ${setLabel}`,
    ];
    if (item.affix) {
      lines.push(`${t("ui.affix")}: ${describeAffixStat(item.affix)}`);
    }
    return lines.join("\n");
  }

  function buildRuneTooltip(rune) {
    const rarity = t(`rarity.${rune.rarity.toLowerCase()}`);
    return [
      getRuneName(rune),
      `${t("ui.rarity")}: ${rarity}`,
      `${t("ui.effect")}: ${describeRuneStat(rune)}`,
    ].join("\n");
  }

  function buildRuneOfferTooltip(rune) {
    const base = buildRuneTooltip(rune);
    const costLine = `${t("ui.gold")}: ${formatNumber(rune.cost)}`;
    return `${base}\n${costLine}`;
  }

  function updateInventoryUi() {
    const maxSlots = getInventoryMaxSlots();
    const expandCost = getInventoryExpandCost();
    if (el.inventorySlots) {
      el.inventorySlots.textContent = t("ui.inventorySlots", {
        count: formatNumber(state.run.inventory.length),
        max: formatNumber(maxSlots),
      });
    }
    if (el.inventoryExpand) {
      el.inventoryExpand.textContent = t("ui.expandInventory", { cost: formatNumber(expandCost) });
      el.inventoryExpand.disabled = state.run.gold < expandCost;
    }

    const weapon = getEquippedWeapon();
    if (weapon) {
      el.equippedWeaponName.textContent = `${getItemName(weapon)} (${t(`rarity.${weapon.rarity.toLowerCase()}`)})`;
      el.equippedWeaponName.className = `equipped-name rarity-${weapon.rarity.toLowerCase()}`;
      el.equippedWeaponState.textContent = t("ui.equipped");
      el.equippedWeaponStat.textContent = describeItemStat(weapon);
      el.equippedWeaponTile.textContent = getItemGlyph(weapon);
      el.equippedWeaponTile.className = `equip-tile equipped rarity-${weapon.rarity.toLowerCase()}`;
      el.equippedWeaponTile.dataset.tooltip = buildItemTooltip(weapon);
      el.unequipWeapon.disabled = false;
    } else {
      el.equippedWeaponName.textContent = t("ui.none");
      el.equippedWeaponName.className = "equipped-name";
      el.equippedWeaponState.textContent = t("ui.empty");
      el.equippedWeaponStat.textContent = t("ui.noBonus");
      el.equippedWeaponTile.textContent = "";
      el.equippedWeaponTile.className = "equip-tile";
      el.equippedWeaponTile.dataset.tooltip = "";
      el.unequipWeapon.disabled = true;
    }

    const relic = getEquippedRelic();
    if (relic) {
      el.equippedRelicName.textContent = `${getItemName(relic)} (${t(`rarity.${relic.rarity.toLowerCase()}`)})`;
      el.equippedRelicName.className = `equipped-name rarity-${relic.rarity.toLowerCase()}`;
      el.equippedRelicState.textContent = t("ui.equipped");
      el.equippedRelicStat.textContent = describeItemStat(relic);
      el.equippedRelicTile.textContent = getItemGlyph(relic);
      el.equippedRelicTile.className = `equip-tile equipped rarity-${relic.rarity.toLowerCase()}`;
      el.equippedRelicTile.dataset.tooltip = buildItemTooltip(relic);
      el.unequipRelic.disabled = false;
    } else {
      el.equippedRelicName.textContent = t("ui.none");
      el.equippedRelicName.className = "equipped-name";
      el.equippedRelicState.textContent = t("ui.empty");
      el.equippedRelicStat.textContent = t("ui.noBonus");
      el.equippedRelicTile.textContent = "";
      el.equippedRelicTile.className = "equip-tile";
      el.equippedRelicTile.dataset.tooltip = "";
      el.unequipRelic.disabled = true;
    }

    const selectedItem = state.run.inventory.find((entry) => entry.id === state.ui.selectedInventoryItemId);
    if (!selectedItem) {
      state.ui.selectedInventoryItemId = null;
    }
    if (state.ui.selectedInventoryItemId) {
      const selected = state.run.inventory.find((entry) => entry.id === state.ui.selectedInventoryItemId);
      el.inventorySelected.textContent = selected ? getItemName(selected) : t("ui.none");
      const isEquipped =
        (selected?.slot === "weapon" && selected.id === state.run.equippedWeaponId) ||
        (selected?.slot === "relic" && selected.id === state.run.equippedRelicId);
      el.inventoryEquip.disabled = !selected || isEquipped;
      el.inventorySell.disabled = !selected || isEquipped;
    } else {
      el.inventorySelected.textContent = t("ui.none");
      el.inventoryEquip.disabled = true;
      el.inventorySell.disabled = true;
    }

    el.inventoryList.innerHTML = "";
    state.run.inventory.forEach((item) => {
      const isEquipped =
        (item.slot === "weapon" && item.id === state.run.equippedWeaponId) ||
        (item.slot === "relic" && item.id === state.run.equippedRelicId);
      const isSelected = item.id === state.ui.selectedInventoryItemId;
      const tile = document.createElement("div");
      tile.className = `tile rarity-${item.rarity.toLowerCase()}${isEquipped ? " equipped" : ""}${
        isSelected ? " selected" : ""
      }`;
      tile.setAttribute("role", "button");
      tile.dataset.action = "select-item";
      tile.dataset.itemId = item.id;
      tile.dataset.test = "equip-item";
      tile.dataset.tooltip = buildItemTooltip(item);
      tile.textContent = getItemGlyph(item);
      if (isEquipped) {
        const badge = document.createElement("div");
        badge.className = "badge";
        badge.textContent = "E";
        tile.appendChild(badge);
      }
      el.inventoryList.appendChild(tile);
    });
    dirty.inventory = false;
  }

  function updateRuneUi() {
    el.runeShopList.innerHTML = "";
    state.run.runeShop.slice(0, MAX_RUNE_OFFERS).forEach((rune) => {
      const tile = document.createElement("button");
      const isSelected = state.ui.selectedRuneOfferId === rune.id;
      const disabled = state.run.gold < rune.cost || state.run.runes.length >= RUNE_MAX;
      tile.className = `rune-tile rune-offer-tile rarity-${rune.rarity.toLowerCase()}${
        isSelected ? " is-selected" : ""
      }${disabled ? " is-disabled" : ""}`;
      tile.type = "button";
      tile.dataset.action = "rune-offer-select";
      tile.dataset.offerId = rune.id;
      tile.dataset.cost = rune.cost;
      tile.setAttribute("data-offer-id", rune.id);
      tile.dataset.tooltip = buildRuneOfferTooltip(rune);

      const glyph = document.createElement("span");
      glyph.className = "rune-glyph";
      glyph.textContent = getRuneGlyph(rune);

      tile.appendChild(glyph);
      el.runeShopList.appendChild(tile);
    });

    updateRuneOfferPurchaseBar();

    el.runeInventoryList.innerHTML = "";
    const socketedId = state.run.equippedRuneId;
    const sortedRunes = [...state.run.runes].sort((a, b) => {
      if (a.id === socketedId) {
        return -1;
      }
      if (b.id === socketedId) {
        return 1;
      }
      return 0;
    });
    sortedRunes.forEach((rune) => {
      const isSocketed = rune.id === socketedId;
      const isSelected = state.ui.selectedRuneId === rune.id;
      const tile = document.createElement("div");
      tile.className = `tile rarity-${rune.rarity.toLowerCase()}${isSocketed ? " equipped" : ""}${
        isSelected ? " selected" : ""
      }`;
      tile.setAttribute("role", "button");
      tile.dataset.action = "select-rune";
      tile.dataset.runeId = rune.id;
      tile.dataset.test = "rune-socket";
      tile.dataset.tooltip = buildRuneTooltip(rune);
      tile.textContent = getRuneGlyph(rune);
      if (isSocketed) {
        const badge = document.createElement("div");
        badge.className = "badge";
        badge.textContent = "S";
        tile.appendChild(badge);
      }
      el.runeInventoryList.appendChild(tile);
    });

    const socketed = getEquippedRune();
    if (socketed) {
      el.runeStatus.textContent = t("ui.socketedStatus", { name: getRuneName(socketed) });
      el.socketedRuneName.textContent = getRuneName(socketed);
      el.socketedRuneName.className = `rune-slot-name rarity-${socketed.rarity.toLowerCase()}`;
      el.socketedRuneStat.textContent = describeRuneStat(socketed);
      el.socketedRuneTile.textContent = getRuneGlyph(socketed);
      el.socketedRuneTile.className = `equip-tile equipped rarity-${socketed.rarity.toLowerCase()}`;
      el.socketedRuneTile.dataset.tooltip = buildRuneTooltip(socketed);
      el.unequipRune.disabled = false;
    } else {
      el.runeStatus.textContent = t("ui.socketedNone");
      el.socketedRuneName.textContent = t("ui.none");
      el.socketedRuneName.className = "rune-slot-name";
      el.socketedRuneStat.textContent = t("ui.noBonus");
      el.socketedRuneTile.textContent = "";
      el.socketedRuneTile.className = "equip-tile";
      el.socketedRuneTile.dataset.tooltip = "";
      el.unequipRune.disabled = true;
    }

    const selectedRune = state.run.runes.find((entry) => entry.id === state.ui.selectedRuneId);
    if (!selectedRune) {
      state.ui.selectedRuneId = null;
    }
    if (state.ui.selectedRuneId) {
      const rune = state.run.runes.find((entry) => entry.id === state.ui.selectedRuneId);
      el.runeSelected.textContent = rune ? getRuneName(rune) : t("ui.none");
      const hasRelic = Boolean(getEquippedRelic());
      const isSocketed = rune?.id === state.run.equippedRuneId;
      el.runeSocket.disabled = !rune || !hasRelic || isSocketed;
      el.runeSell.disabled = !rune || isSocketed;
    } else {
      el.runeSelected.textContent = t("ui.none");
      el.runeSocket.disabled = true;
      el.runeSell.disabled = true;
    }

    const refreshCost = state.run.freeRuneRefreshUsed ? getRuneRefreshCost() : 0;
    el.runeRefresh.textContent =
      refreshCost === 0 ? t("ui.refreshFree") : t("ui.refreshCost", { cost: formatNumber(refreshCost) });
    el.runeRefresh.disabled = state.run.freeRuneRefreshUsed && state.run.gold < refreshCost;
    dirty.runes = false;
  }

  function updateRuneAffordability() {
    const tiles = el.runeShopList.querySelectorAll(".rune-offer-tile[data-offer-id]");
    tiles.forEach((tile) => {
      const cost = Number(tile.dataset.cost) || 0;
      const disabled = state.run.gold < cost || state.run.runes.length >= RUNE_MAX;
      tile.classList.toggle("is-disabled", disabled);
    });
    const refreshCost = state.run.freeRuneRefreshUsed ? getRuneRefreshCost() : 0;
    el.runeRefresh.disabled = state.run.freeRuneRefreshUsed && state.run.gold < refreshCost;
    updateRuneOfferPurchaseBar();
  }

  function updateRuneOfferPurchaseBar() {
    if (!el.runeOfferSelected || !el.runeOfferBuy) {
      return;
    }
    const selected = state.run.runeShop.find((rune) => rune.id === state.ui.selectedRuneOfferId);
    if (!selected) {
      state.ui.selectedRuneOfferId = null;
      el.runeOfferSelected.textContent = t("runes.shop.noSelection");
      el.runeOfferBuy.textContent = t("runes.shop.purchase");
      el.runeOfferBuy.disabled = true;
      return;
    }
    const summary = `${getRuneName(selected)} • ${describeRuneStat(selected)}`;
    const canAfford = state.run.gold >= selected.cost && state.run.runes.length < RUNE_MAX;
    el.runeOfferSelected.textContent = canAfford
      ? summary
      : `${summary} (${t("runes.shop.cannotAfford")})`;
    el.runeOfferBuy.textContent = `${t("runes.shop.purchase")} ${formatNumber(selected.cost)} ${t("ui.gold")}`;
    el.runeOfferBuy.disabled = !canAfford;
  }

  function renderQuestCard(quest) {
    const card = document.createElement("div");
    card.className = "quest";

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = t(quest.titleKey);

    const desc = document.createElement("div");
    desc.className = "quest-desc";
    desc.textContent = t(quest.descKey, { target: formatNumber(quest.target) });

    const progress = document.createElement("div");
    progress.className = "progress";
    progress.textContent = `${formatNumber(quest.progress)} / ${formatNumber(quest.target)}`;

    const bar = document.createElement("div");
    bar.className = "quest-bar";
    const fill = document.createElement("div");
    fill.className = "quest-bar-fill";
    const pct = quest.target > 0 ? Math.min(100, (quest.progress / quest.target) * 100) : 0;
    fill.style.width = `${pct}%`;
    bar.appendChild(fill);

    const reward = document.createElement("div");
    reward.className = "stat";
    let rewardLabel = t("ui.gold");
    let rewardAmount = formatNumber(quest.rewardAmount);
    if (quest.rewardType === "honor") {
      rewardLabel = t("ui.honor");
    } else if (quest.rewardType === "rune") {
      rewardLabel = t("ui.rune");
    } else if (quest.rewardType === "title") {
      rewardLabel = t("ui.title");
      rewardAmount = getTitleLabel(quest.rewardAmount);
    }
    reward.textContent = `${t("ui.reward")}: ${rewardAmount} ${rewardLabel}`;

    const footer = document.createElement("div");
    footer.className = "quest-footer";

    const button = document.createElement("button");
    button.className = "small";
    if (quest.completed) {
      button.textContent = t("ui.claim");
      button.dataset.action = "claim-quest";
      button.dataset.questId = quest.id;
      button.dataset.test = "quest-claim";
    } else {
      button.textContent = t("ui.inProgress");
      button.disabled = true;
    }

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(bar);
    card.appendChild(progress);
    footer.appendChild(reward);
    footer.appendChild(button);
    card.appendChild(footer);
    return card;
  }

  function updateQuestUi() {
    el.questList.innerHTML = "";
    state.run.quests.forEach((quest) => {
      el.questList.appendChild(renderQuestCard(quest));
    });

    el.weeklyQuest.innerHTML = "";
    if (state.run.weeklyQuest) {
      el.weeklyQuest.appendChild(renderQuestCard(state.run.weeklyQuest));
    }

    el.chainQuest.innerHTML = "";
    if (state.run.chainQuest) {
      const card = document.createElement("div");
      card.className = "quest";
      const title = document.createElement("div");
      title.className = "title";
      title.textContent = `${t(state.run.chainQuest.titleKey)} (${state.run.chainQuest.stepIndex + 1}/3)`;
      const desc = document.createElement("div");
      desc.className = "quest-desc";
      desc.textContent = t(state.run.chainQuest.descKey, { target: formatNumber(state.run.chainQuest.target) });
      const bar = document.createElement("div");
      bar.className = "quest-bar";
      const fill = document.createElement("div");
      fill.className = "quest-bar-fill";
      const pct =
        state.run.chainQuest.target > 0
          ? Math.min(100, (state.run.chainQuest.progress / state.run.chainQuest.target) * 100)
          : 0;
      fill.style.width = `${pct}%`;
      bar.appendChild(fill);
      const progress = document.createElement("div");
      progress.className = "progress";
      progress.textContent = `${formatNumber(state.run.chainQuest.progress)} / ${formatNumber(
        state.run.chainQuest.target
      )}`;
      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(bar);
      card.appendChild(progress);
      el.chainQuest.appendChild(card);
    }
    dirty.quests = false;
  }

  function updateWeeklyResetUi() {
    const now = Date.now();
    const remaining = Math.max(0, state.run.weeklyResetAt - now);
    const days = Math.ceil(remaining / (24 * 60 * 60 * 1000));
    el.weeklyReset.textContent = t("ui.weeklyReset", { days });
  }

  function updateMetaBonusUi() {
    if (!el.metaBonusList) {
      return;
    }
    const meta = getMetaBonuses();
    const lines = [
      `${t("ui.gold")}: +${formatNumber(meta.goldPct)}%`,
      `${t("ui.boss")}: +${formatNumber(meta.bossDamagePct)}%`,
      `${t("ui.skillCdr")}: -${formatNumber(meta.skillCdrPct)}%`,
      `${t("ui.clickDamage")}: +${formatNumber(meta.clickPct)}%`,
      `${t("ui.autoDps")}: +${formatNumber(meta.autoPct)}%`,
      `${t("ui.refreshDiscount")}: -${formatNumber(meta.refreshDiscountPct)}%`,
      `${t("ui.runeRareBonus")}: +${formatNumber(meta.runeShopRarePct)}%`,
      `${t("ui.sellBonus")}: +${formatNumber(meta.sellBonusPct)}%`,
    ];
    el.metaBonusList.textContent = lines.join("\n");
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
      title.textContent = t(ach.titleKey);
      const desc = document.createElement("div");
      desc.textContent = t(ach.descKey);
      const status = document.createElement("div");
      status.className = "stat";
      status.textContent = unlocked
        ? `${t("ui.unlocked")}: ${new Date(state.meta.achievements[ach.id]).toLocaleDateString()}`
        : t("ui.locked");
      const reward = document.createElement("div");
      reward.className = "stat";
      reward.textContent = `${t("ui.reward")}: ${t(ach.rewardKey)}`;

      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(status);
      card.appendChild(reward);
      el.achievementList.appendChild(card);
    });

    updateTitleSelect();
    dirty.achievements = false;
  }

  function updateTitleSelect() {
    const titles = ["", ...state.meta.titlesUnlocked];
    if (state.meta.equippedTitle && !titles.includes(state.meta.equippedTitle)) {
      titles.push(state.meta.equippedTitle);
    }
    el.titleSelect.innerHTML = "";
    titles.forEach((titleKey) => {
      const option = document.createElement("option");
      option.value = titleKey;
      option.textContent = titleKey ? getTitleLabel(titleKey) : t("ui.none");
      if (titleKey === state.meta.equippedTitle) {
        option.selected = true;
      }
      el.titleSelect.appendChild(option);
    });
  }

  function checkAchievements() {
    let unlockedAny = false;
    ACHIEVEMENTS.forEach((ach) => {
      if (state.meta.achievements[ach.id]) {
        return;
      }
      if (ach.check(state)) {
        state.meta.achievements[ach.id] = Date.now();
        if (!state.meta.titlesUnlocked.includes(ach.rewardKey)) {
          state.meta.titlesUnlocked.push(ach.rewardKey);
        }
        addLog(t("log.achievement", { title: t(ach.titleKey) }));
        unlockedAny = true;
      }
    });
    if (unlockedAny) {
      dirty.achievements = true;
    }
    return unlockedAny;
  }

  function validateState() {
    const issues = [];
    if (!Number.isFinite(state.run.gold) || state.run.gold < 0) {
      state.run.gold = Math.max(0, Number(state.run.gold) || 0);
      issues.push("gold");
    }
    if (!Number.isFinite(state.meta.totalHonor) || state.meta.totalHonor < 0) {
      state.meta.totalHonor = Math.max(0, Number(state.meta.totalHonor) || 0);
      issues.push("honor");
    }
    state.run.critChanceBase = clamp(Number(state.run.critChanceBase) || 0, 0, 0.5);
    if (!state.meta.chapterClears || typeof state.meta.chapterClears !== "object") {
      state.meta.chapterClears = {};
      issues.push("chapterClears");
    }
    if (!state.meta.metaBonuses || typeof state.meta.metaBonuses !== "object") {
      state.meta.metaBonuses = {
        goldPct: 0,
        bossDamagePct: 0,
        skillCdrPct: 0,
        clickPct: 0,
        autoPct: 0,
        refreshDiscountPct: 0,
        runeShopRarePct: 0,
        sellBonusPct: 0,
      };
      issues.push("metaBonuses");
    }
    const meta = getMetaBonuses();
    if (meta.skillCdrPct > 30) {
      state.meta.metaBonuses.skillCdrPct = 30;
      issues.push("skillCdr");
    }
    if (meta.refreshDiscountPct > 50) {
      state.meta.metaBonuses.refreshDiscountPct = 50;
      issues.push("refreshDiscount");
    }
    if (meta.runeShopRarePct > 20) {
      state.meta.metaBonuses.runeShopRarePct = 20;
      issues.push("runeShopRare");
    }
    if (meta.sellBonusPct > 100) {
      state.meta.metaBonuses.sellBonusPct = 100;
      issues.push("sellBonus");
    }
    if (!Number.isFinite(state.meta.inventoryMaxSlots) || state.meta.inventoryMaxSlots < BASE_INVENTORY_SLOTS) {
      state.meta.inventoryMaxSlots = BASE_INVENTORY_SLOTS;
      issues.push("inventoryMaxSlots");
    }
    if (!Array.isArray(state.run.runes)) {
      state.run.runes = [];
      issues.push("runes");
    }
    if (!Array.isArray(state.run.inventory)) {
      state.run.inventory = [];
      issues.push("inventory");
    }
    return issues;
  }

  function pushError(message) {
    errorLog.push(message);
    errorLog = errorLog.slice(-10);
    updateErrorUi();
  }

  function updateErrorUi() {
    if (!el.devErrors) {
      return;
    }
    el.devErrors.textContent = errorLog.length ? errorLog.join("\n") : "-";
  }

  function updateDevUi() {
    if (!devMode) {
      el.devPanel.classList.remove("active");
      return;
    }
    el.devPanel.classList.add("active");
    const issues = validateState();
    const rune = getRuneBonuses();
    const event = getEventState();
    el.devInfo.textContent = [
      `${t("ui.clickDamage")}: ${formatNumber(getEffectiveClickDamage(true))}`,
      `${t("ui.autoDps")}: ${formatNumber(getEffectiveAutoDps(true))}`,
      `${t("ui.critChance")}: ${Math.floor(getEffectiveCritChance() * 100)}%`,
      `${t("ui.critMult")}: ${getEffectiveCritMultiplier().toFixed(2)}x`,
      `${t("ui.goldBonus")}: ${formatNumber(getGoldBonusPercent())}%`,
      `${t("ui.rune")}: ${t("rune.effect.boss")} ${rune.bossPct}% | ${t("rune.effect.greed")} ${rune.goldPct}% | ${t("rune.effect.precision")} ${rune.critPct}% | ${t("rune.effect.swiftness")} ${rune.cooldownPct}% | ${t("rune.effect.fury")} ${rune.clickPct}% | ${t("rune.effect.tinker")} ${rune.autoPct}%`,
      `${t("ui.event")}: ${event ? t(event.nameKey) : t("ui.none")}`,
      `${t("ui.monsterHp")}: ${formatNumber(state.run.monsterHp)}/${formatNumber(state.run.monsterMaxHp)}`,
      `${t("ui.monsterType")}: ${t(getMonsterType(state.run.monsterTypeId).labelKey)}`,
      `${t("ui.boss")}: ${state.run.isBoss} | ${t("ui.chapterBoss")}: ${state.run.isChapterBoss}`,
      issues.length ? `validateState: ${issues.join(", ")}` : "validateState: ok",
    ].join("\n");
    updateErrorUi();
  }

  function updateTutorial() {
    if (state.ui.tutorialDone) {
      el.tutorialBox.classList.add("hidden");
      return;
    }

    const step = state.ui.tutorialStep;
    let done = false;
    if (step === 0 && state.ui.tutorialClicks >= 5) {
      state.ui.tutorialStep = 1;
    } else if (step === 1 && state.upgrades.click.level >= 1) {
      state.ui.tutorialStep = 2;
    } else if (step === 2 && state.upgrades.auto.level >= 1) {
      state.ui.tutorialStep = 3;
    } else if (step === 3 && state.ui.tutorialSkillUsed) {
      state.ui.tutorialStep = 4;
    } else if (step === 4 && state.ui.tutorialRuneBought) {
      state.ui.tutorialDone = true;
      done = true;
    }

    if (done || state.ui.tutorialDone) {
      el.tutorialBox.classList.add("hidden");
      return;
    }

    el.tutorialBox.classList.remove("hidden");
    el.tutorialTitle.textContent = t("tutorial.title");
    const steps = [
      t("tutorial.step1"),
      t("tutorial.step2"),
      t("tutorial.step3"),
      t("tutorial.step4"),
      t("tutorial.step5"),
    ];
    let text = steps[state.ui.tutorialStep] || "";
    if (state.ui.tutorialStep === 4 && state.run.gold < 100) {
      text = `${text} ${t("tutorial.moreGold")}`;
    }
    el.tutorialText.textContent = text;
  }

  function updateSettingsButtons() {
    document.querySelectorAll("[data-action='set-numfmt']").forEach((btn) => {
      const value = btn.dataset.value;
      btn.textContent = value === "full" ? t("settings.full") : t("settings.abbr");
      btn.classList.toggle("is-active", state.ui.numFormat === value);
    });
    document.querySelectorAll("[data-action='set-reducedfx']").forEach((btn) => {
      const value = btn.dataset.value;
      btn.textContent = value === "on" ? t("settings.on") : t("settings.off");
      btn.classList.toggle("is-active", (state.ui.reducedFx ? "on" : "off") === value);
    });
    document.querySelectorAll("[data-action='set-lang']").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.lang === state.ui.lang);
    });
    document.querySelectorAll("[data-action='toggle-dev']").forEach((btn) => {
      btn.textContent = devMode ? t("settings.on") : t("settings.off");
      btn.classList.toggle("is-active", devMode);
    });
    document.querySelectorAll("[data-action='toggle-compact']").forEach((btn) => {
      btn.textContent = state.ui.compact ? t("settings.on") : t("settings.off");
      btn.classList.toggle("is-active", state.ui.compact);
    });
    if (el.sfxToggle) {
      el.sfxToggle.textContent = state.ui.sfxEnabled ? t("settings.on") : t("settings.off");
      el.sfxToggle.classList.toggle("is-active", state.ui.sfxEnabled);
    }
    if (el.sfxVolume) {
      el.sfxVolume.value = clamp(Number(state.ui.sfxVolume) || 0, 0, 100);
    }
    el.clickCheck.textContent = clickCheckEnabled ? t("ui.clickCheckOn") : t("ui.clickCheckOff");
  }

  function updateUi() {
    if (dirty.i18n) {
      applyI18n();
    }
    el.gold.textContent = formatNumber(state.run.gold);
    el.honor.textContent = formatNumber(state.meta.totalHonor);
    el.dmgMult.textContent = `${getHonorMultiplier().toFixed(2)}x`;
    el.zone.textContent = formatNumber(state.run.zone);
    const chapterIndex = getChapterIndex(state.run.zone);
    document.body.dataset.chapter = String(chapterIndex);
    el.chapterBadge.textContent = formatNumber(chapterIndex);
    el.kills.textContent = formatNumber(state.run.killsTotal);
    el.titleDisplay.textContent = getTitleLabel(state.meta.equippedTitle);

    el.clickDmg.textContent = formatNumber(getEffectiveClickDamage(true));
    el.autoDps.textContent = formatNumber(getEffectiveAutoDps(true));
    el.critChance.textContent = `${Math.floor(getEffectiveCritChance() * 100)}%`;
    el.critMulti.textContent = `${getEffectiveCritMultiplier().toFixed(2)}x`;
    el.goldBonus.textContent = `${formatNumber(getGoldBonusPercent())}%`;
    el.zoneProgress.textContent = `${formatNumber(state.run.killsInZone)} / ${formatNumber(ZONE_KILLS)}`;

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

    updateComboUi();
    updateSkillUi();
    updatePrestigeUi();
    updateWeeklyResetUi();
    updateBossPatternUi();
    updateMetaBonusUi();
    updateEventUi();
    updateLogUi();
    updateDevUi();
    updateTutorial();
    updateRuneAffordability();
    const newAch = checkAchievements();
    if (dirty.inventory) {
      updateInventoryUi();
    }
    if (dirty.runes) {
      updateRuneUi();
    }
    if (dirty.quests) {
      updateQuestUi();
    }
    if (dirty.collections) {
      updateCollectionsUi();
    }
    if (dirty.achievements || newAch) {
      updateAchievementsUi();
    }
  }

  function buyUpgrade(type) {
    if (testMode) {
      return;
    }
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

    playSfx("confirm");
    updateUi();
    updateTutorial();
  }

  function getEquipmentRarity() {
    const roll = randInt(1, 100);
    if (roll > 95) {
      return "Epic";
    }
    if (roll > 70) {
      return "Rare";
    }
    return "Common";
  }

  function tryDropEquipment() {
    const dropChance = state.run.isBoss || state.run.isChapterBoss ? 0.12 : 0.03;
    if (!chance(dropChance)) {
      return;
    }

    if (state.run.inventory.length >= getInventoryMaxSlots()) {
      addLog(t("log.inventoryFull"));
      return;
    }

    const rarity = getEquipmentRarity();
    const slot = chance(0.5) ? "weapon" : "relic";
    const region = getRegionForZone(state.run.zone);
    const item = generateEquipmentItem(rarity, slot, region.id);

    state.run.inventory.push(item);
    state.session.drops[rarity] += 1;
    if (slot === "weapon" && rarity === "Rare") {
      state.meta.foundRareWeapon = true;
    }
    if (slot === "weapon" && rarity === "Epic") {
      state.meta.foundEpicWeapon = true;
    }
    if (slot === "relic" && rarity === "Rare") {
      state.meta.foundRareRelic = true;
    }
    if (slot === "relic" && rarity === "Epic") {
      state.meta.foundEpicRelic = true;
    }

    state.meta.collections[item.setId] = true;
    dirty.collections = true;
    if (Object.values(state.meta.collections).filter(Boolean).length >= 5) {
      const collector = t("title.collector");
      if (!state.meta.titlesUnlocked.includes(collector)) {
        state.meta.titlesUnlocked.push(collector);
      }
    }

    addLog(`${t("ui.found")} ${t(`rarity.${rarity.toLowerCase()}`)} ${t(`ui.${slot}`)}: ${getItemName(item)}.`);
    dirty.inventory = true;
    updateUi();
  }

  function generateEquipmentItem(rarity, slot, setId) {
    const zone = state.run.zone;
    const base = rarity === "Common" ? 1 : rarity === "Rare" ? 2 : 4;
    const scale = rarity === "Common" ? 0.5 : rarity === "Rare" ? 0.9 : 1.5;
    const flatValue = Math.floor(base + zone * scale);
    let statType = "click";
    let statValue = flatValue;

    if (slot === "weapon") {
      const roll = randInt(0, 2);
      if (roll === 1) {
        statType = "crit";
        statValue = Math.min(15, Math.floor(flatValue / 2) + 2);
      } else if (roll === 2) {
        statType = "critMult";
        statValue = clamp(0.05 + zone * 0.003, 0.05, 0.35);
        statValue = Math.round(statValue * 100) / 100;
      } else {
        statType = "click";
      }
    } else {
      const roll = randInt(0, 2);
      if (roll === 1) {
        statType = "gold";
        statValue = Math.min(25, Math.floor(flatValue / 2) + 3);
      } else if (roll === 2) {
        statType = "crit";
        statValue = Math.min(12, Math.floor(flatValue / 2) + 1);
      } else {
        statType = "auto";
      }
    }

    const item = {
      id: `item-${Date.now()}-${randInt(1000, 9999)}`,
      rarity,
      slot,
      statType,
      statValue,
      setId,
      nameParts: generateItemNameParts(slot),
    };
    item.affix = rollAffixForItem(item);
    return item;
  }

  function generateItemNameParts(slot) {
    const prefixKey = CONTENT.itemNames.prefixes[randInt(0, CONTENT.itemNames.prefixes.length - 1)];
    const baseKey =
      slot === "weapon"
        ? CONTENT.itemNames.weapons[randInt(0, CONTENT.itemNames.weapons.length - 1)]
        : CONTENT.itemNames.relics[randInt(0, CONTENT.itemNames.relics.length - 1)];
    return { prefixKey, baseKey };
  }

  function rollAffixForItem(item, force = false) {
    const pool = CONTENT.affixes?.[item.slot] || [];
    if (!pool.length) {
      return null;
    }
    if (!force && !chance(0.35)) {
      return null;
    }
    const choice = pool[randInt(0, pool.length - 1)];
    const values = choice.values || {};
    let value = values[item.rarity] ?? values.Common ?? 1;
    if (choice.statType === "critMult") {
      value = Math.round(value * 100) / 100;
    }
    return {
      kind: chance(0.5) ? "prefix" : "suffix",
      id: choice.id,
      nameKey: choice.nameKey,
      statType: choice.statType,
      value,
    };
  }

  function normalizeAffix(affix, slot, rarity) {
    if (!affix) {
      return null;
    }
    const pool = CONTENT.affixes?.[slot] || [];
    const match = pool.find((entry) => entry.id === affix.id) || pool[0];
    if (!match) {
      return null;
    }
    const values = match.values || {};
    const value = Number.isFinite(affix.value) ? affix.value : values[rarity] ?? values.Common ?? 1;
    return {
      kind: affix.kind === "suffix" ? "suffix" : "prefix",
      id: match.id,
      nameKey: match.nameKey,
      statType: match.statType,
      value,
    };
  }

  function describeItemStat(item) {
    if (item.statType === "click") {
      return `+${formatNumber(item.statValue)} ${t("ui.clickDamage")}`;
    }
    if (item.statType === "auto") {
      return `+${formatNumber(item.statValue)} ${t("ui.autoDps")}`;
    }
    if (item.statType === "crit") {
      return `+${formatNumber(item.statValue)}% ${t("ui.critChance")}`;
    }
    if (item.statType === "gold") {
      return `+${formatNumber(item.statValue)}% ${t("ui.gold")}`;
    }
    if (item.statType === "critMult") {
      return `+${item.statValue.toFixed(2)} ${t("ui.critMult")}`;
    }
    return "";
  }

  function describeAffixStat(affix) {
    if (!affix) {
      return "";
    }
    if (affix.statType === "click") {
      return `${t("ui.clickDamage")} +${formatNumber(affix.value)}`;
    }
    if (affix.statType === "auto") {
      return `${t("ui.autoDps")} +${formatNumber(affix.value)}`;
    }
    if (affix.statType === "crit") {
      return `${t("ui.critChance")} +${formatNumber(affix.value)}%`;
    }
    if (affix.statType === "gold") {
      return `${t("ui.gold")} +${formatNumber(affix.value)}%`;
    }
    if (affix.statType === "critMult") {
      return `${t("ui.critMult")} +${affix.value.toFixed(2)}`;
    }
    return "";
  }

  function applyAffixBonus(affix, bonuses) {
    if (!affix) {
      return;
    }
    if (affix.statType === "click") {
      bonuses.click += affix.value;
    } else if (affix.statType === "auto") {
      bonuses.auto += affix.value;
    } else if (affix.statType === "crit") {
      bonuses.crit += affix.value;
    } else if (affix.statType === "gold") {
      bonuses.gold += affix.value;
    } else if (affix.statType === "critMult") {
      bonuses.critMult += affix.value;
    }
  }

  function describeRuneStat(rune) {
    return `${t(rune.effectLabelKey)} ${formatNumber(rune.value)}%`;
  }

  function expandInventory() {
    const cost = getInventoryExpandCost();
    if (state.run.gold < cost) {
      return;
    }
    state.run.gold -= cost;
    state.meta.inventoryMaxSlots = getInventoryMaxSlots() + 1;
    addLog(t("log.inventoryExpand", { max: formatNumber(getInventoryMaxSlots()) }));
    playSfx("confirm");
    dirty.inventory = true;
    updateUi();
  }

  function selectInventoryItem(itemId) {
    if (!itemId) {
      return;
    }
    state.ui.selectedInventoryItemId = itemId;
    dirty.inventory = true;
    updateUi();
  }

  function equipSelectedItem() {
    if (!state.ui.selectedInventoryItemId) {
      return;
    }
    equipItem(state.ui.selectedInventoryItemId);
  }

  function getItemSellPrice(item) {
    if (!item) {
      return 0;
    }
    let base = 40;
    if (item.rarity === "Rare") {
      base = 120;
    } else if (item.rarity === "Epic") {
      base = 300;
    }
    const bonus = 1 + getSellBonusPct() / 100;
    return Math.floor(base * bonus);
  }

  function sellSelectedItem() {
    const item = state.run.inventory.find((entry) => entry.id === state.ui.selectedInventoryItemId);
    if (!item) {
      return;
    }
    if (item.id === state.run.equippedWeaponId || item.id === state.run.equippedRelicId) {
      addLog(t("msg.cannotSellEquipped"));
      return;
    }
    const price = getItemSellPrice(item);
    state.run.inventory = state.run.inventory.filter((entry) => entry.id !== item.id);
    state.run.gold += price;
    state.ui.selectedInventoryItemId = null;
    addLog(t("msg.soldItem", { name: getItemName(item), gold: formatNumber(price) }));
    playSfx("confirm");
    dirty.inventory = true;
    updateUi();
  }

  function equipItem(itemId) {
    const item = state.run.inventory.find((entry) => entry.id === itemId);
    if (!item) {
      return;
    }

    state.ui.selectedInventoryItemId = item.id;
    if (item.slot === "weapon") {
      state.run.equippedWeaponId = item.id;
      addLog(t("log.equippedWeapon", { name: getItemName(item) }));
    } else {
      state.run.equippedRelicId = item.id;
      addLog(t("log.equippedRelic", { name: getItemName(item) }));
      dirty.runes = true;
    }
    playSfx("confirm");
    dirty.inventory = true;
    updateUi();
    updateTutorial();
  }

  function unequipWeapon() {
    if (!state.run.equippedWeaponId) {
      return;
    }
    state.run.equippedWeaponId = null;
    addLog(t("log.unequipWeapon"));
    playSfx("confirm");
    dirty.inventory = true;
    updateUi();
  }

  function unequipRelic() {
    if (!state.run.equippedRelicId) {
      return;
    }
    state.run.equippedRelicId = null;
    state.run.equippedRuneId = null;
    addLog(t("log.unequipRelic"));
    playSfx("confirm");
    dirty.inventory = true;
    dirty.runes = true;
    updateUi();
  }

  function generateRune(rarityOverride = null) {
    const rarity = rarityOverride || getEquipmentRarity();
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

    return {
      id: `rune-${Date.now()}-${randInt(1000, 9999)}`,
      rarity,
      effect: effect.id,
      effectLabelKey: effect.labelKey,
      value,
      cost: Math.floor(120 + value * 20),
    };
  }

  function generateRuneOffer() {
    return generateRune(getRuneShopRarity());
  }

  function normalizeRune(rune) {
    if (!rune || typeof rune !== "object") {
      return null;
    }
    const effectId = rune.effect || rune.effectId || RUNE_EFFECTS[0]?.id || "boss";
    const effect = RUNE_EFFECTS.find((entry) => entry.id === effectId) || RUNE_EFFECTS[0];
    rune.id = rune.id || `rune-${Date.now()}-${randInt(1000, 9999)}`;
    rune.effect = effectId;
    rune.effectId = effectId;
    if (!rune.effectLabelKey) {
      rune.effectLabelKey = effect?.labelKey || "rune.effect.boss";
    }
    rune.rarity = rune.rarity || "Common";
    if (!Number.isFinite(rune.value)) {
      rune.value = 3;
    }
    if (rune.cost !== undefined && !Number.isFinite(rune.cost)) {
      rune.cost = Math.floor(120 + rune.value * 20);
    }
    return rune;
  }

  function refreshRuneShop(forceFree = false) {
    if (!forceFree && !testMode) {
      const cost = state.run.freeRuneRefreshUsed ? getRuneRefreshCost() : 0;
      if (cost > 0) {
        if (state.run.gold < cost) {
          return;
        }
        state.run.gold -= cost;
      } else {
        state.run.freeRuneRefreshUsed = true;
      }
    }

    state.run.runeShop = Array.from({ length: MAX_RUNE_OFFERS }, () => generateRuneOffer());
    addLog(t("log.shopRefresh"));
    dirty.runes = true;
    updateUi();
  }

  function addRuneToInventory(rune) {
    if (state.run.runes.length >= RUNE_MAX) {
      addLog(t("log.runeFull"));
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

  function buyRune(runeOfferId) {
    if (testMode) {
      return;
    }
    const runeIndex = state.run.runeShop.findIndex((r) => r.id === runeOfferId);
    if (runeIndex === -1) {
      return;
    }

    const rune = state.run.runeShop[runeIndex];
    if (!Number.isFinite(rune.cost)) {
      return;
    }
    if (state.run.gold < rune.cost || state.run.runes.length >= RUNE_MAX) {
      if (state.run.gold < rune.cost) {
        addLog(t("log.notEnoughGold"));
      }
      return;
    }

    state.run.gold -= rune.cost;
    const purchased = addRuneToInventory({ ...rune, cost: undefined });
    if (purchased) {
      addLog(t("log.boughtRune", { name: getRuneName(rune) }));
      playSfx("confirm");
      state.run.runeShop.splice(runeIndex, 1, generateRuneOffer());
      dirty.runes = true;
      updateUi();
      state.ui.tutorialRuneBought = true;
      updateTutorial();
    }
  }

  function selectRuneOffer(offerId) {
    if (!offerId) {
      return;
    }
    state.ui.selectedRuneOfferId = offerId;
    dirty.runes = true;
    updateUi();
  }

  function buySelectedRuneOffer() {
    if (!state.ui.selectedRuneOfferId) {
      return;
    }
    buyRune(state.ui.selectedRuneOfferId);
  }

  function socketRune(runeId) {
    if (!getEquippedRelic()) {
      addLog(t("log.relicRequired"));
      return;
    }
    const rune = state.run.runes.find((r) => r.id === runeId);
    if (!rune) {
      return;
    }

    state.run.equippedRuneId = rune.id;
    addLog(t("log.socketedRune", { name: getRuneName(rune) }));
    playSfx("confirm");
    dirty.inventory = true;
    dirty.runes = true;
    updateUi();
  }

  function socketSelectedRune() {
    if (!state.ui.selectedRuneId) {
      return;
    }
    if (!getEquippedRelic()) {
      addLog(t("log.relicRequired"));
      return;
    }
    const rune = state.run.runes.find((entry) => entry.id === state.ui.selectedRuneId);
    if (!rune) {
      return;
    }
    const existing = getEquippedRune();
    if (existing && existing.id !== rune.id) {
      const ok = window.confirm(t("confirm.replaceSocket"));
      if (!ok) {
        return;
      }
    }
    socketRune(rune.id);
  }

  function removeRune() {
    if (!state.run.equippedRuneId) {
      return;
    }
    const rune = getEquippedRune();
    state.run.equippedRuneId = null;
    if (state.ui.selectedRuneId === rune?.id) {
      state.ui.selectedRuneId = null;
    }
    if (rune) {
      addLog(t("log.removedRune", { name: getRuneName(rune) }));
    }
    playSfx("confirm");
    dirty.inventory = true;
    dirty.runes = true;
    updateUi();
  }

  function selectRune(runeId) {
    if (!runeId) {
      return;
    }
    state.ui.selectedRuneId = runeId;
    dirty.runes = true;
    updateUi();
  }

  function getRuneSellPrice(rune) {
    if (!rune) {
      return 0;
    }
    let base = 60;
    if (rune.rarity === "Rare") {
      base = 180;
    } else if (rune.rarity === "Epic") {
      base = 450;
    }
    const bonus = 1 + getSellBonusPct() / 100;
    return Math.floor(base * bonus);
  }

  function sellSelectedRune() {
    const rune = state.run.runes.find((entry) => entry.id === state.ui.selectedRuneId);
    if (!rune) {
      return;
    }
    if (rune.id === state.run.equippedRuneId) {
      addLog(t("msg.cannotSellSocketed"));
      return;
    }
    const price = getRuneSellPrice(rune);
    state.run.runes = state.run.runes.filter((entry) => entry.id !== rune.id);
    state.run.gold += price;
    state.ui.selectedRuneId = null;
    addLog(t("msg.soldRune", { name: getRuneName(rune), gold: formatNumber(price) }));
    playSfx("confirm");
    dirty.runes = true;
    updateUi();
  }

  function createQuest() {
    if (!QUEST_TEMPLATES.length) {
      return {
        id: `quest-${Date.now()}-${randInt(1000, 9999)}`,
        templateId: "fallback",
        titleKey: "quest.kill_basic.title",
        descKey: "quest.kill_basic.desc",
        type: "kill",
        target: 10,
        progress: 0,
        completed: false,
        rewardType: "gold",
        rewardAmount: 50,
      };
    }
    const template = QUEST_TEMPLATES[randInt(0, QUEST_TEMPLATES.length - 1)];
    const target = randInt(template.target[0], template.target[1]);
    const reward = template.reward;
    return {
      id: `quest-${Date.now()}-${randInt(1000, 9999)}`,
      templateId: template.id,
      titleKey: template.titleKey,
      descKey: template.descKey,
      type: template.type,
      target,
      progress: 0,
      completed: false,
      rewardType: reward.type,
      rewardAmount: reward.type === "title" ? reward.min : randInt(reward.min, reward.max),
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

  function createWeeklyQuest() {
    if (!WEEKLY_TEMPLATES.length) {
      return {
        id: `weekly-${Date.now()}-${randInt(1000, 9999)}`,
        titleKey: "quest.weekly_kills.title",
        descKey: "quest.weekly_kills.desc",
        type: "kill",
        target: 50,
        progress: 0,
        completed: false,
        rewardType: "honor",
        rewardAmount: 1,
      };
    }
    const template = WEEKLY_TEMPLATES[randInt(0, WEEKLY_TEMPLATES.length - 1)];
    const target = randInt(template.target[0], template.target[1]);
    const reward = template.reward;
    return {
      id: `weekly-${Date.now()}-${randInt(1000, 9999)}`,
      titleKey: template.titleKey,
      descKey: template.descKey,
      type: template.type,
      target,
      progress: 0,
      completed: false,
      rewardType: reward.type,
      rewardAmount: reward.type === "title" ? reward.min : randInt(reward.min, reward.max),
    };
  }

  function ensureWeeklyQuest() {
    const now = Date.now();
    if (!state.run.weeklyQuest || now >= state.run.weeklyResetAt) {
      state.run.weeklyQuest = createWeeklyQuest();
      state.run.weeklyResetAt = now + 7 * 24 * 60 * 60 * 1000;
    }
  }

  function createChainQuest() {
    if (!CHAIN_TEMPLATES.length) {
      return {
        templateId: "fallback",
        titleKey: "quest.chain_slayer",
        stepIndex: 0,
        type: "kill",
        target: 20,
        progress: 0,
        descKey: "quest.chain_slayer_1",
      };
    }
    const template = CHAIN_TEMPLATES[randInt(0, CHAIN_TEMPLATES.length - 1)];
    const step = template.steps[0];
    return {
      templateId: template.id,
      titleKey: template.titleKey,
      stepIndex: 0,
      type: step.type,
      target: step.target,
      progress: 0,
      descKey: step.descKey,
    };
  }

  function ensureChainQuest() {
    if (!state.run.chainQuest) {
      state.run.chainQuest = createChainQuest();
    }
  }

  function advanceChain() {
    if (!state.run.chainQuest) {
      return;
    }
    const template = CHAIN_TEMPLATES.find((t) => t.id === state.run.chainQuest.templateId);
    if (!template) {
      state.run.chainQuest = createChainQuest();
      return;
    }

    if (state.run.chainQuest.stepIndex < 2) {
      const nextIndex = state.run.chainQuest.stepIndex + 1;
      const step = template.steps[nextIndex];
      state.run.chainQuest.stepIndex = nextIndex;
      state.run.chainQuest.type = step.type;
      state.run.chainQuest.target = step.target;
      state.run.chainQuest.progress = 0;
      state.run.chainQuest.descKey = step.descKey;
    } else {
      state.run.chainCompletedAt = Date.now();
      addLog(t("log.chainComplete"));
    }
  }

  function maybeResetChain() {
    if (state.run.chainCompletedAt && Date.now() - state.run.chainCompletedAt > 5000) {
      state.run.chainQuest = createChainQuest();
      state.run.chainCompletedAt = 0;
    }
  }

  function updateWeeklyQuestProgress(eventType, amount) {
    const quest = state.run.weeklyQuest;
    if (!quest || quest.completed) {
      return;
    }
    if (quest.type === "zone_reach" && eventType === "zone_reach") {
      quest.progress = Math.max(quest.progress, amount);
    } else if (quest.type === eventType) {
      quest.progress += amount;
    }
    if (quest.progress >= quest.target) {
      quest.completed = true;
      addLog(t("log.weeklyComplete", { title: t(quest.titleKey) }));
      dirty.quests = true;
    }
  }

  function updateChainProgress(eventType, amount) {
    const chain = state.run.chainQuest;
    if (!chain || state.run.chainCompletedAt) {
      return;
    }
    if (chain.type === "zone_reach" && eventType === "zone_reach") {
      chain.progress = Math.max(chain.progress, amount);
    } else if (chain.type === eventType) {
      chain.progress += amount;
    }
    if (chain.progress >= chain.target) {
      advanceChain();
      dirty.quests = true;
    }
  }

  function claimQuest(questId) {
    if (testMode) {
      return;
    }
    let questIndex = state.run.quests.findIndex((quest) => quest.id === questId);
    if (questIndex !== -1) {
      const quest = state.run.quests[questIndex];
      if (!quest.completed) {
        return;
      }
      handleQuestReward(quest);
      state.run.quests.splice(questIndex, 1, createQuest());
      dirty.quests = true;
      return;
    }

    if (state.run.weeklyQuest && state.run.weeklyQuest.id === questId) {
      if (!state.run.weeklyQuest.completed) {
        return;
      }
      handleQuestReward(state.run.weeklyQuest);
      state.run.weeklyQuest = createWeeklyQuest();
      dirty.quests = true;
      return;
    }
  }

  function handleQuestReward(quest) {
    let rewardText = "";
    if (quest.rewardType === "honor") {
      state.meta.totalHonor += quest.rewardAmount;
      state.session.honorGained += quest.rewardAmount;
      rewardText = `+${formatNumber(quest.rewardAmount)} ${t("ui.honor")}`;
    } else if (quest.rewardType === "rune") {
      const rune = generateRune();
      addRuneToInventory(rune);
      addLog(t("log.questRewardRune", { name: getRuneName(rune) }));
      dirty.runes = true;
      rewardText = t("ui.rune");
    } else if (quest.rewardType === "title") {
      const titleKey = normalizeTitleKey(quest.rewardAmount);
      if (titleKey && !state.meta.titlesUnlocked.includes(titleKey)) {
        state.meta.titlesUnlocked.push(titleKey);
        dirty.achievements = true;
      }
      rewardText = getTitleLabel(titleKey || quest.rewardAmount);
    } else {
      state.run.gold += quest.rewardAmount;
      rewardText = `+${formatNumber(quest.rewardAmount)} ${t("ui.gold")}`;
    }

    state.meta.lifetimeQuestClaims += 1;
    state.session.questsCompleted += 1;
    addLog(t("log.claimQuest", { title: t(quest.titleKey), reward: rewardText }));
    playSfx("confirm");
    updateUi();
  }

  function rerollQuests() {
    if (testMode) {
      return;
    }
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
    addLog(t("ui.reroll"));
    dirty.quests = true;
    updateUi();
  }

  function activateSkill() {
    if (testMode) {
      return;
    }
    const selected = state.run.skills.selected;
    const now = Date.now();
    const cooldown = getSkillCooldown(selected);
    const skill = state.run.skills[selected];
    const cooldownRemaining = cooldown - (now - skill.lastUsed);
    if (cooldownRemaining > 0) {
      addLog(t("ui.onCooldown"));
      return;
    }

    skill.lastUsed = now;
    if (selected === "power") {
      skill.activeUntil = now + SKILL_DURATION_MS;
      addLog(t("ui.skillPower"));
    } else {
      skill.activeUntil = now + CRY_DURATION_MS;
      addLog(t("ui.skillCry"));
    }
    state.meta.lifetimeSkillUses += 1;
    state.ui.tutorialSkillUsed = true;
    updateUi();
    updateTutorial();
  }

  function selectSkill(skillId) {
    state.run.skills.selected = skillId;
    updateUi();
  }

  function prestige() {
    if (testMode) {
      return;
    }
    if (state.run.zone < PRESTIGE_ZONE) {
      return;
    }

    const ok = window.confirm(t("ui.confirmPrestige"));
    if (!ok) {
      return;
    }

    const honorGained = Math.max(
      1,
      Math.floor((state.run.highestZone - 9) * 2 + state.run.totalKillsThisRun / 50)
    );

    state.meta.totalHonor += honorGained;
    state.meta.lifetimePrestiges += 1;
    state.session.honorGained += honorGained;
    addLog(t("log.prestige", { amount: formatNumber(honorGained) }));
    finalizeSession();
    resetRun();
    saveGame();
    updateUi();
  }

  function finalizeSession() {
    const session = { ...state.session, endAt: Date.now() };
    state.sessionHistory.unshift(session);
    state.sessionHistory = state.sessionHistory.slice(0, 10);
    state.session = {
      startAt: Date.now(),
      goldEarned: 0,
      kills: 0,
      bossKills: 0,
      chapterBossKills: 0,
      honorGained: 0,
      drops: { Common: 0, Rare: 0, Epic: 0 },
      questsCompleted: 0,
    };
  }

  function resetRun() {
    const base = getDefaultState();
    state.run = base.run;
    state.ui.selectedInventoryItemId = null;
    state.ui.selectedRuneId = null;
    state.upgrades.click.level = 0;
    state.upgrades.auto.level = 0;
    state.upgrades.crit.level = 0;
    state.upgrades.multi.level = 0;
    autoCarry = 0;
    spawnMonster(false);
    ensureQuests();
    ensureWeeklyQuest();
    ensureChainQuest();
    refreshRuneShop(true);
    dirty.inventory = true;
    dirty.runes = true;
    dirty.quests = true;
    dirty.collections = true;
    dirty.achievements = true;
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

    state.session.goldEarned += goldGain;
    state.session.kills += killsGain;

    while (state.run.killsInZone >= ZONE_KILLS) {
      state.run.zone += 1;
      state.run.killsInZone -= ZONE_KILLS;
      state.run.highestZone = Math.max(state.run.highestZone, state.run.zone);
    }

    showOfflineModal(goldGain, killsGain);
  }

  function showOfflineModal(goldGain, killsGain) {
    el.offlineText.textContent = t("ui.offlineGain", {
      gold: formatNumber(goldGain),
      kills: formatNumber(killsGain),
    });
    el.offlineModal.classList.add("active");
  }

  function showSessionReport() {
    const current = state.session;
    const last = state.sessionHistory[0];
    const format = (session, labelKey) => {
      if (!session) {
        return `${t(labelKey)}: ${t("ui.none")}`;
      }
      return [
        `${t(labelKey)}:`,
        `${t("ui.sessionStart")}: ${new Date(session.startAt).toLocaleString()}`,
        session.endAt
          ? `${t("ui.sessionEnd")}: ${new Date(session.endAt).toLocaleString()}`
          : `${t("ui.sessionEnd")}: ${t("ui.active")}`,
        `${t("ui.gold")}: ${formatNumber(session.goldEarned)}`,
        `${t("ui.kills")}: ${formatNumber(session.kills)}`,
        `${t("ui.boss")}: ${formatNumber(session.bossKills)}`,
        `${t("ui.chapterBoss")}: ${formatNumber(session.chapterBossKills)}`,
        `${t("ui.honor")}: ${formatNumber(session.honorGained)}`,
        `${t("ui.drops")}: ${session.drops.Common}/${session.drops.Rare}/${session.drops.Epic}`,
        `${t("ui.quests")}: ${formatNumber(session.questsCompleted)}`,
      ].join("\n");
    };

    el.sessionContent.textContent = `${format(current, "ui.currentSession")}\n\n${format(
      last,
      "ui.lastSession"
    )}`;
    el.sessionModal.classList.add("active");
  }

  function saveGame() {
    state.run.lastActiveAt = Date.now();
    const runSave = { ...state.run, comboCount: 0, comboLastAt: 0 };
    const payload = {
      version: "v0.5",
      meta: state.meta,
      run: runSave,
      upgrades: state.upgrades,
      log: state.log,
      session: state.session,
      sessionHistory: state.sessionHistory,
      ui: state.ui,
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  }

  function applyImportedData(data) {
    const defaults = getDefaultState();
    state.meta = { ...defaults.meta, ...data.meta };
    state.meta.achievements = { ...defaults.meta.achievements, ...state.meta.achievements };
    state.meta.titlesUnlocked = state.meta.titlesUnlocked || [];
    state.meta.regionsReached = state.meta.regionsReached || ["greenfields"];
    state.meta.collections = { ...defaults.meta.collections, ...state.meta.collections };
    state.meta.chapterClears = { ...defaults.meta.chapterClears, ...state.meta.chapterClears };
    state.meta.metaBonuses = { ...defaults.meta.metaBonuses, ...state.meta.metaBonuses };
    state.meta.metaBonuses.skillCdrPct = clamp(state.meta.metaBonuses.skillCdrPct || 0, 0, 30);
    state.meta.metaBonuses.refreshDiscountPct = clamp(state.meta.metaBonuses.refreshDiscountPct || 0, 0, 50);
    state.meta.metaBonuses.runeShopRarePct = clamp(state.meta.metaBonuses.runeShopRarePct || 0, 0, 20);
    state.meta.metaBonuses.sellBonusPct = clamp(state.meta.metaBonuses.sellBonusPct || 0, 0, 100);
    state.meta.inventoryMaxSlots = Math.max(
      BASE_INVENTORY_SLOTS,
      Math.floor(state.meta.inventoryMaxSlots || BASE_INVENTORY_SLOTS)
    );

    state.run = { ...defaults.run, ...data.run };
    state.run.skills = { ...defaults.run.skills, ...state.run.skills };
    state.run.currentBossPattern = state.run.currentBossPattern || null;
    state.run.rewardLock = !!state.run.rewardLock;
    state.run.pendingChapterReward = state.run.pendingChapterReward || null;
    state.run.currentBossPattern = normalizeBossPattern(state.run.currentBossPattern);
    if (state.run.fusionSelection) {
      delete state.run.fusionSelection;
    }

    state.upgrades = { ...defaults.upgrades, ...data.upgrades };
    Object.keys(state.upgrades).forEach((key) => {
      state.upgrades[key].baseCost = defaults.upgrades[key].baseCost;
      state.upgrades[key].level = Math.max(0, state.upgrades[key].level || 0);
    });

    state.session = { ...defaults.session, ...data.session };
    state.sessionHistory = Array.isArray(data.sessionHistory) ? data.sessionHistory : [];
    state.log = (Array.isArray(data.log) ? data.log : []).slice(0, LOG_MAX);

    state.ui = { ...defaults.ui, ...(data.ui || {}) };
    if (!data.ui || data.ui.tutorialDone === undefined) {
      state.ui.tutorialDone = true;
    }
    if (state.ui.lang !== "en" && state.ui.lang !== "ko") {
      state.ui.lang = "en";
    }
    if (state.ui.numFormat !== "full" && state.ui.numFormat !== "abbr") {
      state.ui.numFormat = "full";
    }
    if (typeof state.ui.sfxEnabled !== "boolean") {
      state.ui.sfxEnabled = true;
    }
    state.ui.sfxVolume = clamp(Number(state.ui.sfxVolume) || 60, 0, 100);
    if (state.ui.lang !== "en" && state.ui.lang !== "ko") {
      state.ui.lang = "en";
    }
    if (state.ui.numFormat !== "full" && state.ui.numFormat !== "abbr") {
      state.ui.numFormat = "full";
    }

    const normalizedTitles = state.meta.titlesUnlocked.map((title) => normalizeTitleKey(title));
    state.meta.titlesUnlocked = Array.from(new Set(normalizedTitles.filter((title) => title)));
    state.meta.equippedTitle = normalizeTitleKey(state.meta.equippedTitle);

    state.run.critChanceBase = clamp(state.run.critChanceBase, 0, 0.5);
    state.run.critMultiplierBase = clamp(state.run.critMultiplierBase, 1.5, 3.0);
    state.run.gold = Math.max(0, state.run.gold || 0);
    state.run.zone = Math.max(1, state.run.zone || 1);
    state.run.highestZone = Math.max(state.run.zone, state.run.highestZone || state.run.zone);

    if (!Array.isArray(state.run.inventory)) {
      state.run.inventory = [];
    }
    state.run.inventory = state.run.inventory.slice(0, getInventoryMaxSlots());
    state.run.inventory.forEach((item) => {
      if (!item.slot) {
        item.slot = item.statType === "click" || item.statType === "critMult" ? "weapon" : "relic";
      }
      if (!item.nameParts) {
        item.nameParts = generateItemNameParts(item.slot);
      }
      item.affix = normalizeAffix(item.affix, item.slot, item.rarity);
    });
    if (!state.run.inventory.find((item) => item.id === state.run.equippedRelicId)) {
      state.run.equippedRelicId = null;
    }
    if (!state.run.inventory.find((item) => item.id === state.run.equippedWeaponId)) {
      state.run.equippedWeaponId = null;
    }
    if (!state.run.inventory.find((item) => item.id === state.ui.selectedInventoryItemId)) {
      state.ui.selectedInventoryItemId = null;
    }

    if (!Array.isArray(state.run.runes)) {
      state.run.runes = [];
    }
    state.run.runes = state.run.runes
      .map((rune) => normalizeRune(rune))
      .filter(Boolean)
      .slice(0, RUNE_MAX);
    if (!state.run.runes.find((rune) => rune.id === state.run.equippedRuneId)) {
      state.run.equippedRuneId = null;
    }
    if (!state.run.runes.find((rune) => rune.id === state.ui.selectedRuneId)) {
      state.ui.selectedRuneId = null;
    }

    if (!Array.isArray(state.run.runeShop) || state.run.runeShop.length === 0) {
      state.run.runeShop = Array.from({ length: MAX_RUNE_OFFERS }, () => generateRuneOffer());
    } else {
      state.run.runeShop = state.run.runeShop
        .map((rune) => normalizeRune(rune))
        .filter(Boolean)
        .slice(0, MAX_RUNE_OFFERS);
    }
    if (!state.run.runeShop.find((rune) => rune.id === state.ui.selectedRuneOfferId)) {
      state.ui.selectedRuneOfferId = null;
    }

    if (!Array.isArray(state.run.quests) || state.run.quests.length === 0) {
      state.run.quests = [];
    }

    ensureQuests();
    ensureWeeklyQuest();
    ensureChainQuest();
    if (state.run.pendingChapterReward) {
      state.run.rewardLock = true;
      openChapterRewardModal(
        state.run.pendingChapterReward.chapterZone,
        state.run.pendingChapterReward.options
      );
    } else {
      state.run.rewardLock = false;
    }
    spawnMonster(state.run.isBoss, state.run.monsterTypeId);
    updateHpUi();
    dirty.inventory = true;
    dirty.runes = true;
    dirty.quests = true;
    dirty.collections = true;
    dirty.achievements = true;
    dirty.i18n = true;
  }

  function loadState() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      spawnMonster(false);
      ensureQuests();
      ensureWeeklyQuest();
      ensureChainQuest();
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
        state.meta.collections = { ...defaults.meta.collections, ...data.meta.collections };
      state.meta.chapterClears = { ...defaults.meta.chapterClears, ...state.meta.chapterClears };
      state.meta.metaBonuses = { ...defaults.meta.metaBonuses, ...state.meta.metaBonuses };
      state.meta.metaBonuses.skillCdrPct = clamp(state.meta.metaBonuses.skillCdrPct || 0, 0, 30);
      state.meta.metaBonuses.refreshDiscountPct = clamp(state.meta.metaBonuses.refreshDiscountPct || 0, 0, 50);
      state.meta.metaBonuses.runeShopRarePct = clamp(state.meta.metaBonuses.runeShopRarePct || 0, 0, 20);
      state.meta.metaBonuses.sellBonusPct = clamp(state.meta.metaBonuses.sellBonusPct || 0, 0, 100);
      state.meta.inventoryMaxSlots = Math.max(
        BASE_INVENTORY_SLOTS,
        Math.floor(state.meta.inventoryMaxSlots || BASE_INVENTORY_SLOTS)
      );
      }

      if (data.run) {
        state.run = { ...defaults.run, ...data.run };
        state.run.skills = { ...defaults.run.skills, ...data.run.skills };
        if (state.run.fusionSelection) {
          delete state.run.fusionSelection;
        }
        state.run.currentBossPattern = state.run.currentBossPattern || null;
        state.run.rewardLock = !!state.run.rewardLock;
        state.run.pendingChapterReward = state.run.pendingChapterReward || null;
        state.run.currentBossPattern = normalizeBossPattern(state.run.currentBossPattern);
      }

      if (data.upgrades) {
        state.upgrades = { ...defaults.upgrades, ...data.upgrades };
        Object.keys(state.upgrades).forEach((key) => {
          state.upgrades[key].baseCost = defaults.upgrades[key].baseCost;
          state.upgrades[key].level = Math.max(0, state.upgrades[key].level || 0);
        });
      }

      if (data.session) {
        state.session = { ...defaults.session, ...data.session };
      }
      if (Array.isArray(data.sessionHistory)) {
        state.sessionHistory = data.sessionHistory;
      }
      state.log = (Array.isArray(data.log) ? data.log : []).slice(0, LOG_MAX);

      state.ui = { ...defaults.ui, ...(data.ui || {}) };
      if (!data.ui || data.ui.tutorialDone === undefined) {
        state.ui.tutorialDone = true;
      }
      if (state.ui.lang !== "en" && state.ui.lang !== "ko") {
        state.ui.lang = "en";
      }
      if (state.ui.numFormat !== "full" && state.ui.numFormat !== "abbr") {
        state.ui.numFormat = "full";
      }
      if (typeof state.ui.sfxEnabled !== "boolean") {
        state.ui.sfxEnabled = true;
      }
      state.ui.sfxVolume = clamp(Number(state.ui.sfxVolume) || 60, 0, 100);
      if (state.ui.lang !== "en" && state.ui.lang !== "ko") {
        state.ui.lang = "en";
      }
      if (state.ui.numFormat !== "full" && state.ui.numFormat !== "abbr") {
        state.ui.numFormat = "full";
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

      const normalizedTitles = state.meta.titlesUnlocked.map((title) => normalizeTitleKey(title));
      state.meta.titlesUnlocked = Array.from(new Set(normalizedTitles.filter((title) => title)));
      state.meta.equippedTitle = normalizeTitleKey(state.meta.equippedTitle);

      state.run.comboCount = 0;
      state.run.comboLastAt = 0;

      state.run.critChanceBase = clamp(state.run.critChanceBase, 0, 0.5);
      state.run.critMultiplierBase = clamp(state.run.critMultiplierBase, 1.5, 3.0);
      state.run.gold = Math.max(0, state.run.gold || 0);
      state.run.zone = Math.max(1, state.run.zone || 1);
      state.run.highestZone = Math.max(state.run.zone, state.run.highestZone || state.run.zone);

      if (!Array.isArray(state.run.inventory)) {
        state.run.inventory = [];
      }
      state.run.inventory = state.run.inventory.slice(0, getInventoryMaxSlots());
      state.run.inventory.forEach((item) => {
        if (!item.slot) {
          item.slot = item.statType === "click" || item.statType === "critMult" ? "weapon" : "relic";
        }
        if (!item.nameParts) {
          item.nameParts = generateItemNameParts(item.slot);
        }
        item.affix = normalizeAffix(item.affix, item.slot, item.rarity);
      });
      if (!state.run.inventory.find((item) => item.id === state.run.equippedRelicId)) {
        state.run.equippedRelicId = null;
      }
      if (!state.run.inventory.find((item) => item.id === state.run.equippedWeaponId)) {
        state.run.equippedWeaponId = null;
      }
      if (!state.run.inventory.find((item) => item.id === state.ui.selectedInventoryItemId)) {
        state.ui.selectedInventoryItemId = null;
      }

      if (!Array.isArray(state.run.runes)) {
        state.run.runes = [];
      }
      state.run.runes = state.run.runes
        .map((rune) => normalizeRune(rune))
        .filter(Boolean)
        .slice(0, RUNE_MAX);
      if (!state.run.runes.find((rune) => rune.id === state.run.equippedRuneId)) {
        state.run.equippedRuneId = null;
      }
      if (!state.run.runes.find((rune) => rune.id === state.ui.selectedRuneId)) {
        state.ui.selectedRuneId = null;
      }
      if (!Array.isArray(state.run.runeShop) || state.run.runeShop.length === 0) {
        state.run.runeShop = Array.from({ length: MAX_RUNE_OFFERS }, () => generateRuneOffer());
      } else {
        state.run.runeShop = state.run.runeShop
          .map((rune) => normalizeRune(rune))
          .filter(Boolean)
          .slice(0, MAX_RUNE_OFFERS);
      }
      if (!state.run.runeShop.find((rune) => rune.id === state.ui.selectedRuneOfferId)) {
        state.ui.selectedRuneOfferId = null;
      }

      if (!Array.isArray(state.run.quests) || state.run.quests.length === 0) {
        state.run.quests = [];
      }

      if (!state.run.weeklyQuest) {
        ensureWeeklyQuest();
      }
      if (!state.run.chainQuest) {
        ensureChainQuest();
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
      ensureWeeklyQuest();
      ensureChainQuest();
      if (state.run.pendingChapterReward) {
        state.run.rewardLock = true;
        openChapterRewardModal(
          state.run.pendingChapterReward.chapterZone,
          state.run.pendingChapterReward.options
        );
      } else {
        state.run.rewardLock = false;
      }
      dirty.inventory = true;
      dirty.runes = true;
      dirty.quests = true;
      dirty.collections = true;
      dirty.achievements = true;
      dirty.i18n = true;
    } catch (error) {
      spawnMonster(false);
      ensureQuests();
      ensureWeeklyQuest();
      ensureChainQuest();
      refreshRuneShop(true);
    }
  }

  function resetGame() {
    if (testMode) {
      return;
    }
    const ok = window.confirm(t("ui.confirmReset"));
    if (!ok) {
      return;
    }

    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
  }

  function setCompactMode(enabled) {
    state.ui.compact = enabled;
    if (enabled) {
      document.body.classList.add("compact");
      localStorage.setItem(UI_COMPACT_KEY, "1");
    } else {
      document.body.classList.remove("compact");
      localStorage.setItem(UI_COMPACT_KEY, "0");
    }
    updateSettingsButtons();
  }

  function setLang(lang) {
    state.ui.lang = lang;
    localStorage.setItem(UI_LANG_KEY, lang);
    dirty.i18n = true;
    updateUi();
  }

  function setNumFormat(value) {
    state.ui.numFormat = value;
    localStorage.setItem(UI_NUMFMT_KEY, value);
    updateSettingsButtons();
    updateUi();
  }

  function setReducedFx(value) {
    state.ui.reducedFx = value;
    localStorage.setItem(UI_FX_KEY, value ? "1" : "0");
    document.body.classList.toggle("reduced-fx", value);
    updateSettingsButtons();
    updateUi();
  }

  function setSfxEnabled(value) {
    state.ui.sfxEnabled = value;
    localStorage.setItem(UI_SFX_KEY, value ? "1" : "0");
    updateSettingsButtons();
  }

  function setSfxVolume(value) {
    const next = clamp(Number(value) || 0, 0, 100);
    state.ui.sfxVolume = next;
    localStorage.setItem(UI_SFX_VOL_KEY, String(next));
    updateSettingsButtons();
  }

  function initTabs() {
    const buttons = Array.from(document.querySelectorAll(".tab-button"));
    const panels = Array.from(document.querySelectorAll(".tab-panel"));

    setActiveTab = (tab) => {
      buttons.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.tab === tab));
      panels.forEach((panel) =>
        panel.classList.toggle("is-active", panel.dataset.tabPanel === tab)
      );
      if (tab === "runes") {
        state.ui.tutorialRunesOpened = true;
        dirty.runes = true;
      }
      if (tab === "inventory") {
        dirty.inventory = true;
      }
      updateTutorial();
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => setActiveTab(button.dataset.tab));
    });

    setActiveTab("shop");
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

  function toggleDevMode() {
    devMode = !devMode;
    updateDevUi();
    updateSettingsButtons();
    if (!devMode) {
      clickCheckEnabled = false;
    }
  }

  function openSaveModal() {
    el.saveText.value = JSON.stringify(
      {
        meta: state.meta,
        run: state.run,
        upgrades: state.upgrades,
        session: state.session,
        sessionHistory: state.sessionHistory,
        log: state.log,
        ui: state.ui,
      },
      null,
      2
    );
    el.saveModal.classList.add("active");
  }

  function applySaveImport() {
    if (testMode) {
      return;
    }
    const ok = window.confirm(t("ui.confirmImport"));
    if (!ok) {
      return;
    }
    try {
      const data = JSON.parse(el.saveText.value);
      applyImportedData(data);
      saveGame();
      updateUi();
    } catch (error) {
      addLog(t("log.importFail"));
    }
  }

  function copySaveText() {
    el.saveText.select();
    document.execCommand("copy");
    addLog(t("log.saveCopied"));
  }

  function resetWeakPoint() {
    if (weakPointTimeout) {
      clearTimeout(weakPointTimeout);
    }
    el.weakPoint.classList.remove("active");
    scheduleWeakPoint();
  }

  function scheduleWeakPoint() {
    const delay = randInt(WEAK_POINT_MIN_MS, WEAK_POINT_MAX_MS);
    weakPointTimeout = setTimeout(() => {
      placeWeakPoint();
      scheduleWeakPoint();
    }, delay);
  }

  function placeWeakPoint() {
    if (state.run.rewardLock || state.run.monsterHp <= 0) {
      return;
    }
    const rect = el.monsterArea.getBoundingClientRect();
    const size = 26;
    const x = randInt(10, Math.max(10, rect.width - size - 10));
    const y = randInt(10, Math.max(10, rect.height - size - 10));
    el.weakPoint.style.left = `${x}px`;
    el.weakPoint.style.top = `${y}px`;
    el.weakPoint.classList.add("active");
  }

  function handleWeakPointClick(event) {
    event.stopPropagation();
    el.weakPoint.classList.remove("active");
    handleClick(true);
  }

  function devNote(messageKey, params = {}) {
    if (devMode) {
      addLog(t(messageKey, params));
    }
  }

  function onGlobalClick(event) {
    unlockAudio();
    const button = event.target.closest("button[data-action], [role='button'][data-action]");
    if (!button) {
      return;
    }
    if (button.disabled) {
      devNote("log.actionBlocked", { action: button.dataset.action || "-" });
      return;
    }
    if (clickCheckEnabled) {
      const rect = button.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const top = document.elementFromPoint(x, y);
      if (!top || (top !== button && !button.contains(top))) {
        const blocker = top ? `${top.tagName}.${top.className || "no-class"}` : "unknown";
        addLog(t("log.clickBlocked", { target: blocker }));
      }
    }
    try {
      const action = button.dataset.action;
      if (action === "select-item") {
        selectInventoryItem(button.dataset.itemId);
      } else if (action === "equip-item") {
        equipItem(button.dataset.itemId);
      } else if (action === "equip-selected-item") {
        equipSelectedItem();
      } else if (action === "sell-selected-item") {
        sellSelectedItem();
      } else if (action === "expand-inventory") {
        expandInventory();
      } else if (action === "unequip-weapon") {
        unequipWeapon();
      } else if (action === "unequip-relic") {
        unequipRelic();
      } else if (action === "unequip-rune") {
        removeRune();
      } else if (action === "buy-rune") {
        buyRune(button.dataset.runeOfferId);
      } else if (action === "rune-offer-select") {
        selectRuneOffer(button.dataset.offerId);
      } else if (action === "rune-offer-buy") {
        buySelectedRuneOffer();
      } else if (action === "refresh-rune-shop" || action === "runes-refresh") {
        refreshRuneShop(false);
      } else if (action === "socket-rune") {
        socketRune(button.dataset.runeId);
      } else if (action === "socket-selected-rune") {
        socketSelectedRune();
      } else if (action === "claim-quest") {
        claimQuest(button.dataset.questId);
      } else if (action === "reroll-quest") {
        rerollQuests();
      } else if (action === "select-rune") {
        selectRune(button.dataset.runeId);
      } else if (action === "set-lang") {
        setLang(button.dataset.lang);
      } else if (action === "set-numfmt") {
        setNumFormat(button.dataset.value);
      } else if (action === "set-reducedfx") {
        setReducedFx(button.dataset.value === "on");
      } else if (action === "toggle-sfx") {
        setSfxEnabled(!state.ui.sfxEnabled);
      } else if (action === "toggle-compact") {
        setCompactMode(!state.ui.compact);
      } else if (action === "toggle-dev") {
        toggleDevMode();
      } else if (action === "sell-selected-rune") {
        sellSelectedRune();
      } else if (action === "goto-runes") {
        if (typeof setActiveTab === "function") {
          setActiveTab("runes");
          setTimeout(() => {
            el.runeInventoryList?.scrollIntoView({ block: "nearest" });
          }, 0);
        }
      } else if (action === "select-chapter-reward") {
        applyChapterReward(Number(button.dataset.rewardIndex || 0));
      } else if (action === "tutorial-next") {
        state.ui.tutorialStep += 1;
        updateTutorial();
      } else if (action === "tutorial-skip") {
        state.ui.tutorialDone = true;
        updateTutorial();
      }
    } catch (error) {
      console.error(error);
      addLog(t("log.actionError"));
    }
  }

  function onGlobalDblClick(event) {
    unlockAudio();
    const tile = event.target.closest(".tile[data-item-id], .tile[data-rune-id]");
    if (!tile) {
      return;
    }
    if (tile.dataset.itemId) {
      state.ui.selectedInventoryItemId = tile.dataset.itemId;
      equipItem(tile.dataset.itemId);
      return;
    }
    if (tile.dataset.runeId) {
      state.ui.selectedRuneId = tile.dataset.runeId;
      if (!getEquippedRelic()) {
        addLog(t("log.relicRequired"));
        return;
      }
      const existing = getEquippedRune();
      if (existing && existing.id !== tile.dataset.runeId) {
        const ok = window.confirm(t("ui.confirmReplaceRune"));
        if (!ok) {
          return;
        }
      }
      socketRune(tile.dataset.runeId);
    }
  }

  function runUiTests() {
    testMode = true;
    const snapshot = JSON.parse(JSON.stringify(state));
    const errorSnapshot = [...errorLog];

    state.run.gold = 999999;
    state.run.zone = 10;
    if (state.run.inventory.length === 0) {
      state.run.inventory.push(
        generateEquipmentItem("Common", "weapon", "greenfields"),
        generateEquipmentItem("Common", "relic", "greenfields")
      );
    }
    state.run.equippedWeaponId = state.run.inventory.find((i) => i.slot === "weapon")?.id || null;
    state.run.equippedRelicId = state.run.inventory.find((i) => i.slot === "relic")?.id || null;
    if (state.run.runes.length === 0) {
      state.run.runes.push(generateRune(), generateRune());
    }
    state.run.equippedRuneId = state.run.runes[0]?.id || null;
    if (state.run.runeShop.length === 0) {
      state.run.runeShop = Array.from({ length: MAX_RUNE_OFFERS }, () => generateRuneOffer());
    }
    if (state.run.runeShop.length > 0) {
      state.ui.selectedRuneOfferId = state.run.runeShop[0].id;
    }
    if (state.run.quests.length === 0) {
      state.run.quests = [createQuest(), createQuest(), createQuest()];
    }
    state.run.quests[0].completed = true;
    ensureWeeklyQuest();
    if (state.run.weeklyQuest) {
      state.run.weeklyQuest.completed = true;
    }
    state.meta.chapterClears[10] = true;

    dirty.inventory = true;
    dirty.runes = true;
    dirty.quests = true;
    updateUi();

    const checks = [
      "[data-test='tab-shop']",
      "[data-test='tab-inventory']",
      "[data-test='tab-quests']",
      "[data-test='tab-runes']",
      "[data-test='tab-achievements']",
      "[data-test='tab-collections']",
      "[data-test='tab-settings']",
      "[data-test='tab-log']",
      "[data-test='buy-click']",
      "[data-test='buy-auto']",
      "[data-test='buy-crit']",
      "[data-test='buy-multi']",
      "[data-test='skill-activate']",
      "[data-test='prestige']",
      "[data-test='unequip-weapon']",
      "[data-test='unequip-relic']",
      "[data-test='unequip-rune']",
      "[data-test='rune-refresh']",
      "[data-test='export']",
      "[data-test='import']",
      "[data-test='run-tests']",
    ];

    const results = [];
    const passLabel = t("ui.testsPass");
    const failLabel = t("ui.testsFail");
    const missingLabel = t("ui.testsMissing");
    const disabledLabel = t("ui.testsDisabled");
    const errorLabel = t("ui.testsError");

    const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
    for (let i = 0; i < 2; i += 1) {
      tabButtons.forEach((btn) => {
        try {
          btn.click();
          const panel = document.querySelector(`[data-tab-panel='${btn.dataset.tab}']`);
          if (!panel) {
            results.push(`${failLabel}: ${missingLabel} panel-${btn.dataset.tab}`);
          }
        } catch (error) {
          results.push(`${failLabel}: ${errorLabel} tab-${btn.dataset.tab}`);
        }
      });
    }

    const runeBuyBtn = document.querySelector("[data-test='rune-buy']");
    if (runeBuyBtn) {
      if (state.run.runeShop.length > 0) {
        state.ui.selectedRuneOfferId = state.run.runeShop[0].id;
      }
      state.run.gold = 0;
      updateRuneAffordability();
      const disabledBefore = runeBuyBtn.disabled;
      state.run.gold = 999999;
      updateRuneAffordability();
      const disabledAfter = runeBuyBtn.disabled;
      if (disabledBefore && !disabledAfter) {
        results.push(`${passLabel}: rune-affordability`);
      } else {
        results.push(`${failLabel}: rune-affordability`);
      }
    }

    const beforeSlots = getInventoryMaxSlots();
    state.run.gold = 999999;
    expandInventory();
    if (getInventoryMaxSlots() === beforeSlots + 1) {
      results.push(`${passLabel}: inventory-expand`);
    } else {
      results.push(`${failLabel}: inventory-expand`);
    }

    const testItem = generateEquipmentItem("Common", "weapon", "greenfields");
    testItem.affix = rollAffixForItem(testItem, true);
    const tooltip = buildItemTooltip(testItem);
    if (testItem.affix && tooltip.includes(t("ui.affix"))) {
      results.push(`${passLabel}: affix-tooltip`);
    } else {
      results.push(`${failLabel}: affix-tooltip`);
    }

    const rewardPool = (CHAPTER_REWARDS[10] || []).concat(CHAPTER_REWARDS[20] || []);
    const hasNewReward = rewardPool.some(
      (reward) =>
        reward.bonus.refreshDiscountPct ||
        reward.bonus.runeShopRarePct ||
        reward.bonus.sellBonusPct
    );
    if (hasNewReward) {
      results.push(`${passLabel}: chapter-reward-pool`);
    } else {
      results.push(`${failLabel}: chapter-reward-pool`);
    }

    const initialGold = state.run.gold;
    if (state.run.inventory.length < 2) {
      state.run.inventory.push(generateEquipmentItem("Common", "weapon", "greenfields"));
    }
    state.run.equippedWeaponId = state.run.inventory[0]?.id || null;
    state.ui.selectedInventoryItemId = state.run.inventory[1]?.id || null;
    sellSelectedItem();
    if (state.run.gold > initialGold) {
      results.push(`${passLabel}: sell-immediate`);
    } else {
      results.push(`${failLabel}: sell-immediate`);
    }

    for (let i = 0; i < LOG_MAX + 5; i += 1) {
      addLog(`test-${i}`);
    }
    const timeOk = state.log[0] && /^\d{2}:\d{2}:\d{2} /.test(state.log[0]);
    if (state.log.length <= LOG_MAX && timeOk) {
      results.push(`${passLabel}: log-format`);
    } else {
      results.push(`${failLabel}: log-format`);
    }

    if (state.run.inventory.length > 0) {
      equipItem(state.run.inventory[0].id);
      if (state.run.equippedRelicId && state.run.runes.length > 0) {
        socketRune(state.run.runes[0].id);
        const summaryText = el.socketedRuneName.textContent || "";
        if (summaryText !== t("ui.none")) {
          results.push(`${passLabel}: equip-socket-summary`);
        } else {
          results.push(`${failLabel}: equip-socket-summary`);
        }
      }
    }

    spawnMonster(true);
    updateBossPatternUi();
    if (el.bossPattern && el.bossPattern.textContent && el.bossPattern.textContent !== "-") {
      results.push(`${passLabel}: boss-pattern`);
    } else {
      results.push(`${failLabel}: boss-pattern`);
    }

    checks.forEach((selector) => {
      const element = document.querySelector(selector);
      if (!element) {
        results.push(`${failLabel}: ${missingLabel} ${selector}`);
        return;
      }
      if (element.disabled) {
        results.push(`${failLabel}: ${disabledLabel} ${selector}`);
        return;
      }
      try {
        element.click();
        results.push(`${passLabel}: ${selector}`);
      } catch (error) {
        results.push(`${failLabel}: ${errorLabel} ${selector}`);
      }
    });

    const dynamicChecks = [
      { selector: "[data-test='equip-item']", label: "equip-item" },
      { selector: "[data-test='quest-claim']", label: "quest-claim" },
      { selector: "[data-test='rune-buy']", label: "rune-buy" },
      { selector: "[data-test='rune-socket']", label: "rune-socket" },
    ];

    dynamicChecks.forEach((check) => {
      const element = document.querySelector(check.selector);
      if (!element) {
        results.push(`${failLabel}: ${missingLabel} ${check.label}`);
        return;
      }
      if (element.disabled) {
        results.push(`${failLabel}: ${disabledLabel} ${check.label}`);
        return;
      }
      try {
        element.click();
        results.push(`${passLabel}: ${check.label}`);
      } catch (error) {
        results.push(`${failLabel}: ${errorLabel} ${check.label}`);
      }
    });

    const passCount = results.filter((line) => line.startsWith(passLabel)).length;
    const failCount = results.filter((line) => line.startsWith(failLabel)).length;
    el.testResults.textContent = `${t("ui.testsTitle")}: ${passCount} ${t("ui.testsPassed")}, ${failCount} ${t("ui.testsFailed")}\n${results.join("\n")}`;

    state = snapshot;
    testMode = false;
    errorLog = errorSnapshot;
    dirty.inventory = true;
    dirty.runes = true;
    dirty.quests = true;
    updateUi();
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
      maybeResetChain();
      updateUi();
    }, DPS_TICK_MS);

    autosaveInterval = setInterval(saveGame, AUTOSAVE_MS);
  }

  function init() {
    loadState();
    initTabs();
    initAchievementFilters();
    setCompactMode(state.ui.compact);
    setReducedFx(state.ui.reducedFx);
    applyOfflineProgress();
    updateUi();

    el.monster.addEventListener("click", () => handleClick(false));
    el.weakPoint.addEventListener("click", handleWeakPointClick);
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
    el.sessionReport.addEventListener("click", showSessionReport);
    el.titleSelect.addEventListener("change", (event) => {
      state.meta.equippedTitle = event.target.value;
      updateUi();
    });
    el.devGold.addEventListener("click", () => {
      if (!devMode) {
        return;
      }
      state.run.gold += 10000;
      updateUi();
    });
    el.devZone.addEventListener("click", () => {
      if (!devMode) {
        return;
      }
      state.run.zone += 1;
      spawnMonster(false);
      updateUi();
    });
    el.devBoss.addEventListener("click", () => {
      if (!devMode) {
        return;
      }
      spawnMonster(true);
      updateUi();
    });
    el.exportSave.addEventListener("click", () => {
      if (!devMode) {
        return;
      }
      openSaveModal();
    });
    el.importSave.addEventListener("click", () => {
      if (!devMode) {
        return;
      }
      el.saveModal.classList.add("active");
    });
    el.runTests.addEventListener("click", () => {
      if (!devMode) {
        return;
      }
      runUiTests();
    });
    if (el.copyErrors) {
      el.copyErrors.addEventListener("click", () => {
        if (!devMode) {
          return;
        }
        const text = errorLog.join("\n");
        if (!text) {
          return;
        }
        navigator.clipboard?.writeText(text).catch(() => {
          el.saveText.value = text;
          el.saveModal.classList.add("active");
        });
      });
    }
    el.clickCheck.addEventListener("click", () => {
      clickCheckEnabled = !clickCheckEnabled;
      updateSettingsButtons();
    });
    el.saveCopy.addEventListener("click", copySaveText);
    el.saveApply.addEventListener("click", applySaveImport);
    el.saveClose.addEventListener("click", () => el.saveModal.classList.remove("active"));
    el.sessionClose.addEventListener("click", () => el.sessionModal.classList.remove("active"));
    el.save.addEventListener("click", () => {
      saveGame();
      updateUi();
    });
    el.reset.addEventListener("click", resetGame);
    el.offlineClose.addEventListener("click", () => {
      el.offlineModal.classList.remove("active");
    });
    if (el.sfxVolume) {
      el.sfxVolume.addEventListener("input", (event) => {
        setSfxVolume(event.target.value);
      });
    }

    document.addEventListener("click", onGlobalClick, true);
    document.addEventListener("dblclick", onGlobalDblClick, true);
    document.addEventListener("mousemove", handleTooltipMove);
    document.addEventListener("mouseleave", hideTooltip);
    window.addEventListener("error", (event) => {
      if (!devMode) {
        return;
      }
      pushError(`${event.message || "Error"} @ ${event.filename || "unknown"}:${event.lineno || 0}`);
    });
    window.addEventListener("unhandledrejection", (event) => {
      if (!devMode) {
        return;
      }
      const reason = event.reason && event.reason.message ? event.reason.message : String(event.reason || "Promise");
      pushError(`Promise: ${reason}`);
    });
    startIntervals();
  }

  window.addEventListener("beforeunload", saveGame);
  init();
})();
