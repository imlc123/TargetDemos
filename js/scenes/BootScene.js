import { buildEffectTextures } from '../art/pixels.js';
import { buildTileTextures } from '../art/tiles.js';
import { buildHero, buildSlingshot } from '../art/sprites.js';
import { buildBossTextures } from '../art/boss.js';
import { buildNamedCharacters } from '../systems/People.js';
import { START_LEVEL, DEBUG, GALLERY } from '../config.js';
import { Save } from '../systems/Save.js';
import { Sfx } from '../systems/Sfx.js';
import { Hero } from '../systems/Hero.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  // Load the Gemini-generated art listed in assets/img/manifest.json.
  // Anything missing simply falls back to the code-drawn art.
  preload() {
    this.load.json('artManifest', 'assets/img/manifest.json');
    this.load.once('filecomplete-json-artManifest', (key, type, data) => {
      for (const f of (data && data.files) || []) this.load.image(`gen:${f.replace(/\.png$/, '')}`, `assets/img/${f}`);
    });
    this.load.on('loaderror', () => {}); // a missing file must not stop the game
    const W = this.scale.width;
    const H = this.scale.height;
    const bar = this.add.rectangle(W / 2 - 150, H / 2, 0, 10, 0xff5fa2).setOrigin(0, 0.5);
    this.add.rectangle(W / 2, H / 2, 304, 14).setStrokeStyle(2, 0xff5fa2);
    this.load.on('progress', (v) => { bar.width = 300 * v; });
  }

  create() {
    buildEffectTextures(this);
    buildTileTextures(this);
    buildNamedCharacters(this);
    buildHero(this, Hero.get());
    buildSlingshot(this);
    buildBossTextures(this);
    // Soft gradients look better smoothed than pixelated.
    for (const key of ['glow', 'aura', 'vignette']) {
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
    this.registry.set('touch', { x: 0, y: 0, action: false });
    const save = Save.load();
    Sfx.setMuted(save.muted);

    if (GALLERY) this.scene.start('Gallery');
    else if (DEBUG && START_LEVEL !== null) this.scene.start('Game', { level: START_LEVEL });
    else this.scene.start('Menu');
  }
}
