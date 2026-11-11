// Art for the intro cutscene. The bedroom is 240x135 pixels, shown at 4x.

import { canvasTexture, rect, drawRows, drawText, drawTextCentered, grayCanvas } from './pixels.js';
import { buildCharacter } from './sprites.js';

export const ROOM_W = 240;
export const ROOM_H = 135;
export const WINDOW = { x: 166, y: 18, w: 52, h: 54 };

const ell = (ctx, c, cx, cy, rx, ry) => {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
};

function drawRoom(ctx) {
  // wall with faint stripes
  rect(ctx, '#5a4a7a', 0, 0, ROOM_W, 104);
  for (let x = 0; x < ROOM_W; x += 12) rect(ctx, '#62528a', x, 0, 5, 102);
  rect(ctx, '#4a3c66', 0, 0, ROOM_W, 3);
  // floor
  rect(ctx, '#6b4a32', 0, 104, ROOM_W, 31);
  for (const y of [110, 117, 125]) rect(ctx, '#5a3a24', 0, y, ROOM_W, 1);
  for (let x = 8, i = 0; x < ROOM_W; x += 22, i++) rect(ctx, '#5a3a24', x + (i % 2) * 9, 104 + (i % 3) * 7, 1, 6);
  rect(ctx, '#3e2c1e', 0, 101, ROOM_W, 3);
  rect(ctx, '#8a6a4a', 0, 101, ROOM_W, 1);

  // window: night city outside
  const W = WINDOW;
  rect(ctx, '#140f26', W.x, W.y, W.w, W.h);
  rect(ctx, '#1e1636', W.x, W.y + 20, W.w, W.h - 20);
  ell(ctx, '#f4efd0', W.x + 40, W.y + 10, 4, 4);
  ell(ctx, '#140f26', W.x + 42, W.y + 9, 3, 3);
  const towers = [[0, 26, 10], [9, 18, 12], [20, 30, 9], [28, 14, 13], [40, 24, 12]];
  towers.forEach(([dx, top, w]) => {
    rect(ctx, '#2a2444', W.x + dx, W.y + top, w, W.h - top);
    for (let y = W.y + top + 3; y < W.y + W.h - 2; y += 4) {
      for (let x = W.x + dx + 2; x < W.x + dx + w - 1; x += 3) {
        if ((x * 7 + y * 3) % 5 < 2) rect(ctx, (x + y) % 3 ? '#7fe3ff' : '#ff3fb4', x, y, 1, 2);
      }
    }
  });
  rect(ctx, '#ff3fb4', W.x + 30, W.y + 16, 9, 5);
  drawText(ctx, 'BUY', W.x + 30, W.y + 16, '#ffffff');
  // frame + mullions + sill
  rect(ctx, '#e8dcc0', W.x - 3, W.y - 3, W.w + 6, 3);
  rect(ctx, '#e8dcc0', W.x - 3, W.y, 3, W.h);
  rect(ctx, '#e8dcc0', W.x + W.w, W.y, 3, W.h);
  rect(ctx, '#e8dcc0', W.x + W.w / 2 - 1, W.y, 2, W.h);
  rect(ctx, '#e8dcc0', W.x, W.y + W.h / 2 - 1, W.w, 2);
  rect(ctx, '#d8ccb0', W.x - 6, W.y + W.h, W.w + 12, 4);
  rect(ctx, '#a89c80', W.x - 6, W.y + W.h + 4, W.w + 12, 1);
  // dead plant on the sill
  rect(ctx, '#a0522d', W.x + 2, W.y + W.h - 6, 7, 6);
  rect(ctx, '#7a6a4a', W.x + 4, W.y + W.h - 11, 1, 5); rect(ctx, '#7a6a4a', W.x + 6, W.y + W.h - 10, 1, 4);
  rect(ctx, '#8a7a5a', W.x + 3, W.y + W.h - 12, 2, 1);
  // curtains
  for (const cx of [W.x - 12, W.x + W.w + 4]) {
    rect(ctx, '#8a3a4a', cx, W.y - 6, 9, W.h + 14);
    for (let x = cx + 2; x < cx + 9; x += 3) rect(ctx, '#6a2a3a', x, W.y - 6, 1, W.h + 14);
  }
  rect(ctx, '#5a4a3a', W.x - 14, W.y - 8, W.w + 28, 2);

  // posters
  rect(ctx, '#1c1c24', 38, 18, 26, 32); rect(ctx, '#2a2a33', 40, 20, 22, 28);
  drawTextCentered(ctx, 'RISE', 51, 24, '#ffd23f'); drawTextCentered(ctx, 'AND', 51, 31, '#ffd23f'); drawTextCentered(ctx, 'GRIND', 51, 38, '#ffd23f');
  rect(ctx, '#ffd23f', 42, 45, 18, 1);
  rect(ctx, '#ffffff', 70, 22, 22, 26); rect(ctx, '#ff7eb6', 72, 24, 18, 18);
  ell(ctx, '#f6d1b0', 81, 32, 5, 5); rect(ctx, '#f3d36b', 76, 26, 10, 4);
  drawTextCentered(ctx, '#ME', 81, 42, '#ffffff');
  rect(ctx, '#d81e3a', 100, 16, 20, 24); drawTextCentered(ctx, 'NEWS', 110, 19, '#ffffff');
  rect(ctx, '#14141c', 102, 25, 16, 12);
  rect(ctx, '#ff3b5c', 103, 27, 2, 1); rect(ctx, '#ff3b5c', 105, 29, 3, 1); rect(ctx, '#ff3b5c', 108, 31, 3, 1); rect(ctx, '#ff3b5c', 111, 34, 5, 1);
  // shelf with books and a trophy
  rect(ctx, '#7a5a3a', 126, 52, 32, 2); rect(ctx, '#5a3a24', 126, 54, 32, 1);
  const books = ['#3f7fe8', '#e8433f', '#3fbf6a', '#ffd23f', '#9a5cff'];
  books.forEach((c, i) => rect(ctx, c, 128 + i * 3, 43 + (i % 2), 2, 9 - (i % 2)));
  rect(ctx, '#ffd23f', 148, 46, 5, 4); rect(ctx, '#ffd23f', 150, 50, 1, 2); rect(ctx, '#c8a020', 148, 51, 5, 1);

  // bed
  rect(ctx, '#7a4a2a', 14, 60, 8, 44); rect(ctx, '#9a6a3a', 14, 60, 8, 2); rect(ctx, '#5a3a1a', 20, 62, 2, 42);
  rect(ctx, '#7a4a2a', 120, 74, 6, 30); rect(ctx, '#9a6a3a', 120, 74, 6, 2);
  rect(ctx, '#5a3a1a', 22, 92, 98, 4);
  rect(ctx, '#e8e8f0', 22, 82, 98, 10);
  rect(ctx, '#c8c8d8', 22, 90, 98, 2);
  rect(ctx, '#5a3a1a', 24, 96, 3, 8); rect(ctx, '#5a3a1a', 114, 96, 3, 8);
  // pillow
  rect(ctx, '#f4f4f8', 22, 72, 22, 11); rect(ctx, '#d8d8e8', 22, 81, 22, 2); rect(ctx, '#ffffff', 24, 73, 8, 2);
  // blanket
  rect(ctx, '#3a6ac8', 36, 74, 84, 20);
  rect(ctx, '#2a4a98', 36, 90, 84, 4);
  rect(ctx, '#5a8ae8', 36, 74, 84, 2);
  for (let x = 42; x < 118; x += 10) { rect(ctx, '#ffd23f', x, 79 + (x % 3), 1, 1); rect(ctx, '#ffffff', x + 5, 85 - (x % 2), 1, 1); }
  rect(ctx, '#2a4a98', 36, 74, 2, 20);

  // nightstand, alarm clock, lamp
  rect(ctx, '#7a5a3a', 128, 84, 20, 20); rect(ctx, '#9a7a5a', 128, 84, 20, 2); rect(ctx, '#5a3a24', 130, 92, 16, 1);
  rect(ctx, '#d8c8a0', 137, 94, 2, 1);
  rect(ctx, '#1c1c24', 130, 76, 17, 8);
  drawText(ctx, '3:47', 131, 77, '#ff3b4e');
  rect(ctx, '#3a3a44', 144, 70, 1, 6); ell(ctx, '#e8d8a8', 144, 68, 4, 3);

  // laundry and sneakers on the floor
  ell(ctx, '#3f7fe8', 158, 113, 9, 4); ell(ctx, '#e8433f', 164, 111, 6, 3); ell(ctx, '#3fbf6a', 152, 112, 5, 3);
  rect(ctx, '#f4f4f4', 186, 113, 7, 3); rect(ctx, '#e8433f', 186, 112, 4, 1); rect(ctx, '#c0c0c8', 186, 116, 7, 1);
  rect(ctx, '#f4f4f4', 195, 114, 7, 3); rect(ctx, '#e8433f', 195, 113, 4, 1); rect(ctx, '#c0c0c8', 195, 117, 7, 1);
}

