// 16px tiles, Stardew-style: clustered texture details instead of dithering,
// light from the top-left, several variants per ground type.
// Building fronts can be several rows tall: the top, middle and ground rows of a
// wall each get their own tile (cornice, windows, shopfronts and doors).
// Two strips are built: a full-color city and a gray one that keeps its neon.

import { TILE } from '../config.js';
import { canvasTexture, grayPalette, hash2 } from './pixels.js';

export const T = {
  ROAD: 0, ROAD_B: 1, ROAD_PATCH: 2, MANHOLE: 3, LANE_HB: 4, LANE_HT: 5, LANE_VR: 6, LANE_VL: 7, CROSS_H: 8, CROSS_V: 9,
  SIDEWALK: 10, SIDEWALK_B: 11, SIDEWALK_C: 12, SIDEWALK_D: 13, CURB_S: 14, CURB_N: 15, CURB_E: 16, CURB_W: 17, DRAIN: 18,
  GRASS: 19, GRASS_B: 20, GRASS_C: 21, GRASS_D: 22, FLOWER: 23, FLOWER_B: 24, TREE: 25, BENCH: 26, HEDGE: 27,
  PLAZA: 28, PLAZA_B: 29, PLAZA_C: 30, BILLBOARD: 31,
};
export const THEMES = ['hustle', 'aesthetic', 'scroll', 'feed'];
const THEMED_BASE = 32;
export const K = {
  ROOF: 0, ROOF_DETAIL: 1, ROOF_EAVE: 2, WALL_TOP: 3, WALL_TOP_LIT: 4, WALL_MID: 5, WALL_MID_LIT: 6,
  WALL_GROUND: 7, WALL_GROUND_ALT: 8, DOOR: 9,
};
const PER_THEME = 10;
export const themed = (theme, k) => THEMED_BASE + THEMES.indexOf(theme) * PER_THEME + k;
export const TILE_COUNT = THEMED_BASE + THEMES.length * PER_THEME;
export const FLOWER_IDS = [T.FLOWER, T.FLOWER_B];

export function isSolidTile(id) {
  if (id >= THEMED_BASE) return true;
  return id === T.TREE || id === T.BENCH || id === T.HEDGE || id === T.BILLBOARD;
}
export const SOLID = Array.from({ length: TILE_COUNT }, (_, i) => i).filter(isSolidTile);

const GROUND = {
  asphalt: '#454a5c', asphaltLo: '#3a3e4e', asphaltHi: '#555a6e', crack: '#2c2f3c', patch: '#3d4152', lane: '#f0d36a', laneLo: '#c8a848',
  stripe: '#ececec', stripeLo: '#c8c8c8', manhole: '#33363f', manholeHi: '#666a78',
  side: '#bdb5a6', sideLo: '#a1998b', sideHi: '#d6cfc2', seam: '#8f887b', side2: '#b2aa9b', gum: '#7d766a', leafY: '#d9a441', leafR: '#c8603a',
  curb: '#e0dbd0', curbLo: '#8c877c', curbFace: '#c4beb2', grate: '#2c2f38',
  grass: '#6cbf4f', grassLo: '#4f9e44', grassHi: '#95d96b', grassDeep: '#3d8040', clover: '#a8e47c', pebble: '#a7a2a0', pebbleHi: '#d2cdca',
  petal: '#ff6fa8', petal2: '#ffd23f', petal3: '#8fd3ff', petal4: '#ffffff', center: '#fff4b0', stem: '#3d8040',
  trunk: '#7a4e2c', trunkLo: '#55341c', leaf: '#3f9b47', leafLo: '#2b7a3a', leafHi: '#78c86c', leafTop: '#a3e08a', shadow: '#3f8a3c',
  bench: '#c99158', benchLo: '#8e5c30', benchHi: '#e0b07a', iron: '#3b3b48',
  plaza: '#d0c0a0', plazaLo: '#b8a684', plazaHi: '#e2d6bc', plazaLine: '#a39272', inlay: '#c47a52',
  planter: '#9a7650', planterLo: '#6e5034', hedge: '#4fa046', hedgeLo: '#357a34', hedgeHi: '#7cc86a',
  frame: '#2a2a33', screen: '#7fd1ff', screen2: '#7bd36a', screenText: '#ffffff', sun: '#ffe066',
};
const GROUND_GRAY_KEEP = { screen: '#ff3fb4', screen2: '#3fe8ff', sun: '#ff3fb4', screenText: '#ffffff', frame: '#1c1c24' };

