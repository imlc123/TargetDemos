import { FONT } from '../config.js';
import { Sfx } from '../systems/Sfx.js';

// A simple tappable pixel button.
export function makeButton(scene, x, y, label, onClick, opts = {}) {
  const { w = 220, h = 50, size = 14, color = 0xff5fa2, enabled = true } = opts;
  const c = scene.add.container(x, y);
  const fill = enabled ? 0x2a1f44 : 0x1a1626;
  const bg = scene.add.rectangle(0, 0, w, h, fill).setStrokeStyle(3, enabled ? color : 0x3a3450);
  const t = scene.add
    .text(0, 0, label, { fontFamily: FONT, fontSize: `${size}px`, color: enabled ? '#ffffff' : '#5a5470', align: 'center' })
    .setOrigin(0.5);
  c.add([bg, t]);
  c.setSize(w, h);
  c.bg = bg;
  c.label = t;
  if (enabled) {
    c.setInteractive({ useHandCursor: true });
    c.on('pointerover', () => bg.setFillStyle(0x3d2c63));
    c.on('pointerout', () => { bg.setFillStyle(fill); c.setScale(1); });
    c.on('pointerdown', () => c.setScale(0.95));
    c.on('pointerup', () => {
      c.setScale(1);
      Sfx.play('click');
      onClick();
    });
  }
  return c;
}
