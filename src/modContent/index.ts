import type { CombatEntity, CombatStep, CraftingResult, CraftingStep, DualCultivationStep, EventStep, EnemyEntity, FightCharacterStep, ModAPI, ModOptionsFC, RootState } from 'afnm-types';

import previewImageUrl from './AuspiciousChart.jpg';

type AuspiciousDaysConfig = {
  enabled: boolean;
  numerologyBase: 'date' | 'character';
};

const MOD_TAG = `[${MOD_METADATA.name}]`;
const ENABLED_FLAG_KEY = `${MOD_METADATA.name}.enabled`;
const NUMEROLOGY_BASE_FLAG_KEY = `${MOD_METADATA.name}.numerologyBase`;

let lastKnownLocation: string | null = null;

function log(message: string, ...args: unknown[]) {
  console.log(MOD_TAG, message, ...args);
}

function getSnapshot(): RootState | null {
  return window.modAPI?.getGameStateSnapshot?.() ?? null;
}

function getGlobalFlags(): Record<string, number> {
  return window.modAPI?.actions?.getGlobalFlags?.() ?? {};
}

function getConfig(): AuspiciousDaysConfig {
  const flags = getGlobalFlags();
  return {
    enabled: (flags[ENABLED_FLAG_KEY] ?? 1) !== 0,
    numerologyBase: (flags[NUMEROLOGY_BASE_FLAG_KEY] ?? 0) === 0 ? 'date' : 'character',
  };
}

function setEnabled(enabled: boolean): AuspiciousDaysConfig {
  window.modAPI?.actions?.setGlobalFlag?.(ENABLED_FLAG_KEY, enabled ? 1 : 0);
  return getConfig();
}

function setNumerologyBase(base: 'date' | 'character'): AuspiciousDaysConfig {
  window.modAPI?.actions?.setGlobalFlag?.(NUMEROLOGY_BASE_FLAG_KEY, base === 'date' ? 0 : 1);
  return getConfig();
}

function ensureDefaultConfig() {
  const flags = getGlobalFlags();
  if (flags[ENABLED_FLAG_KEY] === undefined) {
    window.modAPI?.actions?.setGlobalFlag?.(ENABLED_FLAG_KEY, 1);
  }
  if (flags[NUMEROLOGY_BASE_FLAG_KEY] === undefined) {
    window.modAPI?.actions?.setGlobalFlag?.(NUMEROLOGY_BASE_FLAG_KEY, 0); // default to 'date'
  }
}

// Sum digits from a numeric string, ignoring any non-digit characters.
function sumDigitsFromString(source: string): number {
  return String(source)
    .split('')
    .filter((char) => /\d/.test(char))
    .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
}

function padValue(value: number, width: number) {
  return String(value).padStart(width, '0');
}

function normalizeNumerologyFactor(value: number): number {
  while (value > 50) {
    value = sumDigitsFromString(String(value));
  }
  return Math.max(1, value);
}

function calculateNumerologyFactorFromDate(calendar: { day: number; month: number; year: number }): number {
  const month = padValue(calendar.month, 2);
  const day = padValue(calendar.day, 2);
  const year = padValue(calendar.year, 4);
  return sumDigitsFromString(`${month}${day}${year}`);
}

function getNumerologyBase(snapshot: RootState | null, config: AuspiciousDaysConfig): number {
  if (!snapshot) return 1;

  if (config.numerologyBase === 'date') {
    const calendar = snapshot.calendar;
    if (calendar) {
      return calculateNumerologyFactorFromDate(calendar);
    }
  } else {
    const player = (snapshot as any).player?.player;
    if (player) {
      const level = player.level || player.currentLevel || 1;
      const realm = player.realm || player.currentRealm || 0;
      const progress = player.progress || player.realmProgress || 0;
      const digits = `${padValue(level, 2)}${padValue(realm, 2)}${padValue(progress, 2)}`;
      return sumDigitsFromString(digits);
    }
  }

  return 1; // fallback
}

type AffectedStatBonuses = {
  power: number;
  artifactPower: number;
  critChance: number;
  armor: number;
  travelSpeed: number;
  explorationSpeed: number;
  qiAbsorption: number;
  charisma: number;
  qiControl: number;
  qiIntensity: number;
  craftingCritChance: number;
};

type StatModifiers = AffectedStatBonuses & {
  luck: number;
  crafting: number;
  damageReduction: number;
  globalModifier: number;
};

type CombatStatAdjustment = {
  label: string;
  statKey: 'power' | 'artefactpower' | 'critchance' | 'defense';
  base: number;
  final: number;
  modifier: number;
};

