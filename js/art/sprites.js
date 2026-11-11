// Character sprites, 24x32, painted part by part (Stardew-style):
//  - three facings: 'down' (front), 'up' (back), 'side' (facing right; left is flipped)
//  - 3-tone hue-shifted shading (warm highlights, cool shadows), light from the top-left
//  - outlines in a darker shade of the part they wrap, not black
//
// Frames on every sheet:
//   down_idle0 down_idle1 down_walk0..3 down_aim   (same for side_ and up_)
//   wave cheer   (front-facing poses)

import { canvasTexture, mix, shade, lighten, grayPalette, rect } from './pixels.js';

export const FRAME_W = 24;
export const FRAME_H = 32;
export const FACINGS = ['down', 'side', 'up'];
const ANIMS = ['idle0', 'idle1', 'walk0', 'walk1', 'walk2', 'walk3', 'aim'];
export const FRAMES = [...FACINGS.flatMap((f) => ANIMS.map((a) => `${f}_${a}`)), 'wave', 'cheer'];

// ---------- color ramps ----------
const WARM = '#fff0a0';
const COOL = '#3a2a6e';
const DEEP = '#170f2a';
const rampCache = new Map();
export function ramp(hex) {
  if (rampCache.has(hex)) return rampCache.get(hex);
  const r = {
    hi: mix(lighten(hex, 0.2), WARM, 0.14),
    base: hex,
    lo: mix(shade(hex, 0.74), COOL, 0.16),
    ol: mix(shade(hex, 0.45), DEEP, 0.4),
  };
  rampCache.set(hex, r);
  return r;
}

// Keys that get shaded (the rest are flat: eyes, whites, mouths).
const SHADED = new Set(['skin', 'hair', 'top', 'top2', 'bottom', 'hat', 'hat2', 'shoe', 'gold', 'dark', 'sock', 'skin2']);
const SHINY = new Set(['hair', 'hat', 'top', 'shoe', 'gold']);

// ---------- the pixel grid ----------
class Grid {
  constructor() {
    this.c = new Array(FRAME_W * FRAME_H).fill(null);
    this.oy = 0;
    this.z = 0;
    this.dim = false;
  }
  set(x, y, k) {
    x = Math.round(x);
    y = Math.round(y + this.oy);
    if (x < 0 || y < 0 || x >= FRAME_W || y >= FRAME_H || !k) return;
    this.c[y * FRAME_W + x] = { k, z: this.z, dim: this.dim };
  }
  rect(x, y, w, h, k) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, k);
  }
  hline(x0, x1, y, k) {
    for (let x = x0; x <= x1; x++) this.set(x, y, k);
  }
  del(x, y) {
    y = Math.round(y + this.oy);
    if (x < 0 || y < 0 || x >= FRAME_W || y >= FRAME_H) return;
    this.c[y * FRAME_W + x] = null;
  }
  get(x, y) {
    if (x < 0 || y < 0 || x >= FRAME_W || y >= FRAME_H) return null;
    return this.c[y * FRAME_W + x];
  }
  // draw a line of 2-px-wide limb from (x0,y0) to (x1,y1)
  limb(x0, y0, x1, y1, k, w = 2) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) {
      const x = Math.round(x0 + ((x1 - x0) * i) / n);
      const y = Math.round(y0 + ((y1 - y0) * i) / n);
      this.rect(x, y, w, 1, k);
    }
  }
}

// ---------- body parts ----------
function head(g, f) {
  g.z = 7;
  if (f === 'side') {
    g.rect(7, 2, 10, 12, 'skin');
    for (const [x, y] of [[7, 2], [8, 2], [7, 3], [16, 2], [7, 13], [8, 13], [16, 13]]) g.del(x, y);
    g.set(17, 9, 'skin');
    g.set(10, 8, 'skin2'); g.set(10, 9, 'skin2'); g.set(11, 9, 'skin2');
  } else {
    g.rect(6, 2, 12, 12, 'skin');
    for (const [x, y] of [[6, 2], [7, 2], [6, 3], [17, 2], [16, 2], [17, 3], [6, 13], [7, 13], [6, 12], [17, 13], [16, 13], [17, 12]]) g.del(x, y);
    g.set(5, 8, 'skin'); g.set(5, 9, 'skin'); g.set(18, 8, 'skin2'); g.set(18, 9, 'skin2');
  }
}

function neck(g, f) {
  g.z = 6;
  if (f === 'side') g.rect(11, 13, 3, 2, 'skin2');
  else g.rect(10, 13, 4, 2, 'skin2');
}

