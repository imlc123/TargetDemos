// 16px tiles. Ground tiles are shared; building tiles change with the level theme
// (glass towers, pastel storefronts, gray concrete, neon dark glass).
// Two strips are built: a full-color city and a gray one that keeps its neon.

import { TILE } from '../config.js';
import { canvasTexture, grayPalette, rect, dither, hash2, shade } from './pixels.js';

export const T = {
  ROAD: 0, ROAD_B: 1, MANHOLE: 2, LANE_HB: 3, LANE_HT: 4, LANE_VR: 5, LANE_VL: 6, CROSS_H: 7, CROSS_V: 8,
  SIDEWALK: 9, SIDEWALK_B: 10, CURB_S: 11, CURB_N: 12, CURB_E: 13, CURB_W: 14,
  GRASS: 15, GRASS_B: 16, FLOWER: 17, TREE: 18, BENCH: 19, HEDGE: 20, PLAZA: 21, PLAZA_B: 22, BILLBOARD: 23,
};
export const THEMES = ['hustle', 'aesthetic', 'scroll', 'feed'];
const THEMED_BASE = 24;
export const K = { ROOF: 0, ROOF_DETAIL: 1, WALL: 2, WALL_LIT: 3, DOOR: 4, WALL_ALT: 5 };
export const themed = (theme, k) => THEMED_BASE + THEMES.indexOf(theme) * 6 + k;
export const TILE_COUNT = THEMED_BASE + THEMES.length * 6;

export function isSolidTile(id) {
  if (id >= THEMED_BASE) return true;
  return id === T.TREE || id === T.BENCH || id === T.HEDGE || id === T.BILLBOARD;
}
export const SOLID = Array.from({ length: TILE_COUNT }, (_, i) => i).filter(isSolidTile);

const GROUND = {
  asphalt: '#3b3f4a', asphalt2: '#373b46', speck: '#4a4f5d', crack: '#2a2d36', lane: '#e8d36a', stripe: '#e9e9e9',
  manhole: '#2e3038', manholeHi: '#565a66',
  side: '#b0aa9e', side2: '#a6a094', sideEdge: '#8e897f', sideHi: '#c4bfb3', curb: '#d8d4ca', curbShade: '#6e6a62', gum: '#8a847a',
  grass: '#5fae4f', grassDark: '#3f8a3c', grassHi: '#7cc864', petal: '#ff6fa8', petal2: '#ffd23f', petal3: '#8fd3ff', center: '#fff4b0',
  trunk: '#6b4428', leaf: '#3f9b47', leafDark: '#2e7a38', leafHi: '#72c873', shadow: '#2f6a30',
  bench: '#c08a55', benchDark: '#7a5130', benchLeg: '#3b3b44',
  frame: '#2a2a33', screen: '#7fd1ff', screen2: '#7bd36a', screenText: '#ffffff', sun: '#ffe066',
  plaza: '#c9b99a', plazaDark: '#bcab8b', plazaHi: '#d8cbb0', plazaLine: '#a8987a',
  planter: '#8a6a4a', hedge: '#4f9a46', hedgeDark: '#357a34',
};
const GROUND_GRAY_KEEP = { screen: '#ff3fb4', screen2: '#3fe8ff', sun: '#ff3fb4', screenText: '#ffffff', frame: '#1c1c24' };

const THEME_PAL = {
  hustle: { roof: '#3e4a5e', roofHi: '#4e5a70', roofEdge: '#2c3546', detail: '#8a96a8', detailDark: '#5a6678', wall: '#4a7ab8', wall2: '#6a9ad4', wallDark: '#2f5585', trim: '#d9b44a', win: '#2a4a7a', winLit: '#ffd97a', door: '#d9b44a' },
  aesthetic: { roof: '#c4704a', roofHi: '#d88a62', roofEdge: '#94502e', detail: '#6fbf73', detailDark: '#3f8a4a', wall: '#f2b5c8', wall2: '#f8cad8', wallDark: '#d08aa2', trim: '#ffffff', win: '#9fd8e8', winLit: '#ffe8a0', door: '#8a5a3a', awning: '#ff7eb6' },
  scroll: { roof: '#55545a', roofHi: '#65646a', roofEdge: '#3c3b40', detail: '#c8c8cc', detailDark: '#8a8a90', wall: '#7a7068', wall2: '#8a8078', wallDark: '#5a5048', trim: '#9a9088', win: '#2a2e3a', winLit: '#ffcf7a', door: '#4a4a52', blind: '#b8b0a0', tag: '#ff3fb4' },
  feed: { roof: '#2a2438', roofHi: '#3a3250', roofEdge: '#1a1626', detail: '#ff3b4e', detailDark: '#5a5070', wall: '#302848', wall2: '#3a3258', wallDark: '#201a30', trim: '#b44aff', win: '#1a1a2a', winLit: '#ff5fd0', door: '#b44aff' },
};
const THEME_GRAY_KEEP = {
  hustle: { winLit: '#7fe3ff', roof: '#33303f', roofEdge: '#24212e', roofHi: '#403c4c' },
  aesthetic: { winLit: '#7fe3ff', awning: '#ff3fb4', roof: '#3a3446', roofEdge: '#28232f', roofHi: '#463f52' },
  scroll: { winLit: '#7fe3ff', tag: '#ff3fb4', roof: '#35333c', roofEdge: '#25232a', roofHi: '#423f48' },
  feed: { winLit: '#ff3fb4', trim: '#b44aff', detail: '#ff3b4e', roof: '#221d2e', roofEdge: '#14111c', roofHi: '#2e2840' },
};

