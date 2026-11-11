// 64x64 Stardew-style dialogue portraits, painted in code from the same "look"
// that builds a character's sprite, so the two always match.
// Two expressions: 'n' (neutral) and 'h' (happy).

import { shade, lighten, mix, canvasTexture, hash2 } from './pixels.js';
import { ramp } from './sprites.js';

const S = 64;

const BACKDROPS = {
  bro: { bg: '#284a78', ring: '#35609a', fx: '#4a7ac0' },
  influencer: { bg: '#b8508a', ring: '#d27aa6', fx: '#ffffff' },
  doom: { bg: '#3d2f5e', ring: '#52427a', fx: '#6a5a9a' },
  hero: { bg: '#2f6a48', ring: '#3f8a5c', fx: '#ffe28a' },
};

class Painter {
  constructor() {
    this.fig = new Array(S * S).fill(null);
    this.bg = new Array(S * S).fill(null);
  }
  set(x, y, c, layer) {
    layer = layer || 'fig';
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= S || y >= S || !c) return;
    this[layer][y * S + x] = c;
  }
  get(x, y, layer) {
    layer = layer || 'fig';
    if (x < 0 || y < 0 || x >= S || y >= S) return null;
    return this[layer][y * S + x];
  }
  rect(x, y, w, h, c, layer) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c, layer);
  }
  ellipse(cx, cy, rx, ry, c, layer, clip) {
    for (let y = Math.ceil(cy - ry); y <= Math.floor(cy + ry); y++) {
      const t = (y - cy) / ry;
      const dx = rx * Math.sqrt(Math.max(0, 1 - t * t));
      for (let x = Math.round(cx - dx); x <= Math.round(cx + dx); x++) {
        if (clip && !clip(x, y)) continue;
        this.set(x, y, typeof c === 'function' ? c(x, y) : c, layer);
      }
    }
  }
  // Recolor existing figure pixels that pass a test.
  recolor(test, fn) {
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const c = this.fig[y * S + x];
      if (c && test(x, y, c)) this.fig[y * S + x] = fn(c, x, y);
    }
  }
  // Outline in a darker shade of whatever it wraps (Stardew style), not flat black.
  outline() {
    const add = [];
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      if (this.fig[y * S + x]) continue;
      for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
        const c = this.get(x + dx, y + dy);
        if (c) { add.push([x, y, ramp(c).ol]); break; }
      }
    }
    add.forEach(([x, y, c]) => this.set(x, y, c));
  }
  flush(ctx, ox = 0) {
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const c = this.fig[y * S + x] || this.bg[y * S + x];
      if (!c) continue;
      ctx.fillStyle = c;
      ctx.fillRect(ox + x, y, 1, 1);
    }
  }
}

// ---------- parts ----------
function backdrop(p, kind, seed) {
  const b = BACKDROPS[kind] || BACKDROPS.hero;
  p.rect(0, 0, S, S, b.bg, 'bg');
  p.ellipse(32, 30, 27, 27, b.ring, 'bg');
  p.ellipse(32, 30, 22, 22, lighten(b.ring, 0.08), 'bg');
  if (kind === 'bro') {
    let y = 50;
    for (let x = 2; x < 62; x++) {
      y += (hash2(x, seed) % 5) - 2.6;
      y = Math.max(8, Math.min(56, y));
      p.set(x, y, b.fx, 'bg');
    }
  } else if (kind === 'influencer') {
    for (let i = 0; i < 6; i++) {
      const x = 4 + (hash2(i, seed) % 56);
      const y = 4 + (hash2(seed, i) % 40);
      p.set(x, y, b.fx, 'bg'); p.set(x - 1, y, lighten(b.ring, 0.4), 'bg'); p.set(x + 1, y, lighten(b.ring, 0.4), 'bg');
      p.set(x, y - 1, lighten(b.ring, 0.4), 'bg'); p.set(x, y + 1, lighten(b.ring, 0.4), 'bg');
    }
  } else if (kind === 'doom') {
    for (let i = 0; i < 14; i++) {
      const x = hash2(i, seed) % 64;
      const y = hash2(seed, i * 3) % 60;
      for (let k = 0; k < 4; k++) p.set(x - k, y + k * 2, b.fx, 'bg');
    }
  } else {
    for (let a = 0; a < 12; a++) {
      const ang = (a / 12) * Math.PI * 2;
      for (let r = 24; r < 34; r++) p.set(32 + Math.cos(ang) * r, 30 + Math.sin(ang) * r, b.fx, 'bg');
    }
  }
}

