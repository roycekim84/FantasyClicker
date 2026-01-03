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
  const COMBO_WINDOW_MS = 850;
  const WEAK_POINT_MIN_MS = 1200;
  const WEAK_POINT_MAX_MS = 2200;

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
    comboDisplay: document.getElementById("combo-display"),
    eventBanner: document.getElementById("event-banner"),
    eventName: document.getElementById("event-name"),
    eventTimer: document.getElementById("event-timer"),
    monster: document.getElementById("monster"),
    monsterArea: document.getElementById("monster-area"),
    weakPoint: document.getElementById("weak-point"),
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
    sessionReport: document.getElementById("session-report"),
    equippedWeaponName: document.getElementById("equipped-weapon-name"),
    equippedWeaponStat: document.getElementById("equipped-weapon-stat"),
    unequipWeapon: document.getElementById("unequip-weapon"),
    equippedRelicName: document.getElementById("equipped-relic-name"),
    equippedRelicStat: document.getElementById("equipped-relic-stat"),
    unequipRelic: document.getElementById("unequip-relic"),
    equippedRuneName: document.getElementById("equipped-rune-name"),
    equippedRuneStat: document.getElementById("equipped-rune-stat"),
    unequipRune: document.getElementById("unequip-rune"),
    inventoryList: document.getElementById("inventory-list"),
    runeShopList: document.getElementById("rune-shop-list"),
    runeRefresh: document.getElementById("rune-refresh"),
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
    logList: document.getElementById("log-list"),
    devPanel: document.getElementById("dev-panel"),
    devInfo: document.getElementById("dev-info"),
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
    tutorialBox: document.getElementById("tutorial-box"),
    tutorialTitle: document.getElementById("tutorial-title"),
    tutorialText: document.getElementById("tutorial-text"),
    tutorialNext: document.getElementById("tutorial-next"),
    tutorialSkip: document.getElementById("tutorial-skip"),
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
        tutorialStep: 0,
        tutorialDone: false,
        tutorialClicks: 0,
        tutorialSkillUsed: false,
        tutorialRunesOpened: false,
        tutorialRuneBought: false,
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
    const event = includeEvent ? getEventState() : null;
    const comboBonus = getComboBonusPercent();
    const base = Math.max(1, state.run.clickDamageBase + equip.click);
    const clickPct = 1 + rune.clickPct / 100 + comboBonus / 100 + (event && event.id === "frenzy" ? 1 : 0);
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
    return equip.gold + rune.goldPct + getCollectionBonusPercent() + eventGold + skillGold;
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
    if (state.run.monsterHp <= 0) {
      return;
    }

    const monsterType = getMonsterType(state.run.monsterTypeId);
    if (!isWeak && monsterType.dodge > 0 && chance(monsterType.dodge)) {
      addFloatingText(t("ui.miss"), "miss");
      hitEffects();
      addLog(t("log.runnerDodge"));
      return;
    }

    registerCombo();
    state.ui.tutorialClicks += 1;

    const critChance = getEffectiveCritChance();
    const isCrit = Math.random() < critChance;
    let damage = getEffectiveClickDamage(true);
    damage = Math.floor(damage * getBossDamageMultiplier() * getTypeDamageMultiplier());
    damage = isCrit ? Math.floor(damage * getEffectiveCritMultiplier()) : damage;

    dealDamage(damage, isCrit ? "crit" : "");
    hitEffects();

    state.meta.lifetimeClickDamage += damage;
    updateQuests("click_damage", damage);

    if (isCrit) {
      state.meta.lifetimeCrits += 1;
      updateQuests("crit", 1);
    }

    if (isWeak) {
      const weakBase = getEffectiveClickDamage(true);
      const weakMultiplier = state.run.isChapterBoss ? 1.25 : 2.5;
      const weakDamage = Math.floor(weakBase * weakMultiplier);
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
      addFloatingText(`+${formatNumber(bonusGold)} ${t("ui.gold")}`, "weak");
      addLog(t("log.weakHit"));
    }

    updateTutorial();
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
      dealDamage(damage, "");
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
    return `${prefix} ${base}`.trim();
  }

  function getRuneName(rune) {
    const rarity = t(`rarity.${rune.rarity.toLowerCase()}`);
    return `${rarity} ${t(rune.effectLabelKey)}`.trim();
  }

  function updateInventoryUi() {
    const weapon = getEquippedWeapon();
    if (weapon) {
      el.equippedWeaponName.textContent = `${getItemName(weapon)} (${t(`rarity.${weapon.rarity.toLowerCase()}`)})`;
      el.equippedWeaponName.className = `equipped-name rarity-${weapon.rarity.toLowerCase()}`;
      el.equippedWeaponStat.textContent = describeItemStat(weapon);
      el.unequipWeapon.disabled = false;
    } else {
      el.equippedWeaponName.textContent = t("ui.none");
      el.equippedWeaponName.className = "equipped-name";
      el.equippedWeaponStat.textContent = t("ui.noBonus");
      el.unequipWeapon.disabled = true;
    }

    const relic = getEquippedRelic();
    if (relic) {
      el.equippedRelicName.textContent = `${getItemName(relic)} (${t(`rarity.${relic.rarity.toLowerCase()}`)})`;
      el.equippedRelicName.className = `equipped-name rarity-${relic.rarity.toLowerCase()}`;
      el.equippedRelicStat.textContent = describeItemStat(relic);
      el.unequipRelic.disabled = false;
    } else {
      el.equippedRelicName.textContent = t("ui.none");
      el.equippedRelicName.className = "equipped-name";
      el.equippedRelicStat.textContent = t("ui.noBonus");
      el.unequipRelic.disabled = true;
    }

    const rune = getEquippedRune();
    if (rune && relic) {
      el.equippedRuneName.textContent = `${t("ui.rune")}: ${getRuneName(rune)} (${t(`rarity.${rune.rarity.toLowerCase()}`)})`;
      el.equippedRuneName.className = `equipped-name rarity-${rune.rarity.toLowerCase()}`;
      el.equippedRuneStat.textContent = describeRuneStat(rune);
      el.unequipRune.disabled = false;
    } else if (!relic) {
      el.equippedRuneName.textContent = `${t("ui.rune")}: ${t("ui.none")}`;
      el.equippedRuneName.className = "equipped-name";
      el.equippedRuneStat.textContent = t("ui.needRelicRune");
      el.unequipRune.disabled = true;
    } else {
      el.equippedRuneName.textContent = `${t("ui.rune")}: ${t("ui.none")}`;
      el.equippedRuneName.className = "equipped-name";
      el.equippedRuneStat.textContent = t("ui.noRune");
      el.unequipRune.disabled = true;
    }

    el.inventoryList.innerHTML = "";
    state.run.inventory.forEach((item) => {
      const wrap = document.createElement("div");
      wrap.className = "item";

      const name = document.createElement("div");
      name.className = `name rarity-${item.rarity.toLowerCase()}`;
      name.textContent = `${getItemName(item)} (${t(`rarity.${item.rarity.toLowerCase()}`)})`;

      const stat = document.createElement("div");
      stat.className = "stat";
      stat.textContent = `${t(`ui.${item.slot}Slot`)} | ${describeItemStat(item)}`;

      const button = document.createElement("button");
      button.className = "small";
      const isEquipped =
        (item.slot === "weapon" && item.id === state.run.equippedWeaponId) ||
        (item.slot === "relic" && item.id === state.run.equippedRelicId);
      button.textContent = isEquipped ? t("ui.equipped") : t("ui.equip");
      button.disabled = isEquipped;
      button.dataset.action = "equip-item";
      button.dataset.itemId = item.id;
      button.dataset.test = "equip-item";

      wrap.appendChild(name);
      wrap.appendChild(stat);
      wrap.appendChild(button);
      el.inventoryList.appendChild(wrap);
    });
    dirty.inventory = false;
  }

  function updateRuneUi() {
    el.runeShopList.innerHTML = "";
    state.run.runeShop.forEach((rune) => {
      const wrap = document.createElement("div");
      wrap.className = "rune-card";

      const name = document.createElement("div");
      name.className = `name rarity-${rune.rarity.toLowerCase()}`;
      name.textContent = getRuneName(rune);

      const stat = document.createElement("div");
      stat.className = "stat";
      stat.textContent = describeRuneStat(rune);

      const row = document.createElement("div");
      row.className = "rune-row";

      const button = document.createElement("button");
      button.className = "small";
      button.textContent = t("ui.buy");
      button.disabled = state.run.gold < rune.cost || state.run.runes.length >= RUNE_MAX;
      button.dataset.action = "buy-rune";
      button.dataset.runeOfferId = rune.id;
      button.dataset.test = "rune-buy";

      const cost = document.createElement("div");
      cost.className = "stat";
      cost.textContent = `${formatNumber(rune.cost)} ${t("ui.gold")}`;

      row.appendChild(cost);
      row.appendChild(button);

      wrap.appendChild(name);
      wrap.appendChild(stat);
      wrap.appendChild(row);
      el.runeShopList.appendChild(wrap);
    });

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
      const wrap = document.createElement("div");
      wrap.className = "rune-card";

      const name = document.createElement("div");
      name.className = `name rarity-${rune.rarity.toLowerCase()}`;
      name.textContent = getRuneName(rune);

      const badge = document.createElement("div");
      if (rune.id === socketedId) {
        badge.className = "rune-badge";
        badge.textContent = t("ui.socketed");
      }

      const stat = document.createElement("div");
      stat.className = "stat";
      stat.textContent = describeRuneStat(rune);

      const row = document.createElement("div");
      row.className = "rune-row";

      const button = document.createElement("button");
      button.className = "small";
      button.textContent = rune.id === state.run.equippedRuneId ? t("ui.socketed") : t("ui.socket");
      button.disabled = rune.id === state.run.equippedRuneId || !getEquippedRelic();
      button.dataset.action = "socket-rune";
      button.dataset.runeId = rune.id;
      button.dataset.test = "rune-socket";

      wrap.appendChild(name);
      if (badge.textContent) {
        wrap.appendChild(badge);
      }
      wrap.appendChild(stat);
      row.appendChild(document.createElement("div"));
      row.appendChild(button);
      wrap.appendChild(row);
      el.runeInventoryList.appendChild(wrap);
    });

    const refreshCost = state.run.freeRuneRefreshUsed ? RUNE_REFRESH_COST : 0;
    el.runeRefresh.textContent =
      refreshCost === 0 ? t("ui.refreshFree") : t("ui.refreshCost", { cost: formatNumber(refreshCost) });
    el.runeRefresh.disabled = state.run.freeRuneRefreshUsed && state.run.gold < refreshCost;
    dirty.runes = false;
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

  function updateDevUi() {
    if (!devMode) {
      el.devPanel.classList.remove("active");
      return;
    }
    el.devPanel.classList.add("active");
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
    ].join("\n");
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
    updateEventUi();
    updateLogUi();
    updateDevUi();
    updateTutorial();

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

    if (state.run.inventory.length >= INVENTORY_MAX) {
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

    return {
      id: `item-${Date.now()}-${randInt(1000, 9999)}`,
      rarity,
      slot,
      statType,
      statValue,
      setId,
      nameParts: generateItemNameParts(slot),
    };
  }

  function generateItemNameParts(slot) {
    const prefixKey = CONTENT.itemNames.prefixes[randInt(0, CONTENT.itemNames.prefixes.length - 1)];
    const baseKey =
      slot === "weapon"
        ? CONTENT.itemNames.weapons[randInt(0, CONTENT.itemNames.weapons.length - 1)]
        : CONTENT.itemNames.relics[randInt(0, CONTENT.itemNames.relics.length - 1)];
    return { prefixKey, baseKey };
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

  function describeRuneStat(rune) {
    return `${t(rune.effectLabelKey)} ${formatNumber(rune.value)}%`;
  }

  function equipItem(itemId) {
    const item = state.run.inventory.find((entry) => entry.id === itemId);
    if (!item) {
      return;
    }

    if (item.slot === "weapon") {
      state.run.equippedWeaponId = item.id;
      addLog(t("log.equippedWeapon", { name: getItemName(item) }));
    } else {
      state.run.equippedRelicId = item.id;
      addLog(t("log.equippedRelic", { name: getItemName(item) }));
    }
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
    dirty.inventory = true;
    updateUi();
  }

  function generateRune() {
    const rarity = getEquipmentRarity();
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

  function refreshRuneShop(forceFree = false) {
    if (!forceFree && !testMode) {
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
      state.run.runeShop.splice(runeIndex, 1, generateRune());
      dirty.runes = true;
      updateUi();
      state.ui.tutorialRuneBought = true;
      updateTutorial();
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
    addLog(t("log.socketedRune", { name: getRuneName(rune) }));
    dirty.runes = true;
    updateUi();
  }

  function removeRune() {
    if (!state.run.equippedRuneId) {
      return;
    }
    const rune = getEquippedRune();
    state.run.equippedRuneId = null;
    if (rune) {
      addLog(t("log.removedRune", { name: getRuneName(rune) }));
    }
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

    state.run = { ...defaults.run, ...data.run };
    state.run.skills = { ...defaults.run.skills, ...state.run.skills };

    state.upgrades = { ...defaults.upgrades, ...data.upgrades };
    Object.keys(state.upgrades).forEach((key) => {
      state.upgrades[key].baseCost = defaults.upgrades[key].baseCost;
      state.upgrades[key].level = Math.max(0, state.upgrades[key].level || 0);
    });

    state.session = { ...defaults.session, ...data.session };
    state.sessionHistory = Array.isArray(data.sessionHistory) ? data.sessionHistory : [];
    state.log = Array.isArray(data.log) ? data.log : [];

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
    state.run.inventory = state.run.inventory.slice(0, INVENTORY_MAX);
    state.run.inventory.forEach((item) => {
      if (!item.slot) {
        item.slot = item.statType === "click" || item.statType === "critMult" ? "weapon" : "relic";
      }
      if (!item.nameParts) {
        item.nameParts = generateItemNameParts(item.slot);
      }
    });
    if (!state.run.inventory.find((item) => item.id === state.run.equippedRelicId)) {
      state.run.equippedRelicId = null;
    }
    if (!state.run.inventory.find((item) => item.id === state.run.equippedWeaponId)) {
      state.run.equippedWeaponId = null;
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

    ensureQuests();
    ensureWeeklyQuest();
    ensureChainQuest();
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

      if (data.session) {
        state.session = { ...defaults.session, ...data.session };
      }
      if (Array.isArray(data.sessionHistory)) {
        state.sessionHistory = data.sessionHistory;
      }
      state.log = Array.isArray(data.log) ? data.log : [];

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
      state.run.inventory = state.run.inventory.slice(0, INVENTORY_MAX);
      state.run.inventory.forEach((item) => {
        if (!item.slot) {
          item.slot = item.statType === "click" || item.statType === "critMult" ? "weapon" : "relic";
        }
        if (!item.nameParts) {
          item.nameParts = generateItemNameParts(item.slot);
        }
      });
      if (!state.run.inventory.find((item) => item.id === state.run.equippedRelicId)) {
        state.run.equippedRelicId = null;
      }
      if (!state.run.inventory.find((item) => item.id === state.run.equippedWeaponId)) {
        state.run.equippedWeaponId = null;
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

  function initTabs() {
    const buttons = Array.from(document.querySelectorAll(".tab-button"));
    const panels = Array.from(document.querySelectorAll(".tab-panel"));

    const setActive = (tab) => {
      buttons.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.tab === tab));
      panels.forEach((panel) =>
        panel.classList.toggle("is-active", panel.dataset.tabPanel === tab)
      );
      if (tab === "runes") {
        state.ui.tutorialRunesOpened = true;
      }
      updateTutorial();
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
    if (state.run.monsterHp <= 0) {
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
      if (action === "equip-item") {
        equipItem(button.dataset.itemId);
      } else if (action === "unequip-weapon") {
        unequipWeapon();
      } else if (action === "unequip-relic") {
        unequipRelic();
      } else if (action === "unequip-rune") {
        removeRune();
      } else if (action === "buy-rune") {
        buyRune(button.dataset.runeOfferId);
      } else if (action === "refresh-rune-shop") {
        refreshRuneShop(false);
      } else if (action === "socket-rune") {
        socketRune(button.dataset.runeId);
      } else if (action === "claim-quest") {
        claimQuest(button.dataset.questId);
      } else if (action === "reroll-quest") {
        rerollQuests();
      } else if (action === "set-lang") {
        setLang(button.dataset.lang);
      } else if (action === "set-numfmt") {
        setNumFormat(button.dataset.value);
      } else if (action === "set-reducedfx") {
        setReducedFx(button.dataset.value === "on");
      } else if (action === "toggle-compact") {
        setCompactMode(!state.ui.compact);
      } else if (action === "toggle-dev") {
        toggleDevMode();
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

  function runUiTests() {
    testMode = true;
    const snapshot = JSON.parse(JSON.stringify(state));

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
      state.run.runeShop = [generateRune(), generateRune(), generateRune(), generateRune()];
    }
    if (state.run.quests.length === 0) {
      state.run.quests = [createQuest(), createQuest(), createQuest()];
    }
    state.run.quests[0].completed = true;
    ensureWeeklyQuest();
    if (state.run.weeklyQuest) {
      state.run.weeklyQuest.completed = true;
    }

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

    document.addEventListener("click", onGlobalClick, true);
    startIntervals();
  }

  window.addEventListener("beforeunload", saveGame);
  init();
})();
