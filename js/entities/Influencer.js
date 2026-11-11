import { TUNING, FONT } from '../config.js';
import { NPC } from './NPC.js';
import { LINES, pick } from '../data/lines.js';
import { Sfx } from '../systems/Sfx.js';

const rand = Phaser.Math.FloatBetween;
const RAYS = 14;

// The Aesthetic Influencer: always filming. Only a hit from behind breaks the phone.
export class Influencer extends NPC {
  constructor(scene, x, y, person) {
    super(scene, x, y, 'influencer', person);
    this.lockFacing = true;
    const C = TUNING.influencer;
    this.facing = (Math.floor(Math.random() * 8) * Math.PI) / 4;
    this.targetFacing = this.facing;
    this.poseT = rand(C.poseTime[0], C.poseTime[1]);
    this.walkT = 0;
    this.filmT = 0;
    this.filmCd = 0;
    this.filming = false;
    this.cone = [];
    this.setPhoneColor(0xffffff);
    this.ring = scene.add.image(x, y, 'ring').setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.8).setTint(0xffe6f2);
    this.rec = scene.add.image(x, y, 'recdot').setVisible(false);
    this.recText = scene.add
      .text(x, y, 'REC', { fontFamily: FONT, fontSize: '8px', color: '#ff3b4e', resolution: 2 })
      .setOrigin(0, 0.5)
      .setVisible(false);
  }

  // A pebble breaks the phone if it travels the same way she is facing (comes from behind).
  isVulnerableTo(dx, dy) {
    const fx = Math.cos(this.facing);
    const fy = Math.sin(this.facing);
    return dx * fx + dy * fy > TUNING.influencer.backHitDot;
  }

  updateLocked(dt) {
    const C = TUNING.influencer;
    const s = this.scene;

    // posing, turning, the occasional short walk
    if (this.walkT > 0) {
      this.walkT -= dt;
      this.setVelocity(Math.cos(this.facing) * C.speed, Math.sin(this.facing) * C.speed);
      if (!this.body.blocked.none) this.walkT = 0;
      if (this.walkT <= 0) this.setVelocity(0, 0);
    } else {
      this.setVelocity(0, 0);
      this.poseT -= dt;
      if (this.poseT <= 0) this.nextPose();
    }
    this.facing = Phaser.Math.Angle.RotateTo(this.facing, this.targetFacing, 4.5 * dt);
    this.faceDir(Math.cos(this.facing), Math.sin(this.facing));

    // camera cone (rays stop at walls, hedges, trees)
    const ex = this.x;
    const ey = this.y - 12;
    const half = Phaser.Math.DegToRad(C.coneHalfAngle);
    this.cone.length = 0;
    this.cone.push({ x: ex, y: ey });
    for (let i = 0; i <= RAYS; i++) {
      const a = this.facing - half + (2 * half * i) / RAYS;
      const len = s.rayLength(ex, ey, a, C.coneRange);
      this.cone.push({ x: ex + Math.cos(a) * len, y: ey + Math.sin(a) * len });
    }

    // is the kid on camera?
    const p = s.player;
    const dx = p.cx - ex;
    const dy = p.cy - ey;
    const d = Math.hypot(dx, dy);
    let seen = false;
    if (d < C.coneRange && !s.ending) {
      const diff = Math.abs(Phaser.Math.Angle.Wrap(Math.atan2(dy, dx) - this.facing));
      seen = diff < half && s.lineOfSight(ex, ey, p.cx, p.cy);
    }
    this.filmCd = Math.max(0, this.filmCd - dt);
    this.filming = seen;
    if (seen && this.filmCd <= 0) {
      s.meter.addContinuous(C.filmRate * dt);
      this.filmT += dt;
      if (Math.random() < dt * 4) Sfx.play('rec');
      if (this.filmT >= C.contentifyTime / (s.diff || 1)) this.contentify();
    } else {
      this.filmT = Math.max(0, this.filmT - dt);
    }

    // ring light + REC indicator
    const o = this.phonePos();
    this.ring.setPosition(o.x, o.y).setDepth(100 + this.y + 0.7);
    const blink = seen && Math.floor(s.time.now / 250) % 2 === 0;
    this.rec.setVisible(blink).setPosition(this.x - 8, this.y - 38).setDepth(5001);
    this.recText.setVisible(blink).setPosition(this.x - 5, this.y - 38).setDepth(5001);
  }

  nextPose() {
    const C = TUNING.influencer;
    this.poseT = rand(C.poseTime[0], C.poseTime[1]);
    const r = Math.random();
    if (r < 0.25) {
      // outfit check: spin around
      this.targetFacing = Phaser.Math.Angle.Wrap(this.facing + Math.PI);
      if (this.playerDist() < 160) this.say(pick(this.lines.turn), 1.6);
    } else if (r < 0.5) {
      this.walkT = rand(0.8, 1.8);
    } else {
      const steps = Phaser.Utils.Array.GetRandom([-2, -1, 1, 2]);
      this.targetFacing = Phaser.Math.Angle.Wrap(this.facing + (steps * Math.PI) / 4);
    }
  }

  contentify() {
    const C = TUNING.influencer;
    const s = this.scene;
    this.filmT = 0;
    this.filmCd = 1.2;
    s.player.stagger(this.x, this.y, 120, C.stunTime);
    s.hurt(C.contentifyPenalty, true);
    s.cameras.main.flash(120, 255, 255, 255);
    s.popText(s.player.x, s.player.y - 20, pick(LINES.contentified), '#ff7eb6');
    this.say(pick(this.lines.filmed), 1.8);
    Sfx.play('shutter');
  }

  onPebble(pebble) {
    if (this.isVulnerableTo(pebble.dx, pebble.dy)) {
      this.free();
      return;
    }
    // Spotted from the front: she turns to face you.
    const p = this.scene.player;
    this.targetFacing = Math.atan2(p.cy - (this.y - 12), p.cx - this.x);
    this.poseT = Math.max(this.poseT, 1.8);
    this.walkT = 0;
    this.say(pick(this.lines.spotted), 1.8);
    Sfx.play('shutter');
  }

  onFreed() {
    this.cone.length = 0;
    this.filming = false;
    this.ring.destroy();
    this.rec.destroy();
    this.recText.destroy();
  }
}