function headWidth(y, jaw) {
  const cy = 29;
  const ry = 15;
  const t = (y - cy) / ry;
  if (Math.abs(t) > 1) return -1;
  let hw = jaw * Math.sqrt(1 - t * t);
  if (y > 37) hw *= 1 - (y - 37) * 0.035;
  return hw;
}

function torso(p, look, kind) {
  const skin = look.skin;
  const A = look.top;
  const As = shade(A, 0.78);
  for (let y = 47; y < S; y++) {
    const hw = Math.min(31, 13 + (y - 47) * 1.25);
    for (let x = Math.round(32 - hw); x <= Math.round(32 + hw); x++) {
      let c = A;
      if (x > 32 + hw * 0.55) c = As;
      if (y <= 49 && x < 32 - hw + 6) c = lighten(A, 0.15);
      if (kind === 'bro') {
        const inner = 9 + (y - 47) * 0.5;
        const strap = (x >= 23 && x <= 26) || (x >= 38 && x <= 41);
        if (Math.abs(x - 32) > inner && !(strap && y < 52)) c = x > 40 ? shade(skin, 0.84) : skin;
        if (y < 53 && Math.abs(x - 32) < 6 - (y - 47)) c = skin;
      } else if (kind === 'influencer') {
        if (y < 53) c = x > 40 ? shade(skin, 0.84) : skin;
        if (y === 53) c = shade(A, 0.85);
      }
      p.set(x, y, c);
    }
  }
  if (kind === 'doom' || kind === 'hero') {
    if (look.hat !== 'hood') {
      p.ellipse(32, 48, 12, 4, shade(A, 0.68));
      p.ellipse(32, 47, 8, 2.5, shade(A, 0.5));
    }
    p.rect(28, 51, 1, 6, '#f4efe0'); p.rect(36, 51, 1, 6, '#f4efe0');
    p.set(28, 57, '#cfc6b0'); p.set(36, 57, '#cfc6b0');
  }
}

function neck(p, skin) {
  p.rect(27, 40, 11, 10, skin);
  p.rect(27, 40, 11, 4, shade(skin, 0.8));
  p.rect(36, 40, 2, 10, shade(skin, 0.84));
}

function head(p, look) {
  const skin = look.skin;
  const s1 = shade(skin, 0.86);
  const jaw = look.kind === 'bro' ? 13 : 12;
  for (let y = 14; y <= 44; y++) {
    const hw = headWidth(y, jaw);
    if (hw < 0) continue;
    for (let x = Math.round(32 - hw); x <= Math.round(32 + hw); x++) {
      let c = skin;
      if (x > 32 + hw * 0.5) c = s1;
      if (y >= 42) c = s1;
      p.set(x, y, c);
    }
  }
  // cheek highlight
  p.set(23, 33, lighten(skin, 0.18)); p.set(24, 33, lighten(skin, 0.18)); p.set(24, 32, lighten(skin, 0.12));
  // ears
  p.ellipse(19, 31, 2, 3.5, skin);
  p.ellipse(45, 31, 2, 3.5, s1);
  p.set(19, 31, shade(skin, 0.75)); p.set(45, 31, shade(skin, 0.7));
}

