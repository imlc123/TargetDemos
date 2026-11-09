// Character sprites, 24x32, built like paper dolls from layers:
// body + outfit + hair/hat + arms. Outlines and edge shading are added automatically.
// Every character gets a spritesheet with frames:
//   idle0 idle1 walk0 walk1 walk2 walk3 wave cheer
//
// Layer letters:  S skin  E eye  W white  M mouth  H hair  A top  B bottoms  C hat/hood
//                 K shoes  G gold  X dark (glasses)  Z wood  w band  Q sleeve
// Lowercase = the darker shade of the same color.

import { shade, grayPalette, canvasTexture } from './pixels.js';

export const FRAME_W = 24;
export const FRAME_H = 32;
const LEG_Y = 25;
export const FRAMES = ['idle0', 'idle1', 'walk0', 'walk1', 'walk2', 'walk3', 'wave', 'cheer'];

const L = (y0, rows) => ({ y0, rows });

// ---------- body ----------
const BASE = L(3, [
  '........SSSSSSSS........',
  '.......SSSSSSSSSS.......',
  '......SSSSSSSSSSSS......',
  '......SSSSSSSSSSSS......',
  '......SSSSSSSSSSSs......',
  '......SSWESSSSWESs......',
  '.....sSSEESSSSEESss.....',
  '.....sSSSSSSSSSSSss.....',
  '......SSSSSSsSSSSs......',
  '......sSSSSMMSSSSs......',
  '.......sSSSSSSSSs.......',
  '........ssSSSSss........',
  '..........sSSs..........',
]);
const LEGS = L(25, Array(5).fill('........SSS..SSS........'));
const SHOES = L(30, ['.......KKKK..KKKK.......', '.......kkkk..kkkk.......']);

// ---------- outfits ----------
const TANK = L(16, [
  '.......SSAAAAAASS.......',
  '.......SAAAAAAAAS.......',
  '.......AAAAAAAAAa.......',
  '.......AAAAAAAAAa.......',
  '.......AAAAAAAAAa.......',
  '.......aAAAAAAAaa.......',
  '.......BBBBBBBBBb.......',
  '.......BBBBBBBBBb.......',
  '.......BBBB..BBBb.......',
]);
const CROP = L(16, [
  '.......SAAAAAAAAS.......',
  '.......AAAAAAAAAa.......',
  '.......AAAAAAAAAa.......',
  '.......aAAAAAAAaa.......',
  '........SSSSSSSS........',
  '........BBBBBBBB........',
  '.......BBBBBBBBBb.......',
  '.......BBBBBBBBBb.......',
  '.......BBBB..BBBb.......',
  '........BBb..BBb........',
  '........BBb..BBb........',
  '........BBb..BBb........',
  '........BBb..BBb........',
  '........BBb..BBb........',
]);
const HOODIE = L(16, [
  '.......AAAAAAAAAA.......',
  '.......AAAWAAWAAa.......',
  '.......AAAWAAWAAa.......',
  '.......AAAAAAAAAa.......',
  '.......AAaaaaaaAa.......',
  '.......AAaAAAAaAa.......',
  '.......aaaaaaaaaa.......',
]);
const BOTTOMS = {
  sweats: L(23, [
    '.......BBBBBBBBBb.......',
    '.......BBBB..BBBb.......',
    '........BBb..BBb........',
    '........BBb..BBb........',
    '........BBb..BBb........',
    '........BBb..BBb........',
    '........bbb..bbb........',
  ]),
  shorts: L(23, [
    '.......BBBBBBBBBb.......',
    '.......BBBB..BBBb.......',
    '........................',
    '........................',
    '........................',
    '........................',
    '........WWW..WWW........',
  ]),
  skirt: L(23, [
    '......BBBBBBBBBBBb......',
    '.....BBBBBBBBBBBBbb.....',
    '.....bbbbbbbbbbbbbb.....',
  ]),
};
BOTTOMS.joggers = BOTTOMS.sweats;

