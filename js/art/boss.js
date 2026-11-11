// Art for the final boss, THE ENDLESS SCROLL: a black-pilled doom-scroller
// shown at 2x, plus their shield, attacks and phone cracks.

import { canvasTexture, rect } from './pixels.js';
import { buildCharacter } from './sprites.js';

export const BOSS_LOOK = {
  kind: 'boss', skin: '#d8b49a', hair: '#1a1418', hairStyle: 'messy', hat: 'hood', hatColor: '#2a2632',
  top: '#2a2632', bottom: '#24242c', shoes: '#18181e', glowEyes: '#ff3b6b', extras: ['eyebags', 'headphones'],
};

export function buildBossTextures(scene) {
  buildCharacter(scene, 'ch_boss', BOSS_LOOK);

  // shield: a dark bubble with a bright rim
  canvasTexture(scene, 'boss_shield', 96, 96, (ctx) => {
    const g = ctx.createRadialGradient(48, 48, 10, 48, 48, 47);
    g.addColorStop(0, 'rgba(40,0,60,0.05)');
    g.addColorStop(0.75, 'rgba(90,20,140,0.25)');
    g.addColorStop(0.92, 'rgba(255,63,180,0.65)');
    g.addColorStop(1, 'rgba(255,63,180,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 96, 96);
  });
  scene.textures.get('boss_shield').setFilter(Phaser.Textures.FilterMode.LINEAR);

  // phase 1 attack: green candles bursting from the ground (a stock chart, but painful)
  canvasTexture(scene, 'candle', 10, 34, (ctx) => {
    rect(ctx, '#1f8a4a', 4, 0, 2, 34);
    rect(ctx, '#2bd46a', 1, 6, 8, 24);
    rect(ctx, '#7dffaa', 1, 6, 2, 24);
    rect(ctx, '#1f8a4a', 7, 6, 2, 24);
    rect(ctx, '#d8ffe4', 2, 7, 1, 6);
  });
  canvasTexture(scene, 'candle_mark', 16, 8, (ctx) => {
    ctx.strokeStyle = '#3dff8a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(8, 4, 7, 3, 0, 0, Math.PI * 2);
    ctx.stroke();
    rect(ctx, '#3dff8a', 7, 3, 2, 2);
  });

  // the giant phone and its cracks (0-3)
  for (let c = 0; c <= 3; c++) {
    canvasTexture(scene, `boss_phone_${c}`, 9, 14, (ctx) => {
      rect(ctx, '#121218', 0, 0, 9, 14);
      rect(ctx, '#ff3fb4', 1, 1, 7, 11);
      rect(ctx, '#ff9fd8', 1, 1, 7, 2);
      rect(ctx, '#ffffff', 2, 4, 5, 1); rect(ctx, '#ffffff', 2, 6, 3, 1); rect(ctx, '#ffffff', 2, 8, 4, 1);
      rect(ctx, '#3a3a48', 3, 12, 3, 1);
      const W = '#f4f4ff';
      if (c >= 1) [[6, 1], [5, 2], [5, 3], [4, 4], [4, 5]].forEach(([x, y]) => rect(ctx, W, x, y, 1, 1));
      if (c >= 2) [[1, 7], [2, 8], [3, 8], [4, 9], [5, 10], [6, 11]].forEach(([x, y]) => rect(ctx, W, x, y, 1, 1));
      if (c >= 3) [[7, 5], [6, 6], [6, 7], [7, 8], [2, 2], [3, 3]].forEach(([x, y]) => rect(ctx, W, x, y, 1, 1));
    });
  }
}
