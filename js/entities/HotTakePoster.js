import { TUNING, FONT } from '../config.js';
import { NPC } from './NPC.js';
import { pick } from '../data/lines.js';
import { Sfx } from '../systems/Sfx.js';

const rand = Phaser.Math.FloatBetween;
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// The Hot-Take Poster: once they spot you, they fire bursts of angry REPLY bubbles.
// Walls, trees and hedges block replies, but you can't deflect them.
// Break line of sight and they go on typing anyway ("replying to the void"):
// that is the moment to break the phone.
export class HotTakePoster extends NPC {
  constructor(scene, x, y, person) {
    super(scene, x, y, 'hottake', person);
    this.hmode = 'idle'; // idle -> notice -> track -> void -> idle
    this.hmodeT = 0;
    this.lostT = 0;
    this.burstLeft = 0;
    this.burstT = 0;
    this.fireT = rand(0.6, 1.2);
    this.walkT = 0;
    this.dir = null;
    this.shots = [];
    this.alert = scene.add.image(x, y, 'badge').setVisible(false);
    this.setPhoneColor(0xff3b4e);
    this.bubbleLift = 40;
  }

  get C() {
    return TUNING.hottake;
  }

  isOpen() {
    return this.lockedMode === 'void';
  }

  isVulnerableTo() {
    return this.lockedMode === 'void';
  }

  // the state machine uses its own name so it never clashes with the freed-state `mode`
  get lockedMode() {
    return this.state === 'locked' ? this.hmode : null;
  }

  seesPlayer() {
    const s = this.scene;
    const p = s.player;
    const d = Math.hypot(p.cx - this.cx, p.cy - this.cy);
    return !s.ending && d < this.C.sightRange && s.lineOfSight(this.cx, this.cy, p.cx, p.cy);
  }

  setMode(m, t = 0) {
    this.hmode = m;
    this.hmodeT = t;
  }

  updateLocked(dt) {
    const C = this.C;
    const s = this.scene;
    const p = s.player;
    const diff = s.diff || 1;
    if (!this.hmode) this.setMode('idle');
    this.hmodeT -= dt;
    const sees = this.seesPlayer();

    switch (this.hmode) {
      case 'idle':
        this.wander(dt);
        if (sees) {
          this.setMode('notice', C.noticeTime);
          this.setVelocity(0, 0);
          this.say(pick(this.lines.spotted), 1.6);
          Sfx.play('ping');
        }
        break;
      case 'notice':
        this.setVelocity(0, 0);
        this.faceDir(p.x - this.x, p.y - this.y);
        if (this.hmodeT <= 0) {
          this.setMode('track');
          this.lostT = 0;
          this.fireT = 0.2;
        }
        break;
      case 'track':
        this.setVelocity(0, 0);
        this.faceDir(p.x - this.x, p.y - this.y);
        // furious typing
        this.setAngle(Math.sin(s.time.now / 35) * 1.5);
        this.fireT -= dt;
        if (this.fireT <= 0 && this.burstLeft === 0 && sees) {
          this.burstLeft = C.burstCount;
          this.burstT = 0;
          this.fireT = rand(C.burstEvery[0], C.burstEvery[1]) / diff;
        }
        this.lostT = sees ? 0 : this.lostT + dt;
        if (this.lostT > C.lostTime) {
          this.setAngle(0);
          this.setMode('void', C.voidTime / Math.sqrt(diff));
          this.burstLeft = 0;
          this.say(pick(this.lines.void), 2.4);
          s.popText(this.x, this.y - 44, 'REPLYING TO THE VOID', '#5dff8a');
          Sfx.play('pop');
        }
        break;
      case 'void':
        this.setVelocity(0, 0);
        this.setAngle(Math.sin(s.time.now / 60) * 1);
        if (this.hmodeT <= 0) {
          this.setAngle(0);
          this.setMode('idle');
          this.walkT = 0;
        }
        break;
    }

    // a burst fires one bubble at a time
    if (this.burstLeft > 0) {
      this.burstT -= dt;
      if (this.burstT <= 0) {
        this.fireReply(p.cx, p.cy);
        this.burstLeft--;
        this.burstT = C.burstGap;
      }
    }

    this.updateShots(dt);
    const showAlert = this.hmode === 'track' || this.hmode === 'notice';
    this.alert.setVisible(showAlert).setPosition(this.x, this.y - 40 + Math.sin(s.time.now / 120)).setDepth(100 + this.y + 3);
  }