// ---------- hair & hats ----------
const HAIR = {
  short: { front: L(2, [
    '.........HHHHHH.........',
    '........HHHHHHHH........',
    '.......HHHHHHHHHH.......',
    '......HHHhHHhHHHHH......',
    '......HH.H....H.HH......',
    '......H..........H......',
  ]) },
  buzz: { front: L(2, [
    '.........hhhhhh.........',
    '........HHHHHHHH........',
    '.......HHHHHHHHHH.......',
    '......HHHhhhhhhHHH......',
    '......HH........HH......',
    '......H..........H......',
  ]) },
  swoop: { front: L(0, [
    '........HHHHH...........',
    '.......HHHHHHHH.........',
    '......HHHHHHHHHHh.......',
    '......hHHHHHHHHHHh......',
    '.......HHHHHHHHHH.......',
    '......HHHhhhhhhHHH......',
    '......HH........HH......',
  ]) },
  long: {
    back: L(6, [...Array(14).fill('....hHH..........HHh....'), '.....hh..........hh.....']),
    front: L(1, [
      '.........HHHHHH.........',
      '.......HHHHHHHHHH.......',
      '......HHHHHHHHHHHH......',
      '.....HHHHHhhHHHHHHH.....',
      '.....HHHH......hHHH.....',
      '.....HHH........HHH.....',
      ...Array(8).fill('.....HH..........HH.....'),
    ]),
  },
  bob: { front: L(1, [
    '.........HHHHHH.........',
    '.......HHHHHHHHHH.......',
    '......HHHHHHHHHHHH......',
    '.....HHHHHhhHHHHHHH.....',
    '.....HHHH......hHHH.....',
    '.....HHH........HHH.....',
    ...Array(6).fill('.....HH..........HH.....'),
    '.....hh..........hh.....',
  ]) },
  bun: { front: L(0, [
    '..........HHHH..........',
    '.........HHhhHH.........',
    '........HHHHHHHH........',
    '.......HHHHHHHHHH.......',
    '......HHHHHHHHHHHH......',
    '......HH........HH......',
    '......H..........H......',
  ]) },
  curly: { front: L(0, [
    '........H.HH.H..........',
    '.......HHHHHHHHH........',
    '......HHHHHHHHHHH.......',
    '.....HHHHHHHHHHHHH......',
    '.....HHhHHhhHHhHHHH.....',
    '.....HHH........HHH.....',
    '....HHH..........HHH....',
    '....HH............HH....',
    '....H..............H....',
  ]) },
  pony: {
    back: L(3, [
      '..................HHH...',
      '...................HHH..',
      '...................HHH..',
      '...................hHH..',
      '....................HH..',
      '....................h...',
    ]),
    front: L(2, [
      '.........HHHHHH.........',
      '........HHHHHHHH........',
      '.......HHHHHHHHHH.......',
      '......HHHHHHHHHHHH......',
      '......HH........HH......',
      '......H..........H......',
    ]),
  },
  messy: { front: L(0, [
    '.......H..H.H..H........',
    '.......HHHHHHHHHH.......',
    '......HHHHHHHHHHHH......',
    '......HHHHHHHHHHHH......',
    '......HHhHHhHHhHHH......',
    '......HH.h..h...HH......',
    '......H..........H......',
  ]) },
};
const HATS = {
  cap: L(1, [
    '.........CCCCCC.........',
    '........CCCCCCCC........',
    '.......CCCCCCCCCC.......',
    '......CCCCCCCCCCCC......',
    '.....cccccccccccccc.....',
  ]),
  capBack: L(1, [
    '.........CCCCCC.........',
    '........CCCCCCCC........',
    '.......CCCCCCCCCC.......',
    '......CCCCCHHCCCCC......',
    '......cccccccccccc......',
  ]),
  hood: L(1, [
    '.........CCCCCC.........',
    '........CCCCCCCC........',
    '......CCCCCCCCCCCC......',
    '.....CCCccccccccCCC.....',
    '.....CCc........cCC.....',
    ...Array(8).fill('....CC............CC....'),
    '.....CC..........CC.....',
    '......CCCC....CCCC......',
  ]),
  beanie: L(0, [
    '...........CC...........',
    '.........CCCCCC.........',
    '........CCCCCCCC........',
    '.......CCCCCCCCCC.......',
    '......cccccccccccc......',
    '......cccccccccccc......',
  ]),
};
const EXTRAS = {
  glasses: L(7, [
    '.......XXXX..XXXX.......',
    '.......X..XXXX..X.......',
    '.......X..X..X..X.......',
    '.......XXXX..XXXX.......',
  ]),
  chain: L(17, [
    '.........G....G.........',
    '..........G..G..........',
    '...........GG...........',
  ]),
  earbuds: L(9, ['.....W............W.....']),
  hoops: L(10, ['.....G............G.....', '.....G............G.....']),
};

