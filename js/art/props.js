// Themed props. Each has a "locked" look (gray city, neon survives) and a "freed"
// look it switches to when the nearest person is freed.
//
// place: 'ground' sits on its tile and blocks `foot` tiles, 'wall' hangs on a building
// wall, 'roof' sits on rooftops, 'floor' is painted on the ground, 'air' floats.

import { canvasTexture, rect, dither, drawText, drawTextCentered, textWidth, grayCanvas, shade } from './pixels.js';

const ell = (ctx, c, cx, cy, rx, ry) => {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
};
const ring = (ctx, c, cx, cy, r) => {
  ctx.strokeStyle = c;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
};

export const PROP_TYPES = {
  ticker: {
    w: 48, h: 14, place: 'wall', dy: 1,
    scroll: { x: 3, y: 4, w: 42, text: ['BTC ^420%  $GRIND ^1000%  NVDA ^69%  HUSTLE ^^^  ', 'NICE DAY :)  CALL YOUR MOM  DRINK WATER  NAP AT 3  '], color: ['#3dff8a', '#ffd97a'] },
    draw(ctx, freed) {
      rect(ctx, freed ? '#6b4428' : '#1c1c24', 0, 0, 48, 14);
      rect(ctx, freed ? '#3a2412' : '#07080c', 2, 2, 44, 10);
      dither(ctx, freed ? '#4a3018' : '#12141c', 2, 2, 44, 10, 0);
      rect(ctx, freed ? '#8a5a2b' : '#3a3a48', 0, 0, 48, 1);
    },
  },
  bigboard: {
    w: 48, h: 30, place: 'roof',
    draw(ctx, freed, text) {
      rect(ctx, '#2a2a33', 8, 21, 3, 9); rect(ctx, '#2a2a33', 37, 21, 3, 9);
      rect(ctx, '#1c1c24', 0, 0, 48, 22);
      if (freed) {
        rect(ctx, '#8fd3ff', 2, 2, 44, 18);
        rect(ctx, '#7bd36a', 2, 15, 44, 5); ell(ctx, '#7bd36a', 12, 16, 12, 4);
        ell(ctx, '#ffe066', 40, 6, 3, 3);
      } else {
        rect(ctx, '#ff3fb4', 2, 2, 44, 18);
        dither(ctx, '#d02a90', 2, 2, 44, 18, 0);
      }
      const t = text || ['', '', '', ''];
      const [a, b] = freed ? [t[2], t[3]] : [t[0], t[1]];
      const c = freed ? '#2a4a7a' : '#ffffff';
      drawTextCentered(ctx, a, 24, 5, c);
      drawTextCentered(ctx, b, 24, 12, c);
    },
  },
  sign: {
    place: 'wall', dy: 2, h: 12,
    width: (text) => Math.max(textWidth(text[0]), textWidth(text[1])) + 10,
    draw(ctx, freed, text, w, color = '#3dff8a') {
      if (freed) {
        rect(ctx, '#6b4428', 0, 0, w, 12);
        rect(ctx, '#a8743a', 1, 1, w - 2, 10);
        rect(ctx, '#c08a55', 1, 1, w - 2, 1);
        drawTextCentered(ctx, text[1], w / 2, 4, '#fff3d0');
      } else {
        rect(ctx, '#1c1c24', 0, 0, w, 12);
        rect(ctx, '#0a0a10', 1, 1, w - 2, 10);
        drawTextCentered(ctx, text[0], w / 2 + 1, 5, shade(color, 0.45));
        drawTextCentered(ctx, text[0], w / 2, 4, color);
      }
    },
  },
  atm: {
    w: 16, h: 26, place: 'ground', foot: 1,
    draw(ctx, freed) {
      if (freed) {
        rect(ctx, '#8a5a2b', 2, 6, 1, 20); rect(ctx, '#8a5a2b', 13, 6, 1, 20);
        for (let x = 0; x < 16; x += 4) { rect(ctx, '#ffd23f', x, 1, 2, 5); rect(ctx, '#ffffff', x + 2, 1, 2, 5); }
        rect(ctx, '#c0902a', 0, 6, 16, 1);
        rect(ctx, '#c08a55', 1, 15, 14, 3); rect(ctx, '#7a5130', 1, 18, 14, 1);
        rect(ctx, '#7a5130', 2, 19, 1, 7); rect(ctx, '#7a5130', 13, 19, 1, 7);
        rect(ctx, '#fff3a0', 4, 10, 4, 5); rect(ctx, '#ffd23f', 4, 12, 4, 3); rect(ctx, '#ffffff', 5, 10, 1, 2);
        rect(ctx, '#ffffff', 10, 12, 2, 3); rect(ctx, '#ffffff', 12, 12, 2, 3);
        rect(ctx, '#ffe066', 4, 20, 8, 4); drawText(ctx, ':)', 6, 20, '#8a5a2b');
      } else {
        rect(ctx, '#2a2a33', 1, 2, 14, 24);
        rect(ctx, '#ff8a3d', 2, 3, 12, 22);
        rect(ctx, '#c8601a', 12, 3, 2, 22);
        rect(ctx, '#0a0a10', 3, 5, 10, 8); drawText(ctx, 'BTC', 3, 7, '#3fe8ff');
        for (let y = 15; y < 21; y += 2) for (let x = 4; x < 11; x += 2) rect(ctx, '#3a3a48', x, y, 1, 1);
        rect(ctx, '#0a0a10', 4, 22, 8, 1);
      }
    },
  },
  bull: {
    w: 32, h: 28, place: 'ground', foot: 2,
    draw(ctx, freed) {
      rect(ctx, '#6a6a72', 2, 20, 28, 8); rect(ctx, '#85858e', 2, 20, 28, 2); rect(ctx, '#55555c', 2, 27, 28, 1);
      const g = '#ffd23f';
      const gs = '#c8a020';
      ell(ctx, g, 15, 13, 10, 5);
      rect(ctx, gs, 8, 15, 16, 2);
      ell(ctx, g, 26, 10, 4, 4); rect(ctx, gs, 28, 11, 2, 3);
      rect(ctx, '#fff3a0', 23, 5, 1, 3); rect(ctx, '#fff3a0', 22, 4, 1, 1); rect(ctx, '#fff3a0', 29, 5, 1, 3); rect(ctx, '#fff3a0', 30, 4, 1, 1);
      for (const x of [8, 11, 18, 21]) rect(ctx, gs, x, 17, 2, 3);
      rect(ctx, gs, 4, 10, 2, 1); rect(ctx, gs, 3, 11, 1, 3);
      rect(ctx, '#2a1d1a', 27, 9, 1, 1);
      rect(ctx, '#fff3a0', 10, 9, 8, 1);
      if (freed) {
        for (const [x, c] of [[23, '#ff6fa8'], [25, '#ffffff'], [27, '#ffd23f'], [29, '#ff6fa8']]) rect(ctx, c, x, 5, 1, 1);
        rect(ctx, '#3f9b47', 23, 6, 7, 1);
        rect(ctx, '#8a5a2b', 11, 6, 7, 2); rect(ctx, '#6b4428', 12, 5, 5, 1);
        rect(ctx, '#3f7fe8', 13, 3, 3, 2); rect(ctx, '#ffd23f', 16, 4, 1, 1); rect(ctx, '#2a1d1a', 14, 3, 1, 1);
        for (let x = 3; x < 30; x += 3) rect(ctx, '#3f9b47', x, 21 + (x % 2), 1, 3);
        rect(ctx, '#ff6fa8', 6, 21, 1, 1); rect(ctx, '#ffd23f', 18, 22, 1, 1);
      }
    },
  },
  gymwin: {
    w: 32, h: 13, place: 'wall', dy: 2,
    draw(ctx, freed) {
      rect(ctx, '#2a2a33', 0, 0, 32, 13);
      rect(ctx, freed ? '#ffe8a0' : '#1a2030', 1, 1, 30, 11);
      if (freed) {
        for (const [x, c] of [[8, '#ff6fa8'], [22, '#3f7fe8']]) {
          rect(ctx, c, x, 5, 3, 4); rect(ctx, '#f2c29b', x, 3, 3, 2);
          rect(ctx, c, x - 2, 2, 1, 3); rect(ctx, c, x + 4, 2, 1, 3);
          rect(ctx, '#3a3a48', x, 9, 1, 2); rect(ctx, '#3a3a48', x + 2, 9, 1, 2);
        }
        rect(ctx, '#8a5a2b', 15, 3, 1, 3); rect(ctx, '#8a5a2b', 14, 5, 1, 1); rect(ctx, '#8a5a2b', 16, 3, 2, 1);
      } else {
        for (const x of [4, 18]) {
          rect(ctx, '#5a5a66', x, 10, 10, 1); rect(ctx, '#5a5a66', x + 9, 5, 1, 5);
          rect(ctx, '#9aa0aa', x + 4, 3, 2, 2); rect(ctx, '#9aa0aa', x + 4, 5, 2, 3);
          rect(ctx, '#9aa0aa', x + 3, 8, 1, 2); rect(ctx, '#9aa0aa', x + 6, 8, 1, 2);
          rect(ctx, '#7fe3ff', x + 8, 4, 2, 1);
        }
      }
      rect(ctx, '#2a2a33', 15, 1, 1, 11);
    },
  },
  plunge: {
    w: 32, h: 16, place: 'ground', foot: 2,
    draw(ctx, freed) {
      if (freed) {
        ell(ctx, '#e8433f', 16, 9, 15, 6.5); ell(ctx, '#ffffff', 16, 9, 13, 5.5);
        ell(ctx, '#4ab8e8', 16, 9, 12, 4.5); rect(ctx, '#8fd8ff', 8, 7, 6, 1);
        for (const [x, y] of [[10, 9], [19, 8], [23, 10]]) {
          rect(ctx, '#ffd23f', x, y, 4, 2); rect(ctx, '#ffd23f', x + 2, y - 2, 2, 2); rect(ctx, '#ff8a3d', x + 4, y - 1, 1, 1);
        }
      } else {
        for (const x of [0, 16]) {
          rect(ctx, '#7a8898', x + 1, 2, 14, 13); rect(ctx, '#c8d4e0', x + 1, 2, 14, 2);
          rect(ctx, '#bfe8ff', x + 2, 4, 12, 9);
          rect(ctx, '#ffffff', x + 4, 6, 3, 3); rect(ctx, '#ffffff', x + 9, 8, 3, 3); rect(ctx, '#ffffff', x + 6, 10, 2, 2);
          rect(ctx, '#5a6878', x + 1, 14, 14, 1);
        }
      }
    },
  },
  wings: {
    w: 32, h: 30, place: 'ground', foot: 2,
    draw(ctx, freed) {
      rect(ctx, '#d0d0d8', 0, 0, 32, 28); rect(ctx, '#9a9aa2', 0, 27, 32, 3);
      if (freed) {
        rect(ctx, '#8fd3ff', 1, 1, 30, 26);
        ell(ctx, '#ffe066', 25, 7, 4, 4);
        rect(ctx, '#7bd36a', 1, 20, 30, 7);
        const hands = [[4, 12, '#ff6fa8'], [10, 15, '#ffd23f'], [16, 11, '#3f7fe8'], [21, 16, '#ff8a3d'], [7, 20, '#a98bff']];
        hands.forEach(([x, y, c]) => { rect(ctx, c, x, y, 4, 4); rect(ctx, c, x, y - 2, 1, 2); rect(ctx, c, x + 2, y - 3, 1, 3); rect(ctx, c, x + 4, y - 1, 1, 2); });
        drawText(ctx, 'US', 12, 2, '#ffffff');
      } else {
        rect(ctx, '#f2b5c8', 1, 1, 30, 26);
        for (const side of [-1, 1]) {
          for (let i = 0; i < 5; i++) {
            const x = 16 + side * (3 + i * 2);
            rect(ctx, '#ffffff', side < 0 ? x - 1 : x, 5 + i, 2, 14 - i * 2);
          }
        }
        drawTextCentered(ctx, 'BLESSED', 16, 21, '#ff3fb4');
      }
    },
  },
  ringlight: {
    w: 12, h: 28, place: 'ground', foot: 1,
    draw(ctx, freed) {
      if (freed) {
        rect(ctx, '#8a5a2b', 5, 2, 2, 26);
        rect(ctx, '#6b4428', 3, 26, 6, 2);
        const bulbs = ['#ff6fa8', '#ffd23f', '#7bd36a', '#8fd3ff', '#ff8a3d'];
        for (let i = 0; i < 6; i++) { rect(ctx, bulbs[i % 5], 1 + (i % 2) * 8, 4 + i * 3, 2, 2); }
        rect(ctx, '#ffe8a0', 3, 0, 6, 3);
      } else {
        rect(ctx, '#2a2a33', 5, 10, 2, 12);
        rect(ctx, '#2a2a33', 1, 22, 2, 6); rect(ctx, '#2a2a33', 9, 22, 2, 6); rect(ctx, '#2a2a33', 5, 22, 2, 6);
        ring(ctx, '#ffffff', 6, 6, 5); ring(ctx, '#e8f6ff', 6, 6, 4);
        rect(ctx, '#1c1c24', 5, 4, 3, 5); rect(ctx, '#7fd1ff', 6, 5, 1, 3);
      }
    },
  },
  decal: {
    w: 16, h: 16, place: 'floor',
    draw(ctx, freed) {
      if (freed) {
        const cs = ['#ff6fa8', '#ffd23f', '#8fd3ff', '#7bd36a'];
        [[1, 1], [8, 1], [1, 8], [8, 8]].forEach(([x, y], i) => {
          ctx.strokeStyle = cs[i]; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, 6, 6);
          drawText(ctx, String(i + 1), x + 2, y + 1, cs[i]);
        });
      } else {
        ell(ctx, '#ff3fb4', 8, 8, 7, 7); ell(ctx, '#d02a90', 8, 9, 6, 5);
        drawTextCentered(ctx, 'AD', 8, 6, '#ffffff');
      }
    },
  },
  plant: {
    w: 12, h: 20, place: 'ground', foot: 1,
    draw(ctx, freed) {
      if (freed) {
        rect(ctx, '#c4704a', 2, 13, 8, 7); rect(ctx, '#94502e', 2, 13, 8, 1); rect(ctx, '#94502e', 8, 14, 2, 6);
        for (const [x, y, c] of [[1, 6, '#3f9b47'], [5, 2, '#5fbf6a'], [8, 5, '#3f9b47'], [3, 9, '#72c873'], [7, 9, '#2e7a38']]) rect(ctx, c, x, y, 3, 5);
        rect(ctx, '#ff6fa8', 2, 5, 2, 2); rect(ctx, '#ffd23f', 8, 3, 2, 2);
        rect(ctx, '#ff8a3d', 9, 0, 1, 1); rect(ctx, '#ff8a3d', 11, 0, 1, 1); rect(ctx, '#2a1d1a', 10, 0, 1, 2);
      } else {
        rect(ctx, '#f4f4f4', 2, 13, 8, 7); rect(ctx, '#c8c8d0', 8, 13, 2, 7); rect(ctx, '#ffffff', 2, 13, 8, 1);
        rect(ctx, '#3a8a4a', 5, 9, 2, 4);
        ell(ctx, '#3fd06a', 6, 6, 5, 5); ell(ctx, '#2fa050', 7, 7, 3, 3);
        rect(ctx, '#ffffff', 3, 3, 2, 2);
      }
    },
  },
  newsscreen: {
    w: 48, h: 36, place: 'ground', foot: 3,
    scroll: { x: 3, y: 22, w: 42, text: ['MARKETS DOWN  SKY FALLING  EXPERTS WORRIED  STAY TUNED  ', 'PARK OPENS  SUNNY ALL WEEK  NEIGHBORS WAVE  BEES ARE BACK  '], color: ['#ffffff', '#3a2a10'] },
    draw(ctx, freed) {
      rect(ctx, '#2a2a33', 6, 28, 3, 8); rect(ctx, '#2a2a33', 39, 28, 3, 8);
      rect(ctx, '#1c1c24', 0, 0, 48, 29);
      if (freed) {
        rect(ctx, '#3f7fe8', 2, 2, 44, 7); drawTextCentered(ctx, 'GOOD NEWS', 24, 3, '#ffffff');
        rect(ctx, '#8fd3ff', 2, 9, 44, 11); rect(ctx, '#7bd36a', 2, 16, 44, 4);
        ell(ctx, '#ffe066', 38, 12, 3, 3);
        rect(ctx, '#6b4428', 12, 12, 2, 5); ell(ctx, '#3f9b47', 13, 11, 4, 3);
        rect(ctx, '#ffe066', 2, 21, 44, 6);
      } else {
        rect(ctx, '#d81e3a', 2, 2, 44, 7); drawTextCentered(ctx, 'BREAKING', 24, 3, '#ffffff');
        rect(ctx, '#14141c', 2, 9, 44, 11);
        const pts = [[6, 11], [12, 12], [18, 11], [24, 14], [30, 15], [36, 17], [42, 18]];
        for (let i = 0; i < pts.length - 1; i++) {
          const [x1, y1] = pts[i]; const [x2, y2] = pts[i + 1];
          for (let t = 0; t <= 1; t += 0.1) rect(ctx, '#ff3b5c', Math.round(x1 + (x2 - x1) * t), Math.round(y1 + (y2 - y1) * t), 1, 1);
        }
        rect(ctx, '#ff3b5c', 41, 17, 3, 1); rect(ctx, '#ff3b5c', 43, 15, 1, 3);
        rect(ctx, '#0a0a10', 2, 21, 44, 6);
      }
    },
  },
  newsbox: {
    w: 12, h: 18, place: 'ground', foot: 1,
    draw(ctx, freed) {
      const c = freed ? '#ffd23f' : '#c0392b';
      rect(ctx, '#2a2a33', 1, 15, 10, 3);
      rect(ctx, c, 0, 1, 12, 14); rect(ctx, shade(c, 0.75), 10, 1, 2, 14); rect(ctx, shade(c, 1.15), 0, 1, 12, 1);
      drawTextCentered(ctx, freed ? 'YAY' : 'BAD', 6, 3, freed ? '#8a5a2b' : '#ffffff');
      rect(ctx, '#bfe8ff', 2, 9, 8, 5); rect(ctx, freed ? '#fff6c8' : '#e8e2d0', 3, 10, 6, 4);
      rect(ctx, freed ? '#ffb800' : '#b3202f', 3, 10, 6, 1);
    },
  },
  badges: {
    w: 26, h: 18, place: 'air',
    draw(ctx, freed) {
      for (const [x, y] of [[0, 6], [9, 0], [17, 8]]) {
        if (freed) {
          ring(ctx, '#bfe8ff', x + 4.5, y + 4.5, 4); rect(ctx, '#ffffff', x + 2, y + 2, 1, 1);
        } else {
          ell(ctx, '#ff3b4e', x + 4.5, y + 4.5, 4.5, 4.5);
          drawText(ctx, '99', x + 1, y + 2, '#ffffff');
        }
      }
    },
  },
  lamp: {
    w: 12, h: 36, place: 'ground', foot: 1, light: true,
    draw(ctx, freed) {
      rect(ctx, '#3a3a44', 5, 6, 2, 30); rect(ctx, '#2a2a33', 4, 33, 4, 3);
      rect(ctx, '#3a3a44', 2, 2, 8, 3); rect(ctx, '#2a2a33', 2, 1, 8, 1);
      rect(ctx, freed ? '#ffd97a' : '#bfe8ff', 3, 5, 6, 2);
    },
  },
  trash: {
    w: 16, h: 13, place: 'ground', foot: 1,
    draw(ctx, freed) {
      if (freed) {
        rect(ctx, '#8a5a2b', 1, 6, 14, 7); rect(ctx, '#6b4428', 1, 6, 14, 1); rect(ctx, '#6b4428', 1, 12, 14, 1);
        for (const [x, c] of [[3, '#ff6fa8'], [7, '#ffd23f'], [11, '#8fd3ff']]) { rect(ctx, '#3f9b47', x, 2, 1, 4); rect(ctx, c, x - 1, 1, 3, 2); }
        rect(ctx, '#3f9b47', 5, 4, 1, 2); rect(ctx, '#3f9b47', 9, 3, 1, 3);
      } else {
        ell(ctx, '#2a2a33', 5, 8, 5, 4.5); ell(ctx, '#33333e', 11, 9, 4.5, 4);
        rect(ctx, '#4a4a58', 3, 5, 2, 1); rect(ctx, '#4a4a58', 10, 6, 2, 1);
        rect(ctx, '#2a2a33', 5, 2, 1, 2); rect(ctx, '#2a2a33', 11, 3, 1, 2);
        rect(ctx, '#7a8a5a', 7, 0, 1, 1); rect(ctx, '#7a8a5a', 9, 1, 1, 1);
      }
    },
  },
  speaker: {
    w: 14, h: 26, place: 'ground', foot: 1,
    draw(ctx, freed) {
      rect(ctx, '#3a3a44', 6, 8, 2, 18); rect(ctx, '#2a2a33', 4, 24, 6, 2);
      if (freed) {
        rect(ctx, '#8a5a2b', 1, 4, 12, 1); rect(ctx, '#8a5a2b', 6, 0, 2, 4);
        const cs = ['#ff6fa8', '#ffd23f', '#8fd3ff', '#7bd36a'];
        [2, 5, 8, 11].forEach((x, i) => rect(ctx, cs[i], x, 6, 1, 4 + (i % 2) * 2));
      } else {
        rect(ctx, '#5a5a66', 3, 2, 8, 6); rect(ctx, '#3a3a44', 0, 0, 3, 10); rect(ctx, '#7a7a88', 3, 2, 8, 1);
        rect(ctx, '#ff3fb4', 12, 2, 1, 1); rect(ctx, '#ff3fb4', 13, 4, 1, 2); rect(ctx, '#ff3fb4', 12, 7, 1, 1);
      }
    },
  },
  eye: {
    w: 128, h: 48, place: 'roof', iris: true,
    draw(ctx, freed) {
      rect(ctx, '#1c1c24', 0, 0, 128, 48);
      rect(ctx, '#2a0a3a', 2, 2, 124, 44);
      dither(ctx, '#3a1250', 2, 2, 124, 44, 0);
      drawTextCentered(ctx, freed ? 'SEE YOU OUTSIDE' : 'THE FEED', 64, 4, freed ? '#ffe066' : '#ff3fb4', 1);
      if (freed) {
        rect(ctx, '#ff3fb4', 36, 29, 56, 2);
        for (let i = 0; i < 6; i++) rect(ctx, '#ff3fb4', 40 + i * 9, 31, 1, 3);
      } else {
        ell(ctx, '#ff3fb4', 64, 29, 31, 14);
        ell(ctx, '#f4efff', 64, 29, 28, 12);
        rect(ctx, '#d8c8f0', 36, 37, 56, 2);
      }
    },
  },
};