function face(p, look, expr) {
  const skin = look.skin;
  const s1 = shade(skin, 0.84);
  const s2 = shade(skin, 0.7);
  const dark = '#2a1d1a';
  const brow = shade(look.hair, 0.7);
  const iris = look.eyes || '#5a3a22';
  const happy = expr === 'h';
  for (const [ex, side] of [[26, -1], [38, 1]]) {
    const ey = 31;
    if (happy) {
      p.rect(ex - 1, ey - 1, 3, 1, dark);
      p.set(ex - 2, ey, dark); p.set(ex + 2, ey, dark);
      p.set(ex - 2, ey + 1, s1); p.set(ex + 2, ey + 1, s1);
    } else {
      p.rect(ex - 2, ey - 2, 5, 1, dark);
      p.rect(ex - 2, ey - 1, 5, 3, '#ffffff');
      p.rect(ex - 1, ey - 1, 3, 3, iris);
      p.rect(ex - 1, ey + 1, 3, 1, shade(iris, 0.7));
      p.set(ex, ey, '#120c0a'); p.set(ex, ey - 1, '#120c0a');
      p.set(ex - 1, ey - 1, '#ffffff');
      p.rect(ex - 2, ey + 2, 5, 1, s1);
    }
    if (look.lashes || look.kind === 'influencer') {
      p.set(ex + side * 3, ey - 2, dark);
      p.set(ex + side * 3, ey - 3, dark);
    }
    // brows
    const by = happy ? 25 : 26;
    const thick = look.kind === 'bro' ? 2 : 1;
    p.rect(ex - 2, by, 5, thick, brow);
    if (happy) p.set(ex + side * 3, by + 1, brow);
  }
  // nose
  p.set(33, 33, s1); p.set(33, 34, s1); p.set(32, 35, s2); p.set(33, 35, s2); p.set(31, 35, s1);
  // mouth
  const lip = look.kind === 'influencer' ? '#c8405a' : '#7a3a3a';
  if (happy) {
    p.rect(29, 38, 7, 1, lip);
    p.set(29, 39, lip); p.rect(30, 39, 5, 1, '#ffffff'); p.set(35, 39, lip);
    p.set(30, 40, '#5a1a1a'); p.rect(31, 40, 3, 1, '#e06070'); p.set(34, 40, '#5a1a1a');
    p.rect(31, 41, 3, 1, '#5a1a1a');
    const blush = mix(skin, '#ff6f8f', 0.45);
    p.rect(22, 35, 3, 1, blush); p.rect(40, 35, 3, 1, blush);
  } else {
    p.rect(30, 39, 5, 1, lip);
    if (look.kind === 'influencer') p.rect(31, 40, 3, 1, lighten(lip, 0.35));
    else p.rect(31, 40, 3, 1, s1);
  }
}

function hairBack(p, look) {
  const H = look.hair;
  const h = shade(H, 0.72);
  if (look.hairStyle === 'long') {
    p.ellipse(32, 30, 17, 18, h);
    p.rect(15, 30, 35, 30, h);
    p.ellipse(32, 60, 17, 4, h);
  } else if (look.hairStyle === 'pony') {
    p.ellipse(48, 34, 5, 13, H);
    p.ellipse(49, 36, 3, 10, h);
  }
  if (look.hat === 'hood') {
    const C = look.hatColor;
    p.ellipse(32, 31, 20, 21, C);
    p.ellipse(32, 32, 16, 17, shade(C, 0.55));
  }
}