const THEME_PAL = {
  hustle: {
    roof: '#3e4a60', roofLo: '#323c4f', roofHi: '#505d75', trim: '#d9b44a', trimLo: '#9c7d2c', trimHi: '#f2d27a',
    wall: '#4f7fbe', wallLo: '#3d6aa3', wallHi: '#7fa9dc', mullion: '#2d4a72', win: '#2f4f80', winLit: '#ffd97a', winLit2: '#fff0b8',
    stone: '#8a8f9c', stoneLo: '#6c7180', door: '#d9b44a', detail: '#a2acbd', detailLo: '#6f7a8c', plant: '#3f9b47',
  },
  aesthetic: {
    roof: '#c8724a', roofLo: '#9a5234', roofHi: '#e2936a', trim: '#ffffff', trimLo: '#d8ccd4', trimHi: '#ffffff',
    wall: '#f4b9cb', wallLo: '#dc98ae', wallHi: '#fcd6e2', mullion: '#ffffff', win: '#a6dcec', winLit: '#ffe8a0', winLit2: '#fff6d8',
    stone: '#e8d8c8', stoneLo: '#c8b4a0', door: '#8a5a3a', detail: '#6fbf73', detailLo: '#3f8a4a', plant: '#5fbf6a',
    awning: '#ff7eb6', awningLo: '#d8578f', shutter: '#7fd6c0', shutterLo: '#57b29c',
  },
  scroll: {
    roof: '#5a5960', roofLo: '#47464d', roofHi: '#6c6b72', trim: '#9a9088', trimLo: '#6e665e', trimHi: '#b4aaa2',
    wall: '#7c7269', wallLo: '#655c54', wallHi: '#8f857b', mullion: '#4a443e', win: '#262a36', winLit: '#ffcf7a', winLit2: '#ffe6b0',
    stone: '#5e5852', stoneLo: '#47423d', door: '#4a4a54', detail: '#d0d0d6', detailLo: '#8a8a92', plant: '#5a7a4a',
    blind: '#b8b0a0', tag: '#ff3fb4', shutter: '#8c8c96', shutterLo: '#6c6c76',
  },
  feed: {
    roof: '#2a2438', roofLo: '#1e1a2a', roofHi: '#3a3250', trim: '#b44aff', trimLo: '#7a2ab8', trimHi: '#d89aff',
    wall: '#2f2846', wallLo: '#231e36', wallHi: '#40385c', mullion: '#1a1628', win: '#181628', winLit: '#ff5fd0', winLit2: '#ffb0ea',
    stone: '#3a3450', stoneLo: '#2a2440', door: '#b44aff', detail: '#ff3b4e', detailLo: '#5a5070', plant: '#3fe8ff',
  },
};
const THEME_GRAY_KEEP = {
  hustle: { winLit: '#7fe3ff', winLit2: '#c8f4ff', roof: '#33303f', roofLo: '#28252f', roofHi: '#403c4c' },
  aesthetic: { winLit: '#7fe3ff', winLit2: '#c8f4ff', awning: '#ff3fb4', awningLo: '#c02a88', roof: '#3a3446', roofLo: '#2c2736', roofHi: '#463f52' },
  scroll: { winLit: '#7fe3ff', winLit2: '#c8f4ff', tag: '#ff3fb4', roof: '#35333c', roofLo: '#2a2830', roofHi: '#423f48' },
  feed: { winLit: '#ff3fb4', winLit2: '#ffa0de', trim: '#b44aff', trimHi: '#d89aff', detail: '#ff3b4e', plant: '#3fe8ff' },
};

// ---------- drawing helpers ----------
function pen(ctx, ox) {
  const r = (c, x, y, w = 1, h = 1) => { ctx.fillStyle = c; ctx.fillRect(ox + x, y, w, h); };
  const disc = (c, cx, cy, rad) => {
    for (let y = -rad; y <= rad; y++) for (let x = -rad; x <= rad; x++) if (x * x + y * y <= rad * rad + rad * 0.6) r(c, cx + x, cy + y);
  };
  return { r, disc };
}
// deterministic little scatter
const scatter = (seed, n, w = 16, h = 16) => Array.from({ length: n }, (_, i) => [hash2(seed, i * 7 + 1) % w, hash2(i * 13 + 3, seed) % h]);

