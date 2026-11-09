// All art is drawn in code from tiny pixel maps.
// Each character sprite is drawn twice: a gray "locked" version (screen-blue eyes)
// and a full-color "freed" version.

import { TILE } from '../config.js';

// ---------- color helpers ----------
function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r, g, b) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return '#' + c(r) + c(g) + c(b);
}
// Cool, slightly dim gray: the color of a life lived through a screen.
export function desaturate(h) {
  const [r, g, b] = hexToRgb(h);
  const l = 0.3 * r + 0.59 * g + 0.11 * b;
  const v = l * 0.72 + 18;
  return rgbToHex(v * 0.92, v * 0.96, v * 1.1);
}
function grayPalette(pal, overrides = {}) {
  const out = {};
  for (const k in pal) out[k] = overrides[k] ?? desaturate(pal[k]);
  return out;
}

// ---------- canvas helpers ----------
function canvasTexture(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  draw(ctx);
  tex.refresh();
  return tex;
}
function drawRows(ctx, rows, pal, ox = 0, oy = 0) {
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.') continue;
      const col = pal[ch];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  });
}
// Second walk frame: spread the legs apart from legRow down.
function walkFrame(rows, legRow) {
  return rows.map((row, y) => {
    if (y < legRow) return row;
    const out = Array(row.length).fill('.');
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.') continue;
      const nx = x < row.length / 2 ? x - 1 : x + 1;
      if (nx >= 0 && nx < row.length) out[nx] = ch;
    }
    return out.join('');
  });
}

// ---------- character pixel maps (16 wide) ----------
const KID = [
  '................',
  '......RRRR......',
  '.....RRRRRR.....',
  '.....RRRRRRRR...',
  '.....HSSSSH.....',
  '.....SESSES.....',
  '.....SSSSSS.....',
  '......SSSS.W.W..',
  '.....YYYYYY.W...',
  '....SYYYYYYSW...',
  '....SYYYYYYS....',
  '.....YYYYYY.....',
  '.....BBBBBB.....',
  '.....BB..BB.....',
  '.....SS..SS.....',
  '.....KK..KK.....',
];
const KID_PAL = {
  R: '#e8433f', H: '#6b3e1f', S: '#f2c29b', E: '#2a1d1a',
  Y: '#ffd23f', B: '#3f6fd8', K: '#2b2b3a', W: '#8a5a2b',
};

const BRO = [
  '................',
  '.....NNNNNN.....',
  '...NNNNNNNN.....',
  '.....SSSSSS.....',
  '.....SESSES.....',
  '.....SSSSSS.....',
  '.....SSMMSS.....',
  '.......SS.......',
  '..SSTTTTTTTTSS..',
  '..SSTTTTTTTTSS..',
  '.SS.TTTTTTTT.SS.',
  '.SS.TTTTTTTT.SS.',
  '.SS.TTTTTTTT.SS.',
  '.SS.GGGGGGGG.SS.',
  '....GGGGGGGG....',
  '....GGG..GGG....',
  '.....SS..SS.....',
  '.....SS..SS.....',
  '.....SS..SS.....',
  '....WWW..WWW....',
];
const INFLUENCER = [
  '................',
  '.....LLLLLL.....',
  '....LLLLLLLL....',
  '....LSSSSSSL....',
  '....LSESSESL....',
  '....LSSSSSSL....',
  '....LLSQQSLL....',
  '....LL.SS.LL....',
  '....LPPPPPPL....',
  '...SSPPPPPPSS...',
  '...S.PPPPPP.S...',
  '...S.SSSSSS.S...',
  '...S.VVVVVV.S...',
  '....VVVVVVVV....',
  '.....VVVVVV.....',
  '.....VV..VV.....',
  '.....VV..VV.....',
  '.....VV..VV.....',
  '.....VV..VV.....',
  '....KKK..KKK....',
];
const DOOM = [
  '................',
  '................',
  '......OOOO......',
  '.....OOOOOO.....',
  '....OOSSSSOO....',
  '....OSESSESO....',
  '....OSSSSSSO....',
  '....OOSSSSOO....',
  '...OOOOOOOOOO...',
  '..OOOOOOOOOOOO..',
  '..OO.OOOOOO.OO..',
  '..OO.OOOOOO.OO..',
  '..SS.OOOOOO.SS..',
  '....DDDDDDDD....',
  '....DDDDDDDD....',
  '....DDD..DDD....',
  '.....DD..DD.....',
  '.....DD..DD.....',
  '.....DD..DD.....',
  '....KKK..KKK....',
];

