import { TUNING } from '../config.js';
import { NPC } from './NPC.js';
import { pick } from '../data/lines.js';
import { Sfx } from '../systems/Sfx.js';

const rand = Phaser.Math.FloatBetween;

// The Doom-Scroller: a draining aura that blocks pebbles. Deflect their doom
// headline back as good news to stun them, then break the phone.
export class DoomScroller extends NPC {
  constructor(scene, x, y, person) {
    super(scene, x, y, 'doom', person);
    const C = TUNING.doom;
    this.auraScale = 1;
    this.stunT = 0;
    this.fireT = rand(1.2, C.fireEvery[1]);
    this.activeHeadline = null;
    this.blockedLineCd = 0;
    this.aura = scene.add.image(x, y, 'aura').setDepth(3);
    this.stars = [scene.add.image(x, y, 'star').setVisible(false), scene.add.image(x, y, 'star').setVisible(false)];
    this.setPhoneColor(0x9a7dff);
    this.bubbleLift = 36;
    this.sway = Math.random() * 6;
  }

  get cy() {
    return this.y - 14;
  }

  get auraRadius() {
    return TUNING.doom.auraRadius * this.auraScale;
  }

  isVulnerableTo() {
    return this.stunT > 0;
  }

  // True if the pebble hits the aura before reaching the phone.
  blocksPebble(pebble) {
    if (this.stunT > 0 || this.auraScale < 0.3) return false;
    return Math.hypot(pebble.x - this.cx, pebble.y - this.cy) < this.auraRadius;
  }

  onBlocked() {
    Sfx.play('tink');
    this.scene.fx.star.explode(2, this.x, this.y - 10);
    this.blockedLineCd -= 1;
    if (this.blockedLineCd <= 0) {
      this.say(pick(this.lines.blocked), 1.6);
      this.blockedLineCd = 3;
    }
  }

  updateLocked(dt) {
    const C = TUNING.doom;
    const s = this.scene;
    this.setVelocity(0, 0);
    const p = s.player;
    const d = Math.hypot(p.cx - this.cx, p.cy - this.cy);

    if (this.stunT > 0) {
      this.stunT -= dt;
      const t = s.time.now / 160;
      this.stars.forEach((st, i) => {
        const a = t + i * Math.PI;
        st.setVisible(true).setPosition(this.x + Math.cos(a) * 9, this.y - 34 + Math.sin(a) * 2).setDepth(100 + this.y + 2);
      });
      this.glow.setAlpha(0.15);
      if (this.stunT <= 0) {
        this.stars.forEach((st) => st.setVisible(false));
        this.glow.setAlpha(0.5);
        s.tweens.add({ targets: this, auraScale: 1, duration: 500, ease: 'Sine.Out' });
        this.fireT = rand(1.5, 2.5);
      }
    } else {
      // aura drains you
      if (d < this.auraRadius && !s.ending) s.meter.addContinuous(C.auraRate * dt);
      // fire doom headlines
      this.fireT -= dt;
      if (this.fireT <= 0) {
        this.fireT = rand(C.fireEvery[0], C.fireEvery[1]);
        if (!this.activeHeadline && d < C.fireRange && d > 10 && s.lineOfSight(this.cx, this.cy, p.cx, p.cy)) {
          this.activeHeadline = s.spawnHeadline(this, p.cx, p.cy);
          Sfx.play('fire');
        }
      }
    }

    // aura visuals
    const pulse = 1 + Math.sin(s.time.now / 300) * 0.05;
    const inside = d < this.auraRadius;
    this.aura
      .setPosition(this.x, this.y - 10)
      .setScale(((this.auraRadius * 2) / 96) * pulse)
      .setAlpha(this.auraScale < 0.05 ? 0 : inside ? 1 : 0.85);
    // gentle hunched sway
    this.setAngle(Math.sin(s.time.now / 700 + this.sway) * 2);
  }

  onReflectHit() {
    const s = this.scene;
    this.stunT = TUNING.doom.stunTime;
    s.tweens.killTweensOf(this);
    s.tweens.add({ targets: this, auraScale: 0, duration: 300, ease: 'Sine.In' });
    s.fx.star.explode(10, this.x, this.y - 12);
    s.popText(this.x, this.y - 40, 'STUNNED!', '#ffe066');
    this.say(pick(this.lines.stunned), 2.2);
    Sfx.play('stun');
  }

  onPebble() {
    if (this.stunT > 0) this.free();
  }

  onFreed() {
    this.scene.tweens.killTweensOf(this);
    this.aura.destroy();
    this.stars.forEach((st) => st.destroy());
    if (this.activeHeadline) this.activeHeadline.die();
  }
}