  wander(dt) {
    const C = this.C;
    this.walkT -= dt;
    if (this.walkT <= 0) {
      if (this.dir) {
        this.dir = null;
        this.walkT = rand(1, 2.2);
        this.setVelocity(0, 0);
      } else {
        this.dir = Phaser.Utils.Array.GetRandom(DIRS);
        this.walkT = rand(0.8, 1.8);
      }
    }
    if (this.dir) {
      this.setVelocity(this.dir[0] * C.speed, this.dir[1] * C.speed);
      if (!this.body.blocked.none) this.walkT = 0;
    }
  }

  fireReply(tx, ty) {
    const C = this.C;
    const s = this.scene;
    const sx = this.cx;
    const sy = this.cy - 4;
    const a = Math.atan2(ty - sy, tx - sx) + Phaser.Math.DegToRad(rand(-C.spread, C.spread));
    const img = s.add.image(sx, sy, 'replybubble').setDepth(4500);
    const label = s.add
      .text(sx, sy - 6, pick(this.lines.replies), {
        fontFamily: FONT, fontSize: '8px', color: '#ffffff', backgroundColor: '#b0182c', padding: { x: 2, y: 1 }, resolution: 2,
      })
      .setOrigin(0.5, 1)
      .setDepth(4501);
    const sp = C.shotSpeed * Math.min(1.15, s.diff || 1);
    this.shots.push({ img, label, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 3 });
    Sfx.play('fire');
  }

  updateShots(dt) {
    const s = this.scene;
    const p = s.player;
    for (const sh of this.shots) {
      sh.life -= dt;
      sh.img.x += sh.vx * dt;
      sh.img.y += sh.vy * dt;
      sh.label.setPosition(sh.img.x, sh.img.y - 4);
      let dead = sh.life <= 0 || s.isSolidAt(sh.img.x, sh.img.y + 4);
      if (!dead && !s.ending && Math.hypot(sh.img.x - p.cx, sh.img.y - p.cy) < 9) {
        if (s.hurt(this.C.shotPenalty)) s.popText(p.x, p.y - 34, "RATIO'D!", '#ff6b81');
        dead = true;
      }
      if (dead) {
        s.fx.puff.explode(3, sh.img.x, sh.img.y);
        sh.img.destroy();
        sh.label.destroy();
        sh.dead = true;
      }
    }
    this.shots = this.shots.filter((sh) => !sh.dead);
  }

  onPebble() {
    if (this.hmode === 'void') {
      this.free();
      return;
    }
    // hit while they're watching: they fire straight back
    const s = this.scene;
    Sfx.play('tink');
    s.fx.star.explode(3, this.x, this.y - 14);
    this.say(pick(this.lines.countered), 1.6);
    if (this.hmode === 'idle') this.setMode('notice', 0.15);
    this.burstLeft = this.C.burstCount;
    this.burstT = 0.15;
    s.popText(this.x, this.y - 44, 'NOT NOW!', '#ffffff');
  }

  onFreed() {
    this.setAngle(0);
    this.alert.destroy();
    for (const sh of this.shots) { sh.img.destroy(); sh.label.destroy(); }
    this.shots = [];
  }

  destroy(fromScene) {
    if (this.shots) for (const sh of this.shots) { sh.img.destroy(); sh.label.destroy(); }
    if (this.alert && this.alert.scene) this.alert.destroy();
    super.destroy(fromScene);
  }
}