const SKINS = ['#f2c29b', '#c68b5e', '#8d5a3b'];
export const LOOKS = 6; // skin (3) x accent (2)

function npcPalette(kind, look) {
  const S = SKINS[look % 3];
  const a = Math.floor(look / 3) % 2;
  const E = '#2a1d1a';
  if (kind === 'bro') {
    return { S, E, N: ['#27408b', '#8b2740'][a], M: '#9b4a3a', T: ['#1fbfa5', '#ff8a3d'][a], G: '#4a4a5a', W: '#f4f4f4' };
  }
  if (kind === 'influencer') {
    return { S, E, L: ['#f3d36b', '#2a1a14'][a], P: ['#ff7eb6', '#7ee0ff'][a], Q: '#d9485f', V: ['#a98bff', '#ffb36b'][a], K: '#5a3a5a' };
  }
  return { S, E, O: ['#e09a3a', '#5fbf6a'][a], D: '#5b6d8a', K: '#333344' };
}
const MAPS = { bro: BRO, influencer: INFLUENCER, doom: DOOM };
const SCREEN_EYES = { E: '#8fe9ff' };

// ---------- tiles ----------
// Tile ids used by the tilemap.
export const T = {
  ROAD: 0, SIDEWALK: 1, CROSSWALK: 2, ROOF: 3, WINDOW: 4, WINDOW_LIT: 5, GRASS: 6, FLOWER: 7,
  TREE: 8, BENCH: 9, BILLBOARD: 10, PLAZA: 11, HEDGE: 12, ROOF_VENT: 13,
};
export const TILE_COUNT = 14;
export const SOLID = [T.ROOF, T.WINDOW, T.WINDOW_LIT, T.TREE, T.BENCH, T.BILLBOARD, T.HEDGE, T.ROOF_VENT];

const TILE_PAL = {
  asphalt: '#3b3f4a', asphaltSpeck: '#4a4f5d', stripe: '#e9e9e9',
  side: '#a9a49a', sideEdge: '#8e897f', sideHi: '#bdb8ad',
  roof: '#6b5a7a', roofEdge: '#4f4160', roofHi: '#7d6b8e', roofVent: '#8f80a0',
  wall: '#b8735a', wallDark: '#8f553f', window: '#2d3a55', windowLit: '#ffd97a', windowFrame: '#e8d8c8',
  grass: '#5fae4f', grassDark: '#3f8a3c', grassHi: '#7cc864',
  petal: '#ff6fa8', petal2: '#ffd23f', petal3: '#8fd3ff', center: '#fff4b0',
  trunk: '#6b4428', leaf: '#3f9b47', leafDark: '#2e7a38', leafHi: '#66c06a',
  bench: '#c08a55', benchDark: '#7a5130', benchLeg: '#3b3b44',
  frame: '#2a2a33', screen: '#7fd1ff', screen2: '#7bd36a', screenText: '#ffffff', sun: '#ffe066',
  plaza: '#c9b99a', plazaDark: '#bcab8b', plazaHi: '#d8cbb0',
  planter: '#8a6a4a', hedge: '#4f9a46', hedgeDark: '#357a34',
};
// The gray city keeps its neon: screens, lit windows and billboards glow.
const TILE_PAL_GRAY = grayPalette(TILE_PAL, {
  windowLit: '#7fe3ff', screen: '#ff3fb4', screen2: '#3fe8ff', sun: '#ff3fb4', screenText: '#ffffff', frame: '#1c1c24',
  roof: '#3b3649', roofEdge: '#2a2636', roofHi: '#4a4459', roofVent: '#5a546c',
});