// ---------- arms (right side; the left side is mirrored) ----------
const R_ARMS = {
  down: L(16, [
    '.................QQ.....',
    '.................Qq.....',
    '.................Qq.....',
    '.................Qq.....',
    '.................Qq.....',
    '.................SS.....',
    '.................ss.....',
  ]),
  phone: L(16, [
    '.................QQ.....',
    '.................Qq.....',
    '..............SS.Qq.....',
    '..............SSQQq.....',
  ]),
  up: L(9, [
    '...................SS...',
    '...................SS...',
    '..................QQ....',
    '..................Qq....',
    '.................QQ.....',
    '.................Qq.....',
    '.................QQ.....',
    '.................QQ.....',
  ]),
  low: L(16, [
    '.................QQ.....',
    '.................Qq.....',
    '.................Qq.....',
    '................QQ......',
    '..............SSQ.......',
  ]),
  sling: L(16, [
    '.................QQ.....',
    '.................Qq.....',
    '.................Qq.Z.Z.',
    '.................Qq.ZwZ.',
    '.................Qq..Z..',
    '.................SSZZ...',
    '.................ss.....',
  ]),
};
const mirror = (layer) => L(layer.y0, layer.rows.map((r) => r.split('').reverse().join('')));
const L_ARMS = { down: mirror(R_ARMS.down), up: mirror(R_ARMS.up), low: mirror(R_ARMS.low) };
const POSES = {
  down: [L_ARMS.down, R_ARMS.down],
  phone: [L_ARMS.down, R_ARMS.phone],
  low: [L_ARMS.low, R_ARMS.low],
  up: [L_ARMS.down, R_ARMS.up],
  sling: [L_ARMS.down, R_ARMS.sling],
  cheer: [L_ARMS.up, R_ARMS.up],
};
// Where the phone sits (sprite pixel coords) for each arm pose.
export const PHONE_AT = { phone: [14.5, 16.5], low: [11.5, 19.5], up: [19.5, 8] };

// ---------- kinds ----------
export const KINDS = {
  bro: { outfit: TANK, bottoms: null, bareArms: true, locked: 'phone', mouth: '#9b4a3a' },
  influencer: { outfit: CROP, bottoms: null, bareArms: true, locked: 'up', mouth: '#d9485f' },
  doom: { outfit: HOODIE, bottoms: 'sweats', bareArms: false, locked: 'low', mouth: '#7a4a4a' },
  hero: { outfit: HOODIE, bottoms: 'shorts', bareArms: false, locked: 'phone', free: 'sling', mouth: '#9b4a3a' },
};

// ---------- composition ----------
function blank() {
  return Array.from({ length: FRAME_H }, () => Array(FRAME_W).fill('.'));
}
function stamp(grid, layer, dy = 0, fn = null) {
  if (!layer) return;
  layer.rows.forEach((row, i) => {
    const y = layer.y0 + i;
    for (let x = 0; x < row.length && x < FRAME_W; x++) {
      const ch = row[x];
      if (ch === '.') continue;
      const yy = y + (fn ? fn(x, y) : dy);
      if (yy >= 0 && yy < FRAME_H) grid[yy][x] = ch;
    }
  });
}

function bodyGrid(look) {
  const kind = KINDS[look.kind];
  const g = blank();
  const hair = HAIR[look.hairStyle] || {};
  stamp(g, hair.back);
  stamp(g, BASE);
  stamp(g, LEGS);
  stamp(g, kind.outfit);
  stamp(g, BOTTOMS[look.bottomLayer || kind.bottoms]);
  stamp(g, SHOES);
  (look.extras || []).forEach((e) => e === 'chain' && stamp(g, EXTRAS.chain));
  stamp(g, hair.front);
  stamp(g, HATS[look.hat]);
  (look.extras || []).forEach((e) => e !== 'chain' && stamp(g, EXTRAS[e]));
  return g;
}

// Walk/idle transforms on a finished body grid.
function liftLeg(g, left) {
  for (let x = 0; x < FRAME_W; x++) {
    if (left ? x >= 12 : x < 12) continue;
    for (let y = LEG_Y; y < FRAME_H - 1; y++) g[y][x] = g[y + 1][x];
    g[FRAME_H - 1][x] = '.';
  }
}
function bobDown(g) {
  for (let y = LEG_Y; y >= 1; y--) g[y] = g[y - 1].slice();
  g[0] = Array(FRAME_W).fill('.');
}

function frameGrid(look, base, f) {
  const g = bodyGrid(look);
  let pose = base;
  let bob = 0;
  let armL = 0;
  let armR = 0;
  if (f === 'idle1') { bobDown(g); bob = 1; }
  if (f === 'walk1') { liftLeg(g, true); armL = 1; armR = -1; }
  if (f === 'walk2') { bobDown(g); bob = 1; }
  if (f === 'walk3') { liftLeg(g, false); armL = -1; armR = 1; }
  if (f === 'wave') pose = 'up';
  if (f === 'cheer') pose = 'cheer';
  const [la, ra] = POSES[pose];
  stamp(g, la, bob + armL);
  stamp(g, ra, bob + armR);
  return g;
}

