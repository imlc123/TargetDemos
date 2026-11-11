import { FONT } from '../config.js';
import { Hero, cleanName, randomName } from '../systems/Hero.js';
import { Sfx } from '../systems/Sfx.js';
import { buildHero, heroKey, heroLook, HERO_SKINS, HERO_COLORS } from '../art/sprites.js';
import { buildPortrait, heroGenKey } from '../art/portraits.js';
import { makeButton } from '../ui/button.js';

const GENDERS = [['boy', 'BOY'], ['girl', 'GIRL'], ['nb', 'NONBINARY']];
const INPUT_CSS =
  'width: 300px; padding: 12px 14px; font: 16px "Press Start 2P", monospace; color: #ffffff; ' +
  'background: #1a1428; border: 4px solid #ff5fa2; outline: none; border-radius: 0; text-transform: none;';

// Name the hero and choose how they look.
export class CreateScene extends Phaser.Scene {
  constructor() {
    super('Create');
  }

  init(data) {
    this.next = data.next || 'game';
    this.level = data.level || 0;
    this.leaving = false;
  }

  create() {
    const W = this.scale.width;
    this.cameras.main.setBackgroundColor('#140f22');
    // let the text box receive every key (Phaser would otherwise swallow WASD and Space)
    this.input.keyboard.disableGlobalCapture();
    this.input.keyboard.clearCaptures();
    this.events.once('shutdown', () => this.input.keyboard.enableGlobalCapture());

    const existing = Hero.exists() ? Hero.get() : null;
    this.profile = existing ? { ...existing } : { name: randomName(), gender: 'nb', skin: 0, cap: 0 };

    this.add.text(W / 2, 40, this.next === 'game' ? 'WHO ARE YOU?' : 'EDIT YOUR HERO', { fontFamily: FONT, fontSize: '24px', color: '#ffe066' }).setOrigin(0.5);

    // preview
    const g = this.add.graphics();
    g.fillStyle(0x2a1f44).fillRect(40, 84, 360, 400);
    g.lineStyle(4, 0x8a5cff).strokeRect(40, 84, 360, 400);
    g.fillStyle(0x5a3a1a).fillRect(196, 110, 184, 184);
    g.fillStyle(0xe6d0a4).fillRect(202, 116, 172, 172);
    g.fillStyle(0x1f1832).fillRect(60, 400, 150, 10);
    this.portrait = this.add.image(288, 202, '__DEFAULT').setScale(2.6);
    this.sprite = this.add.image(126, 404, '__DEFAULT').setOrigin(0.5, 1).setScale(5);
    this.nameLabel = this.add.text(288, 330, '', { fontFamily: FONT, fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);
    this.pronounLabel = this.add.text(288, 362, '', { fontFamily: FONT, fontSize: '10px', color: '#cdbfff' }).setOrigin(0.5);
    let walk = 0;
    const views = ['down', 'side', 'up', 'side'];
    this.time.addEvent({ delay: 130, loop: true, callback: () => {
      walk = (walk + 1) % 32;
      const view = views[Math.floor(walk / 8)];
      this.sprite.setFlipX(Math.floor(walk / 8) === 3);
      this.sprite.setFrame(`${view}_walk${walk % 4}`);
    } });

    // name
    const lx = 440;
    this.add.text(lx, 96, 'NAME', { fontFamily: FONT, fontSize: '12px', color: '#cdbfff' });
    this.nameInput = this.add.dom(lx + 166, 140, 'input', INPUT_CSS);
    const node = this.nameInput.node;
    node.type = 'text';
    node.maxLength = 10;
    node.autocomplete = 'off';
    node.spellcheck = false;
    node.placeholder = 'your name';
    node.value = this.profile.name;
    node.setAttribute('aria-label', 'Hero name');
    node.addEventListener('input', () => {
      const clean = cleanName(node.value);
      if (node.value.replace(/\s+/g, ' ').slice(0, 10) !== node.value) node.value = node.value.slice(0, 10);
      this.profile.name = clean;
      this.refresh();
    });
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); node.blur(); this.start(); }
    });
    makeButton(this, lx + 400, 140, 'DICE', () => {
      node.value = randomName(node.value);
      this.profile.name = node.value;
      this.refresh();
    }, { w: 90, h: 52, size: 11, color: 0xffe066 });

    // gender
    this.add.text(lx, 196, 'I AM A', { fontFamily: FONT, fontSize: '12px', color: '#cdbfff' });
    this.genderButtons = GENDERS.map(([id, label], i) => {
      const w = id === 'nb' ? 170 : 120;
      const x = lx + [60, 194, 352][i];
      const b = makeButton(this, x, 236, label, () => { this.profile.gender = id; this.refresh(); }, { w, h: 44, size: 11, color: 0xff5fa2 });
      b.value = id;
      return b;
    });

    // skin
    this.add.text(lx, 290, 'SKIN', { fontFamily: FONT, fontSize: '12px', color: '#cdbfff' });
    this.skinSwatches = HERO_SKINS.map((c, i) => this.swatch(lx + 26 + i * 64, 330, [c], () => { this.profile.skin = i; this.refresh(); }));

    // colors
    this.add.text(lx, 370, 'CAP & HOODIE', { fontFamily: FONT, fontSize: '12px', color: '#cdbfff' });
    this.capSwatches = HERO_COLORS.map((c, i) => this.swatch(lx + 26 + i * 64, 410, [c.cap, c.hoodie], () => { this.profile.cap = i; this.refresh(); }));

    makeButton(this, lx + 236, 490, this.next === 'game' ? "LET'S GO" : 'SAVE', () => this.start(), { w: 260, h: 54, size: 16, color: 0x7bd36a });
    if (this.next !== 'game') makeButton(this, 120, 512, 'BACK', () => this.scene.start('Menu'), { w: 140, h: 40, size: 11, color: 0x8a5cff });

    this.refresh();
  }

  swatch(x, y, colors, onClick) {
    const c = this.add.container(x, y);
    const frame = this.add.rectangle(0, 0, 48, 48, 0x1a1428).setStrokeStyle(3, 0x5b4a8a);
    c.add(frame);
    if (colors.length === 1) c.add(this.add.rectangle(0, 0, 36, 36, Phaser.Display.Color.HexStringToColor(colors[0]).color));
    else {
      c.add(this.add.rectangle(0, -9, 36, 18, Phaser.Display.Color.HexStringToColor(colors[0]).color));
      c.add(this.add.rectangle(0, 9, 36, 18, Phaser.Display.Color.HexStringToColor(colors[1]).color));
    }
    c.frame = frame;
    c.setSize(48, 48).setInteractive({ useHandCursor: true });
    c.on('pointerup', () => { Sfx.play('click'); onClick(); });
    return c;
  }

  refresh() {
    const p = this.profile;
    const key = heroKey(p);
    buildHero(this, p);
    buildPortrait(this, `pt_${key}`, heroLook(p), 'hero', 7, heroGenKey(p));
    this.sprite.setTexture(`${key}_color`, this.sprite.frame?.name?.includes('_walk') ? this.sprite.frame.name : 'down_walk0');
    this.portrait.setTexture(`pt_${key}`, 'h');
    this.nameLabel.setText((p.name || '...').toUpperCase());
    const pro = { boy: 'HE / HIM', girl: 'SHE / HER', nb: 'THEY / THEM' }[p.gender];
    this.pronounLabel.setText(pro);
    this.genderButtons.forEach((b) => {
      const on = b.value === p.gender;
      b.bg.setFillStyle(on ? 0x5a2a6a : 0x2a1f44);
      b.bg.setStrokeStyle(on ? 5 : 3, on ? 0xffe066 : 0xff5fa2);
    });
    this.skinSwatches.forEach((s, i) => s.frame.setStrokeStyle(i === p.skin ? 5 : 3, i === p.skin ? 0xffe066 : 0x5b4a8a));
    this.capSwatches.forEach((s, i) => s.frame.setStrokeStyle(i === p.cap ? 5 : 3, i === p.cap ? 0xffe066 : 0x5b4a8a));
  }

  start() {
    if (this.leaving) return;
    this.leaving = true;
    Sfx.unlock();
    Sfx.play('freed');
    Hero.set({ ...this.profile, name: cleanName(this.nameInput.node.value) });
    if (this.next === 'game') this.scene.start('Game', { level: this.level });
    else this.scene.start('Menu');
  }
}