function face(g, f, look, variant) {
  if (f === 'up') return;
  g.z = 8;
  const looking = look._lookDown;
  if (f === 'side') {
    if (looking) { g.set(15, 9, 'eye'); g.set(14, 9, 'eye'); }
    else { g.set(14, 8, 'white'); g.set(15, 8, 'eye'); g.set(15, 9, 'eye'); }
    g.set(15, 11, 'mouth');
    if (variant === 'color') g.set(14, 10, 'blush');
    if (look.lashes || look.kind === 'influencer') g.set(16, 7, 'eye');
    return;
  }
  if (looking) {
    g.hline(8, 9, 9, 'eye'); g.hline(14, 15, 9, 'eye');
  } else {
    g.set(8, 8, 'white'); g.set(9, 8, 'eye'); g.set(8, 9, 'eye'); g.set(9, 9, 'eye');
    g.set(14, 8, 'white'); g.set(15, 8, 'eye'); g.set(14, 9, 'eye'); g.set(15, 9, 'eye');
  }
  g.hline(11, 12, 11, 'mouth');
  if (variant === 'color') { g.set(7, 10, 'blush'); g.set(16, 10, 'blush'); }
  if (look.lashes || look.kind === 'influencer') { g.set(7, 7, 'eye'); g.set(16, 7, 'eye'); }
  const ex = look.extras || [];
  if (ex.includes('eyebags')) { g.hline(8, 9, 10, 'skin2'); g.hline(14, 15, 10, 'skin2'); }
  if (ex.includes('freckles')) { g.set(7, 11, 'skin2'); g.set(9, 11, 'skin2'); g.set(14, 11, 'skin2'); g.set(16, 11, 'skin2'); }
  if (ex.includes('stubble')) { for (const x of [8, 10, 13, 15]) g.set(x, 12, 'skin2'); g.set(11, 13, 'skin2'); g.set(12, 13, 'skin2'); }
}

// ----- hair -----
function hairBack(g, f, look) {
  const s = look.hairStyle;
  g.z = 1;
  if (s === 'long') {
    if (f === 'down') g.rect(5, 6, 14, 14, 'hair');
    else if (f === 'side') g.rect(6, 5, 6, 15, 'hair');
  } else if (s === 'pony' && f === 'side') {
    g.rect(4, 5, 4, 3, 'hair'); g.rect(4, 8, 3, 6, 'hair'); g.set(5, 14, 'hair');
  } else if (s === 'pony' && f === 'down') {
    g.rect(18, 6, 2, 5, 'hair');
  }
}