// The hero lying in bed, seen from the side: head on the pillow, hood up,
// both arms raised holding the phone above their face.
const LYING = [
  '....................sSSSs.........',
  '...................SSSSSSS........',
  '....................sSSSs.........',
  '.....................QQq..........',
  '....................QQq...........',
  '...................QQq............',
  '..................QQq.............',
  '......hhhhhh.....QQq..............',
  '....hhHHHHHHh...QQq...............',
  '...hHHHHHHHHHh.QQq................',
  '..hHHHHSSSSSHHQQq.................',
  '..hHHHSSSSSSSSHq..................',
  '.hHHHSSSSWESSSSq..................',
  '.hHHHSSSSEESSSSS..................',
  '.hHHHSSSSSSSSSSSS.................',
  '.hHHHsSSSSSSSSSS..................',
  '.hHHHHsSSSMMSSs...................',
  '..hHHHHsSSSSSs....................',
  '..hhHHHHHHHHHHHHHHHHHHHHHHHHH.....',
  '...hhhhhhhhhhhhhhhhhhhhhhhhhhh....',
];

export function buildIntroTextures(scene) {
  canvasTexture(scene, 'intro_room_color', ROOM_W, ROOM_H, (ctx) => drawRoom(ctx));
  canvasTexture(scene, 'intro_room_gray', ROOM_W, ROOM_H, (ctx) => { drawRoom(ctx); grayCanvas(ctx, ROOM_W, ROOM_H, true); });

  const pal = { H: '#8a8aa0', h: '#6a6a80', S: '#d8c0a8', s: '#b8a088', E: '#2a1d1a', M: '#9b4a3a', Q: '#8a8aa0', q: '#6a6a80' };
  const grayPal = { ...pal, S: '#a8a8b8', s: '#8a8a9a', E: '#8fe9ff', M: '#6a6a7a' };
  const withOutline = (rows) => {
    // outline in a dark violet, like the game sprites
    const H = rows.length;
    const Wd = rows[0].length;
    const out = rows.map((r) => r.split(''));
    for (let y = 0; y < H; y++) for (let x = 0; x < Wd; x++) {
      if (rows[y][x] !== '.') continue;
      if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => rows[y + dy]?.[x + dx] && rows[y + dy][x + dx] !== '.')) out[y][x] = 'O';
    }
    return out.map((r) => r.join(''));
  };
  const outlinePal = { O: '#1e1a2e' };
  canvasTexture(scene, 'intro_lying', 34, 20, (ctx) => drawRows(ctx, withOutline(LYING), { ...grayPal, ...outlinePal }));
  const startled = LYING.map((r, i) => (i < 10 ? r.slice(0, 14).replace(/[SsQq]/g, '.') + r.slice(14).replace(/[SsQq]/g, '.') : r))
    .map((r, i) => (i === 12 ? r.replace('WE', 'WW') : i === 13 ? r.replace('EE', 'EE') : r));
  canvasTexture(scene, 'intro_lying_startled', 34, 20, (ctx) => drawRows(ctx, withOutline(startled), { ...grayPal, ...outlinePal, W: '#ffffff' }));

  // neutral hooded hero: gray "holding a phone", color "empty hands", and color "with slingshot"
  const base = { skin: '#d8b090', hair: '#3a2a1a', hairStyle: 'short', hat: 'hood', hatColor: '#ffd23f', top: '#ffd23f', bottom: '#5b6d8a', bottomLayer: 'joggers', shoes: '#f4f4f4' };
  buildCharacter(scene, 'intro_hero_a', { ...base, kind: 'doom' });
  buildCharacter(scene, 'intro_hero_b', { ...base, kind: 'hero' });

  canvasTexture(scene, 'intro_phone', 5, 8, (ctx) => {
    rect(ctx, '#1c1c24', 0, 0, 5, 8); rect(ctx, '#7fe3ff', 1, 1, 3, 5); rect(ctx, '#ffffff', 1, 1, 1, 1);
  });
  canvasTexture(scene, 'intro_phone_cracked', 5, 8, (ctx) => {
    rect(ctx, '#1c1c24', 0, 0, 5, 8); rect(ctx, '#0a0a10', 1, 1, 3, 5);
    rect(ctx, '#8a8aa0', 1, 2, 1, 1); rect(ctx, '#8a8aa0', 2, 3, 1, 1); rect(ctx, '#8a8aa0', 3, 4, 1, 1); rect(ctx, '#8a8aa0', 2, 5, 1, 1);
  });
  canvasTexture(scene, 'intro_sling', 11, 13, (ctx) => {
    drawRows(ctx, [
      'Z.......Z..',
      'Z.......Z..',
      'Zw.....wZ..',
      '.Zw...wZ...',
      '..ZwwwZ....',
      '...ZZZ.PPP.',
      '....Z..PPPP',
      '....Z..PPP.',
      '....Z......',
      '...ZZZ.....',
      '...ZZZ.....',
      '....Z......',
      '...........',
    ], { Z: '#8a5a2b', w: '#e8dcc8', P: '#f4efe0' });
  });
  canvasTexture(scene, 'intro_glass', ROOM_W, ROOM_H, (ctx) => {
    const W = WINDOW;
    // a jagged hole in the right-hand panes
    const hole = [[W.x + 30, W.y + 8], [W.x + 44, W.y + 4], [W.x + 50, W.y + 20], [W.x + 46, W.y + 36], [W.x + 32, W.y + 42], [W.x + 26, W.y + 26]];
    ctx.strokeStyle = '#e8f6ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    hole.forEach(([x, y], i) => (i ? ctx.lineTo(x + 0.5, y + 0.5) : ctx.moveTo(x + 0.5, y + 0.5)));
    ctx.closePath();
    ctx.stroke();
    hole.forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(x + 0.5, y + 0.5); ctx.lineTo(x + (x - (W.x + 38)) * 0.5 + 0.5, y + (y - (W.y + 24)) * 0.5 + 0.5); ctx.stroke(); });
    rect(ctx, '#ffffff', W.x + 33, W.y + 12, 1, 1);
  });
  canvasTexture(scene, 'intro_note_floor', 8, 6, (ctx) => {
    drawRows(ctx, ['.PPPPP..', 'PPpPPPP.', 'PPPPpPPP', '.PPPPPPP', '..PPpPP.', '...PP...'], { P: '#f4efe0', p: '#c8c0b0' });
  });
}