// ---------- ground ----------
function drawGround(ctx, id, P, ox) {
  const { r, disc } = pen(ctx, ox);
  const road = (seed) => {
    r(P.asphalt, 0, 0, 16, 16);
    scatter(seed, 5).forEach(([x, y]) => { r(P.asphaltHi, x, y, 2, 1); r(P.asphaltLo, x + 1, y + 1, 1, 1); });
    scatter(seed + 9, 3).forEach(([x, y]) => r(P.asphaltLo, x, y, 1, 1));
  };
  const pavers = (seed, base = P.side) => {
    r(P.seam, 0, 0, 16, 16);
    for (const [px, py] of [[0, 0], [8, 0], [0, 8], [8, 8]]) {
      const c = hash2(seed + px, py) % 5 === 0 ? P.side2 : base;
      r(c, px, py, 7, 7);
      r(P.sideHi, px, py, 7, 1); r(P.sideHi, px, py, 1, 7);
      r(P.sideLo, px, py + 6, 7, 1); r(P.sideLo, px + 6, py, 1, 7);
    }
  };
  const grass = (seed) => {
    r(P.grass, 0, 0, 16, 16);
    scatter(seed, 6).forEach(([x, y]) => {
      // a small tuft: dark base, bright tip, light from the top-left
      r(P.grassLo, x, y + 1, 3, 1); r(P.grassHi, x, y, 1, 1); r(P.grassHi, x + 2, y - 1 < 0 ? 0 : y - 1, 1, 1); r(P.grassDeep, x + 1, y + 2, 1, 1);
    });
    scatter(seed + 5, 4).forEach(([x, y]) => r(P.grassLo, x, y, 1, 1));
  };
  const flower = (x, y, c) => {
    r(P.stem, x, y + 2, 1, 2); r(P.grassDeep, x + 1, y + 3, 1, 1);
    r(c, x - 1, y, 3, 1); r(c, x, y - 1, 1, 3); r(P.center, x, y, 1, 1);
  };
  const plaza = (v) => {
    r(P.plazaLine, 0, 0, 16, 16);
    for (const [px, py] of [[0, 0], [8, 0], [0, 8], [8, 8]]) {
      const c = (px + py) % 16 === 0 ? P.plaza : P.plazaLo;
      r(c, px, py, 7, 7); r(P.plazaHi, px, py, 7, 1); r(P.plazaHi, px, py, 1, 7);
    }
    if (v === 1) { r(P.inlay, 5, 5, 6, 6); r(P.plazaHi, 6, 6, 4, 4); r(P.inlay, 7, 7, 2, 2); }
    if (v === 2) { r(P.plazaLine, 3, 2, 1, 3); r(P.plazaLine, 4, 4, 2, 1); r(P.plazaLine, 6, 5, 1, 2); }
  };
  switch (id) {
    case T.ROAD: road(1); break;
    case T.ROAD_B:
      road(2);
      for (const [x, y] of [[3, 5], [4, 5], [5, 6], [6, 6], [7, 7], [7, 8], [8, 9], [10, 9]]) { r(P.crack, x, y); r(P.asphaltHi, x, y - 1); }
      break;
    case T.ROAD_PATCH: road(3); r(P.patch, 3, 4, 9, 7); r(P.asphaltLo, 3, 10, 9, 1); r(P.asphaltHi, 3, 4, 9, 1); break;
    case T.MANHOLE:
      road(4); disc(P.crack, 8, 8, 6); disc(P.manhole, 8, 8, 5);
      for (const y of [5, 8, 11]) r(P.manholeHi, 4, y, 9, 1);
      r(P.manholeHi, 6, 3, 4, 1);
      break;
    case T.LANE_HB: road(5); for (let x = 3; x < 11; x++) if (x !== 7) r(P.lane, x, 15); r(P.laneLo, 10, 15); break;
    case T.LANE_HT: road(6); for (let x = 3; x < 11; x++) if (x !== 6) r(P.lane, x, 0); break;
    case T.LANE_VR: road(7); for (let y = 3; y < 11; y++) if (y !== 8) r(P.lane, 15, y); break;
    case T.LANE_VL: road(8); for (let y = 3; y < 11; y++) r(P.lane, 0, y); break;
    case T.CROSS_H: road(9); for (const y of [1, 5, 9, 13]) { r(P.stripe, 2, y, 12, 2); r(P.stripeLo, 2, y + 1, 12, 1); r(P.asphalt, 6 + (y % 5), y, 1, 1); } break;
    case T.CROSS_V: road(10); for (const x of [1, 5, 9, 13]) { r(P.stripe, x, 2, 2, 12); r(P.stripeLo, x + 1, 2, 1, 12); r(P.asphalt, x, 7 + (x % 4), 1, 1); } break;
    case T.SIDEWALK: pavers(1); break;
    case T.SIDEWALK_B: pavers(2); for (const [x, y] of [[9, 2], [10, 3], [11, 3], [12, 4]]) r(P.seam, x, y); break;
    case T.SIDEWALK_C: pavers(3); r(P.gum, 3, 11, 2, 1); r(P.gum, 12, 4, 1, 1); break;
    case T.SIDEWALK_D: pavers(4); r(P.leafY, 4, 3, 2, 1); r(P.leafY, 5, 2, 1, 1); r(P.leafR, 11, 10, 2, 1); r(P.leafR, 12, 11, 1, 1); break;
    case T.CURB_S: pavers(5); r(P.curb, 0, 12, 16, 1); r(P.curbFace, 0, 13, 16, 2); r(P.curbLo, 0, 15, 16, 1); break;
    case T.CURB_N: pavers(6); r(P.curbLo, 0, 0, 16, 1); r(P.curbFace, 0, 1, 16, 1); r(P.curb, 0, 2, 16, 1); break;
    case T.CURB_E: pavers(7); r(P.curb, 12, 0, 1, 16); r(P.curbFace, 13, 0, 2, 16); r(P.curbLo, 15, 0, 1, 16); break;
    case T.CURB_W: pavers(8); r(P.curbLo, 0, 0, 1, 16); r(P.curbFace, 1, 0, 1, 16); r(P.curb, 2, 0, 1, 16); break;
    case T.DRAIN:
      pavers(9); r(P.curb, 0, 12, 16, 1); r(P.curbFace, 0, 13, 16, 2); r(P.curbLo, 0, 15, 16, 1);
      r(P.grate, 4, 9, 8, 4); for (let x = 5; x < 12; x += 2) r(P.curbLo, x, 10, 1, 2);
      break;
    case T.GRASS: grass(1); break;
    case T.GRASS_B: grass(2); r(P.clover, 4, 9, 1, 1); r(P.clover, 5, 10, 1, 1); r(P.clover, 3, 10, 1, 1); break;
    case T.GRASS_C: grass(3); r(P.pebble, 10, 11, 2, 2); r(P.pebbleHi, 10, 11, 1, 1); r(P.pebble, 4, 4, 1, 1); break;
    case T.GRASS_D: grass(4); for (const [x, y] of [[3, 3], [11, 7], [6, 12]]) { r(P.grassHi, x, y, 1, 3); r(P.grassHi, x + 1, y + 1, 1, 2); } break;
    case T.FLOWER:
      grass(5);
      flower(3, 4, P.petal); flower(11, 3, P.petal2); flower(6, 10, P.petal3); flower(12, 11, P.petal);
      break;
    case T.FLOWER_B:
      grass(6);
      flower(4, 3, P.petal4); flower(10, 6, P.petal); flower(4, 11, P.petal2); flower(12, 12, P.petal4);
      break;
    case T.TREE:
      grass(7);
      for (let x = 2; x < 15; x++) r(P.shadow, x, 12 + (x < 4 || x > 12 ? 1 : 0), 1, x < 4 || x > 12 ? 2 : 3);
      r(P.trunkLo, 7, 9, 3, 5); r(P.trunk, 7, 9, 2, 5); r(P.trunkLo, 6, 13, 5, 1);
      disc(P.leafLo, 8, 6, 6);
      disc(P.leaf, 7, 5, 5);
      for (const [x, y] of [[4, 3], [8, 2], [5, 6], [10, 5]]) disc(P.leafHi, x, y, 1);
      r(P.leafTop, 4, 2); r(P.leafTop, 8, 1); r(P.leafTop, 5, 5);
      for (const [x, y] of [[11, 8], [12, 6], [9, 10], [3, 9]]) r(P.leafLo, x, y);
      break;
    case T.BENCH:
      pavers(10);
      r(P.iron, 2, 6, 1, 8); r(P.iron, 13, 6, 1, 8); r(P.iron, 1, 13, 3, 1); r(P.iron, 12, 13, 3, 1);
      for (const y of [2, 4]) { r(P.bench, 1, y, 14, 1); r(P.benchLo, 1, y + 1, 14, 1); }
      r(P.benchHi, 1, 2, 14, 1);
      r(P.bench, 1, 8, 14, 2); r(P.benchHi, 1, 8, 14, 1); r(P.benchLo, 1, 10, 14, 1);
      break;
    case T.HEDGE:
      pavers(11);
      r(P.planterLo, 1, 10, 14, 5); r(P.planter, 1, 10, 14, 4); r(P.curb, 1, 10, 14, 1);
      disc(P.hedgeLo, 5, 7, 4); disc(P.hedgeLo, 11, 7, 4);
      disc(P.hedge, 5, 6, 3); disc(P.hedge, 11, 6, 3); r(P.hedge, 4, 3, 8, 6);
      for (const [x, y] of [[3, 4], [7, 3], [10, 4], [12, 6]]) r(P.hedgeHi, x, y, 2, 1);
      break;
    case T.PLAZA: plaza(0); break;
    case T.PLAZA_B: plaza(1); break;
    case T.PLAZA_C: plaza(2); break;
    case T.BILLBOARD:
      r(P.frame, 0, 0, 16, 16);
      r(P.screen, 1, 1, 14, 11); r(P.screen2, 1, 9, 14, 3);
      r(P.sun, 10, 3, 3, 3);
      r(P.screenText, 2, 3, 5, 1); r(P.screenText, 2, 5, 4, 1);
      r(P.frame, 6, 12, 4, 4);
      break;
  }
}