function outline(g) {
  const out = g.map((r) => r.slice());
  for (let y = 0; y < FRAME_H; y++) {
    for (let x = 0; x < FRAME_W; x++) {
      if (g[y][x] !== '.') continue;
      const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => g[y + dy]?.[x + dx] && g[y + dy][x + dx] !== '.');
      if (n) out[y][x] = 'O';
    }
  }
  return out;
}

export function lookPalette(look) {
  const kind = KINDS[look.kind];
  const base = {
    S: look.skin, E: '#2a1d1a', W: '#ffffff', M: kind.mouth, H: look.hair, A: look.top, B: look.bottom,
    C: look.hatColor || look.top, K: look.shoes || '#f4f4f4', G: '#ffd23f', X: '#2b2b3a', Z: '#8a5a2b', w: '#e8dcc8',
    O: '#1b1424',
  };
  for (const k of 'SHABCK') base[k.toLowerCase()] = shade(base[k], 0.76);
  const sleeve = kind.bareArms ? 'S' : 'A';
  base.Q = base[sleeve];
  base.q = base[sleeve.toLowerCase()];
  return base;
}

function drawGrid(ctx, g, pal, ox) {
  for (let y = 0; y < FRAME_H; y++) {
    for (let x = 0; x < FRAME_W; x++) {
      const ch = g[y][x];
      if (ch === '.') continue;
      let c = pal[ch];
      if (!c) continue;
      // light from the top-left: darken right and bottom edges a touch
      if (ch !== 'O' && ch !== 'E' && ch !== 'W') {
        const r = g[y][x + 1];
        const b = g[y + 1]?.[x];
        if (r === '.' || r === 'O' || r === undefined) c = shade(c, 0.86);
        else if (b === '.' || b === 'O' || b === undefined) c = shade(c, 0.92);
      }
      ctx.fillStyle = c;
      ctx.fillRect(ox + x, y, 1, 1);
    }
  }
}

// Builds `${key}_color` and `${key}_gray` spritesheets for a look.
export function buildCharacter(scene, key, look) {
  const kind = KINDS[look.kind];
  const color = lookPalette(look);
  const gray = grayPalette(color, { E: '#8fe9ff', O: '#151320', W: '#e8f6ff' });
  const variants = [
    ['color', color, kind.free || 'down'],
    ['gray', gray, kind.locked],
  ];
  for (const [variant, pal, pose] of variants) {
    const k = `${key}_${variant}`;
    if (scene.textures.exists(k)) continue;
    const tex = canvasTexture(scene, k, FRAME_W * FRAMES.length, FRAME_H, (ctx) => {
      FRAMES.forEach((f, i) => drawGrid(ctx, outline(frameGrid(look, pose, f)), pal, i * FRAME_W));
    });
    FRAMES.forEach((f, i) => tex.add(f, 0, i * FRAME_W, 0, FRAME_W, FRAME_H));
  }
  return key;
}

// ---------- hero ----------
export const HERO_SKINS = ['#f6d1b0', '#e0a77e', '#b07650', '#6e4630'];
export const HERO_COLORS = [
  { cap: '#e8433f', hoodie: '#ffd23f' },
  { cap: '#3f7fe8', hoodie: '#ff9a3d' },
  { cap: '#3fbf6a', hoodie: '#b79cff' },
  { cap: '#9a5cff', hoodie: '#5fe0c0' },
];
export const HERO_GENDERS = {
  boy: { hairStyle: 'short', bottomLayer: 'shorts', bottom: '#3f5fae', hair: '#5a3a1f' },
  girl: { hairStyle: 'pony', bottomLayer: 'skirt', bottom: '#2f8f9a', hair: '#3a2412', lashes: true },
  nb: { hairStyle: 'curly', bottomLayer: 'joggers', bottom: '#5b6d8a', hair: '#2a1a14' },
};

export function heroLook(profile) {
  const g = HERO_GENDERS[profile.gender] || HERO_GENDERS.nb;
  const c = HERO_COLORS[profile.cap] || HERO_COLORS[0];
  return {
    kind: 'hero', skin: HERO_SKINS[profile.skin] || HERO_SKINS[0], hair: g.hair, hairStyle: g.hairStyle,
    hat: 'cap', hatColor: c.cap, top: c.hoodie, bottom: g.bottom, bottomLayer: g.bottomLayer, shoes: '#f4f4f4',
    lashes: g.lashes, gender: profile.gender,
  };
}
export function heroKey(profile) {
  return `hero_${profile.gender}_${profile.skin}_${profile.cap}`;
}
export function buildHero(scene, profile) {
  return buildCharacter(scene, heroKey(profile), heroLook(profile));
}