function hairFront(p, look) {
  const H = look.hair;
  const h = shade(H, 0.72);
  const hl = lighten(H, 0.25);
  const style = look.hairStyle;
  const under = (y) => (x, yy) => yy <= y;
  const shadowLine = (y) => {
    for (let x = 18; x <= 46; x++) {
      const c = p.get(x, y);
      if (c && c !== H && c !== h && c !== hl) p.set(x, y, shade(c, 0.82));
    }
  };
  switch (style) {
    case 'buzz':
      p.ellipse(32, 24, 13.5, 10, (x, y) => ((x + y) % 2 ? H : h), null, under(22));
      p.rect(19, 23, 2, 7, h); p.rect(44, 23, 2, 7, h);
      shadowLine(23);
      break;
    case 'short':
    case 'swoop':
      p.ellipse(32, 22, 14.5, 9, H, null, under(24));
      for (let x = 20; x <= 44; x++) if (x % 4 !== 1) p.set(x, 24, H);
      for (let x = 21; x <= 43; x += 4) p.set(x, 25, h);
      p.rect(18, 22, 3, 9, H); p.rect(44, 22, 3, 9, h);
      p.rect(24, 16, 6, 1, hl);
      if (style === 'swoop') {
        p.ellipse(29, 15, 13, 5.5, H);
        p.ellipse(28, 14, 9, 3, hl, null, (x, y) => y <= 13);
        for (let i = 0; i < 6; i++) p.set(36 + i, 19 + Math.floor(i / 2), h);
      }
      shadowLine(25);
      break;
    case 'long':
      p.ellipse(32, 22, 15.5, 10, H, null, under(25));
      for (let i = 0; i < 9; i++) p.rect(21 + i, 23, 1, 4 - Math.floor(i / 3), H);
      p.rect(17, 24, 5, 30, H); p.rect(43, 24, 5, 30, h);
      p.rect(18, 26, 1, 24, hl);
      p.rect(31, 14, 1, 6, h);
      p.rect(24, 15, 5, 1, hl);
      shadowLine(26);
      break;
    case 'bob':
      p.ellipse(32, 22, 15.5, 10, H, null, under(24));
      p.rect(20, 23, 25, 2, H);
      p.rect(17, 23, 5, 21, H); p.rect(43, 23, 5, 21, h);
      p.rect(18, 43, 4, 1, h); p.rect(43, 43, 4, 1, shade(h, 0.85));
      p.rect(25, 15, 7, 1, hl);
      shadowLine(25);
      break;
    case 'bun':
      p.ellipse(32, 22, 13.5, 8.5, H, null, under(22));
      p.ellipse(32, 11, 6, 5.5, H);
      p.ellipse(31, 10, 3, 2, hl);
      p.rect(27, 15, 10, 1, h);
      p.rect(19, 22, 2, 6, H); p.rect(44, 22, 2, 6, h);
      shadowLine(23);
      break;
    case 'curly': {
      const blobs = [[20, 22], [24, 17], [30, 14], [36, 14], [41, 17], [45, 22], [18, 28], [46, 28], [17, 34], [47, 34], [26, 21], [33, 19], [39, 21]];
      blobs.forEach(([x, y], i) => p.ellipse(x, y, 4.5, 4, i % 3 === 0 ? h : H));
      blobs.forEach(([x, y]) => p.set(x - 1, y - 1, hl));
      shadowLine(25);
      break;
    }
    case 'pony':
      p.ellipse(32, 22, 14, 9, H, null, under(23));
      p.rect(19, 22, 2, 8, H); p.rect(44, 22, 2, 8, h);
      p.rect(25, 15, 8, 1, hl);
      p.rect(44, 25, 3, 3, '#ff6f9f');
      shadowLine(24);
      break;
    case 'messy':
      p.ellipse(32, 21, 15, 9, H, null, under(24));
      for (const [x, y] of [[22, 12], [27, 10], [33, 11], [39, 12], [44, 15]]) {
        p.rect(x, y, 2, 4, H); p.set(x, y, hl);
      }
      for (let x = 20; x <= 44; x += 3) p.rect(x, 24, 2, 2, x % 2 ? H : h);
      shadowLine(26);
      break;
  }
}

function hat(p, look) {
  const C = look.hatColor;
  if (!C || !look.hat) return;
  const Cs = shade(C, 0.75);
  const Cl = lighten(C, 0.2);
  const crown = (clipY) => {
    p.ellipse(32, 21, 16, 10, C, null, (x, y) => y <= clipY);
    p.rect(31, 11, 3, 1, Cs);
    p.ellipse(26, 16, 5, 2, Cl, null, (x, y) => y <= 16);
    for (let y = 13; y <= clipY; y++) p.set(32, y, Cs);
  };
  if (look.hat === 'cap') {
    crown(23);
    p.ellipse(32, 18, 3, 2.5, '#ffffff');
    p.rect(15, 23, 34, 3, Cs);
    p.rect(15, 25, 34, 1, shade(C, 0.6));
    for (let x = 18; x <= 46; x++) {
      const c = p.get(x, 27);
      if (c) p.set(x, 27, shade(c, 0.8));
    }
  } else if (look.hat === 'capBack') {
    p.rect(40, 12, 12, 4, Cs);
    p.rect(41, 15, 11, 1, shade(C, 0.6));
    crown(23);
    p.rect(18, 22, 29, 2, Cs);
    p.rect(29, 19, 7, 4, look.hair);
    p.rect(29, 21, 7, 1, '#d8d8d8');
  } else if (look.hat === 'beanie') {
    p.ellipse(32, 20, 16, 10, (x, y) => ((x + y) % 3 === 0 ? Cs : C), null, (x, y) => y <= 22);
    p.rect(16, 20, 33, 5, Cs);
    for (let x = 17; x <= 47; x += 2) p.rect(x, 20, 1, 5, shade(C, 0.62));
    p.ellipse(32, 9, 4, 3.5, Cl);
  } else if (look.hat === 'hood') {
    // the rim of the hood around the face
    p.ellipse(32, 26, 17, 13, C, null, (x, y) => y <= 18 || (y <= 24 && Math.abs(x - 32) > 13));
    p.rect(13, 24, 6, 26, C); p.rect(46, 24, 6, 26, shade(C, 0.8));
    p.ellipse(32, 15, 10, 2, Cl, null, (x, y) => y <= 14);
    p.rect(26, 47, 1, 9, '#f4efe0'); p.rect(38, 47, 1, 9, '#f4efe0');
  }
}

