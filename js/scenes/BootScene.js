import { buildTextures } from '../art/pixels.js';
import { START_LEVEL, DEBUG } from '../config.js';
import { Save } from '../systems/Save.js';
import { Sfx } from '../systems/Sfx.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    buildTextures(this);
    // Soft gradients look better smoothed than pixelated.
    for (const key of ['glow', 'aura', 'vignette']) {
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
    this.registry.set('touch', { x: 0, y: 0, action: false });
    const save = Save.load();
    Sfx.setMuted(save.muted);

    if (DEBUG && START_LEVEL !== null) {
      this.scene.start('Game', { level: Math.min(3, START_LEVEL) });
    } else {
      this.scene.start('Menu');
    }
  }
}
