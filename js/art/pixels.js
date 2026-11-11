// Shared pixel-art helpers: colors, canvas textures, a tiny 3x5 pixel font,
// and the small effect textures used everywhere.

// ---------- color helpers ----------
export function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function rgbToHex(r, g, b) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return '#' + c(r) + c(g) + c(b);
}
export function shade(h, f) {
  const [r, g, b] = hexToRgb(h);
  return rgbToHex(r * f, g * f, b * f);
}
export function mix(a, b, t) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}
export function lighten(h, t) {
  return mix(h, '#ffffff', t);
}
// Cool, slightly dim gray: the color of a life lived through a screen.
export function desaturate(h) {
  const [r, g, b] = hexToRgb(h);
  const l = 0.3 * r + 0.59 * g + 0.11 * b;
  const v = l * 0.72 + 18;
  return rgbToHex(v * 0.92, v * 0.96, v * 1.1);
}
export function grayPalette(pal, overrides = {}) {
  const out = {};
  for (const k in pal) out[k] = overrides[k] ?? desaturate(pal[k]);
  return out;
}
// Saturated, bright colors survive in the gray city (neon, gold, screens).
function isNeon(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max > 170 && (max - min) / max > 0.55;
}
// Turns a drawn canvas region gray, keeping neon colors.
export function grayCanvas(ctx, w, h, keepNeon = true) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    if (keepNeon && isNeon(d[i], d[i + 1], d[i + 2])) continue;
    const l = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2];
    const v = l * 0.72 + 18;
    d[i] = v * 0.92;
    d[i + 1] = v * 0.96;
    d[i + 2] = Math.min(255, v * 1.1);
  }
  ctx.putImageData(img, 0, 0);
}

// ---------- canvas helpers ----------
export function canvasTexture(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) return scene.textures.get(key);
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  draw(ctx);
  tex.refresh();
  return tex;
}
export function drawRows(ctx, rows, pal, ox = 0, oy = 0) {
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const col = pal[ch];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  });
}
export function rect(ctx, c, x, y, w, h) {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}
// Checkerboard dither between two colors.
export function dither(ctx, c, x, y, w, h, phase = 0) {
  ctx.fillStyle = c;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if ((i + j + phase) % 2 === 0) ctx.fillRect(x + i, y + j, 1, 1);
}
export function hash2(x, y) {
  return (((x * 73856093) ^ (y * 19349663)) >>> 0) % 997;
}

// ---------- 3x5 pixel font ----------
const GLYPHS = {
  "A": '.#.#.#####.##.#',
  "B": '##.#.###.#.###.',
  "C": '.###..#..#...##',
  "D": '##.#.##.##.###.',
  "E": '####..##.#..###',
  "F": '####..##.#..#..',
  "G": '.###..#.##.#.##',
  "H": '#.##.#####.##.#',
  "I": '###.#..#..#.###',
  "J": '..#..#..##.#.#.',
  "K": '#.##.###.#.##.#',
  "L": '#..#..#..#..###',
  "M": '#.########.##.#',
  "N": '##.#.##.##.##.#',
  "O": '.#.#.##.##.#.#.',
  "P": '##.#.###.#..#..',
  "Q": '.#.#.##.###..##',
  "R": '##.#.###.#.##.#',
  "S": '.###...#...###.',
  "T": '###.#..#..#..#.',
  "U": '#.##.##.##.####',
  "V": '#.##.##.##.#.#.',
  "W": '#.##.########.#',
  "X": '#.##.#.#.#.##.#',
  "Y": '#.##.#.#..#..#.',
  "Z": '###..#.#.#..###',
  "0": '####.##.##.####',
  "1": '.#.##..#..#.###',
  "2": '##...#.#.#..###',
  "3": '##...#.#...###.',
  "4": '#.##.####..#..#',
  "5": '####..##...###.',
  "6": '.###..####.####',
  "7": '###..#.#..#..#.',
  "8": '####.#####.####',
  "9": '####.####..###.',
  " ": '...............',
  "!": '.#..#..#.....#.',
  "?": '##...#.#.....#.',
  ".": '.............#.',
  ",": '..........#.#..',
  ":": '....#.....#....',
  "+": '....#.###.#....',
  "-": '......###......',
  "%": '#.#..#.#.#..#.#',
  "$": '.####..#..####.',
  "#": '#.#####.#####.#',
  "&": '.#.#.#.#.#.#.##',
  "'": '.#..#..........',
  "(": '.#.#..#..#...#.',
  ")": '.#...#..#..#.#.',
  "/": '..#..#.#.#..#..',
  "^": '....#.###......',
  "~": '...###.#.......',
  "=": '...###...###...',
  "@": '#.#######.#....',
  "*": '#.#.#.#.#......',
  "<": '..#.#.#...#...#',
  ">": '#...#...#.#.#..',
};