function hairFront(g, f, look) {
  const s = look.hairStyle;
  if (!s) return;
  g.z = 9;
  const capped = look.hat === 'cap' || look.hat === 'capBack' || look.hat === 'beanie';
  // a cap of hair over the top of the head
  const top = (H) => {
    if (f === 'side') {
      g.rect(7, 2, 10, H - 1, 'hair');
      for (const [x, y] of [[7, 2], [8, 2], [7, 3], [16, 2]]) g.del(x, y);
    } else {
      g.rect(6, 2, 12, H - 1, 'hair');
      for (const [x, y] of [[6, 2], [7, 2], [6, 3], [17, 2], [16, 2], [17, 3]]) g.del(x, y);
    }
  };
  if (f === 'up') {
    // the back of the head is all hair
    const nape = { buzz: 11, short: 12, swoop: 12, messy: 12, curly: 12, bun: 12, pony: 12, bob: 14, long: 13 }[s] ?? 12;
    g.rect(6, 2, 12, nape - 1, 'hair');
    for (const [x, y] of [[6, 2], [7, 2], [6, 3], [17, 2], [16, 2], [17, 3]]) g.del(x, y);
    g.hline(8, 15, nape + 1, 'hair');
    if (s === 'long') { g.z = 12; g.rect(6, 12, 12, 9, 'hair'); g.hline(7, 16, 21, 'hair'); }
    if (s === 'bob') { g.hline(6, 17, 13, 'hair'); g.hline(6, 17, 14, 'hair'); }
    if (s === 'pony') { g.z = 12; g.rect(10, 9, 4, 3, 'hat2'); g.rect(10, 12, 4, 6, 'hair'); g.rect(11, 18, 2, 1, 'hair'); }
    if (s === 'bun' && !capped) { g.rect(9, 0, 6, 3, 'hair'); }
    if (s === 'curly') { for (const x of [5, 18]) g.rect(x, 4, 1, 8, 'hair'); for (const x of [7, 10, 13, 16]) g.set(x, 1, 'hair'); }
    if (s === 'messy') for (const x of [7, 10, 13, 15]) g.set(x, 1, 'hair');
    if (s === 'swoop' && !capped) g.rect(8, 0, 7, 2, 'hair');
    return;
  }
  switch (s) {
    case 'buzz':
      top(4);
      if (f === 'down') { g.set(6, 5, 'hair'); g.set(17, 5, 'hair'); }
      else g.rect(7, 4, 4, 3, 'hair');
      break;
    case 'short':
      top(5);
      if (f === 'down') {
        g.rect(6, 5, 2, 3, 'hair'); g.rect(16, 5, 2, 3, 'hair');
        for (const x of [8, 9, 11, 13, 14]) g.set(x, 5, 'hair');
      } else {
        g.rect(7, 5, 4, 5, 'hair'); g.set(15, 5, 'hair'); g.set(16, 5, 'hair');
      }
      break;
    case 'swoop':
      top(5);
      if (!capped) {
        if (f === 'down') { g.rect(7, 0, 9, 2, 'hair'); g.rect(13, 2, 5, 4, 'hair'); g.set(16, 6, 'hair'); }
        else { g.rect(9, 0, 7, 2, 'hair'); g.rect(13, 2, 5, 3, 'hair'); g.set(17, 4, 'hair'); }
      }
      if (f === 'down') { g.rect(6, 5, 2, 3, 'hair'); g.rect(16, 5, 2, 2, 'hair'); }
      else g.rect(7, 5, 4, 4, 'hair');
      break;
    case 'messy':
      top(5);
      if (!capped) for (const x of (f === 'down' ? [7, 10, 12, 15] : [8, 11, 14])) g.rect(x, 0, 1, 2, 'hair');
      if (f === 'down') { g.rect(6, 5, 2, 3, 'hair'); g.rect(16, 5, 2, 3, 'hair'); for (const x of [9, 12, 14]) g.set(x, 5, 'hair'); }
      else { g.rect(7, 5, 4, 5, 'hair'); g.set(16, 5, 'hair'); }
      break;
    case 'curly':
      top(5);
      if (f === 'down') {
        g.rect(4, 4, 3, 7, 'hair'); g.rect(17, 4, 3, 7, 'hair');
        for (const [x, y] of [[4, 4], [19, 4], [4, 10], [19, 10]]) g.del(x, y);
        if (!capped) for (const x of [6, 9, 12, 15]) g.rect(x, 1, 2, 1, 'hair');
        for (const x of [8, 11, 14]) g.set(x, 5, 'hair');
      } else {
        g.rect(5, 4, 7, 7, 'hair'); g.del(5, 4); g.del(5, 10);
        if (!capped) for (const x of [7, 10, 13]) g.rect(x, 1, 2, 1, 'hair');
        g.set(15, 5, 'hair');
      }
      break;
    case 'long':
    case 'bob':
      top(5);
      if (f === 'down') {
        const end = s === 'long' ? 13 : 12;
        g.rect(5, 4, 3, end - 3, 'hair'); g.rect(16, 4, 3, end - 3, 'hair');
        g.rect(8, 5, 4, 1, 'hair'); g.set(8, 6, 'hair');
        g.set(14, 5, 'hair'); g.set(15, 5, 'hair');
      } else {
        g.rect(6, 4, 6, s === 'long' ? 10 : 9, 'hair');
        g.set(15, 5, 'hair'); g.set(16, 5, 'hair'); g.set(16, 6, 'hair');
      }
      break;
    case 'bun':
      top(4);
      if (!capped) {
        if (f === 'down') { g.rect(9, 0, 6, 2, 'hair'); g.rect(10, 0, 4, 1, 'hair'); }
        else g.rect(5, 1, 4, 3, 'hair');
      }
      if (f === 'down') { g.set(6, 5, 'hair'); g.set(17, 5, 'hair'); }
      else g.rect(7, 4, 4, 3, 'hair');
      break;
    case 'pony':
      top(4);
      if (f === 'down') { g.rect(6, 4, 2, 3, 'hair'); g.rect(16, 4, 2, 3, 'hair'); }
      else { g.rect(7, 4, 4, 3, 'hair'); g.rect(6, 6, 2, 2, 'hat2'); }
      break;
  }
}