type CombatModifierCache = {
  baseValue: number;
  numerologyFactor: number;
  level: AuspiciousnessLevel;
  globalModifier: number;
  modifiers: StatModifiers;
  adjustments: CombatStatAdjustment[];
  buffNames: string;
};

let lastCombatModifierCache: CombatModifierCache | null = null;

function formatModifierValue(value: number) {
  return `${value >= 0 ? '+' : ''}${value}%`;
}

function getCombatStatAdjustments(entity: CombatEntity, modifiers: StatModifiers): CombatStatAdjustment[] {
  const stats = [
    { statKey: 'power' as const, label: 'Power', modifier: modifiers.power },
    { statKey: 'artefactpower' as const, label: 'Artifact Power', modifier: modifiers.artifactPower },
    { statKey: 'critchance' as const, label: 'Crit Chance', modifier: modifiers.critChance },
    { statKey: 'defense' as const, label: 'Defense', modifier: modifiers.armor },
  ];

  return stats.map(({ statKey, label, modifier }) => {
    const base = entity.stats[statKey];
    const final = Math.max(0, Math.round(base * (1 + modifier / 100)));
    return { label, statKey, base, final, modifier };
  });
}

function getBuffNames(buffs: unknown[] | undefined) {
  if (!Array.isArray(buffs) || buffs.length === 0) {
    return 'none';
  }

  return buffs
    .map((buff: any) => buff?.name ?? buff?.id ?? 'unknown')
    .filter(Boolean)
    .join(', ') || 'none';
}

function applyCombatStatModifiers(playerState: CombatEntity, modifiers: StatModifiers) {
  const adjustments = getCombatStatAdjustments(playerState, modifiers);
  for (const adjustment of adjustments) {
    playerState.stats[adjustment.statKey] = adjustment.final;
  }
  return adjustments;
}

function getAuspiciousnessLevelModifier(level: AuspiciousnessLevel) {
  switch (level) {
    case 'Very Auspicious':
      return 10;
    case 'Auspicious':
      return 5;
    case 'Quite Auspicious':
      return 2;
    case 'Quite Inauspicious':
      return -1;
    case 'Inauspicious':
      return -3;
    case 'Very Inauspicious':
      return -7;
    default:
      return 0;
  }
}

function getAuspiciousnessStatBonuses(level: AuspiciousnessLevel): AffectedStatBonuses {
  const bonus = getAuspiciousnessLevelModifier(level);
  return {
    power: bonus,
    artifactPower: bonus,
    critChance: bonus,
    armor: bonus,
    travelSpeed: bonus,
    explorationSpeed: bonus,
    qiAbsorption: bonus,
    charisma: bonus,
    qiControl: bonus,
    qiIntensity: bonus,
    craftingCritChance: bonus,
  };
}

function calculateStatModifiers(snapshot: RootState | null, config: AuspiciousDaysConfig): StatModifiers {
  if (!config.enabled || !snapshot) {
    return {
      luck: 0,
      crafting: 0,
      damageReduction: 0,
      globalModifier: 0,
      ...getAuspiciousnessStatBonuses('Very Inauspicious'),
    };
  }

  const base = getNumerologyBase(snapshot, config);
  const numerologyFactor = normalizeNumerologyFactor(base);
  const level = getAuspiciousnessLevel(numerologyFactor);
  const globalModifier = getAuspiciousnessLevelModifier(level);
  const bonuses = getAuspiciousnessStatBonuses(level);

  switch (level) {
    case 'Very Auspicious':
      return {
        luck: 7,
        crafting: 5,
        damageReduction: 4,
        globalModifier,
        ...bonuses,
      };
    case 'Auspicious':
      return {
        luck: 5,
        crafting: 3,
        damageReduction: 2,
        globalModifier,
        ...bonuses,
      };
    case 'Quite Auspicious':
      return {
        luck: 3,
        crafting: 2,
        damageReduction: 1,
        globalModifier,
        ...bonuses,
      };
    case 'Very Inauspicious':
      return {
        luck: 0,
        crafting: 0,
        damageReduction: 0,
        globalModifier,
        ...bonuses,
      };
    case 'Inauspicious':
      return {
        luck: 0,
        crafting: 0,
        damageReduction: 0,
        globalModifier,
        ...bonuses,
      };
    case 'Quite Inauspicious':
      return {
        luck: 0,
        crafting: 0,
        damageReduction: 0,
        globalModifier,
        ...bonuses,
      };
    default:
      return {
        luck: 0,
        crafting: 0,
        damageReduction: 0,
        globalModifier: 0,
        ...getAuspiciousnessStatBonuses('Very Inauspicious'),
      };
  }
}