function drawTile(ctx, id, P, ox) {
  const r = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(ox + x, y, w, h); };
  const sidewalk = () => {
    r(P.side, 0, 0, 16, 16);
    r(P.sideEdge, 0, 7, 16, 1); r(P.sideEdge, 7, 0, 1, 16);
    r(P.sideEdge, 0, 15, 16, 1); r(P.sideEdge, 15, 0, 1, 16);
    r(P.sideHi, 1, 0, 6, 1); r(P.sideHi, 9, 8, 6, 1);
  };
  const grass = () => {
    r(P.grass, 0, 0, 16, 16);
    r(P.grassDark, 2, 3, 1, 2); r(P.grassDark, 10, 6, 1, 2); r(P.grassDark, 6, 11, 1, 2); r(P.grassDark, 13, 1, 1, 2);
    r(P.grassHi, 13, 12, 1, 1); r(P.grassHi, 4, 8, 1, 1);
  };
  const flower = (x, y, c) => {
    r(P.grassDark, x, y + 2, 1, 2);
    r(c, x - 1, y, 3, 1); r(c, x, y - 1, 1, 3); r(P.center, x, y, 1, 1);
  };
  switch (id) {
    case T.ROAD:
      r(P.asphalt, 0, 0, 16, 16);
      r(P.asphaltSpeck, 3, 4, 1, 1); r(P.asphaltSpeck, 11, 9, 1, 1); r(P.asphaltSpeck, 7, 13, 1, 1); r(P.asphaltSpeck, 14, 2, 1, 1);
      break;
    case T.SIDEWALK: sidewalk(); break;
    case T.CROSSWALK:
      r(P.asphalt, 0, 0, 16, 16); r(P.stripe, 2, 0, 3, 16); r(P.stripe, 10, 0, 3, 16);
      break;
    case T.ROOF:
    case T.ROOF_VENT:
      r(P.roof, 0, 0, 16, 16); r(P.roofHi, 0, 0, 16, 1); r(P.roofEdge, 0, 15, 16, 1);
      r(P.roofEdge, 4, 6, 1, 1); r(P.roofEdge, 11, 3, 1, 1); r(P.roofEdge, 9, 12, 1, 1);
      if (id === T.ROOF_VENT) { r(P.roofVent, 5, 5, 6, 5); r(P.roofEdge, 5, 10, 6, 1); r(P.roofEdge, 6, 7, 4, 1); }
      break;
    case T.WINDOW:
    case T.WINDOW_LIT: {
      r(P.wall, 0, 0, 16, 16); r(P.wallDark, 0, 0, 16, 1); r(P.wallDark, 0, 14, 16, 2);
      r(P.windowFrame, 2, 3, 5, 8); r(P.windowFrame, 9, 3, 5, 8);
      const w = id === T.WINDOW_LIT ? P.windowLit : P.window;
      r(w, 3, 4, 3, 6); r(w, 10, 4, 3, 6);
      break;
    }
    case T.GRASS: grass(); break;
    case T.FLOWER:
      grass();
      flower(3, 4, P.petal); flower(11, 3, P.petal2); flower(6, 10, P.petal3); flower(12, 11, P.petal);
      break;
    case T.TREE:
      grass();
      r(P.grassDark, 3, 12, 11, 3);
      r(P.trunk, 7, 10, 2, 4);
      r(P.leafDark, 3, 2, 10, 9); r(P.leaf, 4, 1, 8, 9); r(P.leaf, 2, 3, 12, 6); r(P.leafHi, 5, 2, 3, 2); r(P.leafHi, 3, 4, 1, 2);
      break;
    case T.BENCH:
      sidewalk();
      r(P.benchLeg, 3, 9, 1, 4); r(P.benchLeg, 12, 9, 1, 4);
      r(P.benchDark, 1, 5, 14, 2); r(P.bench, 1, 4, 14, 1); r(P.bench, 1, 8, 14, 2); r(P.benchDark, 1, 10, 14, 1);
      break;
    case T.BILLBOARD:
      r(P.frame, 0, 0, 16, 16);
      r(P.screen, 1, 1, 14, 11); r(P.screen2, 1, 9, 14, 3);
      r(P.sun, 10, 3, 3, 3);
      r(P.screenText, 2, 3, 5, 1); r(P.screenText, 2, 5, 4, 1);
      r(P.frame, 6, 12, 4, 4);
      break;
    case T.PLAZA:
      r(P.plaza, 0, 0, 16, 16); r(P.plazaDark, 0, 0, 8, 8); r(P.plazaDark, 8, 8, 8, 8);
      r(P.plazaHi, 0, 0, 16, 1);
      break;
    case T.HEDGE:
      sidewalk();
      r(P.planter, 1, 10, 14, 5); r(P.benchDark, 1, 14, 14, 1);
      r(P.hedgeDark, 1, 3, 14, 8); r(P.hedge, 2, 2, 12, 7); r(P.leafHi, 4, 3, 3, 2);
      break;
  }
}

