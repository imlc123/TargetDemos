import { FONT, DEBUG } from '../config.js';
import { LEVELS } from '../data/levels.js';
import { Save } from '../systems/Save.js';
import { Sfx } from '../systems/Sfx.js';
import { Hero } from '../systems/Hero.js';
import { buildHero, heroKey } from '../art/sprites.js';
import { makeButton } from '../ui/button.js';

const CROWD = ['chad', 'brooke', 'doug', 'marcus', 'jade', 'ray'];

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.cameras.main.setBackgroundColor('#0d0b16');
    this.leaving = false; // the scene object is reused, so reset this every time the menu opens
    this.input.keyboard.enableGlobalCapture();
    this.drawCity(W, H);

    // a lineup of locked people; one by one they get freed
    this.crowd = [];
    const xs = [96, 196, 296, 664, 764, 864];
    CROWD.forEach((id, i) => {
      const spr = this.add.image(xs[i], 444, `ch_${id}_gray`, 'down_idle0').setOrigin(0.5, 1).setScale(3);
      const glow = this.add.image(xs[i] + 8, 396, 'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0x7fd1ff).setAlpha(0.5).setScale(1.8);
      this.time.addEvent({ delay: 450 + i * 40, loop: true, callback: () => spr.setFrame(spr.frame.name === 'down_idle0' ? 'down_idle1' : 'down_idle0') });
      this.crowd.push({ spr, glow, id, freed: false });
    });
    const profile = Hero.get();
    buildHero(this, profile);
    this.hero = this.add.image(W / 2, 444, `${heroKey(profile)}_color`, 'down_idle0').setOrigin(0.5, 1).setScale(3);
    this.time.addEvent({ delay: 500, loop: true, callback: () => this.hero.setFrame(this.hero.frame.name === 'down_idle0' ? 'down_idle1' : 'down_idle0') });
    this.hearts = this.add.particles(0, 0, 'heart', {
      speed: { min: 20, max: 60 }, angle: { min: 240, max: 300 }, lifespan: 1000,
      scale: { start: 2, end: 0 }, emitting: false,
    });
    this.time.addEvent({ delay: 1800, loop: true, callback: () => this.freeOne() });

    // title
    this.add.text(W / 2 + 4, 82, 'TARGET DEMOS', { fontFamily: FONT, fontSize: '46px', color: '#3fe8ff' }).setOrigin(0.5).setAlpha(0.6);
    this.add.text(W / 2, 78, 'TARGET DEMOS', { fontFamily: FONT, fontSize: '46px', color: '#ff5fa2' }).setOrigin(0.5);
    this.add
      .text(W / 2, 134, 'break the loop. smash the phones. touch grass.', { fontFamily: FONT, fontSize: '12px', color: '#cdbfff' })
      .setOrigin(0.5);

    const save = Save.load();
    if (DEBUG) save.unlocked = LEVELS.length;
    const next = this.nextLevel(save);
    const hasHero = Hero.exists();
    const label = !hasHero ? 'PLAY' : save.cleared.some(Boolean) ? 'CONTINUE' : 'PLAY';
    this.mainButtons = [
      makeButton(this, W / 2, 200, label, () => this.play(next), { w: 280, h: 54, size: 18 }),
      makeButton(this, W / 2 - 190, 266, 'LEVELS', () => this.showLevels(true), { w: 170, h: 44, size: 11, color: 0x3fe8ff }),
      makeButton(this, W / 2, 266, 'WATCH INTRO', () => this.go('Intro', { next: 'menu' }), { w: 190, h: 44, size: 11, color: 0xffe066 }),
      makeButton(this, W / 2 + 190, 266, hasHero ? 'EDIT HERO' : 'CREATE HERO', () => this.go('Create', { next: 'menu' }), { w: 170, h: 44, size: 11, color: 0x7bd36a }),
    ];
    if (hasHero) {
      this.add.text(W / 2, 470, profile.name.toUpperCase(), { fontFamily: FONT, fontSize: '11px', color: '#ffffff', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5);
    }

    this.muteBtn = makeButton(this, W - 90, 30, this.muteLabel(), () => this.toggleMute(), { w: 150, h: 38, size: 10, color: 0x8a5cff });

    const touch = this.sys.game.device.input.touch;
    this.add
      .text(
        W / 2, H - 20,
        touch ? 'Turn your phone sideways. Drag left side to move, tap right side to act.' : 'WASD / Arrows: move     Space / J: shoot, deflect, talk     Esc: pause     M: mute',
        { fontFamily: FONT, fontSize: '10px', color: '#ffffff' },
      )
      .setOrigin(0.5)
      .setAlpha(0.75);

    this.buildLevelPanel(W, H, save);

    const kb = this.input.keyboard;
    kb.on('keydown-ENTER', () => (this.levelPanel.visible ? null : this.play(next)));
    kb.on('keydown-SPACE', () => (this.levelPanel.visible ? null : this.play(next)));
    kb.on('keydown-ESC', () => this.showLevels(false));
    kb.on('keydown-M', () => this.toggleMute());
    for (let i = 0; i < LEVELS.length; i++) {
      kb.on(`keydown-${['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX'][i]}`, () => {
        if (i < Save.load().unlocked || DEBUG) this.startLevel(i);
      });
    }
  }

  nextLevel(save) {
    for (let i = 0; i < LEVELS.length; i++) if (!save.cleared[i] && i < save.unlocked) return i;
    return 0;
  }

  // First PLAY: intro (unless already seen), then hero creation, then the level.
  play(level) {
    if (!Hero.exists() && !Save.load().seenIntro) this.go('Intro', { next: 'create' });
    else this.startLevel(level);
  }

  go(scene, data) {
    if (this.leaving) return;
    this.leaving = true;
    Sfx.unlock();
    Sfx.play('click');
    this.scene.start(scene, data);
  }

  drawCity(W, H) {
    if (this.textures.exists('gen:ui/title_city')) {
      this.add.image(0, 0, 'gen:ui/title_city').setOrigin(0).setDisplaySize(W, H);
      // darken the sky behind the title and the street behind the buttons' hints
      const shade = this.add.graphics();
      shade.fillGradientStyle(0x0d0b16, 0x0d0b16, 0x0d0b16, 0x0d0b16, 0.85, 0.85, 0, 0).fillRect(0, 0, W, 300);
      shade.fillStyle(0x0d0b16, 0.55).fillRect(0, H - 40, W, 40);
      return;
    }
    const g = this.add.graphics();
    const bands = [0x0d0b16, 0x120d22, 0x18102c, 0x1f1236];
    bands.forEach((c, i) => g.fillStyle(c).fillRect(0, i * 60, W, 60));
    g.fillStyle(0x1f1236).fillRect(0, 240, W, 200);
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
    g.fillStyle(0x1c1c24).fillRect(W / 2 - 150, 312, 300, 52);
    g.fillStyle(0xff3fb4).fillRect(W / 2 - 144, 317, 288, 42);
    this.add.text(W / 2, 338, 'YOU ARE WHAT YOU SCROLL', { fontFamily: FONT, fontSize: '11px', color: '#ffffff' }).setOrigin(0.5);
    g.fillStyle(0x6e6c74).fillRect(0, 410, W, 38);
    g.fillStyle(0x56545c).fillRect(0, 444, W, 4);
    g.fillStyle(0x2c2f38).fillRect(0, 448, W, H - 448);
    for (let sx = 20; sx < W; sx += 80) g.fillStyle(0x8a8676).fillRect(sx, 494, 40, 4);
  }

  freeOne() {
    const locked = this.crowd.filter((c) => !c.freed);
    if (!locked.length) {
      this.time.delayedCall(1200, () => {
        this.crowd.forEach((c) => {
          c.freed = false;
          c.spr.setTexture(`ch_${c.id}_gray`, 'down_idle0');
          c.glow.setVisible(true);
        });
      });
      return;
    }
    const c = Phaser.Utils.Array.GetRandom(locked);
    c.freed = true;
    c.spr.setTexture(`ch_${c.id}_color`, 'cheer');
    this.time.delayedCall(700, () => c.freed && c.spr.setFrame('down_idle0'));
    c.glow.setVisible(false);
    this.hearts.explode(4, c.spr.x, c.spr.y - 90);
  }

  buildLevelPanel(W, H, save) {
    const panel = this.add.container(0, 0).setVisible(false).setDepth(10);
    const shade = this.add.rectangle(0, 0, W, H, 0x07050d, 0.85).setOrigin(0).setInteractive();
    const box = this.add.rectangle(W / 2, H / 2, 720, 460, 0x1a1428).setStrokeStyle(4, 0x3fe8ff);
    const title = this.add.text(W / 2, H / 2 - 190, 'CHOOSE A BLOCK', { fontFamily: FONT, fontSize: '20px', color: '#3fe8ff' }).setOrigin(0.5);
    panel.add([shade, box, title]);
    LEVELS.forEach((lv, i) => {
      const unlocked = DEBUG || i < save.unlocked;
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx = W / 2 - 170 + col * 340;
      const by = H / 2 - 112 + row * 86;
      const tick = save.cleared[i] ? '  *' : '';
      const label = unlocked ? `${i + 1}. ${lv.name.toUpperCase()}${tick}` : `${i + 1}. LOCKED`;
      panel.add(makeButton(this, bx, by, label, () => this.startLevel(i), { w: 310, h: 64, size: 11, enabled: unlocked }));
    });
    panel.add(makeButton(this, W / 2, H / 2 + 180, 'BACK', () => this.showLevels(false), { w: 180, h: 44, size: 12, color: 0x8a5cff }));
    this.levelPanel = panel;
  }

  showLevels(v) {
    this.levelPanel.setVisible(v);
    this.mainButtons.forEach((b) => b.input && (v ? b.disableInteractive() : b.setInteractive()));
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

  // Without a hero yet, make one first and then start the level.
  startLevel(i) {
    if (!Hero.exists()) this.go('Create', { next: 'game', level: i });
    else this.go('Game', { level: i });
  }
}