// ---------- buildings ----------
function drawThemed(ctx, theme, k, P, ox) {
  const { r, disc } = pen(ctx, ox);
  const roofBase = (seed) => {
    r(P.roof, 0, 0, 16, 16);
    scatter(seed, 6).forEach(([x, y]) => { r(P.roofHi, x, y); r(P.roofLo, x + 1, y + 1); });
  };
  const brickish = () => {
    r(P.wall, 0, 0, 16, 16);
    scatter(theme.length, 5).forEach(([x, y]) => r(P.wallHi, x, y, 2, 1));
  };

  if (k === K.ROOF || k === K.ROOF_DETAIL || k === K.ROOF_EAVE) {
    if (theme === 'aesthetic') {
      r(P.roof, 0, 0, 16, 16);
      for (let y = 0; y < 16; y += 4) {
        const off = (y / 4) % 2 ? 2 : 0;
        for (let x = -off; x < 16; x += 4) { r(P.roofHi, x + 1, y, 2, 1); r(P.roofLo, x, y + 3, 4, 1); r(P.roofLo, x + 3, y + 1, 1, 2); }
      }
    } else if (theme === 'scroll') {
      roofBase(3); r(P.roofLo, 0, 7, 16, 1); r(P.roofHi, 0, 8, 16, 1); r(P.roofLo, 9, 0, 1, 7);
      r(P.roofLo, 3, 10, 4, 2); r('#4a5a6a', 4, 10, 2, 1);
    } else if (theme === 'feed') {
      roofBase(4); r(P.roofLo, 0, 7, 16, 1); r(P.roofLo, 7, 0, 1, 16);
    } else {
      roofBase(2);
    }
    if (k === K.ROOF_DETAIL) {
      if (theme === 'hustle') {
        r(P.roofLo, 3, 12, 11, 2); r(P.detailLo, 3, 4, 10, 9); r(P.detail, 3, 4, 10, 7);
        disc(P.detailLo, 8, 7, 3); disc(P.roofLo, 8, 7, 2); r(P.detail, 8, 5, 1, 5); r(P.detail, 6, 7, 5, 1);
      } else if (theme === 'aesthetic') {
        r(P.trimLo, 4, 5, 8, 8); r(P.win, 5, 6, 6, 6); r(P.winLit2, 5, 6, 2, 2); r(P.trim, 4, 5, 8, 1);
      } else if (theme === 'scroll') {
        disc(P.detailLo, 8, 8, 5); disc(P.detail, 7, 7, 4); r(P.detailLo, 9, 9, 2, 2); r(P.detailLo, 8, 13, 1, 2); r(P.roofLo, 5, 14, 6, 1);
      } else {
        r(P.detailLo, 7, 3, 2, 11); r(P.detailLo, 4, 13, 8, 1); disc(P.detail, 8, 2, 1); r('#ffffff', 8, 2);
      }
    }
    if (k === K.ROOF_EAVE) {
      // the edge where the roof meets the wall below
      r(P.trimLo, 0, 11, 16, 1); r(P.trim, 0, 12, 16, 2); r(P.trimHi, 0, 12, 16, 1); r(P.trimLo, 0, 14, 16, 1); r('#1c1a24', 0, 15, 16, 1);
    }
    return;
  }

  const top = k === K.WALL_TOP || k === K.WALL_TOP_LIT;
  const lit = k === K.WALL_TOP_LIT || k === K.WALL_MID_LIT;
  const ground = k === K.WALL_GROUND || k === K.WALL_GROUND_ALT || k === K.DOOR;

  if (theme === 'hustle') {
    r(P.mullion, 0, 0, 16, 16);
    for (const [px, py, w, h] of [[1, 1, 6, 6], [9, 1, 6, 6], [1, 9, 6, 6], [9, 9, 6, 6]]) {
      const on = lit && (px + py) % 16 !== 0;
      r(on ? P.winLit : P.wall, px, py, w, h);
      r(on ? P.winLit2 : P.wallHi, px, py, w, 1); r(on ? P.winLit2 : P.wallHi, px, py, 1, h);
      r(on ? P.winLit : P.wallLo, px + w - 1, py + 1, 1, h - 1);
      if (!on) { r(P.wallHi, px + 2, py + 3); r(P.wallHi, px + 3, py + 2); }
    }
    if (top) { r(P.trim, 0, 0, 16, 2); r(P.trimHi, 0, 0, 16, 1); r(P.trimLo, 0, 2, 16, 1); }
    if (ground) {
      r(P.stone, 0, 12, 16, 4); r(P.stoneLo, 0, 15, 16, 1); r(P.trimLo, 0, 11, 16, 1);
      if (k === K.DOOR) { r(P.trim, 3, 2, 10, 10); r(P.mullion, 4, 3, 8, 9); r(P.winLit2, 5, 4, 2, 6); r(P.trim, 7, 3, 2, 9); r(P.trimHi, 3, 2, 10, 1); }
      if (k === K.WALL_GROUND_ALT) { r(P.stoneLo, 5, 8, 6, 4); r(P.plant, 6, 5, 4, 4); r(P.trimHi, 7, 5, 1, 1); }
    }
  } else if (theme === 'aesthetic') {
    brickish();
    r(P.wallLo, 0, 15, 16, 1);
    if (top) { r(P.trim, 0, 0, 16, 2); r(P.trimLo, 0, 2, 16, 1); }
    if (!ground) {
      // arched window with shutters and a flower box
      r(P.shutter, 2, 5, 2, 7); r(P.shutterLo, 3, 5, 1, 7); r(P.shutter, 12, 5, 2, 7); r(P.shutterLo, 13, 5, 1, 7);
      r(P.trim, 4, 4, 8, 9); r(P.trim, 5, 3, 6, 1);
      r(lit ? P.winLit : P.win, 5, 5, 6, 7); r(lit ? P.winLit2 : '#d4f0f8', 5, 5, 2, 2);
      r(P.trim, 7, 5, 1, 7); r(P.trim, 5, 8, 6, 1);
      r('#8a5a3a', 4, 13, 8, 2); r(P.detail, 4, 12, 8, 1); r('#ff7eb6', 5, 11, 1, 1); r('#ffd23f', 8, 11, 1, 1); r('#ffffff', 10, 11, 1, 1);
    } else {
      // striped, scalloped awning over a shop window
      for (let x = 0; x < 16; x += 4) { r(P.awning, x, 0, 2, 5); r(P.trim, x + 2, 0, 2, 5); r(P.awningLo, x, 4, 2, 1); }
      for (let x = 1; x < 16; x += 2) r(P.awningLo, x, 5, 1, 1);
      r(P.stone, 0, 14, 16, 2);
      if (k === K.DOOR) { r(P.door, 4, 7, 8, 7); r(P.door, 5, 6, 6, 1); r('#5a3a24', 11, 7, 1, 7); r(P.winLit2, 6, 8, 4, 2); r('#ffd23f', 10, 11, 1, 1); }
      else {
        r(P.trim, 1, 7, 14, 7); r(P.win, 2, 8, 12, 5); r('#d4f0f8', 2, 8, 3, 1);
        if (k === K.WALL_GROUND_ALT) { r('#ffd23f', 4, 11, 2, 2); r('#ff7eb6', 8, 10, 2, 3); r('#7fd6c0', 11, 11, 2, 2); }
        else { r('#c08a55', 3, 11, 3, 2); r('#ffffff', 9, 10, 3, 3); r('#8a5a3a', 10, 11, 1, 1); }
      }
    }
  } else if (theme === 'scroll') {
    r(P.wall, 0, 0, 16, 16);
    scatter(7, 4).forEach(([x, y]) => { r(P.wallLo, x, y, 1, 3); });
    r(P.wallLo, 0, 15, 16, 1);
    if (top) { r(P.trim, 0, 0, 16, 2); r(P.trimLo, 0, 2, 16, 1); r(P.trimLo, 3, 3, 1, 2); r(P.trimLo, 11, 3, 1, 3); }
    if (!ground) {
      r(P.trimLo, 3, 4, 10, 9); r(P.trim, 3, 4, 10, 1);
      r(lit ? P.winLit : P.win, 4, 5, 8, 7);
      if (!lit) for (let y = 5; y < 10; y += 2) r(P.blind, 4, y, 8, 1);
      else { r(P.winLit2, 4, 5, 3, 2); r('#7a5a3a', 7, 8, 3, 4); r('#7a5a3a', 8, 7, 1, 1); }
      r(P.trim, 3, 12, 10, 1);
      if (top && !lit) { r(P.detailLo, 11, 9, 4, 4); r(P.detail, 11, 9, 4, 3); r(P.detailLo, 12, 10, 2, 1); }
    } else if (k === K.DOOR) {
      r(P.door, 4, 3, 8, 13); r('#3a3a44', 11, 3, 1, 13); r(P.detailLo, 5, 5, 6, 1); r(P.detailLo, 5, 7, 6, 1); r(P.detail, 10, 10, 1, 1);
      r('#ffcf7a', 7, 1, 2, 1);
    } else {
      // roll-up shutter
      r(P.shutterLo, 1, 3, 14, 13); for (let y = 4; y < 15; y += 2) r(P.shutter, 1, y, 14, 1);
      r(P.trim, 1, 2, 14, 1);
      if (k === K.WALL_GROUND_ALT) { r(P.tag, 3, 8, 4, 1); r(P.tag, 6, 7, 1, 3); r(P.tag, 8, 9, 3, 1); r(P.tag, 11, 7, 2, 1); r(P.tag, 4, 11, 7, 1); }
    }
  } else {
    r(P.wall, 0, 0, 16, 16);
    r(P.wallLo, 0, 15, 16, 1);
    if (top) { r(P.trim, 0, 1, 16, 1); r(P.trimHi, 0, 1, 8, 1); }
    if (!ground) {
      for (const px of [2, 9]) {
        r(P.mullion, px, 4, 5, 8);
        r(lit ? P.winLit : P.win, px + 1, 5, 3, 6);
        if (lit) r(P.winLit2, px + 1, 5, 1, 2);
      }
    } else if (k === K.DOOR) {
      r(P.trim, 4, 4, 8, 12); r(P.win, 5, 5, 6, 11); r(P.trimHi, 4, 4, 8, 1);
    } else {
      r(P.mullion, 1, 3, 14, 11); r(k === K.WALL_GROUND_ALT ? P.winLit : P.win, 2, 4, 12, 9);
      if (k === K.WALL_GROUND_ALT) { r('#ffffff', 4, 6, 6, 1); r('#ffffff', 4, 8, 4, 1); r(P.winLit2, 2, 4, 12, 1); }
      r(P.trim, 1, 13, 14, 1);
    }
  }
}

