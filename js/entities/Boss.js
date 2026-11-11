import { TUNING, FONT } from '../config.js';
import { LINES, pick } from '../data/lines.js';
import { facingFor, PHONE_AT } from '../art/sprites.js';
import { Sfx } from '../systems/Sfx.js';

const rand = Phaser.Math.FloatBetween;
const PHASE_NAMES = ['GRINDSET', 'INFLUENCER', 'DOOM'];
const PHASE_TINTS = [0x3dff8a, 0xff7eb6, 0x9a5cff];

// THE ENDLESS SCROLL: a black-pilled doom-scroller with every power in the city.
// Each phase: a shield goes up and they pull people back into the feed. Free enough
// of them to drop the shield, then hit the boss the way that phase's power demands.
export class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, startPhase = 0) {
    super(scene, x, y, 'ch_boss_gray', 'down_idle0');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1).setScale(2);
    this.body.setSize(14, 8).setOffset(5, 24);
    this.body.setImmovable(true);
    this.kind = 'boss';
    this.state = 'locked';
    this.phase = startPhase;
    this.cracks = startPhase;
    this.mode = 'intro';
    this.look = { facing: 'down', flip: false };
    this.angleFacing = Math.PI / 2;
    this.hitRadius = 22;
    this.stunT = 0;
    this.home = { x, y };
    this.animT = 0;
    this.idleIdx = 0;
    this.walkIdx = 0;
    this.cones = [];
    this.marks = [];

    this.shadowImg = scene.add.image(x, y, 'shadow').setScale(2.2).setDepth(4);
    this.phone = scene.add.image(x, y, `boss_phone_${this.cracks}`).setScale(1.4);
    this.glow = scene.add.image(x, y, 'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0xff3fb4).setScale(1.6).setAlpha(0.7);
    this.shield = scene.add.image(x, y, 'boss_shield').setDepth(4400).setAlpha(0);
    this.ring = scene.add.image(x, y, 'aura').setDepth(3).setAlpha(0);
    this.chart = scene.add.image(x, y, 'chart_up').setScale(2).setVisible(false);
    this.stars = [0, 1, 2].map(() => scene.add.image(x, y, 'star').setScale(1.5).setVisible(false));
    this.bubble = scene.add
      .text(x, y, '', {
        fontFamily: FONT, fontSize: '8px', align: 'center', resolution: 2, color: '#ff9fd8', backgroundColor: '#140a1e',
        padding: { x: 4, y: 3 }, wordWrap: { width: 150 },
      })
      .setOrigin(0.5, 1)
      .setDepth(5000)
      .setVisible(false);
    this.bubbleT = 0;
  }

  get cx() {
    return this.x;
  }
  get cy() {
    return this.y - 30;
  }

  say(text, dur = 2.6) {
    this.bubble.setText(text).setVisible(true).setAlpha(1);
    this.bubbleT = dur;
  }

  // ---------- flow ----------
  begin(fresh) {
    const s = this.scene;
    if (fresh) {
      // crawl out of the giant screen
      this.setAlpha(0);
      this.y = this.home.y - 70;
      s.tweens.add({ targets: this, alpha: 1, duration: 600 });
      s.tweens.add({ targets: this, y: this.home.y, duration: 1600, ease: 'Bounce.Out' });
      s.cameras.main.shake(900, 0.006);
      s.fx.shard.explode(30, this.home.x, this.home.y - 70);
      Sfx.play('onboard');
      s.time.delayedCall(1700, () => this.say(pick(LINES.boss.intro), 2.8));
      s.time.delayedCall(4200, () => this.startPhase());
    } else {
      this.say(`PHASE ${this.phase + 1}. Again.`, 2);
      s.time.delayedCall(1200, () => this.startPhase());
    }
  }

  startPhase() {
    const C = TUNING.boss;
    const s = this.scene;
    this.mode = 'shielded';
    this.freed = 0;
    this.need = C.need[this.phase];
    this.spawnT = C.spawnEvery[this.phase];
    this.attackT = 2.5;
    this.openT = 0;
    this.stunT = 0;
    this.dip = { stage: 'up', t: rand(C.dip.up[0], C.dip.up[1]) };
    this.filmT = 0;
    this.filmCd = 0;
    this.say(LINES.boss.phase[this.phase], 2.4);
    s.popText(this.x, this.y - 78, `PHASE ${this.phase + 1}: ${PHASE_NAMES[this.phase]}`, '#ffe066');
    Sfx.play('stun');
    s.cameras.main.flash(200, 255, 63, 180);
    // the first wave: the people you freed, pulled back in
    const wave = s.level.waves[this.phase];
    const first = this.need;
    for (let i = 0; i < first; i++) {
      const [type, who] = wave.who[i % wave.who.length];
      s.time.delayedCall(400 + i * 450, () => s.spawnMinion(type, who));
    }
    this.summonPose = 1.6;
    s.time.delayedCall(1800, () => this.mode === 'shielded' && this.say(pick(LINES.boss.summon), 2.4));
  }

  // Called by the scene when one of the summoned people is freed.
  onMinionFreed() {
    if (this.mode !== 'shielded') return;
    this.freed++;
    if (this.freed >= this.need) this.openShield();
  }

  openShield() {
    const s = this.scene;
    this.mode = 'open';
    this.openT = TUNING.boss.openTime;
    s.fx.shard.explode(24, this.x, this.y - 30);
    s.fx.sparkle.explode(10, this.x, this.y - 30);
    s.popText(this.x, this.y - 70, 'SHIELD DOWN!', '#9fffc0');
    s.cameras.main.shake(200, 0.004);
    Sfx.play('shatter');
    this.say(pick(LINES.boss.open), 2.2);
  }

  regrowShield() {
    const s = this.scene;
    this.mode = 'shielded';
    this.need = this.freed + TUNING.boss.regrowNeed;
    this.stunT = 0;
    s.popText(this.x, this.y - 70, 'SHIELD BACK UP', '#ff9fd8');
    this.say(pick(LINES.boss.shield), 2.2);
    Sfx.play('onboard');
    const wave = s.level.waves[this.phase];
    for (let i = 0; i < TUNING.boss.regrowNeed; i++) s.time.delayedCall(300 + i * 500, () => s.spawnMinion(pick(wave.extras), null));
  }

  isVulnerableTo(dx, dy) {
    if (this.mode !== 'open') return false;
    if (this.phase === 0) return this.dip.stage === 'dip';
    if (this.phase === 1) return dx * Math.cos(this.angleFacing) + dy * Math.sin(this.angleFacing) > 0.2;
    return this.stunT > 0;
  }

  // Pebbles bounce off the shield, and off the doom aura unless stunned.
  blocksPebble(pb) {
    const d = Math.hypot(pb.x - this.cx, pb.y - this.cy);
    if (this.mode === 'shielded' || this.mode === 'intro' || this.mode === 'hurt') return d < 42;
    if (this.phase === 2 && this.stunT <= 0) return d < TUNING.boss.auraRadius * 0.7;
    return false;
  }

  onBlocked() {
    Sfx.play('tink');
    this.scene.fx.star.explode(2, this.x, this.y - 30);
  }

  onPebble(pb) {
    const s = this.scene;
    if (this.mode !== 'open') return;
    if (this.isVulnerableTo(pb.dx, pb.dy)) {
      this.hurt();
      return;
    }
    // the wrong way to hit this phase
    this.say(LINES.boss.dodge[this.phase], 1.6);
    if (this.phase === 0) {
      s.hurt(TUNING.bro.missPenalty);
      const a = Math.atan2(this.y - s.player.y, this.x - s.player.x);
      s.tweens.add({ targets: this, x: Phaser.Math.Clamp(this.x + Math.cos(a) * 50, 60, s.mapW - 60), y: Phaser.Math.Clamp(this.y + Math.sin(a) * 30, 200, s.mapH - 60), duration: 260 });
      Sfx.play('dash');
    } else if (this.phase === 1) {
      const p = s.player;
      this.angleFacing = Math.atan2(p.cy - this.cy, p.cx - this.cx);
      Sfx.play('shutter');
    } else {
      Sfx.play('tink');
    }
  }

  onReflectHit() {
    const s = this.scene;
    if (this.phase !== 2) return;
    this.stunT = TUNING.boss.stunTime;
    s.fx.star.explode(12, this.x, this.y - 40);
    s.popText(this.x, this.y - 74, 'STUNNED!', '#ffe066');
    Sfx.play('stun');
  }

  hurt() {
    const s = this.scene;
    this.mode = 'hurt';
    this.cracks++;
    this.phone.setTexture(`boss_phone_${Math.min(3, this.cracks)}`);
    s.cameras.main.shake(400, 0.01);
    s.cameras.main.flash(180, 255, 255, 255);
    s.fx.shard.explode(30, this.phone.x, this.phone.y);
    Sfx.play('shatter');
    this.setTintFill(0xffffff);
    s.time.delayedCall(140, () => this.clearTint());
    this.marks.forEach((m) => m.destroy());
    this.marks = [];
    this.cones = [];
    s.onBossHurt(this.cracks);
    if (this.cracks >= 3) {
      s.time.delayedCall(900, () => this.defeat());
      return;
    }
    this.say(pick(LINES.boss.hurt), 2.2);
    s.time.delayedCall(2200, () => {
      this.phase++;
      this.startPhase();
    });
  }

  defeat() {
    const s = this.scene;
    this.mode = 'defeated';
    this.state = 'freed';
    this.say(pick(LINES.boss.defeat), 2.6);
    s.fx.shard.explode(50, this.phone.x, this.phone.y);
    s.fx.heart.explode(10, this.x, this.y - 50);
    Sfx.play('shatter');
    s.time.delayedCall(250, () => Sfx.play('freed'));
    this.phone.destroy();
    this.glow.destroy();
    this.ring.setVisible(false);
    this.chart.setVisible(false);
    this.shield.setVisible(false);
    this.stars.forEach((st) => st.setVisible(false));
    s.tweens.add({
      targets: this, scale: 1, duration: 900, ease: 'Sine.InOut',
      onComplete: () => s.onBossDefeated(this),
    });
    this.setTexture('ch_dale_color', 'cheer');
  }

  // ---------- per-frame ----------
  update(dt) {
    const s = this.scene;
    const C = TUNING.boss;
    const p = s.player;
    const busy = this.mode === 'intro' || this.mode === 'defeated';
    this.stunT = Math.max(0, this.stunT - dt);
    this.summonPose = Math.max(0, (this.summonPose || 0) - dt);
    this.cones = [];

    if (!busy && this.mode !== 'hurt') {
      if (this.mode === 'shielded') {
        // keep pulling people back in, up to a cap
        this.spawnT -= dt;
        const locked = s.npcs.filter((n) => n.state === 'locked').length;
        if (this.spawnT <= 0) {
          this.spawnT = C.spawnEvery[this.phase];
          if (locked < C.maxLocked[this.phase]) {
            s.spawnMinion(pick(s.level.waves[this.phase].extras), null);
            this.summonPose = 1;
          }
        }
      } else if (this.mode === 'open') {
        this.openT -= dt;
        if (this.openT <= 0) this.regrowShield();
      }
      if (this.phase === 0) this.updateGrindset(dt);
      else if (this.phase === 1) this.updateInfluencer(dt);
      else this.updateDoom(dt);
    } else if (this.mode !== 'defeated') {
      this.setVelocity(0, 0);
    }

    // facing & animation
    if (this.mode !== 'defeated') {
      if (this.phase === 1 && !busy) this.look = facingFor(Math.cos(this.angleFacing), Math.sin(this.angleFacing), this.look);
      else if (this.body.velocity.lengthSq() > 4) this.look = facingFor(this.body.velocity.x, this.body.velocity.y, this.look);
      else if (!busy) this.look = facingFor(p.x - this.x, p.y - this.y, this.look);
      const f = this.look.facing;
      this.animT += dt;
      let frame;
      if (this.summonPose > 0 || (this.phase === 0 && this.dip?.stage === 'dip' && this.mode === 'open')) frame = 'cheer';
      else if (this.body.velocity.lengthSq() > 4) {
        if (this.animT > 0.14) { this.animT = 0; this.walkIdx = (this.walkIdx + 1) % 4; }
        frame = `${f}_walk${this.walkIdx}`;
      } else {
        if (this.animT > 0.5) { this.animT = 0; this.idleIdx ^= 1; }
        frame = `${f}_idle${this.idleIdx}`;
      }
      if (this.frame.name !== frame) this.setFrame(frame);
      this.setFlipX(frame.startsWith('side') && this.look.flip);
    }

    // attachments
    const d = 100 + this.y;
    this.setDepth(d);
    this.shadowImg.setPosition(this.x, this.y - 1);
    if (this.phone.active) {
      const fr = this.frame.name;
      const facing = fr === 'cheer' ? 'down' : this.look.facing;
      const at = (fr === 'cheer' ? PHONE_AT.down.cheer : PHONE_AT[facing].low) || PHONE_AT.down.low;
      const px = facing === 'side' && this.look.flip ? 23 - at[0] : at[0];
      const sc = this.scale;
      const x = this.x + (px - 12 + 0.5) * sc;
      const y = this.y + (at[1] - 32 + 0.5) * sc;
      const hidden = facing === 'up' && fr !== 'cheer';
      this.phone.setPosition(x, y).setDepth(hidden ? d - 1 : d + 0.5).setVisible(!hidden);
      this.glow.setPosition(hidden ? this.x : x, hidden ? this.y - 60 : y).setDepth(d + 0.6).setAlpha(this.stunT > 0 ? 0.2 : 0.7);
      this.glow.setTint(PHASE_TINTS[this.phase]);
    }
    const shieldOn = this.mode === 'shielded' || this.mode === 'intro';
    const pulse = 1 + Math.sin(s.time.now / 250) * 0.04;
    this.shield.setPosition(this.x, this.y - 30).setScale(1.05 * pulse).setAlpha(shieldOn && this.mode !== 'intro' ? 0.9 : 0);
    this.shield.setTint(PHASE_TINTS[this.phase]);
    this.chart.setVisible(this.phase === 0 && !busy && this.mode !== 'hurt').setPosition(this.x, this.y - 74).setDepth(d + 1);
    if (this.phase === 0 && this.dip) {
      const up = this.dip.stage === 'up' || (this.dip.stage === 'warn' && Math.floor(this.dip.t * 10) % 2 === 0);
      this.chart.setTexture(up ? 'chart_up' : 'chart_down');
    }
    const auraOn = this.phase === 2 && !busy && this.mode !== 'hurt' && this.stunT <= 0;
    this.ring.setPosition(this.x, this.y - 12).setScale((C.auraRadius * 2) / 96 * pulse).setAlpha(auraOn ? 0.9 : 0);
    this.stars.forEach((st, i) => {
      const a = s.time.now / 160 + (i * Math.PI * 2) / 3;
      st.setVisible(this.stunT > 0).setPosition(this.x + Math.cos(a) * 16, this.y - 70 + Math.sin(a) * 3).setDepth(d + 2);
    });
    if (this.bubble.visible) {
      this.bubbleT -= dt;
      this.bubble.setPosition(this.x, this.y - 84);
      if (this.bubbleT <= 0) this.bubble.setVisible(false);
      else if (this.bubbleT < 0.3) this.bubble.setAlpha(this.bubbleT / 0.3);
    }
  }

  // Phase 1: market dips, and green candles erupting in a line toward you.
  updateGrindset(dt) {
    const C = TUNING.boss;
    const s = this.scene;
    const d = this.dip;
    d.t -= dt;
    if (d.t <= 0) {
      if (d.stage === 'up') { d.stage = 'warn'; d.t = C.dip.warn; }
      else if (d.stage === 'warn') {
        d.stage = 'dip'; d.t = C.dip.dip;
        if (this.mode === 'open') { this.say('MARKET DIP?!', 1.4); Sfx.play('dip'); }
      } else { d.stage = 'up'; d.t = rand(C.dip.up[0], C.dip.up[1]); }
    }
    // slow pacing around the plaza while the line goes up
    if (d.stage === 'dip' && this.mode === 'open') this.setVelocity(0, 0);
    else {
      if (!this.paceTarget || Math.hypot(this.paceTarget.x - this.x, this.paceTarget.y - this.y) < 6) {
        this.paceTarget = { x: this.home.x + rand(-120, 120), y: this.home.y + rand(-10, 120) };
      }
      const a = Math.atan2(this.paceTarget.y - this.y, this.paceTarget.x - this.x);
      this.setVelocity(Math.cos(a) * 24, Math.sin(a) * 24);
      if (!this.body.blocked.none) this.paceTarget = null;
    }
    this.attackT -= dt;
    if (this.attackT <= 0) {
      this.attackT = C.candleEvery;
      this.candleLine();
    }
  }

  candleLine() {
    const s = this.scene;
    const p = s.player;
    const a = Math.atan2(p.y - this.y, p.x - this.x);
    const spots = [];
    for (let i = 1; i <= 6; i++) {
      const x = this.x + Math.cos(a) * i * 22;
      const y = this.y + Math.sin(a) * i * 22;
      if (s.isSolidAt(x, y - 2)) break;
      spots.push({ x, y });
    }
    spots.forEach((sp, i) => {
      const mark = s.add.image(sp.x, sp.y, 'candle_mark').setDepth(3.6).setAlpha(0.9);
      this.marks.push(mark);
      s.tweens.add({ targets: mark, alpha: 0.4, duration: 150, yoyo: true, repeat: 3 });
      s.time.delayedCall(800 + i * 70, () => {
        mark.destroy();
        if (this.mode === 'hurt' || this.mode === 'defeated') return;
        const c = s.add.image(sp.x, sp.y + 2, 'candle').setOrigin(0.5, 1).setDepth(100 + sp.y).setScale(1, 0.1);
        s.tweens.add({ targets: c, scaleY: 1, duration: 120, ease: 'Back.Out' });
        s.tweens.add({ targets: c, alpha: 0, delay: 550, duration: 250, onComplete: () => c.destroy() });
        s.sfxOnce('thud');
        if (Math.hypot(p.x - sp.x, p.y - sp.y) < 13) {
          p.stagger(sp.x, sp.y + 10, 150, 0.35);
          if (s.hurt(TUNING.boss.candleDamage)) s.popText(p.x, p.y - 34, 'MARGIN CALL!', '#3dff8a');
        }
      });
    });
  }

  // Phase 2: two camera beams sweep the plaza. Only a hit from behind counts.
  updateInfluencer(dt) {
    const C = TUNING.boss;
    const s = this.scene;
    const p = s.player;
    this.setVelocity(0, 0);
    this.angleFacing = Phaser.Math.Angle.Wrap(this.angleFacing + C.beamSpeed * dt);
    const ex = this.x;
    const ey = this.y - 24;
    const half = Phaser.Math.DegToRad(C.beamHalf);
    let seen = false;
    for (const off of [-0.75, 0.75]) {
      const center = this.angleFacing + off;
      const pts = [{ x: ex, y: ey }];
      for (let i = 0; i <= 12; i++) {
        const a = center - half + (2 * half * i) / 12;
        const len = s.rayLength(ex, ey, a, C.beamRange);
        pts.push({ x: ex + Math.cos(a) * len, y: ey + Math.sin(a) * len });
      }
      this.cones.push(pts);
      const dx = p.cx - ex;
      const dy = p.cy - ey;
      const dist = Math.hypot(dx, dy);
      if (dist < C.beamRange && Math.abs(Phaser.Math.Angle.Wrap(Math.atan2(dy, dx) - center)) < half && s.lineOfSight(ex, ey, p.cx, p.cy)) seen = true;
    }
    this.filming = seen;
    this.filmCd = Math.max(0, this.filmCd - dt);
    if (seen && this.filmCd <= 0 && !s.ending) {
      s.meter.addContinuous(C.filmRate * dt);
      this.filmT += dt;
      if (this.filmT > TUNING.influencer.contentifyTime) {
        this.filmT = 0;
        this.filmCd = 1.2;
        p.stagger(this.x, this.y, 130, TUNING.influencer.stunTime);
        s.hurt(TUNING.influencer.contentifyPenalty, true);
        s.cameras.main.flash(120, 255, 255, 255);
        s.popText(p.x, p.y - 34, pick(LINES.contentified), '#ff7eb6');
        Sfx.play('shutter');
      }
    } else {
      this.filmT = Math.max(0, this.filmT - dt);
    }
  }

  // Phase 3: a draining aura and headline barrages. Deflect one to stun the boss.
  updateDoom(dt) {
    const C = TUNING.boss;
    const s = this.scene;
    const p = s.player;
    this.setVelocity(0, 0);
    const dist = Math.hypot(p.cx - this.cx, p.cy - this.cy);
    if (this.stunT <= 0 && dist < C.auraRadius && !s.ending) s.meter.addContinuous(C.auraRate * dt);
    if (this.stunT > 0) return;
    this.attackT -= dt;
    if (this.attackT <= 0) {
      this.attackT = C.barrageEvery;
      const n = this.mode === 'open' ? C.barrageCount[1] : C.barrageCount[0];
      const base = Math.atan2(p.cy - this.cy, p.cx - this.cx);
      for (let i = 0; i < n; i++) {
        const a = base + (i - (n - 1) / 2) * 0.32;
        s.time.delayedCall(i * 90, () => {
          if (this.mode === 'hurt' || this.mode === 'defeated') return;
          s.spawnHeadline(this, this.cx + Math.cos(a) * 200, this.cy + Math.sin(a) * 200);
        });
      }
      Sfx.play('fire');
    }
  }

  // A short line for the HUD about what to do right now.
  statusText() {
    if (this.mode === 'intro') return '...';
    if (this.mode === 'shielded') {
      const left = Math.max(0, this.need - this.freed);
      return `SHIELD UP: free ${left} more ${left === 1 ? 'person' : 'people'}`;
    }
    if (this.mode === 'open') {
      return ['SHIELD DOWN: hit it during a MARKET DIP', 'SHIELD DOWN: hit it from BEHIND', 'SHIELD DOWN: deflect a headline, then hit it'][this.phase];
    }
    if (this.mode === 'hurt') return 'CRACK!';
    return '';
  }

  destroyAll() {
    [this.shadowImg, this.phone, this.glow, this.shield, this.ring, this.chart, this.bubble, ...this.stars, ...this.marks].forEach((o) => o && o.destroy());
    this.destroy();
  }
}

