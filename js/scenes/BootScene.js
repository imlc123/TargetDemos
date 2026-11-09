import { buildEffectTextures } from '../art/pixels.js';
import { buildTileTextures } from '../art/tiles.js';
import { buildHero } from '../art/sprites.js';
import { buildNamedCharacters } from '../systems/People.js';
import { START_LEVEL, DEBUG, GALLERY } from '../config.js';
import { Save } from '../systems/Save.js';
import { Sfx } from '../systems/Sfx.js';
import { Hero } from '../systems/Hero.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    buildEffectTextures(this);
    buildTileTextures(this);
    buildNamedCharacters(this);
    buildHero(this, Hero.get());
    // Soft gradients look better smoothed than pixelated.
    for (const key of ['glow', 'aura', 'vignette']) {
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
    this.registry.set('touch', { x: 0, y: 0, action: false });
    const save = Save.load();
    Sfx.setMuted(save.muted);

    if (GALLERY) this.scene.start('Gallery');
    else if (DEBUG && START_LEVEL !== null) this.scene.start('Game', { level: Math.min(3, START_LEVEL) });
    else this.scene.start('Menu');
  }
}