function hat(g, f, look) {
  if (!look.hat) return;
  g.z = 10;
  const crown = () => {
    if (f === 'side') {
      g.rect(7, 1, 10, 4, 'hat');
      g.del(7, 1); g.del(16, 1);
    } else {
      g.rect(6, 1, 12, 4, 'hat');
      g.del(6, 1); g.del(17, 1); g.del(7, 1); g.del(16, 1);
    }
  };
  switch (look.hat) {
    case 'cap':
      crown();
      if (f === 'down') { g.hline(5, 18, 5, 'hat2'); g.set(11, 2, 'white'); g.set(12, 2, 'white'); }
      else if (f === 'side') { g.hline(8, 20, 5, 'hat2'); g.set(13, 2, 'white'); }
      else { g.hline(6, 17, 5, 'hat2'); g.rect(10, 4, 4, 2, 'hair'); g.hline(10, 13, 6, 'hat2'); }
      break;
    case 'capBack':
      crown();
      if (f === 'down') { g.hline(6, 17, 5, 'hat2'); g.rect(10, 3, 4, 2, 'hair'); g.hline(10, 13, 5, 'white'); }
      else if (f === 'side') { g.hline(7, 16, 5, 'hat2'); g.rect(3, 4, 5, 2, 'hat2'); }
      else { g.hline(5, 18, 5, 'hat2'); g.set(11, 2, 'white'); g.set(12, 2, 'white'); }
      break;
    case 'beanie':
      crown();
      if (f === 'side') g.hline(7, 16, 5, 'hat2'); else g.hline(6, 17, 5, 'hat2');
      if (f === 'side') g.hline(7, 16, 4, 'hat2'); else g.hline(6, 17, 4, 'hat2');
      g.rect(f === 'side' ? 10 : 11, 0, 2, 1, 'white');
      for (let x = 7; x <= 16; x += 2) g.set(x, 2, 'hat2');
      break;
    case 'hood':
      if (f === 'down') {
        g.rect(5, 1, 14, 3, 'hat');
        g.del(5, 1); g.del(18, 1);
        g.rect(4, 3, 3, 11, 'hat'); g.rect(17, 3, 3, 11, 'hat');
        g.hline(7, 16, 4, 'hat2');
        g.set(7, 5, 'hat2'); g.set(16, 5, 'hat2');
        g.rect(5, 14, 4, 1, 'hat'); g.rect(15, 14, 4, 1, 'hat');
      } else if (f === 'side') {
        g.rect(6, 1, 10, 4, 'hat'); g.del(6, 1);
        g.rect(5, 4, 7, 10, 'hat');
        g.rect(12, 4, 2, 9, 'hat'); g.set(14, 4, 'hat'); g.set(15, 4, 'hat');
        g.hline(13, 15, 5, 'hat2');
      } else {
        g.rect(5, 1, 14, 14, 'hat');
        g.del(5, 1); g.del(18, 1); g.del(5, 14); g.del(18, 14);
        g.hline(9, 14, 15, 'hat2'); g.hline(10, 13, 16, 'hat2');
      }
      break;
  }
}

function headExtras(g, f, look) {
  const ex = look.extras || [];
  g.z = 11;
  if (ex.includes('glasses') && f !== 'up') {
    if (f === 'down') {
      g.hline(7, 10, 7, 'dark'); g.hline(13, 16, 7, 'dark'); g.hline(7, 10, 10, 'dark'); g.hline(13, 16, 10, 'dark');
      g.set(7, 8, 'dark'); g.set(7, 9, 'dark'); g.set(10, 8, 'dark'); g.set(10, 9, 'dark');
      g.set(13, 8, 'dark'); g.set(13, 9, 'dark'); g.set(16, 8, 'dark'); g.set(16, 9, 'dark');
      g.hline(11, 12, 8, 'dark');
    } else {
      g.hline(13, 16, 7, 'dark'); g.hline(13, 16, 10, 'dark'); g.set(13, 8, 'dark'); g.set(13, 9, 'dark'); g.set(16, 8, 'dark'); g.set(16, 9, 'dark');
      g.hline(10, 12, 8, 'dark');
    }
  }
  if (ex.includes('shades') && f !== 'up') {
    if (f === 'down') { g.hline(7, 16, 4, 'dark'); g.hline(8, 10, 4, 'lens'); g.hline(13, 15, 4, 'lens'); }
    else { g.hline(11, 16, 4, 'dark'); g.hline(13, 15, 4, 'lens'); }
  }
  const earX = f === 'side' ? [10] : f === 'down' ? [5, 18] : [];
  if (ex.includes('earbuds') && look.hat !== 'hood') earX.forEach((x) => g.set(x, 9, 'white'));
  if (ex.includes('hoops') && look.hat !== 'hood') earX.forEach((x) => { g.set(x, 10, 'gold'); g.set(x, 11, 'gold'); });
}