// ---------- small effect textures ----------
function radial(scene, key, size, stops) {
  canvasTexture(scene, key, size, size, (ctx) => {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(([p, c]) => g.addColorStop(p, c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  });
}

export function buildTextures(scene) {
  // Kid: always in color; a gray variant is used when the feed "onboards" you.
  const kidGray = grayPalette(KID_PAL, SCREEN_EYES);
  [KID, walkFrame(KID, 13)].forEach((rows, f) => {
    canvasTexture(scene, `kid_${f}`, 16, 16, (ctx) => drawRows(ctx, rows, KID_PAL));
    canvasTexture(scene, `kid_gray_${f}`, 16, 16, (ctx) => drawRows(ctx, rows, kidGray));
  });

  // NPCs: kind x look x variant x frame
  for (const kind of Object.keys(MAPS)) {
    const frames = [MAPS[kind], walkFrame(MAPS[kind], 15)];
    for (let look = 0; look < LOOKS; look++) {
      const color = npcPalette(kind, look);
      const gray = grayPalette(color, SCREEN_EYES);
      frames.forEach((rows, f) => {
        canvasTexture(scene, `${kind}_${look}_color_${f}`, 16, 20, (ctx) => drawRows(ctx, rows, color));
        canvasTexture(scene, `${kind}_${look}_gray_${f}`, 16, 20, (ctx) => drawRows(ctx, rows, gray));
      });
    }
  }

  // Tile strips
  for (const [key, pal] of [['tiles_color', TILE_PAL], ['tiles_gray', TILE_PAL_GRAY]]) {
    canvasTexture(scene, key, TILE * TILE_COUNT, TILE, (ctx) => {
      for (let id = 0; id < TILE_COUNT; id++) drawTile(ctx, id, pal, id * TILE);
    });
  }

  // Effects
  radial(scene, 'glow', 32, [[0, 'rgba(255,255,255,1)'], [0.4, 'rgba(255,255,255,0.35)'], [1, 'rgba(255,255,255,0)']]);
  radial(scene, 'aura', 96, [[0, 'rgba(30,0,50,0.55)'], [0.7, 'rgba(50,5,80,0.45)'], [0.9, 'rgba(160,70,230,0.45)'], [1, 'rgba(60,0,90,0)']]);
  canvasTexture(scene, 'shadow', 12, 4, (ctx) => {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(2, 0, 8, 4); ctx.fillRect(0, 1, 12, 2);
  });
  canvasTexture(scene, 'pebble', 3, 3, (ctx) => drawRows(ctx, ['.G.', 'GGG', '.G.'], { G: '#e6dccb' }));
  canvasTexture(scene, 'shard', 2, 2, (ctx) => { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 2, 2); });
  canvasTexture(scene, 'pollen', 2, 2, (ctx) => { ctx.fillStyle = '#ffe066'; ctx.fillRect(0, 0, 2, 2); });
  canvasTexture(scene, 'puff', 4, 4, (ctx) => drawRows(ctx, ['.WW.', 'WWWW', 'WWWW', '.WW.'], { W: '#ffffff' }));
  canvasTexture(scene, 'heart', 7, 6, (ctx) => drawRows(ctx, ['.PP.PP.', 'PPPPPPP', 'PPPPPPP', '.PPPPP.', '..PPP..', '...P...'], { P: '#ff6f9f' }));
  canvasTexture(scene, 'star', 5, 5, (ctx) => drawRows(ctx, ['..Y..', '.YYY.', 'YYYYY', '.YYY.', '..Y..'], { Y: '#ffe066' }));
  canvasTexture(scene, 'recdot', 3, 3, (ctx) => drawRows(ctx, ['.R.', 'RRR', '.R.'], { R: '#ff3b4e' }));
  canvasTexture(scene, 'ring', 12, 12, (ctx) => {
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 2); ctx.stroke();
  });
  canvasTexture(scene, 'reticle', 15, 15, (ctx) => drawRows(ctx, [
    'WWW.........WWW', 'W.............W', 'W.............W', '...............', '...............',
    '...............', '...............', '...............', '...............', '...............',
    '...............', '...............', 'W.............W', 'W.............W', 'WWW.........WWW',
  ], { W: '#ffffff' }));
  canvasTexture(scene, 'paper_doom', 12, 9, (ctx) => drawRows(ctx, [
    'RRRRRRRRRRRR', 'RWWRRWRRWWRR', 'RRRRRRRRRRRR', 'PPPPPPPPPPPP', 'PKKKKKKPKKKP',
    'PPPPPPPPPPPP', 'PKKKKPKKKKKP', 'PPPPPPPPPPPP', 'KKKKKKKKKKKK',
  ], { R: '#b3202f', W: '#ffffff', P: '#e8e2d0', K: '#555566' }));
  canvasTexture(scene, 'paper_good', 12, 9, (ctx) => drawRows(ctx, [
    'OOOOOOOOOOOO', 'OWWOWWOOWWOO', 'OOOOOOOOOOOO', 'PPPPPPPPPYPP', 'PKKKKKPPYYYP',
    'PPPPPPPPPYPP', 'PKKKKPKKKPPP', 'PPPPPPPPPPPP', 'GGGGGGGGGGGG',
  ], { O: '#ffb800', W: '#ffffff', P: '#fff6c8', K: '#8a7a4a', Y: '#ff9a00', G: '#7bd36a' }));
  const chart = (key, pts, line) => canvasTexture(scene, key, 12, 9, (ctx) => {
    ctx.fillStyle = '#2a2f3d'; ctx.fillRect(0, 0, 12, 9);
    ctx.fillStyle = '#10131c'; ctx.fillRect(1, 1, 10, 7);
    ctx.fillStyle = line;
    pts.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
  });
  chart('chart_up', [[1, 7], [2, 6], [3, 6], [4, 5], [5, 6], [6, 4], [7, 3], [8, 3], [9, 2], [10, 1], [9, 1], [10, 2]], '#3dff8a');
  chart('chart_down', [[1, 1], [2, 2], [3, 2], [4, 3], [5, 2], [6, 4], [7, 5], [8, 5], [9, 6], [10, 7], [9, 7], [10, 6]], '#ff3b5c');

  // Vignette for the UI when the meter is high
  canvasTexture(scene, 'vignette', 240, 135, (ctx) => {
    const g = ctx.createRadialGradient(120, 67, 30, 120, 67, 140);
    g.addColorStop(0, 'rgba(255,40,160,0)');
    g.addColorStop(0.6, 'rgba(180,30,200,0.25)');
    g.addColorStop(1, 'rgba(120,0,160,0.85)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 240, 135);
  });
}