export function textWidth(text, scale = 1) {
  return text.length ? (text.length * 4 - 1) * scale : 0;
}
export function drawText(ctx, text, x, y, color, scale = 1) {
  ctx.fillStyle = color;
  const s = String(text).toUpperCase();
  for (let i = 0; i < s.length; i++) {
    const g = GLYPHS[s[i]] || GLYPHS['?'];
    for (let p = 0; p < 15; p++) {
      if (g[p] !== '#') continue;
      ctx.fillRect(x + (i * 4 + (p % 3)) * scale, y + Math.floor(p / 3) * scale, scale, scale);
    }
  }
}
export function drawTextCentered(ctx, text, cx, y, color, scale = 1) {
  drawText(ctx, text, Math.round(cx - textWidth(text, scale) / 2), y, color, scale);
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

export function buildEffectTextures(scene) {
  radial(scene, 'glow', 32, [[0, 'rgba(255,255,255,1)'], [0.4, 'rgba(255,255,255,0.35)'], [1, 'rgba(255,255,255,0)']]);
  radial(scene, 'aura', 96, [[0, 'rgba(30,0,50,0.55)'], [0.7, 'rgba(50,5,80,0.45)'], [0.9, 'rgba(160,70,230,0.45)'], [1, 'rgba(60,0,90,0)']]);
  canvasTexture(scene, 'shadow', 16, 5, (ctx) => {
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.fillRect(3, 0, 10, 5); ctx.fillRect(1, 1, 14, 3); ctx.fillRect(0, 2, 16, 1);
  });
  canvasTexture(scene, 'pebble', 3, 3, (ctx) => drawRows(ctx, ['.G.', 'GGG', '.G.'], { G: '#e6dccb' }));
  canvasTexture(scene, 'shard', 2, 2, (ctx) => rect(ctx, '#ffffff', 0, 0, 2, 2));
  canvasTexture(scene, 'pollen', 2, 2, (ctx) => rect(ctx, '#ffe066', 0, 0, 2, 2));
  canvasTexture(scene, 'puff', 4, 4, (ctx) => drawRows(ctx, ['.WW.', 'WWWW', 'WWWW', '.WW.'], { W: '#ffffff' }));
  canvasTexture(scene, 'heart', 7, 6, (ctx) => drawRows(ctx, ['.PP.PP.', 'PPPPPPP', 'PPPPPPP', '.PPPPP.', '..PPP..', '...P...'], { P: '#ff6f9f' }));
  canvasTexture(scene, 'star', 5, 5, (ctx) => drawRows(ctx, ['..Y..', '.YYY.', 'YYYYY', '.YYY.', '..Y..'], { Y: '#ffe066' }));
  canvasTexture(scene, 'sparkle', 5, 5, (ctx) => drawRows(ctx, ['..W..', '..W..', 'WWWWW', '..W..', '..W..'], { W: '#ffffff' }));
  canvasTexture(scene, 'raindrop', 2, 7, (ctx) => { rect(ctx, 'rgba(170,200,255,0.75)', 0, 0, 1, 7); rect(ctx, 'rgba(220,235,255,0.9)', 1, 4, 1, 3); });
  canvasTexture(scene, 'flyer', 7, 5, (ctx) => drawRows(ctx, ['WWWWWWW', 'WGGWRRW', 'WWWWWWW', 'WGGGGGW', 'WWWWWWW'], { W: '#f4efe0', G: '#3dff8a', R: '#ff3b5c' }));
  canvasTexture(scene, 'badge', 7, 7, (ctx) => {
    drawRows(ctx, ['.RRRRR.', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR', '.RRRRR.'], { R: '#ff3b4e' });
    drawText(ctx, '!', 2, 1, '#ffffff');
  });
  canvasTexture(scene, 'opentag', 7, 6, (ctx) => drawRows(ctx, ['GGGGGGG', 'GLLLLLG', '.GLLLG.', '..GLG..', '...G...', '.......'], { G: '#1f7a3a', L: '#5dff8a' }));
  canvasTexture(scene, 'tea', 9, 11, (ctx) => drawRows(ctx, [
    '..S...S..', '...S.S...', '..S...S..', '.........', 'OOOOOOO..', 'OCCCCCOOO', 'OCWCCCO.O', 'OCCCCCOOO', '.OCCCO...', '.OOOOO...', 'PPPPPPP..',
  ], { S: '#ffffff', O: '#6b4428', C: '#f4efe0', W: '#ff8fb0', P: '#c8b8a0' }));
  canvasTexture(scene, 'leaf', 5, 4, (ctx) => drawRows(ctx, ['..LL.', '.LLLL', 'LLLD.', '.D...'], { L: '#e08a3a', D: '#a8562a' }));
  canvasTexture(scene, 'gull', 9, 4, (ctx) => drawRows(ctx, ['WW.....WW', '..WW.WW..', '....G....', '.........'], { W: '#ffffff', G: '#c8c8d0' }));
  canvasTexture(scene, 'replybubble', 9, 7, (ctx) => {
    drawRows(ctx, ['RRRRRRRRR', 'RWWWWWWWR', 'RWWWWWWWR', 'RRRRRRRRR', '.RR......', '.R.......', '.........'], { R: '#ff3b4e', W: '#ffd0d4' });
  });
  canvasTexture(scene, 'bubble', 7, 7, (ctx) => {
    drawRows(ctx, ['.BBBBB.', 'BW...BB', 'B.....B', 'B.....B', 'B.....B', 'BB...BB', '.BBBBB.'], { B: '#bfe8ff', W: '#ffffff' });
  });
  canvasTexture(scene, 'recdot', 3, 3, (ctx) => drawRows(ctx, ['.R.', 'RRR', '.R.'], { R: '#ff3b4e' }));
  canvasTexture(scene, 'ring', 12, 12, (ctx) => {
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 2); ctx.stroke();
  });
  canvasTexture(scene, 'reticle', 17, 17, (ctx) => {
    const W = '#ffffff';
    for (const [x, y] of [[0, 0], [14, 0], [0, 14], [14, 14]]) {
      rect(ctx, W, x, y + (y ? 2 : 0), 3, 1);
      rect(ctx, W, x + (x ? 2 : 0), y, 1, 3);
    }
  });
  canvasTexture(scene, 'talktag', 23, 11, (ctx) => {
    drawRows(ctx, [
      '.FFFFFFFFFFFFFFFFFFFFF.', 'FPPPPPPPPPPPPPPPPPPPPPF', 'FPPPPPPPPPPPPPPPPPPPPPF', 'FPPPPPPPPPPPPPPPPPPPPPF',
      'FPPPPPPPPPPPPPPPPPPPPPF', 'FPPPPPPPPPPPPPPPPPPPPPF', 'FPPPPPPPPPPPPPPPPPPPPPF', 'FPPPPPPPPPPPPPPPPPPPPPF',
      '.FFFFFFFFFPPPFFFFFFFFF.', '..........FPF..........', '...........F...........',
    ], { F: '#8a5a2b', P: '#f6e7c8' });
    drawText(ctx, 'TALK', 4, 2, '#5a3a1a');
  });
  canvasTexture(scene, 'paper_doom', 12, 9, (ctx) => drawRows(ctx, [
    'RRRRRRRRRRRR', 'RWWRRWRRWWRR', 'RRRRRRRRRRRR', 'PPPPPPPPPPPP', 'PKKKKKKPKKKP',
    'PPPPPPPPPPPP', 'PKKKKPKKKKKP', 'PPPPPPPPPPPP', 'KKKKKKKKKKKK',
  ], { R: '#b3202f', W: '#ffffff', P: '#e8e2d0', K: '#555566' }));
  canvasTexture(scene, 'paper_good', 12, 9, (ctx) => drawRows(ctx, [
    'OOOOOOOOOOOO', 'OWWOWWOOWWOO', 'OOOOOOOOOOOO', 'PPPPPPPPPYPP', 'PKKKKKPPYYYP',
    'PPPPPPPPPYPP', 'PKKKKPKKKPPP', 'PPPPPPPPPPPP', 'GGGGGGGGGGGG',
  ], { O: '#ffb800', W: '#ffffff', P: '#fff6c8', K: '#8a7a4a', Y: '#ff9a00', G: '#7bd36a' }));
  const chart = (key, pts, line) => canvasTexture(scene, key, 14, 10, (ctx) => {
    rect(ctx, '#2a2f3d', 0, 0, 14, 10);
    rect(ctx, '#10131c', 1, 1, 12, 8);
    ctx.fillStyle = line;
    pts.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
  });
  chart('chart_up', [[1, 8], [2, 7], [3, 7], [4, 6], [5, 7], [6, 5], [7, 4], [8, 4], [9, 3], [10, 2], [11, 1], [12, 1], [10, 1], [12, 2]], '#3dff8a');
  chart('chart_down', [[1, 1], [2, 2], [3, 2], [4, 3], [5, 2], [6, 4], [7, 5], [8, 5], [9, 6], [10, 7], [11, 8], [12, 8], [10, 8], [12, 7]], '#ff3b5c');
  canvasTexture(scene, 'vignette', 240, 135, (ctx) => {
    const g = ctx.createRadialGradient(120, 67, 30, 120, 67, 140);
    g.addColorStop(0, 'rgba(255,40,160,0)');
    g.addColorStop(0.6, 'rgba(180,30,200,0.25)');
    g.addColorStop(1, 'rgba(120,0,160,0.85)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 240, 135);
  });
}
