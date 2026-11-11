// Shared settings. All gameplay tuning lives in TUNING so difficulty is easy to adjust.

export const TILE = 16;
export const VIEW = { width: 960, height: 540, zoom: 2 };
export const FONT = '"Press Start 2P", "Courier New", monospace';

const params = new URLSearchParams(window.location.search);
export const DEBUG = params.has('debug');
export const GALLERY = DEBUG && params.has('gallery');
export const START_LEVEL = params.has('level') ? Math.max(0, parseInt(params.get('level'), 10) - 1 || 0) : null;

export const TUNING = {
  player: {
    speed: 95,
  },
  pebble: {
    speed: 240,
    range: 124, // px, about 8 tiles
    hitRadius: 12, // how close a pebble must pass to hit someone
    cooldown: 0.33, // seconds between shots
    aimAssistAngle: 40, // degrees either side of facing
  },
  parry: {
    radius: 36, // how close a headline must be to deflect it
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
    shoveRange: 16,
    shovePenalty: 5,
    shoveCooldown: 1.6,
  },
  influencer: {
    speed: 22,
    coneRange: 96,
    coneHalfAngle: 27, // degrees
    filmRate: 9, // meter per second while on camera
    contentifyTime: 1.3, // seconds on camera before you get stunned
    contentifyPenalty: 8,
    stunTime: 0.8,
    poseTime: [2.2, 3.8],
    backHitDot: 0.15, // how "behind" a pebble must come from (0 = side counts)
  },
  doom: {
    auraRadius: 46,
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
  boss: {
    need: [3, 3, 3], // people to free before the shield drops, per phase
    regrowNeed: 2, // if the shield comes back, free this many more
    spawnEvery: [7, 6, 5], // seconds between extra summons while shielded
    maxLocked: [3, 4, 4], // most people the boss keeps in the feed at once
    openTime: 10, // seconds the shield stays down
    dip: { up: [2.2, 3], warn: 0.7, dip: 2 },
    candleEvery: 3.6,
    candleDamage: 12,
    beamRange: 170,
    beamHalf: 16, // degrees
    beamSpeed: 0.55, // radians per second
    filmRate: 12,
    auraRadius: 64,
    auraRate: 10,
    barrageEvery: 3.4,
    barrageCount: [3, 4], // headlines per barrage: shielded, open
    stunTime: 4,
  },
  talk: {
    range: 28, // how close you must be to talk to someone
    calm: 25, // the meter drops this much after your first chat with each person
  },
};