// Text pairs are part of the texture key so each sign gets its own texture.
export function propTextureKey(type, text, freed) {
  const t = text ? text.join('|').replace(/[^A-Za-z0-9]/g, '') : '';
  return `prop_${type}_${t}_${freed ? 'f' : 'l'}`;
}

export function buildPropTextures(scene, type, text, color) {
  const spec = PROP_TYPES[type];
  const w = spec.width ? spec.width(text) : spec.w;
  const h = spec.h;
  for (const freed of [false, true]) {
    const key = propTextureKey(type, text, freed);
    canvasTexture(scene, key, w, h, (ctx) => {
      spec.draw(ctx, freed, text, w, color);
      if (!freed) grayCanvas(ctx, w, h, true);
    });
  }
  if (spec.scroll) {
    spec.scroll.text.forEach((t, i) => {
      const key = `scroll_${type}_${i}`;
      canvasTexture(scene, key, textWidth(t), 5, (ctx) => drawText(ctx, t, 0, 0, spec.scroll.color[i]));
    });
  }
  if (spec.iris) {
    canvasTexture(scene, 'prop_eye_iris', 16, 16, (ctx) => {
      ell(ctx, '#6a2ab8', 8, 8, 8, 8); ell(ctx, '#9a5cff', 8, 8, 6, 6); ell(ctx, '#0a0410', 8, 8, 3, 3);
      rect(ctx, '#ffffff', 5, 4, 2, 2);
    });
  }
  return { w, h };
}
