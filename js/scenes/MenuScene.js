import { FONT, DEBUG } from '../config.js';
import { LEVELS } from '../data/levels.js';
import { Save } from '../systems/Save.js';
import { Sfx } from '../systems/Sfx.js';
import { makeButton } from '../ui/button.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.cameras.main.setBackgroundColor('#0d0b16');
    this.drawCity(W, H);

    // a lineup of locked people; one by one they get freed
    this.crowd = [];
    const kinds = ['bro', 'influencer', 'doom', 'bro', 'influencer', 'doom'];
    const xs = [110, 210, 310, 650, 750, 850];
    kinds.forEach((kind, i) => {
      const look = i % 6;
      const spr = this.add.image(xs[i], 436, `${kind}_${look}_gray_0`).setOrigin(0.5, 1).setScale(3);
      const glow = this.add.image(xs[i] + 14, 395, 'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0x7fd1ff).setAlpha(0.6).setScale(1.6);
      this.tweens.add({ targets: spr, y: 433, duration: 900 + i * 70, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      this.crowd.push({ spr, glow, kind, look, freed: false });
    });
    this.add.image(W / 2, 436, 'kid_0').setOrigin(0.5, 1).setScale(3);
    this.hearts = this.add.particles(0, 0, 'heart', {
      speed: { min: 20, max: 60 }, angle: { min: 240, max: 300 }, lifespan: 1000,
      scale: { start: 2, end: 0 }, emitting: false,
    });
    this.time.addEvent({ delay: 1800, loop: true, callback: () => this.freeOne() });

    // title
    this.add.text(W / 2 + 4, 92, 'TARGET DEMOS', { fontFamily: FONT, fontSize: '46px', color: '#3fe8ff' }).setOrigin(0.5).setAlpha(0.6);
    this.add.text(W / 2, 88, 'TARGET DEMOS', { fontFamily: FONT, fontSize: '46px', color: '#ff5fa2' }).setOrigin(0.5);
    this.add
      .text(W / 2, 146, 'break the loop. smash the phones. touch grass.', { fontFamily: FONT, fontSize: '12px', color: '#cdbfff' })
      .setOrigin(0.5);

    const save = Save.load();
    if (DEBUG) save.unlocked = 4;
    const next = this.nextLevel(save);
    const label = save.cleared.some(Boolean) ? 'CONTINUE' : 'PLAY';
    this.mainButtons = [
      makeButton(this, W / 2, 222, label, () => this.startLevel(next), { w: 260, h: 54, size: 18 }),
      makeButton(this, W / 2, 288, 'LEVELS', () => this.showLevels(true), { w: 260, h: 46, size: 14, color: 0x3fe8ff }),
    ];

    this.muteBtn = makeButton(this, W - 90, 36, this.muteLabel(), () => this.toggleMute(), { w: 150, h: 40, size: 10, color: 0x8a5cff });

    const touch = this.sys.game.device.input.touch;
    this.add
      .text(
        W / 2, H - 22,
        touch ? 'Turn your phone sideways. Drag left side to move, tap right side to shoot.' : 'WASD / Arrows: move     Space / J: shoot or deflect     Esc: pause     M: mute',
        { fontFamily: FONT, fontSize: '10px', color: '#ffffff' },
      )
      .setOrigin(0.5)
      .setAlpha(0.75);

    this.buildLevelPanel(W, H, save);

    const kb = this.input.keyboard;
    kb.on('keydown-ENTER', () => (this.levelPanel.visible ? null : this.startLevel(next)));
    kb.on('keydown-SPACE', () => (this.levelPanel.visible ? null : this.startLevel(next)));
    kb.on('keydown-ESC', () => this.showLevels(false));
    kb.on('keydown-M', () => this.toggleMute());
    for (let i = 0; i < 4; i++) {
      kb.on(`keydown-${['ONE', 'TWO', 'THREE', 'FOUR'][i]}`, () => {
        if (i < Save.load().unlocked || DEBUG) this.startLevel(i);
      });
    }
  }

  nextLevel(save) {
    for (let i = 0; i < 4; i++) if (!save.cleared[i] && i < save.unlocked) return i;
    return 0;
  }

  drawCity(W, H) {
    const g = this.add.graphics();
    // sky bands
    const bands = [0x0d0b16, 0x120d22, 0x18102c, 0x1f1236];
    bands.forEach((c, i) => g.fillStyle(c).fillRect(0, i * 60, W, 60));
    g.fillStyle(0x1f1236).fillRect(0, 240, W, 200);
    // skyline
    const rnd = new Phaser.Math.RandomDataGenerator(['targetdemos']);
    let x = -10;
    while (x < W) {
      const w = rnd.between(50, 110);
      const h = rnd.between(120, 260);
      const top = 410 - h;
      g.fillStyle(rnd.pick([0x2a2140, 0x30264a, 0x251c38])).fillRect(x, top, w, h);
      for (let wy = top + 12; wy < 395; wy += 18) {
        for (let wx = x + 8; wx < x + w - 10; wx += 14) {
          const lit = rnd.frac() < 0.35;
          g.fillStyle(lit ? 0x7fe3ff : 0x1a1428, lit ? 0.85 : 1).fillRect(wx, wy, 6, 9);
        }
      }
      x += w + rnd.between(4, 16);
    }
    // billboard
    g.fillStyle(0x1c1c24).fillRect(W / 2 - 150, 300, 300, 60);
    g.fillStyle(0xff3fb4).fillRect(W / 2 - 144, 305, 288, 50);
    this.add.text(W / 2, 330, 'YOU ARE WHAT YOU SCROLL', { fontFamily: FONT, fontSize: '11px', color: '#ffffff' }).setOrigin(0.5);
    // street
    g.fillStyle(0x6e6c74).fillRect(0, 410, W, 34);
    g.fillStyle(0x56545c).fillRect(0, 440, W, 4);
    g.fillStyle(0x2c2f38).fillRect(0, 444, W, H - 444);
    for (let sx = 20; sx < W; sx += 80) g.fillStyle(0x8a8676).fillRect(sx, 488, 40, 4);
  }

  freeOne() {
    const locked = this.crowd.filter((c) => !c.freed);
    if (!locked.length) {
      this.time.delayedCall(1200, () => {
        this.crowd.forEach((c) => {
          c.freed = false;
          c.spr.setTexture(`${c.kind}_${c.look}_gray_0`);
          c.glow.setVisible(true);
        });
      });
      return;
    }
    const c = Phaser.Utils.Array.GetRandom(locked);
    c.freed = true;
    c.spr.setTexture(`${c.kind}_${c.look}_color_0`);
    c.glow.setVisible(false);
    this.hearts.explode(4, c.spr.x, c.spr.y - 60);
  }

  buildLevelPanel(W, H, save) {
    const panel = this.add.container(0, 0).setVisible(false).setDepth(10);
    const shade = this.add.rectangle(0, 0, W, H, 0x07050d, 0.85).setOrigin(0).setInteractive();
    const box = this.add.rectangle(W / 2, H / 2, 720, 400, 0x1a1428).setStrokeStyle(4, 0x3fe8ff);
    const title = this.add.text(W / 2, H / 2 - 160, 'CHOOSE A BLOCK', { fontFamily: FONT, fontSize: '20px', color: '#3fe8ff' }).setOrigin(0.5);
    panel.add([shade, box, title]);
    LEVELS.forEach((lv, i) => {
      const unlocked = DEBUG || i < save.unlocked;
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx = W / 2 - 170 + col * 340;
      const by = H / 2 - 70 + row * 100;
      const tick = save.cleared[i] ? '  *' : '';
      const label = unlocked ? `${i + 1}. ${lv.name.toUpperCase()}${tick}` : `${i + 1}. LOCKED`;
      panel.add(makeButton(this, bx, by, label, () => this.startLevel(i), { w: 310, h: 70, size: 11, enabled: unlocked }));
    });
    panel.add(makeButton(this, W / 2, H / 2 + 150, 'BACK', () => this.showLevels(false), { w: 180, h: 44, size: 12, color: 0x8a5cff }));
    this.levelPanel = panel;
  }

  showLevels(v) {
    this.levelPanel.setVisible(v);
    this.mainButtons.forEach((b) => (v ? b.disableInteractive() : b.setInteractive()));
  }

  muteLabel() {
    return Sfx.muted ? 'SOUND: OFF' : 'SOUND: ON';
  }

  toggleMute() {
    const m = !Sfx.muted;
    Sfx.setMuted(m);
    Save.setMuted(m);
    this.muteBtn.label.setText(this.muteLabel());
  }

  startLevel(i) {
    Sfx.unlock();
    Sfx.play('click');
    this.scene.start('Game', { level: i });
  }
}