// ----- torso & outfit -----
function torso(g, f, look) {
  const kind = look.kind;
  g.z = 4;
  const top = look.topStyle || { bro: 'tank', influencer: 'crop' }[kind] || 'hoodie';
  if (f === 'side') {
    g.hline(10, 14, 14, 'top');
    g.rect(9, 15, 7, 6, 'top');
    if (top === 'tank') { g.set(13, 14, 'skin'); g.set(14, 14, 'skin'); g.set(14, 15, 'skin'); }
    if (top === 'crop') g.rect(9, 19, 7, 2, 'skin');
    if (top === 'hoodie') {
      if (look.hat !== 'hood') { g.rect(9, 14, 3, 2, 'top2'); }
      g.set(15, 15, 'white'); g.set(15, 16, 'white');
      g.hline(12, 15, 18, 'top2');
    }
  } else {
    g.hline(8, 15, 14, 'top');
    g.rect(7, 15, 10, 6, 'top');
    if (top === 'tank') {
      g.rect(7, 14, 2, 2, 'skin'); g.rect(15, 14, 2, 2, 'skin');
      if (f === 'down') { g.rect(11, 14, 2, 2, 'skin'); g.set(10, 14, 'skin'); g.set(13, 14, 'skin'); }
    }
    if (top === 'crop') {
      g.rect(8, 19, 8, 2, 'skin');
      if (f === 'down') g.set(11, 20, 'skin2');
    }
    if (top === 'hoodie') {
      if (f === 'down') {
        if (look.hat !== 'hood') g.hline(9, 14, 14, 'top2');
        g.set(10, 15, 'white'); g.set(10, 16, 'white'); g.set(13, 15, 'white'); g.set(13, 16, 'white');
        g.hline(9, 14, 18, 'top2'); g.set(9, 19, 'top2'); g.set(14, 19, 'top2');
      } else if (look.hat !== 'hood') {
        g.rect(9, 14, 6, 3, 'top2'); g.hline(10, 13, 17, 'top2');
      }
    }
    if (f === 'down' && (look.extras || []).includes('chain')) {
      g.z = 11;
      for (const [x, y] of [[9, 15], [10, 16], [11, 17], [12, 17], [13, 16], [14, 15]]) g.set(x, y, 'gold');
    }
    if ((look.extras || []).includes('headphones')) {
      g.z = 11;
      g.hline(8, 15, 14, 'dark'); g.rect(7, 14, 2, 2, 'hat'); g.rect(15, 14, 2, 2, 'hat');
    }
  }
}

function hips(g, f, look) {
  g.z = 3;
  const b = look.bottomLayer || { bro: 'shorts', influencer: 'pants' }[look.kind] || 'sweats';
  if (b === 'skirt') {
    if (f === 'side') { g.rect(9, 21, 7, 2, 'bottom'); g.rect(8, 23, 9, 2, 'bottom'); }
    else { g.rect(7, 21, 10, 1, 'bottom'); g.rect(6, 22, 12, 2, 'bottom'); g.rect(5, 24, 14, 1, 'bottom'); }
    return;
  }
  if (f === 'side') g.rect(9, 21, 7, 3, 'bottom');
  else g.rect(7, 21, 10, 3, 'bottom');
}

// legs: positions for each leg as { x (left column), lift }
function legs(g, f, look, anim) {
  const b = look.bottomLayer || { bro: 'shorts', influencer: 'pants' }[look.kind] || 'sweats';
  const legKey = b === 'shorts' || b === 'skirt' ? 'skin' : 'bottom';
  const one = (x, lift, dx = 0, dim = false) => {
    g.dim = dim;
    g.z = dim ? 0.5 : 2;
    const bottomY = 29 - lift;
    for (let y = 24; y <= bottomY; y++) {
      const xx = y >= 27 ? x + dx : x;
      let k = legKey;
      if (b === 'shorts' && y === 24) k = 'bottom';
      if (b === 'shorts' && y === bottomY) k = 'sock';
      if ((b === 'sweats' || b === 'joggers') && y === bottomY) k = 'top2b';
      g.rect(xx, y, 3, 1, k === 'top2b' ? 'bottom' : k);
    }
    const sx = x + dx;
    if (f === 'side') { g.rect(sx, bottomY + 1, 4, 1, 'shoe'); g.rect(sx, bottomY + 2, 4, 1, 'sole'); }
    else { g.rect(sx - (x < 12 ? 1 : 0), bottomY + 1, 4, 1, 'shoe'); g.rect(sx - (x < 12 ? 1 : 0), bottomY + 2, 4, 1, 'sole'); }
    g.dim = false;
  };
  if (f === 'side') {
    // far leg first (dim), near leg on top
    const cfg = {
      idle0: [[10, 0, 0], [12, 0, 0]], idle1: [[10, 0, 0], [12, 0, 0]], aim: [[10, 0, 0], [13, 0, 0]],
      walk0: [[10, 0, -2], [12, 0, 2]],
      walk1: [[11, 0, 0], [11, 1, 1]],
      walk2: [[11, 0, 2], [11, 0, -2]],
      walk3: [[11, 1, 1], [11, 0, 0]],
    }[anim];
    one(cfg[0][0], cfg[0][1], cfg[0][2], true);
    one(cfg[1][0], cfg[1][1], cfg[1][2], false);
  } else {
    const liftL = anim === 'walk1' ? 1 : 0;
    const liftR = anim === 'walk3' ? 1 : 0;
    one(8, liftL);
    one(13, liftR);
  }
}

