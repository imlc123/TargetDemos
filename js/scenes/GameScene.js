import { TILE, TUNING, VIEW, FONT, DEBUG } from '../config.js';
import { LEVELS, normalizeMap } from '../data/levels.js';
import { LINES, pick } from '../data/lines.js';
import { T, SOLID, LOOKS } from '../art/pixels.js';
import { Player } from '../entities/Player.js';
import { Pebble } from '../entities/Pebble.js';
import { Headline } from '../entities/Headline.js';
import { GrindsetBro } from '../entities/GrindsetBro.js';
import { Influencer } from '../entities/Influencer.js';
import { DoomScroller } from '../entities/DoomScroller.js';
import { AlgorithmMeter } from '../systems/AlgorithmMeter.js';
import { Save } from '../systems/Save.js';
import { Sfx } from '../systems/Sfx.js';

const CHAR_TO_TILE = {
  '.': T.ROAD, ',': T.SIDEWALK, '=': T.CROSSWALK, R: T.ROOF, W: T.WINDOW, g: T.GRASS, f: T.FLOWER,
  T: T.TREE, b: T.BENCH, B: T.BILLBOARD, p: T.PLAZA, h: T.HEDGE,
};
const SOLID_SET = new Set(SOLID);
const NPC_CLASSES = { bro: GrindsetBro, influencer: Influencer, doom: DoomScroller };
const hash = (x, y) => (((x * 73856093) ^ (y * 19349663)) >>> 0) % 97;

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init(data) {
    this.levelIndex = Phaser.Math.Clamp(data.level ?? 0, 0, LEVELS.length - 1);
    this.level = LEVELS[this.levelIndex];
    this.skipIntro = !!data.skipIntro;
  }

  create() {
    this.ending = false;
    this.cleared = false;
    this.freeRoam = false;
    this.pebbles = [];
    this.headlines = [];
    this.sfxThisFrame = new Set();
    this.claimedFlowers = new Map();
    this.meter = new AlgorithmMeter(TUNING.meter);

    this.buildMap();
    this.buildFx();

    // player
    const [px, py] = this.level.player;
    this.player = new Player(this, px * TILE + 8, py * TILE + 14);
    this.physics.add.collider(this.player, this.grayLayer);

    // NPCs
    this.npcs = [];
    this.level.npcs.forEach((n, i) => {
      const Cls = NPC_CLASSES[n.type];
      const look = (i * 2 + this.levelIndex) % LOOKS;
      const npc = new Cls(this, n.at[0] * TILE + 8, n.at[1] * TILE + 14, look);
      this.npcs.push(npc);
    });
    this.physics.add.collider(this.npcs, this.grayLayer);
    this.total = this.npcs.length;
    this.freedCount = 0;

    // ground-level graphics
    this.coneGfx = this.add.graphics().setDepth(3.5);
    this.reticle = this.add.image(0, 0, 'reticle').setDepth(4100).setVisible(false);
    this.aimDot = this.add.image(0, 0, 'pebble').setDepth(4100).setAlpha(0.5);

    // camera
    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.mapW, this.mapH);
    cam.setZoom(VIEW.zoom);
    cam.startFollow(this.player, true, 0.15, 0.15);
    cam.setRoundPixels(true);
    cam.setBackgroundColor('#0d0b16');
    this.physics.world.setBounds(0, 0, this.mapW, this.mapH);

    // input
    this.keys = this.input.keyboard.addKeys('ESC,P,N,K');
    this.events.on('resume', () => {
      this.input.keyboard.resetKeys();
      const t = this.registry.get('touch');
      if (t) t.action = false;
    });

    if (!this.scene.isActive('UI')) this.scene.launch('UI');
    this.scene.bringToTop('UI');

    if (!this.skipIntro) {
      const intro = this.level.intro;
      this.showCard({
        kind: 'intro', title: intro.title, subtitle: intro.subtitle, body: intro.body,
        icon: this.level.feature, buttons: [{ label: "LET'S GO", action: 'resume' }],
      });
    }
  }

  // ---------- map ----------
  buildMap() {
    const rows = normalizeMap(this.level.map);
    this.tileIds = [];
    this.flowers = [];
    this.billboards = [];
    rows.forEach((row, y) => {
      const ids = [];
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        let id = CHAR_TO_TILE[ch] ?? T.SIDEWALK;
        if (id === T.ROOF && hash(x, y) % 6 === 0) id = T.ROOF_VENT;
        if (id === T.WINDOW && hash(x, y) % 3 === 0) id = T.WINDOW_LIT;
        if (id === T.FLOWER) this.flowers.push({ x: x * TILE + 8, y: y * TILE + 12, key: `${x},${y}` });
        if (id === T.BILLBOARD) this.billboards.push({ x, y });
        ids.push(id);
      }
      this.tileIds.push(ids);
    });
    this.mapTW = rows[0].length;
    this.mapTH = rows.length;
    this.mapW = this.mapTW * TILE;
    this.mapH = this.mapTH * TILE;

    // Two copies of the map: a gray city and a color city that fades in as people are freed.
    this.grayMap = this.make.tilemap({ data: this.tileIds.map((r) => r.slice()), tileWidth: TILE, tileHeight: TILE });
    this.colorMap = this.make.tilemap({ data: this.tileIds.map((r) => r.slice()), tileWidth: TILE, tileHeight: TILE });
    const tsGray = this.grayMap.addTilesetImage('tiles', 'tiles_gray', TILE, TILE, 0, 0);
    const tsColor = this.colorMap.addTilesetImage('tiles', 'tiles_color', TILE, TILE, 0, 0);
    this.grayLayer = this.grayMap.createLayer(0, tsGray, 0, 0).setDepth(0);
    this.colorLayer = this.colorMap.createLayer(0, tsColor, 0, 0).setDepth(1).setAlpha(0);
    this.grayLayer.setCollision(SOLID);
    this.night = this.add.rectangle(0, 0, this.mapW, this.mapH, 0x120a2a, 0.38).setOrigin(0).setDepth(2);
    this.colorNow = 0;
  }

  buildFx() {
    const base = { emitting: false, lifespan: { min: 300, max: 700 }, scale: { start: 1, end: 0 } };
    this.fx = {
      shard: this.add.particles(0, 0, 'shard', {
        ...base, speed: { min: 40, max: 130 }, tint: [0x7fd1ff, 0xffffff, 0xff3fb4, 0x3fe8ff], gravityY: 140,
      }).setDepth(4600),
      heart: this.add.particles(0, 0, 'heart', {
        ...base, speed: { min: 10, max: 35 }, angle: { min: 240, max: 300 }, lifespan: 1100,
      }).setDepth(4600),
      pollen: this.add.particles(0, 0, 'pollen', {
        ...base, speed: { min: 6, max: 20 }, angle: { min: 200, max: 340 }, lifespan: 900,
      }).setDepth(4600),
      puff: this.add.particles(0, 0, 'puff', {
        ...base, speed: { min: 5, max: 25 }, alpha: { start: 0.6, end: 0 }, lifespan: 350,
      }).setDepth(4600),
      star: this.add.particles(0, 0, 'star', {
        ...base, speed: { min: 30, max: 90 }, lifespan: 500,
      }).setDepth(4600),
    };
  }

  // ---------- helpers used by entities ----------
  isSolidAt(wx, wy) {
    const tx = Math.floor(wx / TILE);
    const ty = Math.floor(wy / TILE);
    if (tx < 0 || ty < 0 || tx >= this.mapTW || ty >= this.mapTH) return true;
    return SOLID_SET.has(this.tileIds[ty][tx]);
  }

  // Distance a ray travels before hitting something solid (checked at ground level).
  rayLength(x, y, angle, max) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    for (let d = 4; d <= max; d += 4) {
      if (this.isSolidAt(x + cos * d, y + 6 + sin * d)) return d;
    }
    return max;
  }

  lineOfSight(x0, y0, x1, y1) {
    const d = Math.hypot(x1 - x0, y1 - y0);
    const a = Math.atan2(y1 - y0, x1 - x0);
    return this.rayLength(x0, y0, a, d) >= d - 0.5;
  }

  randomWalkableNear(x, y, radiusTiles) {
    for (let i = 0; i < 14; i++) {
      const tx = Math.floor(x / TILE) + Phaser.Math.Between(-radiusTiles, radiusTiles);
      const ty = Math.floor(y / TILE) + Phaser.Math.Between(-radiusTiles, radiusTiles);
      const wx = tx * TILE + 8;
      const wy = ty * TILE + 12;
      if (!this.isSolidAt(wx, wy)) return { x: wx, y: wy };
    }
    return null;
  }

  claimFlower(npc, maxDist) {
    const free = this.flowers
      .filter((f) => !this.claimedFlowers.has(f.key))
      .map((f) => ({ f, d: Math.hypot(f.x - npc.x, f.y - npc.y) }))
      .filter((o) => o.d < maxDist)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);
    if (!free.length) return null;
    const f = Phaser.Utils.Array.GetRandom(free).f;
    this.claimedFlowers.set(f.key, npc);
    npc.flowerKey = f.key;
    return { x: f.x + Phaser.Math.Between(-3, 3), y: f.y };
  }

  releaseFlower(npc) {
    if (npc.flowerKey) this.claimedFlowers.delete(npc.flowerKey);
    npc.flowerKey = null;
  }

  findChatPartner(npc) {
    const options = this.npcs.filter(
      (o) => o !== npc && o.state === 'freed' && (o.mode === 'idle' || (o.mode === 'walk' && o.purpose === 'wander')) &&
        Math.hypot(o.x - npc.x, o.y - npc.y) < 10 * TILE,
    );
    return options.length ? Phaser.Utils.Array.GetRandom(options) : null;
  }

  nearestLockedDoom(x, y) {
    let best = null;
    let bd = Infinity;
    for (const n of this.npcs) {
      if (n.kind !== 'doom' || n.state !== 'locked') continue;
      const d = Math.hypot(n.cx - x, n.cy - y);
      if (d < bd) {
        bd = d;
        best = n;
      }
    }
    return best;
  }

  spawnHeadline(source, tx, ty) {
    const sx = source.cx;
    const sy = source.cy - 4;
    const a = Math.atan2(ty - sy, tx - sx);
    const h = new Headline(this, source, sx, sy, Math.cos(a), Math.sin(a));
    this.headlines.push(h);
    return h;
  }

  popText(x, y, text, color = '#ffffff') {
    const t = this.add
      .text(x, y, text, { fontFamily: FONT, fontSize: '8px', color, stroke: '#000000', strokeThickness: 3, resolution: 2 })
      .setOrigin(0.5)
      .setDepth(5100);
    this.tweens.add({ targets: t, y: y - 16, alpha: 0, duration: 1000, ease: 'Sine.Out', onComplete: () => t.destroy() });
  }

  // Plays a sound at most once per frame (avoids stacking).
  sfxOnce(name) {
    if (this.sfxThisFrame.has(name)) return;
    this.sfxThisFrame.add(name);
    Sfx.play(name);
  }

  // A discrete hit to the Algorithm meter.
  hurt(amount, silent = false) {
    if (this.ending) return false;
    const ok = this.meter.hit(amount);
    if (ok) {
      if (!silent) Sfx.play('hurt');
      this.cameras.main.shake(100, 0.003);
    }
    return ok;
  }

  // ---------- aiming & action ----------
  findAimTarget() {
    const p = this.player;
    const f = p.facing;
    const cosMax = Math.cos(Phaser.Math.DegToRad(TUNING.pebble.aimAssistAngle));
    const range = TUNING.pebble.range + 6;
    let best = null;
    let bestScore = Infinity;
    for (const n of this.npcs) {
      if (n.state !== 'locked') continue;
      const dx = n.cx - p.cx;
      const dy = n.cy - p.cy;
      const d = Math.hypot(dx, dy);
      if (d > range || d < 1) continue;
      const dot = (dx * f.x + dy * f.y) / d;
      if (dot < cosMax) continue;
      if (!this.lineOfSight(p.cx, p.cy, n.cx, n.cy)) continue;
      const score = d * (2 - dot);
      if (score < bestScore) {
        bestScore = score;
        best = n;
      }
    }
    return best;
  }

  doAction() {
    const p = this.player;
    // Deflect any doom headline in range.
    if (p.parryCd <= 0) {
      const near = this.headlines.filter((h) => !h.reflected && !h.dead && Math.hypot(h.x - p.cx, h.y - p.cy) < TUNING.parry.radius);
      if (near.length) {
        near.forEach((h) => h.reflect());
        p.parryCd = TUNING.parry.cooldown;
        Sfx.play('parry');
        this.popText(p.x, p.y - 22, 'DEFLECT!', '#ffe066');
        this.cameras.main.shake(80, 0.002);
        return;
      }
    }
    if (p.shootCd > 0) return;
    let dx = p.facing.x;
    let dy = p.facing.y;
    const t = this.aimTarget;
    if (t) {
      const d = Math.hypot(t.cx - p.cx, t.cy - p.cy);
      dx = (t.cx - p.cx) / d;
      dy = (t.cy - p.cy) / d;
    }
    this.pebbles.push(new Pebble(this, p.cx + dx * 5, p.cy + dy * 5, dx, dy));
    p.shootCd = TUNING.pebble.cooldown;
    Sfx.play('shoot');
  }

  // ---------- events ----------
  onNpcFreed() {
    this.freedCount++;
    if (this.freedCount >= this.total && !this.ending) {
      this.cleared = true;
      this.meter.frozen = true;
      this.time.delayedCall(1300, () => this.levelClear());
    }
  }

  levelClear() {
    if (this.ending) return;
    this.ending = true;
    Save.clearLevel(this.levelIndex);
    Sfx.play('clear');
    const last = this.levelIndex >= LEVELS.length - 1;
    if (this.level.finale) {
      this.bloomBillboards(() => {
        this.showCard({
          kind: 'win', title: 'THE CITY LOGGED OFF',
          body:
            'Every phone is dust. The big screen is a flower bed now.\n\n' +
            'Somewhere, someone is sniffing a flower for no reason at all.\n\nThanks for playing TARGET DEMOS.',
          icon: 'all', buttons: [{ label: 'STAY & WANDER', action: 'stay' }, { label: 'MENU', action: 'menu' }],
        });
      });
      return;
    }
    const next = LEVELS[this.levelIndex + 1];
    this.time.delayedCall(400, () =>
      this.showCard({
        kind: 'clear', title: 'BLOCK FREED!',
        body: `${this.total} people logged off. ${this.level.name} can breathe again.\n\nNext up: ${next ? next.name : ''}.`,
        icon: this.level.feature,
        buttons: last ? [{ label: 'MENU', action: 'menu' }] : [{ label: 'NEXT BLOCK', action: 'next' }, { label: 'MENU', action: 'menu' }],
      }),
    );
  }

  bloomBillboards(done) {
    Sfx.play('bloom');
    this.cameras.main.flash(300, 255, 240, 200);
    this.billboards.forEach(({ x, y }, i) => {
      this.time.delayedCall(i * 70, () => {
        this.tileIds[y][x] = T.FLOWER;
        this.grayMap.putTileAt(T.FLOWER, x, y);
        this.colorMap.putTileAt(T.FLOWER, x, y);
        this.grayLayer.setCollision(SOLID);
        this.flowers.push({ x: x * TILE + 8, y: y * TILE + 12, key: `${x},${y}` });
        this.fx.heart.explode(2, x * TILE + 8, y * TILE + 8);
        this.fx.pollen.explode(4, x * TILE + 8, y * TILE + 8);
      });
    });
    this.time.delayedCall(this.billboards.length * 70 + 1800, done);
  }

  fail() {
    if (this.ending) return;
    this.ending = true;
    const p = this.player;
    p.skin = 'kid_gray';
    p.setVelocity(0, 0);
    p.stun = 99;
    const phone = this.add.rectangle(p.x + 5, p.y - 9, 3, 5, 0xff3fb4).setStrokeStyle(1, 0x15151c).setDepth(p.depth + 1);
    this.add.image(phone.x, phone.y, 'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0xff3fb4).setDepth(p.depth + 1).setScale(0.6);
    this.headlines.forEach((h) => h.die());
    Sfx.play('onboard');
    this.cameras.main.flash(250, 255, 63, 180);
    this.time.delayedCall(900, () =>
      this.showCard({
        kind: 'fail', title: "YOU'VE BEEN ONBOARDED", body: pick(LINES.fail), icon: 'fail',
        buttons: [{ label: 'TRY AGAIN', action: 'restart' }, { label: 'MENU', action: 'menu' }],
      }),
    );
  }

  showCard(cfg) {
    this.scene.launch('Card', cfg);
    this.scene.bringToTop('Card');
    this.scene.pause();
  }

  handleCardAction(action) {
    if (action === 'resume') this.scene.resume();
    else if (action === 'restart') this.scene.restart({ level: this.levelIndex, skipIntro: true });
    else if (action === 'next') this.scene.restart({ level: this.levelIndex + 1 });
    else if (action === 'stay') {
      this.freeRoam = true;
      this.scene.resume();
    } else if (action === 'menu') {
      this.scene.stop('UI');
      this.scene.start('Menu');
    }
  }

  openPause() {
    if (this.ending && !this.freeRoam) return;
    this.showCard({
      kind: 'pause', title: 'PAUSED', body: 'Take a breath. The feed can wait.',
      buttons: [{ label: 'RESUME', action: 'resume' }, { label: 'RESTART', action: 'restart' }, { label: 'MENU', action: 'menu' }],
    });
  }

  // ---------- main loop ----------
  update(time, delta) {
    const dt = Math.min(delta / 1000, 0.05);
    this.sfxThisFrame.clear();
    const JD = Phaser.Input.Keyboard.JustDown;
    if (JD(this.keys.ESC) || JD(this.keys.P)) {
      this.openPause();
      return;
    }
    if (DEBUG) {
      if (JD(this.keys.N)) this.npcs.forEach((n) => n.free());
      if (JD(this.keys.K)) this.meter.value = this.meter.cfg.max;
    }

    const p = this.player;
    p.update(dt);

    this.aimTarget = this.ending && !this.freeRoam ? null : this.findAimTarget();
    if (p.consumeAction() && (!this.ending || this.freeRoam)) this.doAction();

    for (const n of this.npcs) n.update(dt);

    // pebbles
    for (const pb of this.pebbles) {
      pb.update(dt);
      if (pb.dead) continue;
      for (const n of this.npcs) {
        if (n.state !== 'locked') continue;
        if (n.kind === 'doom' && n.blocksPebble(pb)) {
          pb.die('wall');
          n.onBlocked();
          break;
        }
        if (Math.hypot(pb.x - n.cx, pb.y - n.cy) < 9) {
          pb.die('hit');
          n.onPebble(pb);
          break;
        }
      }
    }
    this.pebbles = this.pebbles.filter((pb) => !pb.dead);

    // headlines
    let parryReady = false;
    for (const h of this.headlines) {
      h.update(dt, p);
      if (h.dead) continue;
      const d = Math.hypot(h.x - p.cx, h.y - p.cy);
      if (!h.reflected) {
        if (d < TUNING.parry.radius * 1.5) parryReady = true;
        if (d < 7) {
          if (this.hurt(TUNING.doom.headlinePenalty)) this.popText(p.x, p.y - 20, 'DOOMED!', '#ff6b81');
          h.die();
        }
      } else if (h.target && h.target.state === 'locked' && Math.hypot(h.x - h.target.cx, h.y - h.target.cy) < 10) {
        h.target.onReflectHit();
        h.die();
      }
    }
    this.headlines = this.headlines.filter((h) => !h.dead);
    this.parryReady = parryReady;

    // influencer camera cones
    this.coneGfx.clear();
    for (const n of this.npcs) {
      if (n.kind !== 'influencer' || n.state !== 'locked' || n.cone.length < 3) continue;
      this.coneGfx.fillStyle(n.filming ? 0xff5fa2 : 0xffd6ec, n.filming ? 0.34 : 0.2);
      this.coneGfx.fillPoints(n.cone, true);
    }

    // aim marker
    const t = this.aimTarget;
    if (t) {
      const td = Math.hypot(t.cx - p.cx, t.cy - p.cy) || 1;
      const good = t.isVulnerableTo((t.cx - p.cx) / td, (t.cy - p.cy) / td);
      this.reticle.setVisible(true).setPosition(t.cx, t.cy).setTint(good ? 0x5dff8a : 0xffffff).setAlpha(good ? 1 : 0.55);
      this.aimDot.setVisible(false);
    } else {
      this.reticle.setVisible(false);
      this.aimDot.setVisible(!this.ending || this.freeRoam).setPosition(p.cx + p.facing.x * 16, p.cy + p.facing.y * 16);
    }

    // the Algorithm meter
    this.meter.update(dt);
    if (this.meter.full && !this.cleared) this.fail();

    // the city gets its color back
    const target = this.freedCount / this.total;
    this.colorNow += (target - this.colorNow) * Math.min(1, dt * 2);
    this.colorLayer.setAlpha(this.colorNow);
    this.night.setAlpha(0.38 * (1 - this.colorNow));
  }
}