function updateLastKnownLocation(snapshot: RootState | null) {
  lastKnownLocation = snapshot?.location?.current ?? null;
}

function createTextElement(
  createElement: (...args: unknown[]) => unknown,
  type: string,
  key: string,
  text: string,
  style: Record<string, string | number> = {},
) {
  return createElement(type, { key, style }, text);
}

const AuspiciousDaysOptions: ModOptionsFC = ({ api }) => {
  const ReactRuntime = window.React;

  if (
    !ReactRuntime?.createElement ||
    !ReactRuntime.useEffect ||
    !ReactRuntime.useState
  ) {
    throw new Error('React runtime unavailable for options UI');
  }

  const createElement = ReactRuntime.createElement.bind(ReactRuntime);
  const [config, setConfig] = ReactRuntime.useState<AuspiciousDaysConfig>(getConfig());
  const GameButton = api.components.GameButton ?? 'button';

  ReactRuntime.useEffect(() => {
    setConfig(getConfig());
  }, []);

  const updateEnabled = (enabled: boolean) => {
    setConfig(setEnabled(enabled));
  };

  const updateNumerologyBase = (base: 'date' | 'character') => {
    setConfig(setNumerologyBase(base));
  };

  const snapshot = getSnapshot();
  const modifiers = calculateStatModifiers(snapshot, config);
  const baseValue = snapshot ? getNumerologyBase(snapshot, config) : 1;
  const numerologyFactor = normalizeNumerologyFactor(baseValue);
  const numerologyLabel = getAuspiciousnessLevel(numerologyFactor);
  const globalModifier = modifiers.globalModifier;

  return createElement(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '8px 4px 4px',
      },
    },
    [
      createTextElement(
        createElement,
        'div',
        'title',
        `${MOD_METADATA.name} Settings`,
        {
          fontWeight: 700,
          fontSize: '1.1rem',
        },
      ),
      createTextElement(
        createElement,
        'div',
        'description',
        'This mod applies stat bonuses based on numerology calculations. The date base sums every digit in the year, month, and day to form the numerology factor. Effect summaries are also added to combat, crafting, and dual cultivation logs.',
        {
          lineHeight: 1.45,
          opacity: 0.9,
        },
      ),
      createElement(
        'div',
        {
          key: 'current-stats',
          style: {
            backgroundColor: 'rgba(0,0,0,0.1)',
            padding: '8px',
            borderRadius: '4px',
          },
        },
        [
          createTextElement(
            createElement,
            'div',
            'numerology-info',
            `Current Numerology Factor: ${numerologyFactor} (base: ${baseValue})`,
            { fontWeight: 600 },
          ),
          createTextElement(
            createElement,
            'div',
            'modifiers',
            `Level: ${numerologyLabel} | Luck: +${modifiers.luck}% | Crafting: +${modifiers.crafting}% | Damage Reduction: +${modifiers.damageReduction}% | Global: ${globalModifier > 0 ? '+' : ''}${globalModifier}%`,
            { fontSize: '0.9rem', opacity: 0.8 },
          ),
        ],
      ),
      createElement(
        'div',
        {
          key: 'base-setting',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          },
        },
        [
          createTextElement(
            createElement,
            'div',
            'base-label',
            'Numerology Base:',
            { fontWeight: 600 },
          ),
          createElement(
            'div',
            {
              key: 'base-buttons',
              style: {
                display: 'flex',
                gap: '8px',
              },
            },
            [
              createElement(
                GameButton,
                {
                  key: 'date-base',
                  onClick: () => updateNumerologyBase('date'),
                },
                config.numerologyBase === 'date' ? '✓ Date' : 'Date',
              ),
              createElement(
                GameButton,
                {
                  key: 'character-base',
                  onClick: () => updateNumerologyBase('character'),
                },
                config.numerologyBase === 'character' ? '✓ Character' : 'Character',
              ),
            ],
          ),
        ],
      ),
      createElement(
        'div',
        {
          key: 'actions',
          style: {
            display: 'flex',
            gap: '12px',
          },
        },
        [
          createElement(
            GameButton,
            {
              key: 'enable',
              onClick: () => updateEnabled(true),
            },
            config.enabled ? 'Enabled' : 'Enable Mod',
          ),
          createElement(
            GameButton,
            {
              key: 'disable',
              onClick: () => updateEnabled(false),
            },
            config.enabled ? 'Disable Mod' : 'Disabled',
          ),
        ],
      ),
      createTextElement(
        createElement,
        'div',
        'footer',
        'Date base uses current game calendar. Character base uses player attributes. Modifiers update dynamically based on the calculated numerology number.',
        {
          lineHeight: 1.45,
          opacity: 0.8,
          fontSize: '0.85rem',
        },
      ),
    ],
  );
};