// Builds 'tiles_color' and 'tiles_gray' (all themes in one strip each).
export function buildTileTextures(scene) {
  const variants = [
    ['tiles_color', GROUND, (t) => THEME_PAL[t]],
    ['tiles_gray', grayPalette(GROUND, GROUND_GRAY_KEEP), (t) => grayPalette(THEME_PAL[t], THEME_GRAY_KEEP[t])],
  ];
  for (const [key, ground, themePal] of variants) {
    canvasTexture(scene, key, TILE * TILE_COUNT, TILE, (ctx) => {
      for (let id = 0; id < THEMED_BASE; id++) drawGround(ctx, id, ground, id * TILE);
      THEMES.forEach((theme, ti) => {
        const P = themePal(theme);
        for (let k = 0; k < PER_THEME; k++) drawThemed(ctx, theme, k, P, (THEMED_BASE + ti * PER_THEME + k) * TILE);
      });
    });
  }
}

// ---------- map classification ----------
const isRoad = (rows, x, y) => rows[y]?.[x] === '.';

// Chooses the tile id for map cell (x, y), looking at neighbors for curbs, markings and wall height.
export function tileIdFor(rows, x, y, theme) {
  const ch = rows[y][x];
  const h = hash2(x, y);
  switch (ch) {
    case '.': {
      const up = isRoad(rows, x, y - 1);
      const dn = isRoad(rows, x, y + 1);
      const lf = isRoad(rows, x - 1, y);
      const rt = isRoad(rows, x + 1, y);
      const hTop = !up && dn && lf && rt;
      const hBot = up && !dn && lf && rt;
      const vLeft = !lf && rt && up && dn;
      const vRight = lf && !rt && up && dn;
      const vBand = (xx) => isRoad(rows, xx, y - 1) && isRoad(rows, xx, y + 1);
      const hBand = (yy) => isRoad(rows, x - 1, yy) && isRoad(rows, x + 1, yy);
      if ((hTop || hBot) && ((rt && vBand(x + 1) && !vBand(x)) || (lf && vBand(x - 1) && !vBand(x)))) return T.CROSS_H;
      if ((vLeft || vRight) && ((dn && hBand(y + 1) && !hBand(y)) || (up && hBand(y - 1) && !hBand(y)))) return T.CROSS_V;
      if (hTop) return T.LANE_HB;
      if (hBot) return T.LANE_HT;
      if (vLeft) return T.LANE_VR;
      if (vRight) return T.LANE_VL;
      if (h % 29 === 0) return T.MANHOLE;
      if (h % 13 === 0) return T.ROAD_PATCH;
      return h % 6 === 0 ? T.ROAD_B : T.ROAD;
    }
    case ',':
    case '=': {
      if (isRoad(rows, x, y + 1)) return h % 9 === 0 ? T.DRAIN : T.CURB_S;
      if (isRoad(rows, x, y - 1)) return T.CURB_N;
      if (isRoad(rows, x + 1, y)) return T.CURB_E;
      if (isRoad(rows, x - 1, y)) return T.CURB_W;
      return [T.SIDEWALK, T.SIDEWALK, T.SIDEWALK, T.SIDEWALK_B, T.SIDEWALK_C, T.SIDEWALK_D][h % 6];
    }
    case 'R': {
      if (rows[y + 1]?.[x] === 'W') return themed(theme, K.ROOF_EAVE);
      return themed(theme, h % 7 === 0 ? K.ROOF_DETAIL : K.ROOF);
    }
    case 'W': {
      const up = rows[y - 1]?.[x] === 'W';
      const below = rows[y + 1]?.[x];
      const dn = below === 'W';
      if (!dn) {
        // the ground floor: shopfronts and doors
        if (below && below !== 'R' && h % 7 === 0) return themed(theme, K.DOOR);
        return themed(theme, h % 3 === 0 ? K.WALL_GROUND_ALT : K.WALL_GROUND);
      }
      if (!up) return themed(theme, h % 3 === 0 ? K.WALL_TOP_LIT : K.WALL_TOP);
      return themed(theme, h % 3 === 0 ? K.WALL_MID_LIT : K.WALL_MID);
    }
    case 'g': return [T.GRASS, T.GRASS, T.GRASS_B, T.GRASS_C, T.GRASS_D][h % 5];
    case 'f': return h % 2 ? T.FLOWER_B : T.FLOWER;
    case 'T': return T.TREE;
    case 'b': return T.BENCH;
    case 'h': return T.HEDGE;
    case 'B': return T.BILLBOARD;
    case 'p': return [T.PLAZA, T.PLAZA, T.PLAZA, T.PLAZA_B, T.PLAZA_C][h % 5];
    default: return T.SIDEWALK;
  }
}