function extras(p, look) {
  const skin = look.skin;
  for (const e of look.extras || []) {
    if (e === 'chain') {
      for (let i = 0; i <= 8; i++) { p.set(23 + i, 49 + i, '#ffd23f'); p.set(41 - i, 49 + i, '#ffd23f'); }
      p.rect(30, 57, 5, 4, '#ffd23f'); p.rect(31, 58, 3, 2, '#b8901f');
    } else if (e === 'earbuds') {
      p.rect(17, 31, 2, 3, '#ffffff'); p.rect(46, 31, 2, 3, '#e8e8e8');
    } else if (e === 'hoops') {
      for (const x of [17, 45]) {
        p.rect(x, 35, 3, 1, '#ffd23f'); p.rect(x, 39, 3, 1, '#ffd23f');
        p.rect(x - 1, 36, 1, 3, '#ffd23f'); p.rect(x + 3, 36, 1, 3, '#ffd23f');
      }
    } else if (e === 'shades') {
      // tinted sunglasses pushed up on the head
      for (const lx of [21, 34]) {
        p.rect(lx, 15, 10, 1, '#ffffff');
        p.rect(lx, 16, 10, 4, '#2b2b3a');
        p.rect(lx + 1, 16, 8, 3, '#ff7eb6');
        p.rect(lx + 1, 18, 8, 1, '#c8508a');
        p.set(lx + 2, 16, '#ffffff'); p.set(lx + 3, 16, '#ffd6ec');
      }
      p.rect(31, 16, 3, 1, '#2b2b3a');
    } else if (e === 'glasses') {
      for (const ex of [26, 38]) {
        p.rect(ex - 4, 27, 9, 1, '#2b2b3a'); p.rect(ex - 4, 34, 9, 1, '#2b2b3a');
        p.rect(ex - 4, 27, 1, 8, '#2b2b3a'); p.rect(ex + 4, 27, 1, 8, '#2b2b3a');
      }
      p.rect(31, 29, 3, 1, '#2b2b3a');
      p.set(23, 28, '#ffffff');
    } else if (e === 'eyebags') {
      const bag = mix(shade(skin, 0.8), '#6a4a8a', 0.3);
      for (const ex of [26, 38]) { p.rect(ex - 2, 34, 5, 1, bag); p.set(ex - 3, 33, bag); p.set(ex + 3, 33, bag); }
    } else if (e === 'stubble') {
      for (let y = 37; y <= 44; y++) for (let x = 21; x <= 43; x++) {
        if ((x + y * 2) % 3 !== 0) continue;
        if (y < 41 && x > 27 && x < 37) continue;
        const c = p.get(x, y);
        if (c && (c === skin || c === shade(skin, 0.86))) p.set(x, y, shade(look.hair, 0.9));
      }
    } else if (e === 'freckles') {
      for (const [x, y] of [[23, 35], [25, 36], [27, 35], [37, 35], [39, 36], [41, 35]]) p.set(x, y, shade(skin, 0.68));
    } else if (e === 'headphones') {
      p.ellipse(32, 50, 15, 3, '#3a3a4a', null, (x, y) => y >= 50);
      p.ellipse(18, 50, 3, 4, '#2b2b3a'); p.ellipse(46, 50, 3, 4, '#2b2b3a');
      p.set(18, 49, look.hatColor || '#ff5fa2'); p.set(46, 49, look.hatColor || '#ff5fa2');
    }
  }
}

export function paintPortrait(ctx, look, expr, kind, seed = 1, ox = 0) {
  const p = new Painter();
  backdrop(p, kind, seed);
  hairBack(p, look);
  torso(p, look, kind);
  neck(p, look.skin);
  head(p, look);
  face(p, look, expr);
  hairFront(p, look);
  hat(p, look);
  extras(p, look);
  p.outline();
  p.flush(ctx, ox);
}

// Builds `${key}` with frames 'n' and 'h'.
export function buildPortrait(scene, key, look, kind, seed = 1) {
  if (scene.textures.exists(key)) return key;
  const tex = canvasTexture(scene, key, S * 2, S, (ctx) => {
    paintPortrait(ctx, look, 'n', kind, seed, 0);
    paintPortrait(ctx, look, 'h', kind, seed, S);
  });
  tex.add('n', 0, 0, 0, S, S);
  tex.add('h', 0, S, 0, S, S);
  return key;
}