// ----- arms -----
function sleeveKey(look) {
  const top = look.topStyle || { bro: 'tank', influencer: 'crop' }[look.kind] || 'hoodie';
  return top === 'hoodie' ? 'top' : 'skin';
}

// A front/back arm hanging at the side. side: -1 left (x 5..6), +1 right (x 17..18).
function armDown(g, side, dy, sk) {
  const x = side < 0 ? 4 : 18;
  g.set(side < 0 ? 6 : 17, 15, sk); // shoulder joint; a 1px gap below separates arm and body
  g.rect(x, 15 + dy, 2, 6, sk);
  if (sk === 'top') g.rect(x, 21 + dy, 2, 1, 'top2');
  else g.rect(x, 21 + dy, 2, 1, sk);
  g.rect(x, 22 + dy, 2, 2, 'skin');
}
function armUp(g, side) {
  const m = (x) => (side < 0 ? 23 - x : x);
  const sk = g._sk;
  for (const [x, y] of [[17, 15], [18, 14], [18, 13], [19, 12], [19, 11], [19, 10]]) { g.set(m(x), y, sk); g.set(m(x + 1), y, sk); }
  g.rect(Math.min(m(19), m(20)), 8, 2, 2, 'skin');
}

function arms(g, f, look, pose, anim) {
  const sk = sleeveKey(look);
  g._sk = sk;
  const swing = { walk0: 0, walk1: 1, walk2: 0, walk3: -1 }[anim] || 0;
  if (f === 'side') {
    const s = { walk0: 2, walk1: 0, walk2: -2, walk3: 0 }[anim] || 0;
    // far arm (behind the body), then near arm in front
    const near = (natural) => {
      g.z = 5;
      if (natural) {
        g.limb(12, 15, 12 + s, 21, sk);
        if (sk === 'top') g.rect(12 + s, 21, 2, 1, 'top2');
        g.rect(12 + s, 22, 2, 2, 'skin');
      }
    };
    g.z = 0.4;
    g.dim = true;
    if (pose === 'down' || pose === 'aim' || pose === 'phone' || pose === 'up') {
      g.limb(11, 15, 11 - s, 21, sk);
      g.rect(11 - s, 22, 2, 2, 'skin');
    } else if (pose === 'low') {
      g.limb(11, 15, 13, 19, sk); g.rect(14, 19, 2, 2, 'skin');
    }
    g.dim = false;
    g.z = 5;
    if (pose === 'down') near(true);
    else if (pose === 'phone') { g.limb(12, 15, 12, 18, sk); g.limb(13, 18, 15, 17, sk); g.rect(16, 16, 2, 2, 'skin'); }
    else if (pose === 'low') { g.limb(12, 15, 12, 18, sk); g.limb(13, 19, 14, 19, sk); g.rect(15, 19, 2, 2, 'skin'); }
    else if (pose === 'up') { g.limb(12, 15, 15, 10, sk); g.limb(15, 10, 16, 8, sk); g.rect(16, 6, 2, 2, 'skin'); }
    else if (pose === 'aim') { g.limb(12, 15, 13, 16, sk); g.limb(13, 16, 18, 16, sk); g.rect(19, 15, 2, 2, 'skin'); }
    return;
  }
  g.z = 5;
  const back = f === 'up';
  switch (pose) {
    case 'down':
      armDown(g, -1, swing, sk);
      armDown(g, 1, -swing, sk);
      break;
    case 'phone':
      armDown(g, -1, 0, sk);
      g.set(17, 15, sk); g.rect(18, 15, 2, 3, sk);
      if (back) { g.rect(17, 18, 2, 1, sk); }
      else { g.limb(17, 18, 13, 18, sk); g.limb(16, 19, 14, 19, sk); g.rect(12, 17, 2, 2, 'skin'); }
      break;
    case 'low':
      for (const side of [-1, 1]) {
        const m = (x) => (side < 0 ? 23 - x : x);
        g.set(m(17), 15, sk);
        g.rect(Math.min(m(18), m(19)), 15, 2, 4, sk);
        if (!back) { g.limb(m(16), 19, m(14), 20, sk); g.rect(Math.min(m(12), m(13)), 20, 2, 2, 'skin'); }
      }
      break;
    case 'up':
      armDown(g, -1, 0, sk);
      armUp(g, 1);
      break;
    case 'cheer':
      armUp(g, -1);
      armUp(g, 1);
      break;
    case 'aim':
      armDown(g, -1, 0, sk);
      g.set(17, 15, sk); g.rect(18, 15, 2, 2, sk);
      if (back) g.limb(17, 17, 16, 18, sk);
      else { g.limb(17, 17, 15, 20, sk); g.rect(13, 20, 2, 2, 'skin'); }
      break;
  }
}

