import { TUNING, FONT } from '../config.js';
import { NPC } from './NPC.js';
import { pick } from '../data/lines.js';
import { Sfx } from '../systems/Sfx.js';

const rand = Phaser.Math.FloatBetween;

// The Podcast Guru: never stops talking. Voice waves push you back and bounce
// pebbles, and standing close pulls the meter up. Every few seconds he stops for
// an AD READ: no waves, no shield. That's when his phone can break.
export class PodcastGuru extends NPC {
  constructor(scene, x, y, person) {
    super(scene, x, y, 'podcast', person);
    this.lockFacing = true;
    this.phase = 'talk'; // talk -> warn -> ad -> talk
    this.phaseT = rand(TUNING.podcast.adEvery[0], TUNING.podcast.adEvery[1]) * 0.6;
    this.waveT = rand(0.8, 1.6);
    this.rings = [];
    this.blockedLineCd = 0;
    this.gfx = scene.add.graphics().setDepth(3);
    this.sign = scene.add
      .text(x, y, 'AD READ', {
        fontFamily: FONT, fontSize: '8px', color: '#2a1a00', backgroundColor: '#ffe066', padding: { x: 3, y: 2 }, resolution: 2,
      })
      .setOrigin(0.5, 1)
      .setVisible(false);
    this.setPhoneColor(0x9fe8ff);
    this.bubbleLift = 40;
    this.sway = Math.random() * 6;
  }

  get C() {
    return TUNING.podcast;
  }

  isOpen() {
    return this.phase === 'ad';
  }

  isVulnerableTo() {
    return this.phase === 'ad';
  }

  // Pebbles bounce off the waves, and off the "flow" close to him while he talks.
  blocksPebble(pb) {
    if (this.phase === 'ad') return false;
    const d = Math.hypot(pb.x - this.cx, pb.y - this.cy);
    if (d < this.C.blockRadius) return true;
    return this.rings.some((r) => Math.abs(d - r.r) < 6);
  }

  onBlocked() {
    Sfx.play('tink');
    this.scene.fx.star.explode(2, this.x, this.y - 12);
    this.blockedLineCd -= 1;
    if (this.blockedLineCd <= 0) {
      this.say(pick(this.lines.blocked), 1.6);
      this.blockedLineCd = 3;
    }
  }

  updateLocked(dt) {
    const C = this.C;
    const s = this.scene;
    const p = s.player;
    const diff = s.diff || 1;
    this.setVelocity(0, 0);
    this.faceDir(p.x - this.x, p.y - this.y);
    const d = Math.hypot(p.cx - this.cx, p.cy - this.cy);

    this.phaseT -= dt;
    if (this.phase === 'talk') {
      // emit voice waves
      this.waveT -= dt;
      if (this.waveT <= 0) {
        this.waveT = rand(C.waveEvery[0], C.waveEvery[1]) / diff;
        if (d < C.waveRange * 1.6) {
          this.rings.push({ r: 8, hit: false });
          Sfx.play('blip', 0.5);
        }
      }
      // parasocial pull: being close raises the meter
      if (d < C.pullRadius && !s.ending) s.meter.addContinuous(C.pullRate * dt);
      if (this.phaseT <= 0) {
        this.phase = 'warn';
        this.phaseT = C.adWarn;
        this.sign.setText('AD BREAK...');
      }
    } else if (this.phase === 'warn') {
      if (this.phaseT <= 0) {
        this.phase = 'ad';
        this.phaseT = C.adTime / Math.sqrt(diff);
        this.sign.setText(pick(this.lines.ad));
        if (this.bubble) this.bubble.setVisible(false);
        this.talkT = C.adTime + 0.5; // keep quiet so the sign stays readable
        Sfx.play('pop');
      }
    } else if (this.phaseT <= 0) {
      this.phase = 'talk';
      this.phaseT = rand(C.adEvery[0], C.adEvery[1]);
      this.waveT = 0.4;
    }

    // the waves expand; each one can push you once
    const grow = C.waveRange / C.waveTime;
    for (const r of this.rings) {
      r.r += grow * dt;
      if (!r.hit && !s.ending && Math.abs(d - r.r) < 7) {
        r.hit = true;
        p.stagger(this.x, this.y - 10, C.wavePush, 0.22);
        if (s.hurt(C.wavePenalty, true)) s.popText(p.x, p.y - 34, pick(this.lines.wave), '#9fe8ff');
        Sfx.play('hurt');
      }
    }
    this.rings = this.rings.filter((r) => r.r < C.waveRange);

    // visuals
    this.gfx.clear();
    for (const r of this.rings) {
      const a = 1 - r.r / C.waveRange;
      this.gfx.lineStyle(2, 0x9fe8ff, 0.7 * a).strokeCircle(this.x, this.y - 10, r.r);
      this.gfx.lineStyle(1, 0xffffff, 0.5 * a).strokeCircle(this.x, this.y - 10, r.r - 2);
    }
    if (this.phase !== 'ad') {
      const pulse = 1 + Math.sin(s.time.now / 200) * 0.06;
      this.gfx.fillStyle(0x9fe8ff, 0.12).fillCircle(this.x, this.y - 10, C.blockRadius * pulse);
      this.gfx.fillStyle(0x9fe8ff, 0.06).fillCircle(this.x, this.y - 10, C.pullRadius);
    }
    const showSign = this.phase !== 'talk';
    const flash = this.phase === 'warn' && Math.floor(s.time.now / 120) % 2;
    this.sign.setVisible(showSign && !flash).setPosition(this.x, this.y - 36).setDepth(100 + this.y + 3);
    this.setAngle(this.phase === 'ad' ? 0 : Math.sin(s.time.now / 500 + this.sway) * 2);
  }

  onPebble() {
    if (this.phase === 'ad') this.free();
  }

  onFreed() {
    this.setAngle(0);
    this.gfx.destroy();
    this.sign.destroy();
    this.rings = [];
  }

  destroy(fromScene) {
    if (this.gfx && this.gfx.scene) this.gfx.destroy();
    if (this.sign && this.sign.scene) this.sign.destroy();
    super.destroy(fromScene);
  }
}