function installDebugApi() {
  window.__afnmModDebug ??= {};
  window.__afnmModDebug[MOD_METADATA.name] = {
    getMetadata: () => ({ ...MOD_METADATA }),
    getConfig,
    getLastLocation: () => lastKnownLocation,
    getSnapshot,
    getStatModifiers: () => calculateStatModifiers(getSnapshot(), getConfig()),
    logSnapshot: () => {
      log('Snapshot', getSnapshot());
    },
  };
}

function registerOptionsUi(modApi: ModAPI) {
  modApi.actions?.registerOptionsUI?.(AuspiciousDaysOptions);
}

type AuspiciousnessLevel =
  | 'Very Auspicious'
  | 'Auspicious'
  | 'Quite Auspicious'
  | 'Very Inauspicious'
  | 'Inauspicious'
  | 'Quite Inauspicious';

const auspiciousnessBuckets: Record<AuspiciousnessLevel, readonly number[]> = {
  'Very Auspicious': [1,3,5,11,13,15,16,21,23,24,29,31,33,39,41,47,48],
  'Auspicious': [6,7,8,17,18,25,32,35,37,45],
  'Quite Auspicious': [38],
  'Very Inauspicious': [9,10,14,19,20,28,34,36,44,46],
  'Inauspicious': [2,4,22],
  'Quite Inauspicious': [12,26,27,30,40,42,43,49,50],
};

const auspiciousnessLookup = new Map<number, AuspiciousnessLevel>(
  Object.entries(auspiciousnessBuckets).flatMap(([level, values]) =>
    values.map((value) => [value, level as AuspiciousnessLevel] as [number, AuspiciousnessLevel]),
  ),
);

function getAuspiciousnessLevel(factor: number): AuspiciousnessLevel {
  const normalized = normalizeNumerologyFactor(factor);
  const explicitLevel = auspiciousnessLookup.get(normalized);
  if (explicitLevel) return explicitLevel;

  // Fallback when the factor is not explicitly mapped.
  if (normalized <= 14) return 'Very Auspicious';
  if (normalized <= 27) return 'Auspicious';
  if (normalized <= 40) return 'Quite Auspicious';
  if (normalized <= 53) return 'Very Inauspicious';
  if (normalized <= 66) return 'Inauspicious';
  return 'Quite Inauspicious';
}

function getAuspiciousnessBadgeColor(level: string) {
  switch (level) {
    case 'Very Auspicious':
      return '#ffb3d9';
    case 'Auspicious':
      return '#ff80bf';
    case 'Quite Auspicious':
      return '#ffb3ff';
    case 'Very Inauspicious':
      return '#9e9e9e';
    case 'Inauspicious':
      return '#bdbdbd';
    case 'Quite Inauspicious':
      return '#e0e0e0';
    default:
      return '#ffffff';
  }
}

function getAuspiciousnessCalculationSteps(
  snapshot: RootState | null,
  config: AuspiciousDaysConfig,
  title: string,
  adjustments?: CombatStatAdjustment[],
) {
  if (!config.enabled || !snapshot) {
    return [];
  }

  const modifiers = calculateStatModifiers(snapshot, config);
  const baseValue = getNumerologyBase(snapshot, config);
  const numerologyFactor = normalizeNumerologyFactor(baseValue);
  const level = getAuspiciousnessLevel(numerologyFactor);

  const lines = [
    title,
    `Numerology: base ${baseValue} → normalized ${numerologyFactor} → ${level}`,
    `Modifiers: Global ${formatModifierValue(modifiers.globalModifier)}, Crafting ${formatModifierValue(modifiers.crafting)}, Luck ${formatModifierValue(modifiers.luck)}, Damage reduction ${modifiers.damageReduction}%`,
  ];

  if (adjustments?.length) {
    lines.push(...adjustments.map((adjustment) =>
      `${adjustment.label}: ${adjustment.base} → ${adjustment.final} (${formatModifierValue(adjustment.modifier)})`,
    ));
  }

  return lines.map((line, index) => createTextEventStep(line));
}

function formatCalendarDate(calendar: { day: number; month: number; year: number }) {
  return `${padValue(calendar.year, 4)}-${padValue(calendar.month, 2)}-${padValue(calendar.day, 2)}`;
}

function createTextEventStep(text: string): EventStep {
  return {
    kind: 'text',
    text,
  };
}