// ---------- composing a frame ----------
function paintFrame(look, facing, anim, pose, variant) {
  const g = new Grid();
  const bob = anim === 'idle1' || anim === 'walk1' || anim === 'walk3' ? 1 : 0;
  const lk = { ...look, _lookDown: variant === 'gray' && facing !== 'up' };
  legs(g, facing, lk, anim);
  g.oy = bob;
  if (facing === 'side') arms(g, facing, lk, pose, anim); // the far arm sits behind the body
  hairBack(g, facing, lk);
  hips(g, facing, lk);
  torso(g, facing, lk);
  if (facing !== 'side') arms(g, facing, lk, pose, anim);
  else {
    // redraw the near arm on top of the torso
    const tmp = new Grid();
    tmp.oy = bob;
    arms(tmp, facing, lk, pose, anim);
    for (let i = 0; i < tmp.c.length; i++) if (tmp.c[i] && !tmp.c[i].dim) g.c[i] = tmp.c[i];
  }
  neck(g, facing);
  head(g, facing);
  face(g, facing, lk, variant);
  hairFront(g, facing, lk);
  hat(g, facing, lk);
  headExtras(g, facing, lk);
  return g;
}

// ---------- rendering: shading + colored outlines ----------
function renderGrid(ctx, g, pal, ox) {
  const colorOf = (cell) => pal[cell.k] || '#ff00ff';
  for (let y = 0; y < FRAME_H; y++) {
    for (let x = 0; x < FRAME_W; x++) {
      const cell = g.get(x, y);
      if (cell) {
        let c = colorOf(cell);
        if (SHADED.has(cell.k)) {
          const R = ramp(c);
          const up = g.get(x, y - 1);
          const rt = g.get(x + 1, y);
          const dn = g.get(x, y + 1);
          const lf = g.get(x - 1, y);
          if (up && up.z > cell.z && up.k !== cell.k) c = R.lo; // cast shadow under hair, chin, sleeves
          else if (!rt || (rt.k !== cell.k && rt.z < cell.z && SHINY.has(cell.k))) c = R.lo;
          else if (!dn || (SHINY.has(cell.k) && dn.k !== cell.k)) c = R.lo;
          else if ((!up || (up.k !== cell.k && up.z < cell.z)) && SHINY.has(cell.k)) c = R.hi;
          else if (!lf && cell.k !== 'skin') c = R.hi;
          if (cell.dim) c = shade(c, 0.78);
        }
        rect(ctx, c, ox + x, y, 1, 1);
      } else {
        // outline: darker shade of the neighboring part
        let n = null;
        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
          const nb = g.get(x + dx, y + dy);
          if (nb && (!n || (n.k === 'eye' || n.k === 'white'))) n = nb;
        }
        if (n) {
          const base = ['eye', 'white', 'mouth', 'blush', 'lens'].includes(n.k) ? pal.skin : colorOf(n);
          rect(ctx, ramp(base).ol, ox + x, y, 1, 1);
        }
      }
    }
  }
}

// ---------- kinds & palettes ----------
export const KINDS = {
  bro: { locked: 'phone', free: 'down', mouth: '#9b4a3a' },
  influencer: { locked: 'up', free: 'down', mouth: '#d9485f' },
  doom: { locked: 'low', free: 'down', mouth: '#7a4a4a' },
  hero: { locked: 'phone', free: 'down', mouth: '#9b4a3a' },
  boss: { locked: 'low', free: 'down', mouth: '#5a3a4a' },
};

export function lookPalette(look) {
  const kind = KINDS[look.kind] || KINDS.hero;
  const skin = look.skin;
  return {
    skin, skin2: mix(shade(skin, 0.82), '#7a3a5a', 0.12), hair: look.hair, top: look.top, top2: shade(look.top, 0.78),
    bottom: look.bottom, hat: look.hatColor || look.top, hat2: shade(look.hatColor || look.top, 0.72),
    shoe: look.shoes || '#f4f4f4', sole: shade(look.shoes || '#f4f4f4', 0.55), sock: '#f4f4f4',
    eye: '#2a1d1a', white: '#ffffff', mouth: kind.mouth, blush: mix(skin, '#ff6f8f', 0.4), gold: '#ffd23f',
    dark: '#2b2b3a', lens: '#ff7eb6',
  };
}

