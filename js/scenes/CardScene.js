import { FONT } from '../config.js';
import { Sfx } from '../systems/Sfx.js';
import { makeButton } from '../ui/button.js';

const ACCENTS = { intro: 0x3fe8ff, clear: 0x7bd36a, win: 0xffe066, fail: 0xff3fb4, pause: 0x8a5cff };

// Pop-up cards: level intros, pause, onboarded (fail), block freed, ending.
export class CardScene extends Phaser.Scene {
  constructor() {
    super('Card');
  }

  create(data) {
    const W = this.scale.width;
    const H = this.scale.height;
    this.done = false;
    this.ready = false;
    this.buttons = data.buttons || [{ label: 'OK', action: 'resume' }];
    const accent = ACCENTS[data.kind] ?? 0xffffff;
    const hex = '#' + accent.toString(16).padStart(6, '0');

    this.add.rectangle(0, 0, W, H, 0x07050d, 0.72).setOrigin(0).setInteractive();
    const panel = this.add.container(W / 2, H / 2);
    const box = this.add.rectangle(0, 0, 760, 440, 0x1a1428, 0.97).setStrokeStyle(4, accent);
    panel.add(box);

    let y = -190;
    if (data.subtitle) {
      panel.add(this.add.text(0, y, data.subtitle, { fontFamily: FONT, fontSize: '11px', color: '#ffffff' }).setOrigin(0.5).setAlpha(0.7));
      y += 26;
    }
    panel.add(this.add.text(0, y, data.title, { fontFamily: FONT, fontSize: '20px', color: hex, align: 'center' }).setOrigin(0.5, 0));
    y += 44;

    // illustration: before -> after
    const icon = this.iconRow(data.icon);
    if (icon) {
      icon.setPosition(0, y + 30);
      panel.add(icon);
      y += 76;
    }

    panel.add(
      this.add
        .text(0, y, data.body || '', {
          fontFamily: FONT, fontSize: '12px', color: '#e8e0ff', align: 'center',
          wordWrap: { width: 660 }, lineSpacing: 7,
        })
        .setOrigin(0.5, 0),
    );

    const n = this.buttons.length;
    const bw = n > 2 ? 200 : 240;
    this.buttons.forEach((b, i) => {
      const bx = (i - (n - 1) / 2) * (bw + 20);
      panel.add(makeButton(this, bx, 180, b.label, () => this.choose(b.action), { w: bw, h: 50, size: 13, color: i === 0 ? accent : 0x8a5cff }));
    });

    panel.setScale(0.9).setAlpha(0);
    this.tweens.add({ targets: panel, scale: 1, alpha: 1, duration: 220, ease: 'Back.Out' });
    this.time.delayedCall(350, () => (this.ready = true));

    const kb = this.input.keyboard;
    kb.on('keydown-ENTER', () => this.choose(this.buttons[0].action));
    kb.on('keydown-SPACE', () => this.choose(this.buttons[0].action));
    kb.on('keydown-ESC', () => {
      if (data.kind === 'pause') this.choose('resume');
      else if (n > 1) this.choose(this.buttons[n - 1].action);
    });
  }

  iconRow(icon) {
    if (!icon) return null;
    const c = this.add.container(0, 0);
    const add = (key, x, scale = 3) => c.add(this.add.image(x, 30, key).setOrigin(0.5, 1).setScale(scale));
    if (icon === 'fail') {
      add('kid_0', -60);
      c.add(this.add.text(0, 0, '>', { fontFamily: FONT, fontSize: '18px', color: '#ff3fb4' }).setOrigin(0.5));
      add('kid_gray_0', 60);
    } else if (icon === 'all') {
      ['bro', 'influencer', 'doom'].forEach((k, i) => add(`${k}_${i}_color_0`, -80 + i * 80));
    } else {
      add(`${icon}_0_gray_0`, -60);
      c.add(this.add.text(0, 0, '>', { fontFamily: FONT, fontSize: '18px', color: '#ffe066' }).setOrigin(0.5));
      add(`${icon}_0_color_0`, 60);
    }
    return c;
  }

  choose(action) {
    if (this.done || !this.ready) return;
    this.done = true;
    Sfx.unlock();
    Sfx.play('click');
    const game = this.scene.get('Game');
    this.scene.stop();
    game.handleCardAction(action);
  }
}