function getAuspiciousDaysSummary(snapshot: RootState | null, config: AuspiciousDaysConfig) {
  if (!config.enabled || !snapshot) {
    return '';
  }

  const modifiers = calculateStatModifiers(snapshot, config);
  const baseValue = getNumerologyBase(snapshot, config);
  const numerologyFactor = normalizeNumerologyFactor(baseValue);
  const level = getAuspiciousnessLevel(numerologyFactor);
  const parts = [`${level.charAt(0).toUpperCase() + level.slice(1)} (${numerologyFactor})`];

  if (modifiers.damageReduction) {
    parts.push(`Damage reduction ${modifiers.damageReduction}%`);
  }
  if (modifiers.crafting) {
    parts.push(`Crafting ${formatModifierValue(modifiers.crafting)}`);
  }
  if (modifiers.luck) {
    parts.push(`Luck ${formatModifierValue(modifiers.luck)}`);
  }
  if (modifiers.globalModifier) {
    parts.push(`Global ${formatModifierValue(modifiers.globalModifier)}`);
  }

  return parts.join(' · ');
}

function getDualCultivationEffectSummary(snapshot: RootState | null, config: AuspiciousDaysConfig) {
  if (!config.enabled || !snapshot) {
    return '';
  }

  const modifiers = calculateStatModifiers(snapshot, config);
  const successBonus = Math.max(0, modifiers.crafting + modifiers.globalModifier);
  const criticalBonus = Math.max(0, modifiers.critChance + modifiers.globalModifier);
  const baseValue = getNumerologyBase(snapshot, config);
  const numerologyFactor = normalizeNumerologyFactor(baseValue);
  const level = getAuspiciousnessLevel(numerologyFactor);

  const pieces = [`${level.charAt(0).toUpperCase() + level.slice(1)}`];
  if (successBonus) {
    pieces.push(`Dual cultivation success +${successBonus}%`);
  }
  if (criticalBonus) {
    pieces.push(`Critical chance +${criticalBonus}%`);
  }
  if (modifiers.globalModifier && !successBonus && !criticalBonus) {
    pieces.push(`Global modifier ${modifiers.globalModifier > 0 ? '+' : ''}${modifiers.globalModifier}%`);
  }

  return pieces.join(' · ');
}