function drawGround(ctx, id, P, ox) {
  const r = (c, x, y, w, h) => rect(ctx, c, ox + x, y, w, h);
  const road = (c = P.asphalt) => {
    r(c, 0, 0, 16, 16);
    for (const [x, y] of [[3, 4], [11, 9], [7, 13], [14, 2], [1, 11], [9, 5]]) r(P.speck, x, y, 1, 1);
  };
  const sidewalk = (c = P.side) => {
    r(c, 0, 0, 16, 16);
    r(P.sideEdge, 0, 7, 16, 1); r(P.sideEdge, 7, 0, 1, 16);
    r(P.sideEdge, 0, 15, 16, 1); r(P.sideEdge, 15, 0, 1, 16);
    r(P.sideHi, 0, 0, 7, 1); r(P.sideHi, 8, 8, 7, 1); r(P.sideHi, 0, 8, 1, 7); r(P.sideHi, 8, 0, 1, 7);
  };
  const grass = (c = P.grass) => {
    r(c, 0, 0, 16, 16);
    dither(ctx, P.grassDark, ox + 0, 12, 16, 4, 1);
    for (const [x, y] of [[2, 3], [10, 6], [6, 10], [13, 1], [4, 7]]) { r(P.grassDark, x, y, 1, 2); r(P.grassHi, x + 1, y, 1, 1); }
  };
  const flower = (x, y, c) => { r(P.grassDark, x, y + 2, 1, 2); r(c, x - 1, y, 3, 1); r(c, x, y - 1, 1, 3); r(P.center, x, y, 1, 1); };
  const plaza = (alt) => {
    r(P.plaza, 0, 0, 16, 16);
    r(P.plazaDark, 0, 0, 8, 8); r(P.plazaDark, 8, 8, 8, 8);
    r(P.plazaLine, 0, 15, 16, 1); r(P.plazaLine, 15, 0, 1, 16);
    r(P.plazaHi, 0, 0, 15, 1);
    if (alt) { r(P.plazaHi, 5, 5, 6, 6); r(P.plazaLine, 6, 6, 4, 4); r(P.plazaHi, 7, 7, 2, 2); }
  };
  switch (id) {
    case T.ROAD: road(); break;
    case T.ROAD_B: road(P.asphalt2); r(P.crack, 3, 5, 3, 1); r(P.crack, 6, 6, 2, 1); r(P.crack, 8, 7, 1, 2); break;
    case T.MANHOLE:
      road(); ctx.fillStyle = P.manhole; ctx.beginPath(); ctx.arc(ox + 8, 8, 5, 0, Math.PI * 2); ctx.fill();
      r(P.manholeHi, 5, 6, 6, 1); r(P.manholeHi, 5, 9, 6, 1); r(P.manholeHi, 7, 4, 2, 1);
      break;
    case T.LANE_HB: road(); r(P.lane, 3, 15, 8, 1); break;
    case T.LANE_HT: road(); r(P.lane, 3, 0, 8, 1); break;
    case T.LANE_VR: road(); r(P.lane, 15, 3, 1, 8); break;
    case T.LANE_VL: road(); r(P.lane, 0, 3, 1, 8); break;
    case T.CROSS_H: road(); for (const y of [1, 5, 9, 13]) r(P.stripe, 2, y, 12, 2); break;
    case T.CROSS_V: road(); for (const x of [1, 5, 9, 13]) r(P.stripe, x, 2, 2, 12); break;
    case T.SIDEWALK: sidewalk(); break;
    case T.SIDEWALK_B: sidewalk(P.side2); r(P.gum, 4, 3, 2, 1); r(P.gum, 11, 11, 1, 1); r(P.sideEdge, 10, 2, 3, 1); break;
    case T.CURB_S: sidewalk(); r(P.curb, 0, 13, 16, 2); r(P.curbShade, 0, 15, 16, 1); break;
    case T.CURB_N: sidewalk(); r(P.curbShade, 0, 0, 16, 1); r(P.curb, 0, 1, 16, 2); break;
    case T.CURB_E: sidewalk(); r(P.curb, 13, 0, 2, 16); r(P.curbShade, 15, 0, 1, 16); break;
    case T.CURB_W: sidewalk(); r(P.curbShade, 0, 0, 1, 16); r(P.curb, 1, 0, 2, 16); break;
    case T.GRASS: grass(); break;
    case T.GRASS_B: grass(); r('#ffffff', 5, 4, 1, 1); r('#ffffff', 11, 10, 1, 1); r(P.center, 12, 10, 1, 1); break;
    case T.FLOWER:
      grass();
      flower(3, 4, P.petal); flower(11, 3, P.petal2); flower(6, 10, P.petal3); flower(12, 11, P.petal);
      break;
    case T.TREE:
      grass();
      r(P.shadow, 2, 11, 13, 4);
      r(P.trunk, 7, 9, 3, 5); r(shade(P.trunk, 0.7), 9, 9, 1, 5);
      ctx.fillStyle = P.leafDark; ctx.beginPath(); ctx.arc(ox + 8, 6.5, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = P.leaf; ctx.beginPath(); ctx.arc(ox + 7.5, 5.5, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = P.leafHi; ctx.beginPath(); ctx.arc(ox + 5.5, 3.5, 2.5, 0, Math.PI * 2); ctx.fill();
      dither(ctx, P.leafDark, ox + 9, 6, 4, 4, 0);
      break;
    case T.BENCH:
      sidewalk();
      r(P.benchLeg, 2, 9, 1, 5); r(P.benchLeg, 13, 9, 1, 5);
      r(P.benchDark, 1, 3, 14, 1); r(P.bench, 1, 2, 14, 1); r(P.bench, 1, 4, 14, 1); r(P.benchDark, 1, 5, 14, 1);
      r(P.bench, 1, 8, 14, 2); r(P.benchDark, 1, 10, 14, 1); r(P.benchLeg, 1, 6, 1, 2); r(P.benchLeg, 14, 6, 1, 2);
      break;
    case T.HEDGE:
      sidewalk();
      r(P.planter, 1, 10, 14, 5); r(P.benchDark, 1, 14, 14, 1); r(shade(P.planter, 1.15), 1, 10, 14, 1);
      r(P.hedgeDark, 1, 3, 14, 8); r(P.hedge, 2, 2, 12, 7); dither(ctx, P.hedgeDark, ox + 3, 4, 10, 4, 0); r(P.leafHi, 4, 3, 3, 1);
      break;
    case T.PLAZA: plaza(false); break;
    case T.PLAZA_B: plaza(true); break;
    case T.BILLBOARD:
      r(P.frame, 0, 0, 16, 16);
      r(P.screen, 1, 1, 14, 11); r(P.screen2, 1, 9, 14, 3);
      r(P.sun, 10, 3, 3, 3);
      r(P.screenText, 2, 3, 5, 1); r(P.screenText, 2, 5, 4, 1);
      r(P.frame, 6, 12, 4, 4);
      break;
  }
}

function drawThemed(ctx, theme, k, P, ox) {
  const r = (c, x, y, w, h) => rect(ctx, c, ox + x, y, w, h);
  const roofBase = () => {
    r(P.roof, 0, 0, 16, 16);
    r(P.roofHi, 0, 0, 16, 1);
    r(P.roofEdge, 0, 15, 16, 1);
  };
  if (k === K.ROOF || k === K.ROOF_DETAIL) {
    roofBase();
    if (theme === 'hustle') {
      dither(ctx, P.roofHi, ox + 1, 2, 14, 12, 0);
      r(P.roof, 2, 3, 12, 10);
      if (k === K.ROOF_DETAIL) {
        r(P.detailDark, 3, 4, 10, 8); r(P.detail, 3, 4, 10, 6);
        for (let x = 4; x < 12; x += 2) r(P.detailDark, x, 5, 1, 4);
        r(P.roofEdge, 3, 12, 10, 1);
      }
    } else if (theme === 'aesthetic') {
      for (let y = 2; y < 15; y += 4) {
        r(P.roofEdge, 0, y + 2, 16, 1);
        for (let x = (y / 4) % 2 ? 0 : 2; x < 16; x += 4) r(P.roofHi, x, y, 2, 2);
      }
      if (k === K.ROOF_DETAIL) {
        r('#8a6a4a', 5, 7, 6, 5); r(P.detailDark, 4, 3, 8, 5); r(P.detail, 5, 3, 6, 3); r('#ff7eb6', 7, 3, 2, 1);
      }
    } else if (theme === 'scroll') {
      dither(ctx, P.roofHi, ox + 2, 3, 5, 3, 0);
      r(P.roofEdge, 9, 5, 4, 1); r(P.roofEdge, 12, 6, 1, 3);
      if (k === K.ROOF_DETAIL) {
        ctx.fillStyle = P.detail; ctx.beginPath(); ctx.ellipse(ox + 8, 7, 5, 4, -0.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = P.detailDark; ctx.beginPath(); ctx.ellipse(ox + 9, 8, 3, 2, -0.5, 0, Math.PI * 2); ctx.fill();
        r(P.detailDark, 8, 11, 1, 3); r(P.roofEdge, 6, 13, 5, 1);
      }
    } else {
      r(P.trim, 0, 14, 16, 1);
      dither(ctx, P.roofHi, ox + 2, 2, 12, 10, 1);
      if (k === K.ROOF_DETAIL) { r(P.detailDark, 7, 3, 2, 10); r(P.detailDark, 5, 12, 6, 1); r(P.detail, 7, 2, 2, 2); }
    }
    return;
  }

  // walls
  const lit = k === K.WALL_LIT;
  if (theme === 'hustle') {
    r(P.wall, 0, 0, 16, 16);
    for (const [px, py] of [[1, 1], [9, 1], [1, 8], [9, 8]]) {
      r(lit && (px + py) % 2 === 0 ? P.winLit : P.wall, px, py, 6, 6);
      r(P.wall2, px, py, 2, 1); r(P.wall2, px, py, 1, 2);
    }
    r(P.wall2, 3, 5, 1, 1); r(P.wall2, 4, 4, 1, 1); r(P.wall2, 5, 3, 1, 1);
    r(P.trim, 0, 0, 16, 1); r(P.trim, 0, 7, 16, 1); r(P.trim, 0, 0, 1, 16); r(P.trim, 8, 0, 1, 14);
    r(P.wallDark, 0, 14, 16, 2);
    if (k === K.DOOR) { r(P.trim, 3, 4, 10, 12); r(P.win, 4, 5, 8, 11); r(P.wall2, 5, 6, 2, 4); r(P.trim, 7, 5, 2, 11); }
    if (k === K.WALL_ALT) { r(P.trim, 2, 9, 12, 4); r(P.wallDark, 3, 10, 10, 2); }
  } else if (theme === 'aesthetic') {
    r(P.wall, 0, 0, 16, 16);
    dither(ctx, P.wall2, ox, 4, 16, 10, 0);
    r(P.wall, 3, 5, 10, 9);
    for (let x = 0; x < 16; x += 4) { r(P.awning, x, 0, 2, 4); r(P.trim, x + 2, 0, 2, 4); }
    r(shade(P.awning, 0.8), 0, 4, 16, 1);
    r(P.wallDark, 0, 14, 16, 2);
    if (k === K.DOOR) {
      r(P.door, 4, 6, 8, 10); r(P.door, 5, 5, 6, 1); r(shade(P.door, 0.75), 11, 6, 1, 10); r(P.trim, 9, 11, 1, 1);
    } else {
      r(P.trim, 4, 6, 8, 8); r(P.trim, 5, 5, 6, 1);
      r(lit ? P.winLit : P.win, 5, 7, 6, 6); r(lit ? P.winLit : P.win, 6, 6, 4, 1);
      r(P.trim, 7, 6, 1, 7);
      r(P.detail, 5, 12, 6, 1); r(P.detailDark, 6, 11, 1, 1); r('#ff7eb6', 9, 11, 1, 1);
      if (k === K.WALL_ALT) { r('#8a5a3a', 3, 13, 10, 2); r(P.detail, 4, 12, 8, 1); r('#ffd23f', 5, 11, 1, 1); r('#ff7eb6', 9, 11, 1, 1); }
    }
  } else if (theme === 'scroll') {
    r(P.wall, 0, 0, 16, 16);
    dither(ctx, P.wallDark, ox + 11, 0, 3, 6, 0);
    r(P.wallDark, 0, 0, 16, 1); r(P.wallDark, 0, 14, 16, 2);
    if (k === K.DOOR) {
      r(P.door, 4, 4, 8, 12); r(shade(P.door, 0.7), 11, 4, 1, 12); r(P.trim, 5, 6, 6, 1); r(P.trim, 5, 8, 6, 1); r(P.detail, 10, 10, 1, 1);
    } else {
      r(P.trim, 3, 3, 10, 9);
      r(lit ? P.winLit : P.win, 4, 4, 8, 7);
      if (!lit) for (let y = 4; y < 8; y += 2) r(P.blind, 4, y, 8, 1);
      else { r(shade(P.winLit, 0.6), 7, 7, 3, 4); r(shade(P.winLit, 0.6), 8, 6, 1, 1); }
      r(P.wallDark, 3, 12, 10, 1);
      if (k === K.WALL_ALT) { r(P.tag, 2, 12, 4, 1); r(P.tag, 5, 11, 1, 2); r(P.tag, 7, 12, 3, 1); r(P.tag, 10, 11, 2, 1); }
    }
  } else {
    r(P.wall, 0, 0, 16, 16);
    r(P.trim, 0, 2, 16, 1);
    r(P.wallDark, 0, 14, 16, 2);
    if (k === K.DOOR) { r(P.trim, 4, 5, 8, 11); r(P.win, 5, 6, 6, 10); }
    else {
      for (const px of [2, 9]) { r(P.wall2, px, 5, 5, 7); r(lit ? P.winLit : P.win, px + 1, 6, 3, 5); }
      if (k === K.WALL_ALT) for (let y = 6; y < 12; y += 2) r(P.wallDark, 3, y, 10, 1);
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
        for (let k = 0; k < 6; k++) drawThemed(ctx, theme, k, P, (THEMED_BASE + ti * 6 + k) * TILE);
      });
    });
  }
}

