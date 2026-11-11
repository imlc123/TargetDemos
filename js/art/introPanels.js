// Comic-style close-up panels for the intro. Each is 120x72 and shown at 4x,
// so they can carry more detail than the wide shot of the bedroom.

import { canvasTexture, rect, drawText } from './pixels.js';

export const PANEL_W = 120;
export const PANEL_H = 72;

// small pixel helpers (no anti-aliased paths, so edges stay crisp)
function disc(ctx, c, cx, cy, r) {
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) rect(ctx, c, cx + x, cy + y, 1, 1);
}
function line(ctx, c, x0, y0, x1, y1, w = 1) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= n; i++) rect(ctx, c, Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), w, w);
}
function tri(ctx, c, a, b, d) {
  const minY = Math.floor(Math.min(a[1], b[1], d[1]));
  const maxY = Math.ceil(Math.max(a[1], b[1], d[1]));
  const edges = [[a, b], [b, d], [d, a]];
  for (let y = minY; y <= maxY; y++) {
    const xs = [];
    for (const [p, q] of edges) {
      if ((p[1] <= y && q[1] > y) || (q[1] <= y && p[1] > y)) xs.push(p[0] + ((y - p[1]) * (q[0] - p[0])) / (q[1] - p[1]));
    }
    if (xs.length >= 2) {
      xs.sort((m, n) => m - n);
      rect(ctx, c, Math.round(xs[0]), y, Math.max(1, Math.round(xs[xs.length - 1] - xs[0])), 1);
    }
  }
}
function slingshot(ctx, x, y, s = 1) {
  // a chunky Y-shaped slingshot, fork up; (x, y) is the top-left
  const R = (c, a, b, w, h) => rect(ctx, c, x + a * s, y + b * s, w * s, h * s);
  R('#6b4020', 4, 7, 3, 8); R('#9a6332', 4, 7, 2, 8);
  R('#9a6332', 3, 5, 5, 2);
  R('#9a6332', 1, 0, 2, 6); R('#6b4020', 2, 2, 1, 4);
  R('#9a6332', 8, 0, 2, 6); R('#6b4020', 8, 2, 1, 4);
  R('#c08a55', 1, 0, 1, 1); R('#c08a55', 8, 0, 1, 1);
  R('#e8433f', 2, 1, 7, 1);
  // the note tied on
  R('#f4efe0', 7, 9, 4, 3); R('#c8c0b0', 7, 11, 4, 1);
}

// The feed on the phone screen: a tall strip that scrolls upward.
function feedStrip(ctx) {
  rect(ctx, '#f4f4fa', 0, 0, 22, 132);
  const posts = [
    ['#ff3fb4', 'chart'], ['#3fe8ff', 'face'], ['#ffd23f', 'bang'], ['#9a5cff', 'face'], ['#3dff8a', 'chart'], ['#ff8a3d', 'bang'],
  ];
  posts.forEach(([c, icon], i) => {
    const y = i * 22;
    disc(ctx, c, 3, y + 3, 2);
    rect(ctx, '#2a2a3a', 7, y + 2, 10, 1);
    rect(ctx, c, 1, y + 6, 20, 10);
    if (icon === 'chart') { line(ctx, '#ffffff', 3, y + 14, 8, y + 10); line(ctx, '#ffffff', 8, y + 10, 12, y + 12); line(ctx, '#ffffff', 12, y + 12, 18, y + 7); }
    if (icon === 'face') { disc(ctx, '#ffffff', 11, y + 11, 3); rect(ctx, c, 10, y + 10, 1, 1); rect(ctx, c, 12, y + 10, 1, 1); rect(ctx, c, 10, y + 12, 3, 1); }
    if (icon === 'bang') { rect(ctx, '#ffffff', 10, y + 7, 2, 5); rect(ctx, '#ffffff', 10, y + 13, 2, 2); }
    rect(ctx, '#ff3b5c', 2, y + 18, 3, 2); rect(ctx, '#9a9aaa', 7, y + 18, 12, 1); rect(ctx, '#c8c8d0', 7, y + 20, 8, 1);
  });
}

