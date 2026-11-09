import { TUNING } from '../config.js';
import { NPC } from './NPC.js';
import { LINES, pick } from '../data/lines.js';
import { Sfx } from '../systems/Sfx.js';

const rand = Phaser.Math.FloatBetween;
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// The Grindset Bro: only vulnerable during a market dip (chart turns red).
export class GrindsetBro extends NPC {
  constructor(scene, x, y, person) {
    super(scene, x, y, 'bro', person);
    const C = TUNING.bro;
    this.phase = 'up';
    this.phaseT = rand(C.upTime[0], C.upTime[1]) + rand(0, 1.5);
    this.dashT = 0;
    this.shoveCd = 0;
    this.chart = scene.add.image(x, y, 'chart_up');
    this.bubbleLift = 46;
    this.pickDir();
    this.setPhoneColor(0x3dff8a);
  }

  isVulnerableTo() {
    return this.phase === 'dip' && this.dashT <= 0;
  }

  pickDir() {
    const options = DIRS.filter(([dx, dy]) => !(this.dir && dx === -this.dir[0] && dy === -this.dir[1]));
    this.dir = Phaser.Utils.Array.GetRandom(options);
    this.paceLeft = rand(3, 7) * 16;
  }

  updateLocked(dt) {
    const C = TUNING.bro;
    this.shoveCd = Math.max(0, this.shoveCd - dt);

    if (this.dashT > 0) {
      this.dashT -= dt;
      if (Math.random() < dt * 30) this.scene.fx.puff.explode(1, this.x, this.y - 2);
      if (this.dashT <= 0) this.setVelocity(0, 0);
    } else {
      this.phaseT -= dt;
      if (this.phaseT <= 0) this.nextPhase();
      if (this.phase === 'dip') {
        this.setVelocity(0, 0);
        this.pose = 'cheer'; // hands up: panic
        this.setAngle(Math.sin(this.scene.time.now / 40) * 4); // panic wobble
      } else {
        this.setAngle(0);
        const sp = C.speed * (this.phase === 'warn' ? 0.5 : 1);
        this.paceLeft -= sp * dt;
        if (this.paceLeft <= 0 || !this.body.blocked.none) this.pickDir();
        this.setVelocity(this.dir[0] * sp, this.dir[1] * sp);
      }
    }

    // chart + phone signal
    let up = this.phase !== 'dip';
    if (this.phase === 'warn') up = Math.floor(this.phaseT * 10) % 2 === 0;
    this.chart.setTexture(up ? 'chart_up' : 'chart_down');
    this.setPhoneColor(up ? 0x3dff8a : 0xff3b5c);
    this.chart.setPosition(this.x, this.y - 39).setDepth(100 + this.y + 1);
    this.chart.setScale(this.phase === 'dip' ? 1.25 : 1);

    // shove the kid out of the way
    if (this.phase !== 'dip' && this.shoveCd <= 0 && this.playerDist() < C.shoveRange) {
      const p = this.scene.player;
      p.stagger(this.x, this.y, 140, 0.25);
      if (this.scene.hurt(C.shovePenalty)) this.say(pick(this.lines.shove), 1.8);
      this.shoveCd = C.shoveCooldown;
    }
  }

  nextPhase() {
    const C = TUNING.bro;
    if (this.phase === 'up') {
      this.phase = 'warn';
      this.phaseT = C.warnTime;
    } else if (this.phase === 'warn') {
      this.phase = 'dip';
      this.phaseT = C.dipTime;
      if (this.playerDist() < 200) {
        Sfx.play('dip');
        this.say(pick(this.lines.dip), 1.6);
      }
    } else {
      this.phase = 'up';
      this.phaseT = rand(C.upTime[0], C.upTime[1]);
    }
  }

  onPebble() {
    if (this.isVulnerableTo()) {
      this.free();
      return;
    }
    // Line goes up: he dashes off and the algorithm gets a hit in.
    const C = TUNING.bro;
    const p = this.scene.player;
    const a = Math.atan2(this.y - p.y, this.x - p.x) + rand(-0.6, 0.6);
    this.setVelocity(Math.cos(a) * C.dashSpeed, Math.sin(a) * C.dashSpeed);
    this.dashT = C.dashTime;
    this.scene.hurt(C.missPenalty);
    this.say(pick(this.lines.dash), 1.6);
    Sfx.play('dash');
  }

  onFreed() {
    this.chart.destroy();
    this.chart = null;
  }
}