// Where the phone sits (sprite pixel coords, facing right for 'side'); null = hidden behind the body.
export const PHONE_AT = {
  down: { phone: [12.5, 15.5], low: [12, 19.5], up: [19.5, 7], cheer: [19.5, 7] },
  side: { phone: [17.5, 14.5], low: [16.5, 18], up: [17.5, 5], cheer: [17.5, 5] },
  up: { phone: null, low: null, up: [19.5, 7], cheer: [19.5, 7] },
};
// Where the hand holding the slingshot is, per facing ('aim' frames and normal frames).
export const HAND_AT = {
  down: { aim: [13.5, 20.5], rest: [18.5, 22.5] },
  side: { aim: [20, 16], rest: [12.5, 22.5] },
  up: { aim: [16.5, 17.5], rest: [18.5, 22.5] },
};

export function buildCharacter(scene, key, look) {
  const kind = KINDS[look.kind] || KINDS.hero;
  const color = lookPalette(look);
  const gray = grayPalette(color, { eye: look.glowEyes || '#8fe9ff', white: '#e8f6ff', lens: '#ff3fb4' });
  gray.blush = gray.skin;
  const variants = [
    ['color', color, kind.free],
    ['gray', gray, kind.locked],
  ];
  for (const [variant, pal, pose] of variants) {
    const k = `${key}_${variant}`;
    if (scene.textures.exists(k)) continue;
    const tex = canvasTexture(scene, k, FRAME_W * FRAMES.length, FRAME_H, (ctx) => {
      FRAMES.forEach((name, i) => {
        let facing = 'down';
        let anim = 'idle0';
        let p = pose;
        if (name === 'wave') p = 'up';
        else if (name === 'cheer') p = 'cheer';
        else {
          [facing, anim] = name.split('_');
          if (anim === 'aim') p = 'aim';
        }
        renderGrid(ctx, paintFrame(look, facing, anim, p, variant), pal, i * FRAME_W);
      });
    });
    FRAMES.forEach((f, i) => tex.add(f, 0, i * FRAME_W, 0, FRAME_W, FRAME_H));
  }
  return key;
}

// ---------- slingshot ----------
// 9x12, pointing up (fork on top). Frames: held, drawn (band pulled back), release.
export function buildSlingshot(scene) {
  const tex = canvasTexture(scene, 'slingshot', 27, 12, (ctx) => {
    const wood = '#9a6332';
    const woodD = '#6b4020';
    const woodL = '#c08a55';
    const band = '#e8433f';
    for (let i = 0; i < 3; i++) {
      const o = i * 9;
      // handle + fork
      rect(ctx, woodD, o + 4, 7, 2, 5); rect(ctx, wood, o + 4, 7, 1, 5);
      rect(ctx, wood, o + 3, 6, 4, 1);
      rect(ctx, wood, o + 2, 3, 1, 3); rect(ctx, woodD, o + 3, 4, 1, 2);
      rect(ctx, wood, o + 7, 3, 1, 3); rect(ctx, woodD, o + 6, 4, 1, 2);
      rect(ctx, woodL, o + 2, 2, 1, 1); rect(ctx, woodL, o + 7, 2, 1, 1);
      rect(ctx, '#3a2412', o + 4, 11, 2, 1);
      if (i === 0) { rect(ctx, band, o + 3, 2, 4, 1); }
      if (i === 1) { rect(ctx, band, o + 3, 3, 1, 2); rect(ctx, band, o + 6, 3, 1, 2); rect(ctx, band, o + 4, 5, 2, 1); rect(ctx, '#e6dccb', o + 4, 4, 2, 1); }
      if (i === 2) { rect(ctx, band, o + 3, 1, 4, 1); rect(ctx, band, o + 4, 0, 2, 1); }
    }
  });
  ['held', 'drawn', 'release'].forEach((f, i) => tex.add(f, 0, i * 9, 0, 9, 12));
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
  return `hero3_${profile.gender}_${profile.skin}_${profile.cap}`;
}
export function buildHero(scene, profile) {
  return buildCharacter(scene, heroKey(profile), heroLook(profile));
}

// Picks the facing for a movement vector. Returns { facing, flip }.
export function facingFor(dx, dy, prev = { facing: 'down', flip: false }) {
  if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return prev;
  if (Math.abs(dx) > Math.abs(dy) * 1.1) return { facing: 'side', flip: dx < 0 };
  return { facing: dy < 0 ? 'up' : 'down', flip: false };
}