// Panel 1: hands holding the glowing phone (gray, lit blue).
function phonePanel(ctx) {
  rect(ctx, '#120f1e', 0, 0, PANEL_W, PANEL_H);
  for (let i = 0; i < 6; i++) disc(ctx, `rgba(127,227,255,${0.05 + i * 0.012})`, 60, 34, 46 - i * 7);
  // sleeves
  rect(ctx, '#4a4a60', 14, 58, 32, 14); rect(ctx, '#5a5a74', 14, 58, 32, 3);
  rect(ctx, '#4a4a60', 74, 58, 32, 14); rect(ctx, '#5a5a74', 74, 58, 32, 3);
  // hands behind the phone
  const skin = '#a8b4cc';
  const skinLo = '#7e88a4';
  const skinHi = '#cfe2f4';
  rect(ctx, skin, 32, 30, 16, 30); rect(ctx, skinLo, 32, 54, 16, 6); rect(ctx, skinHi, 44, 30, 4, 26);
  rect(ctx, skin, 72, 28, 16, 32); rect(ctx, skinLo, 72, 54, 16, 6); rect(ctx, skinHi, 72, 28, 3, 26);
  // fingers curling around the edges
  for (const y of [24, 31, 38]) { rect(ctx, skin, 70, y, 6, 5); rect(ctx, skinHi, 70, y, 6, 1); rect(ctx, skinLo, 70, y + 4, 6, 1); }
  // the phone
  rect(ctx, '#0e0e16', 45, 7, 30, 54);
  rect(ctx, '#22222e', 46, 8, 28, 52);
  rect(ctx, '#3a3a4a', 46, 8, 28, 1);
  rect(ctx, '#0e0e16', 57, 10, 6, 2);
  // the screen area is filled by a scrolling strip in the scene; leave a glow edge
  rect(ctx, '#9fe8ff', 48, 13, 24, 1);
  // thumb over the screen
  rect(ctx, skin, 38, 44, 10, 6); rect(ctx, skin, 46, 42, 9, 6); rect(ctx, skinHi, 47, 42, 7, 1); rect(ctx, skinLo, 46, 47, 9, 1);
  rect(ctx, '#e8f4ff', 53, 43, 2, 2);
}

// Panel 2: the window from inside, then glass shattering around the slingshot.
function windowPanel(ctx, broken) {
  rect(ctx, '#0c0a18', 0, 0, PANEL_W, PANEL_H);
  // night outside
  rect(ctx, '#151032', 14, 8, 92, 56);
  for (let i = 0; i < 40; i++) {
    const x = 16 + ((i * 37) % 88);
    const y = 30 + ((i * 23) % 32);
    rect(ctx, i % 3 ? '#7fe3ff' : '#ff3fb4', x, y, 1, 2);
  }
  rect(ctx, '#241e44', 14, 44, 92, 20);
  for (let i = 0; i < 18; i++) line(ctx, 'rgba(170,200,255,0.5)', 18 + i * 5, 10 + (i % 4) * 9, 15 + i * 5, 16 + (i % 4) * 9);
  if (!broken) {
    // the slingshot spinning toward the glass, with motion lines
    slingshot(ctx, 76, 18, 1);
    for (let i = 0; i < 4; i++) line(ctx, '#ffffff', 92 + i * 2, 12 + i * 3, 100 + i * 2, 6 + i * 3);
    rect(ctx, 'rgba(220,240,255,0.18)', 14, 8, 92, 56);
    rect(ctx, 'rgba(255,255,255,0.35)', 20, 12, 12, 2);
  } else {
    // radial cracks and flying shards
    const cx = 64;
    const cy = 34;
    const rays = [[14, 8], [40, 8], [96, 8], [106, 26], [106, 58], [80, 64], [40, 64], [14, 50], [14, 28]];
    rays.forEach(([x, y]) => line(ctx, '#e8f6ff', cx, cy, x, y));
    for (let r = 10; r < 40; r += 12) for (let a = 0; a < 6.28; a += 0.5) rect(ctx, '#bfe8ff', Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * 0.7), 1, 1);
    const shards = [[[20, 4], [28, 0], [26, 10]], [[96, 2], [104, 6], [98, 12]], [[6, 40], [12, 34], [14, 44]], [[104, 44], [116, 40], [110, 52]],
      [[40, 66], [48, 62], [46, 72]], [[78, 64], [88, 66], [82, 72]], [[8, 14], [14, 10], [12, 20]], [[110, 18], [118, 12], [116, 24]]];
    shards.forEach((t) => { tri(ctx, '#d8f2ff', ...t); line(ctx, '#ffffff', t[0][0], t[0][1], t[1][0], t[1][1]); });
    slingshot(ctx, 54, 18, 2);
  }
  // window frame and mullions (drawn last so the break pokes through the glass, not the frame)
  rect(ctx, '#e8dcc0', 10, 4, 100, 4); rect(ctx, '#e8dcc0', 10, 64, 100, 4);
  rect(ctx, '#e8dcc0', 10, 4, 4, 64); rect(ctx, '#e8dcc0', 106, 4, 4, 64);
  rect(ctx, '#e8dcc0', 58, 8, 4, 56); rect(ctx, '#e8dcc0', 14, 34, 92, 3);
  rect(ctx, '#b8ac90', 10, 67, 100, 1);
  if (broken) slingshot(ctx, 54, 18, 2);
}

