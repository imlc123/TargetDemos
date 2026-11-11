import { TILE } from '../config.js';
import { PROP_TYPES, buildPropTextures, propTextureKey } from '../art/props.js';
import { Sfx } from '../systems/Sfx.js';

// A themed prop in a level. Links to the nearest person and transforms when they are freed.
export class Prop {
  constructor(scene, def) {
    this.scene = scene;
    this.def = def;
    this.type = def.type;
    this.spec = PROP_TYPES[def.type];
    this.freed = false;
    const { w, h } = buildPropTextures(scene, def.type, def.text, def.color);
    this.w = w;
    this.h = h;
    const [tx, ty] = def.at;
    const s = this.spec;
    let x;
    let y;
    let depth;
    if (s.place === 'ground') {
      const footW = (s.foot || 1) * TILE;
      x = tx * TILE + Math.round((footW - w) / 2);
      y = (ty + 1) * TILE - h;
      depth = 100 + (ty + 1) * TILE - 2;
      for (let i = 0; i < (s.foot || 1); i++) scene.markSolid(tx + i, ty);
    } else if (s.place === 'wall') {
      x = tx * TILE;
      y = ty * TILE + (s.dy || 0);
      depth = 3;
    } else if (s.place === 'roof') {
      x = tx * TILE;
      y = ty * TILE;
      depth = 3.2;
    } else if (s.place === 'floor') {
      x = tx * TILE;
      y = ty * TILE;
      depth = 2.6;
    } else {
      x = tx * TILE;
      y = ty * TILE;
      depth = 4700;
    }
    this.x = x;
    this.y = y;
    this.cx = x + w / 2;
    this.cy = y + h / 2;
    this.sc = def.scale || 1;
    this.image = scene.add.image(x, y, propTextureKey(def.type, def.text, false)).setOrigin(0).setDepth(depth).setScale(this.sc);

    if (s.scroll) {
      const sc = s.scroll;
      this.scrollers = [0, 1].map((i) =>
        scene.add.tileSprite(x + sc.x, y + sc.y, sc.w, 5, `scroll_${def.type}_${i}`).setOrigin(0).setDepth(depth + 0.01).setVisible(i === 0),
      );
    }
    if (s.light) {
      this.light = scene.add.image(x + w / 2, y + 7, 'glow').setBlendMode(Phaser.BlendModes.ADD).setDepth(4650).setScale(1.6).setTint(0x9fd0ff).setAlpha(0.6);
      this.pool = scene.add.image(x + w / 2, y + h + 2, 'glow').setBlendMode(Phaser.BlendModes.ADD).setDepth(2.7).setScale(2.4, 1.1).setTint(0x9fd0ff).setAlpha(0.35);
    }
    if (s.iris) {
      this.iris = scene.add.image(x + 64 * this.sc, y + 29 * this.sc, 'prop_eye_iris').setDepth(3.3).setScale(this.sc);
    }
    if (s.place === 'air') {
      scene.tweens.add({ targets: this.image, y: y - 3, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    }
  }

  update(dt) {
    if (this.scrollers) this.scrollers.forEach((s) => { if (s.visible) s.tilePositionX += dt * 18; });
    if (this.light && !this.freed) {
      const flick = Math.random() < 0.04 ? 0.15 : 0.6;
      this.light.setAlpha(flick);
      this.pool.setAlpha(flick * 0.6);
    }
    if (this.iris && !this.freed) {
      // the Feed watches you
      const p = this.scene.player;
      const s = this.sc;
      const a = Math.atan2(p.cy - (this.y + 29 * s), p.cx - (this.x + 64 * s));
      this.iris.setPosition(this.x + (64 + Math.cos(a) * 14) * s, this.y + (29 + Math.sin(a) * 4) * s);
    }
  }

  transform(quiet = false) {
    if (this.freed) return;
    this.freed = true;
    const s = this.scene;
    this.image.setTexture(propTextureKey(this.type, this.def.text, true));
    if (this.scrollers) { this.scrollers[0].setVisible(false); this.scrollers[1].setVisible(true); }
    if (this.light) {
      this.light.setTint(0xffd97a).setAlpha(0.7);
      this.pool.setTint(0xffd97a).setAlpha(0.4);
    }
    if (this.iris) this.iris.setVisible(false);
    if (!quiet) {
      s.fx.sparkle.explode(8, this.cx, this.cy);
      s.fx.heart.explode(2, this.cx, this.y);
      Sfx.play('pop');
    }
    this.image.setScale(this.sc * 1.08);
    s.tweens.add({ targets: this.image, scale: this.sc, duration: 300, ease: 'Back.Out' });
  }
}
