// Shared settings. All gameplay tuning lives in TUNING so difficulty is easy to adjust.

export const TILE = 16;
export const VIEW = { width: 960, height: 540, zoom: 2 };
export const FONT = '"Press Start 2P", "Courier New", monospace';

const params = new URLSearchParams(window.location.search);
export const DEBUG = params.has('debug');
export const START_LEVEL = params.has('level') ? Math.max(0, parseInt(params.get('level'), 10) - 1 || 0) : null;

export const TUNING = {
  player: {
    speed: 95,
  },
  pebble: {
    speed: 240,
    range: 112, // px, about 7 tiles
    cooldown: 0.33, // seconds between shots
    aimAssistAngle: 40, // degrees either side of facing
  },
  parry: {
    radius: 34, // how close a headline must be to deflect it
    cooldown: 0.2,
  },
  meter: {
    max: 100,
    drainPerSec: 7, // drains when nothing has hurt you for a moment
    drainDelay: 1.4,
    invulnTime: 0.7, // grace period after a discrete hit
  },
  bro: {
    speed: 36,
    upTime: [2.6, 3.6], // line goes up (can't be hit)
    warnTime: 0.75, // flicker before the dip
    dipTime: 1.8, // market dip: the window to break his phone
    dashSpeed: 210,
    dashTime: 0.45,
    missPenalty: 10,
    shoveRange: 13,
    shovePenalty: 5,
    shoveCooldown: 1.6,
  },
  influencer: {
    speed: 22,
    coneRange: 86,
    coneHalfAngle: 27, // degrees
    filmRate: 9, // meter per second while on camera
    contentifyTime: 1.3, // seconds on camera before you get stunned
    contentifyPenalty: 8,
    stunTime: 0.8,
    poseTime: [2.2, 3.8],
    backHitDot: 0.15, // how "behind" a pebble must come from (0 = side counts)
  },
  doom: {
    auraRadius: 42,
    auraRate: 13, // meter per second inside the aura
    fireEvery: [2.8, 3.8],
    fireRange: 165,
    headlineSpeed: 50,
    headlinePenalty: 15,
    reflectSpeed: 150,
    stunTime: 3.8,
  },
  freed: {
    speed: 30,
  },
};