// Panel 3: the slingshot knocks the phone out of their hands.
function hitPanel(ctx, flying) {
  rect(ctx, '#120f1e', 0, 0, PANEL_W, PANEL_H);
  const skin = '#a8b4cc';
  const skinHi = '#cfe2f4';
  rect(ctx, '#4a4a60', 18, 60, 30, 12); rect(ctx, '#4a4a60', 72, 60, 30, 12);
  if (!flying) {
    rect(ctx, skin, 36, 38, 12, 22); rect(ctx, skin, 70, 36, 12, 24);
    rect(ctx, '#0e0e16', 49, 20, 20, 36); rect(ctx, '#7fe3ff', 51, 23, 16, 28); rect(ctx, '#ffffff', 52, 24, 6, 2);
    // impact burst at the corner of the phone
    const ix = 68;
    const iy = 22;
    for (let a = 0; a < 6.28; a += 0.52) line(ctx, a % 1.04 < 0.52 ? '#ffe066' : '#ffffff', ix, iy, Math.round(ix + Math.cos(a) * 16), Math.round(iy + Math.sin(a) * 12), 2);
    disc(ctx, '#ffffff', ix, iy, 4);
    slingshot(ctx, 72, 4, 2);
    for (let i = 0; i < 3; i++) line(ctx, '#ffffff', 98 + i * 4, 2 + i * 4, 110 + i * 4, -4 + i * 4);
  } else {
    // hands spring open
    rect(ctx, skin, 34, 42, 12, 18); rect(ctx, skin, 74, 42, 12, 18);
    for (const x of [34, 38, 42]) { rect(ctx, skin, x, 34, 3, 9); rect(ctx, skinHi, x, 34, 3, 1); }
    for (const x of [75, 79, 83]) { rect(ctx, skin, x, 34, 3, 9); rect(ctx, skinHi, x, 34, 3, 1); }
    // the phone tumbling away, screen dead and cracked
    const px = 14;
    const py = 6;
    for (let r = 0; r < 18; r++) rect(ctx, '#0e0e16', px + Math.round(r * 0.45), py + r, 12, 1);
    for (let r = 2; r < 16; r++) rect(ctx, '#1a1a26', px + 1 + Math.round(r * 0.45), py + r, 9, 1);
    line(ctx, '#8a8aa0', px + 3, py + 4, px + 8, py + 12); line(ctx, '#8a8aa0', px + 8, py + 6, px + 5, py + 13);
    // spin lines
    for (let a = 0; a < 3.2; a += 0.4) rect(ctx, '#ffffff', Math.round(px + 8 + Math.cos(a) * 15), Math.round(py + 9 + Math.sin(a) * 13), 1, 1);
    for (let i = 0; i < 4; i++) line(ctx, '#7fe3ff', 34 + i * 4, 30 - i * 3, 46 + i * 4, 24 - i * 3);
    slingshot(ctx, 84, 44, 2);
  }
}