function registerSnapshotListener(modApi: ModAPI) {
  updateLastKnownLocation(modApi.getGameStateSnapshot?.() ?? null);

  modApi.subscribe?.(() => {
    updateLastKnownLocation(modApi.getGameStateSnapshot?.() ?? null);
  });
}
// Inject UI elements directly into the page as an overlay, instead of using the game's React runtime. This avoids potential conflicts and ensures the HUD renders reliably.
function registerDrawerOverlay(modApi: ModAPI) {
  if (typeof document === 'undefined' || !document.body) return;

  const rootId = `${MOD_METADATA.name}-drawer`;
  if (document.getElementById(rootId)) return;

  // Official AFNM Theme Palette
  const GAME_UI = {
    panelBg: 'linear-gradient(180deg, rgba(26, 19, 12, 0.98) 0%, rgba(15, 10, 5, 1) 100%)',
    borderPrimary: '#a67c52',
    borderAccent: '#f7e3b3',
    textMain: '#f5efd7'
  };

  const root = document.createElement('div');
  root.id = rootId;
  Object.assign(root.style, {
    position: 'fixed',
    top: '120px',
    left: '16px',
    zIndex: '9999', // Ensures it acts as a true global overlay
    pointerEvents: 'auto',
  });

  const panel = document.createElement('div');
  Object.assign(panel.style, {
    background: GAME_UI.panelBg,
    border: `1px solid ${GAME_UI.borderPrimary}`,
    boxShadow: '0 8px 32px rgba(0,0,0,0.8), inset 0 0 15px rgba(166, 124, 82, 0.1)',
    borderRadius: '4px',
    padding: '10px 14px',
    minWidth: '160px', // Reduced from 220px so the drawer can shrink
    maxWidth: '260px', // Prevents it from getting too wide
    transition: 'all 0.3s ease',
  });

  const header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px'
  });

  const titleContainer = document.createElement('div');
  Object.assign(titleContainer.style, { flex: '1' });

  // Styling this to look exactly like the game's GameButton
  const toggleButton = document.createElement('button');
  Object.assign(toggleButton.style, {
    background: 'rgba(166, 124, 82, 0.15)',
    border: `1px solid ${GAME_UI.borderPrimary}aa`,
    color: GAME_UI.textMain,
    padding: '3px 10px',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    borderRadius: '2px',
    fontFamily: 'inherit' // <--- Changed from 'system-ui' so it matches the game perfectly
  });

  const content = document.createElement('div');
  let open = false;

  const render = () => {
    const config = getConfig();
    if (!config.enabled) {
      panel.style.display = 'none';
      return;
    }
    panel.style.display = 'block';

    const snapshot = getSnapshot();
    const calendar = snapshot?.calendar;
    const factor = calendar ? calculateNumerologyFactorFromDate(calendar) : 1;
    const normalized = normalizeNumerologyFactor(factor);
    const label = getAuspiciousnessLevel(normalized);
    const color = getAuspiciousnessBadgeColor(label);
    const modifiers = calculateStatModifiers(snapshot, config);

    titleContainer.innerHTML = '';
    content.innerHTML = '';

    if (open) {
      titleContainer.innerHTML = `
        <div style="color: ${GAME_UI.borderAccent}; font-size: 1.05rem; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
          Auspicious Days
        </div>`;

      content.innerHTML = `
        <div style="margin-top: 10px; border-top: 1px solid ${GAME_UI.borderPrimary}44; padding-top: 12px;">
          <div style="position: relative; border: 1px solid ${GAME_UI.borderPrimary}66; border-radius: 2px; overflow: hidden; margin-bottom: 12px; width: 100%;">
            <img src="${previewImageUrl}" style="width: 100%; display: block; filter: sepia(0.2) contrast(1.1);">
          </div>
          <div style="font-size: 0.85rem; color: ${GAME_UI.textMain}; display: flex; flex-direction: column; gap: 5px;">
            <div style="display:flex; justify-content:space-between; opacity: 0.8;">
                <span>Celestial Date</span>
                <span>${calendar ? formatCalendarDate(calendar) : '---'}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
                <span style="color: ${GAME_UI.borderPrimary}">Global Fortune</span>
                <span style="color: ${color}; font-weight: bold;">${modifiers.globalModifier > 0 ? '+' : ''}${modifiers.globalModifier}%</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
                <span style="color: ${GAME_UI.borderPrimary}">Luck</span>
                <span style="color: ${color};">+${modifiers.luck}%</span>
            </div>
          </div>
        </div>`;
      content.style.display = 'block';
      toggleButton.textContent = 'Collapse';
    } else {
      titleContainer.innerHTML = `
        <div style="font-size: 0.85rem; display: flex; align-items: center; white-space: nowrap;">
          <span style="color: ${GAME_UI.borderPrimary}; font-weight: bold; margin-right: 6px; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.8;">STATUS:</span>
          <span style="color: ${color}; font-weight: bold; font-size: 0.9rem; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">${label.toUpperCase()}</span>
        </div>`;
      content.style.display = 'none';
      toggleButton.textContent = 'Expand';
    }
  };
  toggleButton.addEventListener('click', () => {
    open = !open;
    render();
  });

  header.appendChild(titleContainer);
  header.appendChild(toggleButton);
  panel.appendChild(header);
  panel.appendChild(content);
  root.appendChild(panel);
  document.body.appendChild(root);

  render();
  modApi.subscribe?.(() => render());
}

