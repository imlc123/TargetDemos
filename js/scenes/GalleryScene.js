import { FONT } from '../config.js';
import { CHARACTERS } from '../data/characters.js';
import { FRAMES, buildHero, heroKey, HERO_GENDERS } from '../art/sprites.js';
import { buildPortrait } from '../art/portraits.js';
import { heroLook } from '../art/sprites.js';
import { PROP_TYPES, buildPropTextures, propTextureKey } from '../art/props.js';
import { TILE_COUNT } from '../art/tiles.js';

// Debug art review: ?debug=1&gallery=1. Keys 1-4 switch pages.
export class GalleryScene extends Phaser.Scene {
  constructor() {
    super('Gallery');
  }

  create() {
    this.cameras.main.setBackgroundColor('#2a2438');
    this.page = this.add.container(0, 0);
    const kb = this.input.keyboard;
    ['ONE', 'TWO', 'THREE', 'FOUR'].forEach((k, i) => kb.on(`keydown-${k}`, () => this.show(i)));
    this.show(0);
    window.__gallery = this;
  }

  label(x, y, t) {
    this.page.add(this.add.text(x, y, t, { fontFamily: FONT, fontSize: '8px', color: '#ffffff' }));
  }

  show(i) {
    this.page.removeAll(true);
    this.label(10, 6, `GALLERY PAGE ${i + 1}  (keys 1-4: sprites, portraits, props, tiles)`);
    if (i === 0) this.sprites();
    if (i === 1) this.portraits();
    if (i === 2) this.props();
    if (i === 3) this.tiles();
  }

  sprites() {
    const ids = Object.keys(CHARACTERS);
    ids.forEach((id, n) => {
      const x = 10 + (n % 2) * 470;
      const y = 24 + Math.floor(n / 2) * 72;
      this.label(x, y, CHARACTERS[id].name);
      FRAMES.forEach((f, j) => {
        this.page.add(this.add.image(x + j * 28, y + 10, `ch_${id}_color`, f).setOrigin(0).setScale(1));
        this.page.add(this.add.image(x + 240 + j * 28, y + 10, `ch_${id}_gray`, f).setOrigin(0).setScale(1));
      });
      this.page.add(this.add.image(x, y + 44, `ch_${id}_color`, 'idle0').setOrigin(0, 0.5).setScale(1).setVisible(false));
    });
    // heroes
    let hx = 10;
    for (const g of Object.keys(HERO_GENDERS)) {
      for (let s = 0; s < 4; s++) {
        const p = { gender: g, skin: s, cap: s };
        buildHero(this, p);
        this.page.add(this.add.image(hx, 470, `${heroKey(p)}_color`, 'idle0').setOrigin(0).setScale(2));
        hx += 52;
      }
    }
    this.page.add(this.add.image(hx + 10, 470, `${heroKey({ gender: 'boy', skin: 0, cap: 0 })}_gray`, 'idle0').setOrigin(0).setScale(2));
  }

  portraits() {
    const ids = Object.keys(CHARACTERS);
    ids.forEach((id, n) => {
      const x = 10 + (n % 6) * 158;
      const y = 24 + Math.floor(n / 6) * 90;
      this.label(x, y, CHARACTERS[id].name);
      this.page.add(this.add.image(x, y + 12, `pt_${id}`, 'n').setOrigin(0));
      this.page.add(this.add.image(x + 68, y + 12, `pt_${id}`, 'h').setOrigin(0));
    });
    let n = 0;
    for (const g of Object.keys(HERO_GENDERS)) {
      for (let s = 0; s < 4; s += 3) {
        const p = { gender: g, skin: s, cap: s };
        const k = `pt_${heroKey(p)}`;
        buildPortrait(this, k, heroLook(p), 'hero', 7);
        const x = 10 + n * 158;
        this.page.add(this.add.image(x, 300, k, 'n').setOrigin(0));
        this.page.add(this.add.image(x + 68, 300, k, 'h').setOrigin(0));
        n++;
      }
    }
    // big preview
    this.page.add(this.add.image(10, 380, 'pt_brooke', 'h').setOrigin(0).setScale(2.3));
    this.page.add(this.add.image(170, 380, 'pt_ray', 'n').setOrigin(0).setScale(2.3));
  }

  props() {
    let x = 10;
    let y = 24;
    let rowH = 0;
    const samples = {
      sign: [['4AM CLUB', 'SLEEP IN CLUB'], '#3dff8a'],
      bigboard: [['RISE &', 'GRIND', 'REST &', 'RECOVER']],
    };
    for (const type of Object.keys(PROP_TYPES)) {
      const [text, color] = samples[type] || [];
      const { w, h } = buildPropTextures(this, type, text, color);
      if (x + w * 4 + 30 > 950) { x = 10; y += rowH + 18; rowH = 0; }
      this.label(x, y, type);
      this.page.add(this.add.image(x, y + 10, propTextureKey(type, text, false)).setOrigin(0).setScale(2));
      this.page.add(this.add.image(x + w * 2 + 6, y + 10, propTextureKey(type, text, true)).setOrigin(0).setScale(2));
      x += w * 4 + 24;
      rowH = Math.max(rowH, h * 2 + 10);
    }
  }

  tiles() {
    for (const [row, key] of [[0, 'tiles_color'], [1, 'tiles_gray']]) {
      for (let i = 0; i < TILE_COUNT; i++) {
        const x = 10 + (i % 24) * 38;
        const y = 30 + row * 170 + Math.floor(i / 24) * 40;
        this.page.add(this.add.image(x, y, key).setOrigin(0).setCrop(i * 16, 0, 16, 16).setScale(2).setPosition(x - i * 32, y));
      }
    }
  }
}