// Panel 4: the hero's eyes. Tired and screen-lit, then wide awake.
function eyesPanel(ctx, wide, color) {
  const skin = color ? '#e0a77e' : '#a8b0c4';
  const skinLo = color ? '#b8805c' : '#8088a0';
  const skinHi = color ? '#f2c4a0' : '#c4cee0';
  const hood = color ? '#ffd23f' : '#6a6a80';
  rect(ctx, skin, 0, 0, PANEL_W, PANEL_H);
  rect(ctx, skinHi, 0, 52, PANEL_W, 4);
  rect(ctx, hood, 0, 0, PANEL_W, 10); rect(ctx, color ? '#c8a020' : '#4a4a60', 0, 10, PANEL_W, 2);
  // nose bridge
  rect(ctx, skinLo, 58, 40, 4, 22); rect(ctx, skinHi, 57, 40, 1, 20);
  for (const [ex, flip] of [[34, 1], [86, -1]]) {
    // brows
    const by = wide ? 16 : 22;
    rect(ctx, color ? '#3a2412' : '#3a3a4a', ex - 14, by, 28, 3);
    rect(ctx, color ? '#3a2412' : '#3a3a4a', ex + 10 * flip - 2, by + 1, 4, 2);
    // eye white
    const top = wide ? 24 : 31;
    rect(ctx, '#f4f6ff', ex - 13, top, 26, 40 - top);
    rect(ctx, '#2a1d1a', ex - 14, top - 1, 28, 2);
    // iris & pupil
    const iris = color ? '#6a4a2a' : '#7fe3ff';
    disc(ctx, iris, ex, 33, 7);
    disc(ctx, color ? '#3a2412' : '#2a6a8a', ex, 33, 4);
    if (!color) {
      // the screen reflected in their eyes
      rect(ctx, '#ffffff', ex - 4, 29, 5, 7); rect(ctx, '#7fe3ff', ex - 3, 31, 3, 1); rect(ctx, '#ff3fb4', ex - 3, 33, 3, 1);
    } else {
      rect(ctx, '#ffffff', ex - 4, 29, 3, 3); rect(ctx, '#ffffff', ex + 3, 35, 1, 1);
    }
    // heavy lids when tired
    if (!wide) { rect(ctx, skinLo, ex - 14, top - 4, 28, 3); rect(ctx, skin, ex - 14, top - 7, 28, 3); }
    rect(ctx, skin, ex - 13, 40, 26, 12);
    rect(ctx, '#2a1d1a', ex - 12, 40, 24, 1);
    // bags under tired eyes
    if (!wide) { rect(ctx, color ? '#a07a6a' : '#7a74a0', ex - 10, 43, 20, 2); }
  }
}

export function buildIntroPanels(scene) {
  canvasTexture(scene, 'cu_feed', 22, 132, feedStrip);
  canvasTexture(scene, 'cu_phone', PANEL_W, PANEL_H, phonePanel);
  canvasTexture(scene, 'cu_window_a', PANEL_W, PANEL_H, (ctx) => windowPanel(ctx, false));
  canvasTexture(scene, 'cu_window_b', PANEL_W, PANEL_H, (ctx) => windowPanel(ctx, true));
  canvasTexture(scene, 'cu_hit_a', PANEL_W, PANEL_H, (ctx) => hitPanel(ctx, false));
  canvasTexture(scene, 'cu_hit_b', PANEL_W, PANEL_H, (ctx) => hitPanel(ctx, true));
  canvasTexture(scene, 'cu_eyes_tired', PANEL_W, PANEL_H, (ctx) => eyesPanel(ctx, false, false));
  canvasTexture(scene, 'cu_eyes_wide', PANEL_W, PANEL_H, (ctx) => eyesPanel(ctx, true, false));
  canvasTexture(scene, 'cu_eyes_color', PANEL_W, PANEL_H, (ctx) => eyesPanel(ctx, true, true));
  canvasTexture(scene, 'cu_note', PANEL_W, PANEL_H, (ctx) => {
    rect(ctx, '#3a2a20', 0, 0, PANEL_W, PANEL_H);
    // crumpled paper: uneven edges and fold creases
    rect(ctx, '#f4efe0', 12, 8, 96, 56);
    for (const [x, y, w, h] of [[10, 12, 2, 20], [108, 20, 2, 24], [20, 6, 30, 2], [60, 64, 30, 2]]) rect(ctx, '#f4efe0', x, y, w, h);
    line(ctx, '#d8d0bc', 12, 30, 108, 26); line(ctx, '#d8d0bc', 50, 8, 58, 64); line(ctx, '#e6dfcc', 12, 48, 108, 52);
    for (let y = 18; y < 60; y += 8) rect(ctx, '#d0dcea', 16, y, 88, 1);
    drawText(ctx, 'LOOK UP.', 30, 30, '#2a2a4a', 2);
    rect(ctx, '#2a2a4a', 30, 42, 60, 1);
  });
}