/* Note: The registerInjectedHUD code is currently commented out due to some issues with the React runtime and potential conflicts with the game's UI rendering. It can be revisited and refined in future iterations.
function registerInjectedHUD(modApi: ModAPI) {
  const ReactRuntime = window.React;
  if (!ReactRuntime) {
    log('React runtime not found, skipping HUD injection.');
    return;
  }

  const { createElement, useState, useEffect } = ReactRuntime;

  const AuspiciousHudFC = () => {
    const [open, setOpen] = useState(false);
    const [snapshot, setSnapshot] = useState<RootState | null>(getSnapshot());

    useEffect(() => {
      const unsubscribe = modApi.subscribe?.(() => {
        setSnapshot(getSnapshot());
      });
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }, []);

    const config = getConfig();
    if (!config.enabled) return null;

    const calendar = snapshot?.calendar;
    const factor = calendar ? calculateNumerologyFactorFromDate(calendar) : 1;
    const normalized = normalizeNumerologyFactor(factor);
    const label = getAuspiciousnessLevel(normalized);
    const color = getAuspiciousnessBadgeColor(label);
    const modifiers = calculateStatModifiers(snapshot, config);

    // FIX 1: Safely attempt to extract GameButton from anywhere, fallback to raw string 'button'
    const GameButton = (modApi as any).components?.GameButton ?? 'button';

    return createElement(
      'div',
      {
        style: {
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 9999,
          background: 'linear-gradient(180deg, rgba(26, 19, 12, 0.98) 0%, rgba(15, 10, 5, 1) 100%)',
          border: '1px solid #a67c52',
          boxShadow: '0 8px 32px rgba(0,0,0,0.8), inset 0 0 15px rgba(166, 124, 82, 0.1)',
          borderRadius: '4px',
          padding: '10px 14px',
          minWidth: '220px',
        }
      },
      createElement(
        'div',
        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
        createElement(
          'span',
          { style: { color, fontWeight: 'bold', fontFamily: "'Cinzel', serif" } },
          open ? 'Auspicious Days' : `STATUS: ${label.toUpperCase()}`
        ),
        createElement(
          GameButton,
          {
            onClick: () => setOpen(!open),
            style: { marginLeft: '12px', fontSize: '0.7rem' }
          },
          open ? 'Collapse' : 'Expand'
        )
      ),
      open ? createElement(
        'div',
        { style: { marginTop: '10px', borderTop: '1px solid #a67c5244', paddingTop: '10px' } },
        createElement(
          'div', 
          { style: { color: '#f5efd7', fontSize: '0.85rem' } }, 
          `Global Fortune: ${modifiers.globalModifier > 0 ? '+' : ''}${modifiers.globalModifier}%`
        )
      ) : null
    );
  };

  // FIX 2: Cast modApi or actions to 'any' to bypass the missing type definition
  const target = (modApi as any).injectUI ? (modApi as any) : (modApi.actions as any);
  if (target && target.injectUI) {
    target.injectUI('overlay', AuspiciousHudFC);
  } else {
    log('injectUI method not found at runtime. HUD will not render.');
  }
}
*/
function registerGameplayHooks(modApi: ModAPI) {
modApi.hooks?.onBeforeCombat?.((enemies, playerState, gameFlags) => {
    const config = getConfig();
    if (!config.enabled) return { enemies, playerState };

    const snapshot = getSnapshot();
    if (!snapshot) return { enemies, playerState };

    const baseValue = getNumerologyBase(snapshot, config);
    const numerologyFactor = normalizeNumerologyFactor(baseValue);
    const level = getAuspiciousnessLevel(numerologyFactor);
    const modifiers = calculateStatModifiers(snapshot, config);
    const buffNames = getBuffNames(playerState.buffs);
    const adjustments = applyCombatStatModifiers(playerState, modifiers);

    lastCombatModifierCache = {
      baseValue,
      numerologyFactor,
      level,
      globalModifier: modifiers.globalModifier,
      modifiers,
      adjustments,
      buffNames,
    };

    const cache = lastCombatModifierCache; 
    const timestamp = Date.now();

    // 1. INJECT NATIVE BUFF: This forces the game to print to the permanent text log
    playerState.buffs ??= [];
    playerState.buffs.push({
      id: 'auspicious_days_alignment',
      name: `Auspicious Alignment: ${cache.level}`,
      description: `Factor: ${cache.numerologyFactor} | Global: ${cache.globalModifier > 0 ? '+' : ''}${cache.globalModifier}% | DMG Red: ${cache.modifiers.damageReduction}%`,
      duration: -1, // -1 usually means permanent for the combat instance
      stacks: 1,
      maxStacks: 1,
      isDebuff: false,
      hidden: false 
    } as any); // 'as any' safely bypasses strict afnm-types for custom buff injection

    // 2. FLOATING COMBAT TEXT: This bounces over the character's head when combat starts
    playerState.messages ??= [];
    playerState.messages.push({
      id: timestamp,
      text: `Harmonized: ${cache.level}`,
      bindPoint: 'buff', 
      color: '#f2e4c1',
      lifetime: 180, // 3 seconds at 60fps
    });

    return { enemies, playerState };
  });

  // Hook for damage calculation (damage reduction)
modApi.hooks?.onCalculateDamage?.((attacker, defender, damage, damageType, gameFlags) => {
    const config = getConfig();
    if (!config.enabled) return damage;

    const snapshot = getSnapshot();
    const modifiers = calculateStatModifiers(snapshot, config);
    let modifiedDamage = damage;

    if (modifiers.damageReduction > 0) {
      const reduction = (modifiedDamage * modifiers.damageReduction) / 100;
      modifiedDamage = Math.max(0, modifiedDamage - reduction);
      
      const isPlayerTarget = 
        ('isPlayer' in defender && defender.isPlayer) || 
        ('id' in defender && defender.id === 'player');

      if (isPlayerTarget) {
        defender.messages ??= [];
        defender.messages.push({
          id: Date.now() + Math.random(),
          text: `Fate Deflects ${Math.round(reduction)}!`,
          bindPoint: 'hp', // 'hp' binds to the center of the sprite like standard damage text
          color: '#b3f7d1',
          lifetime: 120
        });
      }
    }

    return modifiedDamage;
  });

  // Hook for crafting difficulty
  modApi.hooks?.onDeriveRecipeDifficulty?.((recipe, recipeStats, gameFlags) => {
    const config = getConfig();
    if (!config.enabled) return recipeStats;

    const snapshot = getSnapshot();
    const modifiers = calculateStatModifiers(snapshot, config);
    
    if (modifiers.crafting > 0 || modifiers.globalModifier !== 0) {
      const modifiedStats = { ...recipeStats } as any;
      const originalStats = recipeStats as any;

      const adjustSuccess = (successValue: number) => {
        let success = successValue;

        if (modifiers.crafting > 0) {
          success += (success * modifiers.crafting) / 100;
        }

        if (modifiers.globalModifier !== 0) {
          success *= 1 + modifiers.globalModifier / 100;
        }

        return Math.min(100, Math.max(0, success));
      };

      if (typeof modifiedStats.success === 'number') {
        modifiedStats.success = adjustSuccess(modifiedStats.success);
        log(`Applied crafting success modifier: success ${originalStats.success}% -> ${modifiedStats.success}%`);
      } else if (typeof modifiedStats.successRate === 'number') {
        modifiedStats.successRate = adjustSuccess(modifiedStats.successRate);
        log(`Applied crafting success modifier: successRate ${originalStats.successRate}% -> ${modifiedStats.successRate}%`);
      }

      return modifiedStats;
    }

    return recipeStats;
  });

  // Hook for loot drops (luck modifier) only on Very Auspicious days
  modApi.hooks?.onEventDropItem?.((item, step, gameFlags) => {
    const config = getConfig();
    if (!config.enabled) return item;

    const snapshot = getSnapshot();
    const modifiers = calculateStatModifiers(snapshot, config);
    const level = getAuspiciousnessLevel(normalizeNumerologyFactor(getNumerologyBase(snapshot, config)));
    if (level !== 'Very Auspicious') return item;
    
    if (typeof (item as any).quantity === 'number') {
      let quantity = (item as any).quantity;

      if (modifiers.luck > 0) {
        const luckMultiplier = 1 + (modifiers.luck / 100);
        quantity = Math.floor(quantity * luckMultiplier);
        log(`Applied ${modifiers.luck}% luck bonus: ${(item as any).name || 'item'} quantity ${(item as any).quantity} -> ${quantity}`);
      }

      if (modifiers.globalModifier !== 0) {
        const globalMultiplier = 1 + modifiers.globalModifier / 100;
        quantity = Math.max(1, Math.floor(quantity * globalMultiplier));
        log(`Applied ${modifiers.globalModifier}% global modifier to loot quantity: ${(item as any).quantity} -> ${quantity}`);
      }

      if (quantity !== (item as any).quantity) {
        return {
          ...item,
          quantity,
        };
      }
    }

    return item;
  });

  modApi.hooks?.onCompleteCombat?.((eventStep: CombatStep | FightCharacterStep, victory, playerCombatState, foughtEnemies, droppedItems, gameFlags) => {
    const config = getConfig();
    const cache = lastCombatModifierCache;
    // Clear the cache so it doesn't bleed into the next fight
    lastCombatModifierCache = null;
    // Return an empty array so the game doesn't create story dialogue boxes
    return [];
  });

  modApi.hooks?.onCompleteCrafting?.((eventStep: CraftingStep, item: CraftingResult | undefined, gameFlags) => {
    const config = getConfig();
    //return getAuspiciousnessCalculationSteps(getSnapshot(), config, 'Auspicious Days effect:');
    return [];
  });

  modApi.hooks?.onCompleteDualCultivation?.((eventStep: DualCultivationStep, success, gameFlags) => {
    const config = getConfig();
    const title = `Auspicious Days during dual cultivation (${success ? 'success' : 'failure'}):`;
    //return getAuspiciousnessCalculationSteps(getSnapshot(), config, title);
    return [];
  });
}

function install() {
  const modApi = window.modAPI;

  if (!modApi) {
    console.warn(MOD_TAG, 'ModAPI not available; template scaffold not installed.');
    return;
  }

  window.__afnmModInstalled ??= {};
  if (window.__afnmModInstalled[MOD_METADATA.name]) {
    return;
  }
  window.__afnmModInstalled[MOD_METADATA.name] = true;

  ensureDefaultConfig();
  installDebugApi();
  registerOptionsUi(modApi);
  registerSnapshotListener(modApi);
  registerDrawerOverlay(modApi);
  //registerInjectedHUD(modApi);
  registerGameplayHooks(modApi);

  log('Auspicious Days mod installed.', {
    version: MOD_METADATA.version,
    gameVersion: MOD_METADATA.gameVersion,
  });
}

install();