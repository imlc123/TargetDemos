import { TILE, TUNING, VIEW, FONT, DEBUG } from '../config.js';
import { LEVELS, normalizeMap } from '../data/levels.js';
import { LINES, pick } from '../data/lines.js';
import { T, SOLID, tileIdFor, isSolidTile } from '../art/tiles.js';
import { Player } from '../entities/Player.js';
import { Pebble } from '../entities/Pebble.js';
import { Headline } from '../entities/Headline.js';
import { Prop } from '../entities/Prop.js';
import { GrindsetBro } from '../entities/GrindsetBro.js';
import { Influencer } from '../entities/Influencer.js';
import { DoomScroller } from '../entities/DoomScroller.js';
import { AlgorithmMeter } from '../systems/AlgorithmMeter.js';
import { personFor } from '../systems/People.js';
import { Save } from '../systems/Save.js';
import { Sfx } from '../systems/Sfx.js';

const NPC_CLASSES = { bro: GrindsetBro, influencer: Influencer, doom: DoomScroller };

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
    this.props = [];
    this.sfxThisFrame = new Set();
    this.claimedFlowers = new Map();
    this.meter = new AlgorithmMeter(TUNING.meter);
    this.talkTarget = null;
    this.inDialogue = false;

    this.buildMap();
    this.buildFx();

    // themed props (they mark their own footprint as solid)
    (this.level.props || []).forEach((def) => this.props.push(new Prop(this, def)));

    // player
    const [px, py] = this.level.player;
    this.player = new Player(this, px * TILE + 8, py * TILE + 14);
    this.physics.add.collider(this.player, this.grayLayer);

    // people
    this.npcs = [];
    this.level.npcs.forEach((n, i) => {
      const person = personFor(this, this.levelIndex, this.level, n, i);
      const Cls = NPC_CLASSES[n.type];
      this.npcs.push(new Cls(this, n.at[0] * TILE + 8, n.at[1] * TILE + 14, person));
    });
    this.physics.add.collider(this.npcs, this.grayLayer);
    this.total = this.npcs.length;
    this.freedCount = 0;

    // each prop changes when the nearest person is freed
    for (const prop of this.props) {
      if (prop.type === 'eye') continue;
      let best = null;
      let bd = Infinity;
      for (const n of this.npcs) {
        const d = Math.hypot(n.x - prop.cx, n.y - prop.cy);
        if (d < bd) { bd = d; best = n; }
      }
      prop.link = best;
    }

    this.buildAmbient();

    // ground-level graphics
    this.coneGfx = this.add.graphics().setDepth(3.5);
    this.reticle = this.add.image(0, 0, 'reticle').setDepth(4100).setVisible(false);
    this.aimDot = this.add.image(0, 0, 'pebble').setDepth(4100).setAlpha(0.5);
    this.talkTag = this.add.image(0, 0, 'talktag').setDepth(5050).setVisible(false);

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
        icon: this.featuredTex(), buttons: [{ label: "LET'S GO", action: 'resume' }],
      });
    }
  }

  featuredTex() {
    const n = this.npcs.find((x) => x.kind === this.level.feature) || this.npcs[0];
    return n ? n.person.tex : null;
  }

  // ---------- map ----------
  buildMap() {
    const rows = normalizeMap(this.level.map);
    const theme = this.level.theme || 'hustle';
    this.tileIds = [];
    this.solid = [];
    this.flowers = [];
    this.billboards = [];
    rows.forEach((row, y) => {
      const ids = [];
      const sol = [];
      for (let x = 0; x < row.length; x++) {
        const id = tileIdFor(rows, x, y, theme);
        if (id === T.FLOWER) this.flowers.push({ x: x * TILE + 8, y: y * TILE + 12, key: `${x},${y}` });
        if (id === T.BILLBOARD) this.billboards.push({ x, y });
        ids.push(id);
        sol.push(isSolidTile(id));
      }
      this.tileIds.push(ids);
      this.solid.push(sol);
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

  // Props call this to block the tiles they stand on.
  markSolid(tx, ty) {
    if (!this.solid[ty] || tx < 0 || tx >= this.mapTW) return;
    this.solid[ty][tx] = true;
    const tile = this.grayLayer.getTileAt(tx, ty);
    if (tile) tile.setCollision(true, true, true, true, true);
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
      sparkle: this.add.particles(0, 0, 'sparkle', {
        ...base, speed: { min: 10, max: 40 }, lifespan: 600, tint: [0xffffff, 0xffe066, 0xff9fd0],
      }).setDepth(4600),
    };
  }

  // Weather and drifting stuff that fades as the block is freed.
  buildAmbient() {
    const view = { w: VIEW.width / VIEW.zoom + 40, h: VIEW.height / VIEW.zoom + 40 };
    const kind = this.level.ambient;
    const configs = {
      rain: {
        texture: 'raindrop', freq: 12,
        cfg: { x: { min: 0, max: view.w + 60 }, y: { min: -30, max: 0 }, speedY: { min: 260, max: 330 }, speedX: { min: -50, max: -35 }, lifespan: 1100, quantity: 2, alpha: { start: 0.8, end: 0.4 } },
      },
      flyers: {
        texture: 'flyer', freq: 650,
        cfg: { x: { min: -20, max: 0 }, y: { min: 0, max: view.h }, speedX: { min: 20, max: 45 }, speedY: { min: -6, max: 10 }, rotate: { min: -40, max: 40 }, lifespan: 12000 },
      },
      sparkles: {
        texture: 'sparkle', freq: 260,
        cfg: { x: { min: 0, max: view.w }, y: { min: 0, max: view.h }, scale: { start: 0, end: 1, ease: 'Sine.InOut', yoyo: true }, lifespan: 800, tint: [0xffffff, 0xff9fd0, 0x9fe8ff], alpha: 0.8 },
      },
      badges: {
        texture: 'badge', freq: 700,
        cfg: { x: { min: 0, max: view.w }, y: view.h, speedY: { min: -25, max: -12 }, lifespan: 9000, alpha: { start: 0.8, end: 0 } },
      },
    };
    const c = configs[kind];
    if (!c) return;
    this.ambientBase = c.freq;
    this.ambient = this.add.particles(0, 0, c.texture, { ...c.cfg, frequency: c.freq }).setDepth(4900);
    if (kind === 'rain') {
      Sfx.rain(true);
      this.events.once('shutdown', () => Sfx.rain(false));
    }
  }

  // ---------- helpers used by entities ----------
  isSolidAt(wx, wy) {
    const tx = Math.floor(wx / TILE);
    const ty = Math.floor(wy / TILE);
    if (tx < 0 || ty < 0 || tx >= this.mapTW || ty >= this.mapTH) return true;
    return this.solid[ty][tx];
  }

  // Distance a ray travels before hitting something solid (checked at ground level).
  rayLength(x, y, angle, max) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    for (let d = 4; d <= max; d += 4) {
      if (this.isSolidAt(x + cos * d, y + 8 + sin * d)) return d;
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
      .filter((f) => !this.claimedFlowers.has(f.key) && !this.isSolidAt(f.x, f.y))
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
      (o) => o !== npc && o.state === 'freed' && !o.talking && (o.mode === 'idle' || (o.mode === 'walk' && o.purpose === 'wander')) &&
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

  // ---------- aiming, talking & action ----------
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

  findTalkTarget() {
    const p = this.player;
    let best = null;
    let bd = TUNING.talk.range;
    for (const n of this.npcs) {
      if (n.state !== 'freed' || n.talking || n.mode === 'celebrate') continue;
      const d = Math.hypot(n.x - p.x, n.y - p.y);
      if (d < bd) { bd = d; best = n; }
    }
    return best;
  }

  doAction() {
    const p = this.player;
    // 1. deflect any doom headline in range
    if (p.parryCd <= 0) {
      const near = this.headlines.filter((h) => !h.reflected && !h.dead && Math.hypot(h.x - p.cx, h.y - p.cy) < TUNING.parry.radius);
      if (near.length) {
        near.forEach((h) => h.reflect());
        p.parryCd = TUNING.parry.cooldown;
        p.aim(near[0].x - p.cx, near[0].y - p.cy);
        Sfx.play('parry');
        this.popText(p.x, p.y - 34, 'DEFLECT!', '#ffe066');
        this.cameras.main.shake(80, 0.002);
        return;
      }
    }
    // 2. talk to a freed person
    if (this.talkTarget) {
      this.openDialogue(this.talkTarget);
      return;
    }
    // 3. shoot
    if (p.shootCd > 0) return;
    let dx = p.facing.x;
    let dy = p.facing.y;
    const t = this.aimTarget;
    if (t) {
      const d = Math.hypot(t.cx - p.cx, t.cy - p.cy);
      dx = (t.cx - p.cx) / d;
      dy = (t.cy - p.cy) / d;
    }
    this.pebbles.push(new Pebble(this, p.cx + dx * 9, p.cy + dy * 9, dx, dy));
    p.shootCd = TUNING.pebble.cooldown;
    p.aim(dx, dy);
    Sfx.play('shoot');
  }

  openDialogue(npc) {
    this.inDialogue = true;
    npc.startTalking();
    this.player.setVelocity(0, 0);
    this.talkTag.setVisible(false);
    Sfx.play('pop');
    this.scene.launch('Dialogue', { npc, person: npc.person, first: !npc.talked });
    this.scene.bringToTop('Dialogue');
    this.scene.pause();
  }

  // Called by the Dialogue scene when the conversation ends.
  onDialogueEnd(npc, first) {
    this.inDialogue = false;
    npc.stopTalking();
    this.scene.resume();
    if (first) {
      const before = this.meter.value;
      this.meter.value = Math.max(0, this.meter.value - TUNING.talk.calm);
      this.popText(this.player.x, this.player.y - 34, before > 0 ? 'CALM +' : 'NICE CHAT', '#9fffc0');
      this.fx.heart.explode(3, npc.x, npc.y - 30);
    }
  }

  // ---------- events ----------
  onNpcFreed(npc) {
    this.freedCount++;
    for (const prop of this.props) if (prop.link === npc) prop.transform();
    if (this.ambient) {
      const left = 1 - this.freedCount / this.total;
      if (left <= 0) {
        this.ambient.stop();
        Sfx.rain(false);
      }
      else this.ambient.frequency = this.ambientBase / left;
    }
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
    this.props.forEach((p) => p.type !== 'eye' && p.transform(true));
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
        body: `${this.total} people logged off. ${this.level.name} can breathe again.\n\nTip: freed people love to talk. Walk up and press ACTION.\n\nNext up: ${next ? next.name : ''}.`,
        icon: this.featuredTex(),
        buttons: last ? [{ label: 'MENU', action: 'menu' }] : [{ label: 'NEXT BLOCK', action: 'next' }, { label: 'STAY A WHILE', action: 'stay' }, { label: 'MENU', action: 'menu' }],
      }),
    );
  }

  bloomBillboards(done) {
    Sfx.play('bloom');
    this.cameras.main.flash(300, 255, 240, 200);
    const eye = this.props.find((p) => p.type === 'eye');
    if (eye) {
      eye.transform(true);
      this.tweens.add({ targets: eye.image, alpha: 0, delay: 900, duration: 700 });
    }
    this.billboards.forEach(({ x, y }, i) => {
      this.time.delayedCall(1200 + i * 70, () => {
        this.tileIds[y][x] = T.FLOWER;
        this.solid[y][x] = false;
        this.grayMap.putTileAt(T.FLOWER, x, y);
        this.colorMap.putTileAt(T.FLOWER, x, y);
        this.grayLayer.setCollision(SOLID);
        this.flowers.push({ x: x * TILE + 8, y: y * TILE + 12, key: `${x},${y}` });
        this.fx.heart.explode(2, x * TILE + 8, y * TILE + 8);
        this.fx.pollen.explode(4, x * TILE + 8, y * TILE + 8);
      });
    });
    this.time.delayedCall(1200 + this.billboards.length * 70 + 1800, done);
  }

  fail() {
    if (this.ending) return;
    this.ending = true;
    const p = this.player;
    p.onboard();
    p.setVelocity(0, 0);
    p.stun = 99;
    const { x: fx, y: fy } = p.phonePos();
    this.add.rectangle(fx, fy, 3, 5, 0xff3fb4).setStrokeStyle(1, 0x15151c).setDepth(p.depth + 1);
    this.add.image(fx, fy, 'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0xff3fb4).setDepth(p.depth + 1).setScale(0.6);
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
    const next = this.cleared && this.levelIndex < LEVELS.length - 1;
    this.showCard({
      kind: 'pause', title: 'PAUSED', body: 'Take a breath. The feed can wait.',
      buttons: next
        ? [{ label: 'RESUME', action: 'resume' }, { label: 'NEXT BLOCK', action: 'next' }, { label: 'MENU', action: 'menu' }]
        : [{ label: 'RESUME', action: 'resume' }, { label: 'RESTART', action: 'restart' }, { label: 'MENU', action: 'menu' }],
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

    const canAct = !this.ending || this.freeRoam;
    this.aimTarget = canAct ? this.findAimTarget() : null;
    this.talkTarget = canAct ? this.findTalkTarget() : null;
    if (p.consumeAction() && canAct) this.doAction();
    if (this.inDialogue) return;

    for (const n of this.npcs) n.update(dt);
    for (const prop of this.props) prop.update(dt);

    // pebbles
    const hitR = TUNING.pebble.hitRadius;
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
        if (Math.hypot(pb.x - n.cx, pb.y - n.cy) < hitR) {
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
        if (d < 9) {
          if (this.hurt(TUNING.doom.headlinePenalty)) this.popText(p.x, p.y - 34, 'DOOMED!', '#ff6b81');
          h.die();
        }
      } else if (h.target && h.target.state === 'locked' && Math.hypot(h.x - h.target.cx, h.y - h.target.cy) < 12) {
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

    // aim marker and talk tag
    const t = this.aimTarget;
    const tk = this.talkTarget;
    if (tk && !parryReady) {
      this.talkTag.setVisible(true).setPosition(tk.x, tk.y - 46 + Math.sin(time / 180) * 1.5);
      if (tk.bubble) tk.bubble.setVisible(false);
    } else {
      this.talkTag.setVisible(false);
    }
    if (t) {
      const td = Math.hypot(t.cx - p.cx, t.cy - p.cy) || 1;
      const good = t.isVulnerableTo((t.cx - p.cx) / td, (t.cy - p.cy) / td);
      this.reticle.setVisible(true).setPosition(t.cx, t.cy).setTint(good ? 0x5dff8a : 0xffffff).setAlpha(good ? 1 : 0.55);
      this.aimDot.setVisible(false);
    } else {
      this.reticle.setVisible(false);
      this.aimDot.setVisible(canAct && !tk).setPosition(p.cx + p.facing.x * 18, p.cy + p.facing.y * 18);
    }

    // ambient effects follow the camera
    if (this.ambient) {
      const v = this.cameras.main.worldView;
      this.ambient.setPosition(v.x - 20, v.y - 20);
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