// ---------- map classification ----------
const isRoad = (rows, x, y) => rows[y]?.[x] === '.';

// Chooses the tile id for map cell (x, y), looking at neighbors for curbs and road markings.
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
      // crosswalks: a horizontal road tile next to a vertical road band, or vice versa
      const vBand = (xx) => isRoad(rows, xx, y - 1) && isRoad(rows, xx, y + 1);
      const hBand = (yy) => isRoad(rows, x - 1, yy) && isRoad(rows, x + 1, yy);
      if ((hTop || hBot) && ((rt && vBand(x + 1) && !vBand(x)) || (lf && vBand(x - 1) && !vBand(x)))) return T.CROSS_H;
      if ((vLeft || vRight) && ((dn && hBand(y + 1) && !hBand(y)) || (up && hBand(y - 1) && !hBand(y)))) return T.CROSS_V;
      if (hTop) return T.LANE_HB;
      if (hBot) return T.LANE_HT;
      if (vLeft) return T.LANE_VR;
      if (vRight) return T.LANE_VL;
      if (h % 29 === 0) return T.MANHOLE;
      return h % 6 === 0 ? T.ROAD_B : T.ROAD;
    }
    case ',':
    case '=': {
      if (isRoad(rows, x, y + 1)) return T.CURB_S;
      if (isRoad(rows, x, y - 1)) return T.CURB_N;
      if (isRoad(rows, x + 1, y)) return T.CURB_E;
      if (isRoad(rows, x - 1, y)) return T.CURB_W;
      return h % 7 === 0 ? T.SIDEWALK_B : T.SIDEWALK;
    }
    case 'R': return themed(theme, h % 7 === 0 ? K.ROOF_DETAIL : K.ROOF);
    case 'W': {
      const below = rows[y + 1]?.[x];
      if (below && below !== 'R' && below !== 'W' && h % 9 === 0) return themed(theme, K.DOOR);
      if (h % 11 === 0) return themed(theme, K.WALL_ALT);
      return themed(theme, h % 3 === 0 ? K.WALL_LIT : K.WALL);
    }
    case 'g': return h % 5 === 0 ? T.GRASS_B : T.GRASS;
    case 'f': return T.FLOWER;
    case 'T': return T.TREE;
    case 'b': return T.BENCH;
    case 'h': return T.HEDGE;
    case 'B': return T.BILLBOARD;
    case 'p': return h % 9 === 0 ? T.PLAZA_B : T.PLAZA;
    default: return T.SIDEWALK;
  }
}
