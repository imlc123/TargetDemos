import { FONT } from '../config.js';
import { Save } from '../systems/Save.js';
import { Sfx } from '../systems/Sfx.js';
import { TouchControls } from '../systems/TouchControls.js';

const lerpColor = (a, b, t) => {
  const c = Phaser.Display.Color.Interpolate.ColorWithColor(
    Phaser.Display.Color.ValueToColor(a), Phaser.Display.Color.ValueToColor(b), 100, Math.round(t * 100),
  );
  return Phaser.Display.Color.GetColor(c.r, c.g, c.b);
};

// HUD drawn on top of the game: Algorithm meter, freed counter, buttons, touch controls.
export class UIScene extends Phaser.Scene {
  constructor() {
    super('UI');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.vignette = this.add.image(W / 2, H / 2, 'vignette').setDisplaySize(W, H).setAlpha(0);

    // Algorithm meter
    this.add.text(24, 16, 'ALGORITHM', { fontFamily: FONT, fontSize: '12px', color: '#cdbfff' });
    this.add.rectangle(24, 36, 252, 20, 0x1a1428).setOrigin(0).setStrokeStyle(3, 0x5b4a8a);
    this.bar = this.add.rectangle(28, 40, 0, 12, 0x8a5cff).setOrigin(0);
    this.warn = this.add.text(286, 38, '', { fontFamily: FONT, fontSize: '10px', color: '#ff5fa2' });

    // freed counter + level name
    this.freedText = this.add.text(W - 24, 70, '', { fontFamily: FONT, fontSize: '14px', color: '#ffe066' }).setOrigin(1, 0);
    this.levelText = this.add.text(W / 2, 20, '', { fontFamily: FONT, fontSize: '12px', color: '#ffffff' }).setOrigin(0.5, 0).setAlpha(0.8);

    // top-right buttons
    this.iconBtn(W - 44, 36, (g) => {
      g.fillStyle(0xffffff).fillRect(-8, -9, 5, 18).fillRect(3, -9, 5, 18);
    }, () => this.gameScene()?.openPause());
    this.muteIcon = this.iconBtn(W - 100, 36, (g) => this.drawSpeaker(g), () => this.toggleMute());
    if (this.sys.game.device.input.touch && this.scale.fullscreenAvailable) {
      this.iconBtn(W - 156, 36, (g) => {
        g.lineStyle(3, 0xffffff);
        g.strokeRect(-9, -9, 18, 18);
        g.fillStyle(0x2a1f44).fillRect(-4, -11, 8, 22).fillRect(-11, -4, 22, 8);
      }, () => this.toggleFullscreen(), true);
    }

    // desktop hint
    if (!this.sys.game.device.input.touch) {
      const hint = this.add
        .text(W / 2, H - 26, 'WASD / Arrows: move    Space: shoot / deflect / talk    Esc: pause', { fontFamily: FONT, fontSize: '10px', color: '#ffffff' })
        .setOrigin(0.5)
        .setAlpha(0.7);
      this.time.delayedCall(9000, () => this.tweens.add({ targets: hint, alpha: 0, duration: 800 }));
    }

    // boss bar (only during the finale)
    this.bossBar = this.add.container(W / 2, 54).setVisible(false);
    const bb = this.add.rectangle(0, 0, 420, 52, 0x140a1e, 0.85).setStrokeStyle(3, 0xff3fb4);
    const bt = this.add.text(-196, -18, 'THE ENDLESS SCROLL', { fontFamily: FONT, fontSize: '11px', color: '#ff9fd8' });
    this.bossPips = [0, 1, 2].map((i) => this.add.rectangle(130 + i * 26, -12, 20, 10, 0xff3fb4).setStrokeStyle(2, 0xffffff));
    this.bossStatus = this.add.text(0, 10, '', { fontFamily: FONT, fontSize: '10px', color: '#ffffff' }).setOrigin(0.5, 0);
    this.bossBar.add([bb, bt, ...this.bossPips, this.bossStatus]);

    this.touch = new TouchControls(this, this.registry.get('touch'));
    this.input.keyboard.on('keydown-M', () => this.toggleMute());
    this.events.on('shutdown', () => this.touch.destroy());
  }

  gameScene() {
    const g = this.scene.get('Game');
    if (!g || !g.meter) return null;
    const st = g.sys.settings.status;
    return st === Phaser.Scenes.RUNNING || st === Phaser.Scenes.PAUSED ? g : null;
  }

  iconBtn(x, y, draw, onClick, onUp = false) {
    const bg = this.add.rectangle(x, y, 44, 44, 0x2a1f44, 0.85).setStrokeStyle(3, 0x8a5cff);
    const g = this.add.graphics({ x, y });
    draw(g);
    bg.setInteractive({ useHandCursor: true });
    bg.on(onUp ? 'pointerup' : 'pointerdown', () => {
      if (this.scene.isActive('Card') || this.scene.isActive('Dialogue')) return;
      Sfx.unlock();
      onClick();
    });
    return g;
  }

  drawSpeaker(g) {
    g.clear();
    g.fillStyle(0xffffff).fillRect(-10, -4, 6, 8).fillTriangle(-4, -4, 2, -10, 2, 10).fillTriangle(-4, 4, 2, -10, 2, 10);
    if (Sfx.muted) {
      g.lineStyle(3, 0xff5fa2).lineBetween(5, -5, 12, 5).lineBetween(12, -5, 5, 5);
    } else {
      g.lineStyle(2, 0xffffff).beginPath().arc(3, 0, 6, -0.9, 0.9).strokePath();
      g.beginPath().arc(3, 0, 10, -0.9, 0.9).strokePath();
    }
  }

  toggleMute() {
    const m = !Sfx.muted;
    Sfx.setMuted(m);
    Save.setMuted(m);
    this.drawSpeaker(this.muteIcon);
  }

  toggleFullscreen() {
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
    } else {
      this.scale.startFullscreen();
      try {
        window.screen.orientation?.lock?.('landscape').catch(() => {});
      } catch (e) {
        /* not supported */
      }
    }
  }

  update() {
    const g = this.gameScene();
    if (!g) return;
    const m = g.meter;
    const r = m.ratio;
    this.bar.width = 244 * r;
    const flash = m.flash > 0 && Math.floor(m.flash * 20) % 2 === 0;
    this.bar.setFillStyle(flash ? 0xffffff : lerpColor(0x8a5cff, 0xff3b6b, r));
    this.warn.setText(r > 0.7 ? 'LOG OFF!' : '');
    this.warn.setVisible(Math.floor(this.time.now / 300) % 2 === 0);
    this.vignette.setAlpha(Math.max(0, (r - 0.35) / 0.65) * 0.9);
    this.freedText.setText(g.level.boss ? `FREED ${g.freedCount}` : `FREED ${g.freedCount}/${g.total}`);
    const b = g.boss;
    this.bossBar.setVisible(!!b);
    if (b) {
      this.bossPips.forEach((pip, i) => pip.setFillStyle(i < 3 - b.cracks ? 0xff3fb4 : 0x2a1f44));
      this.bossStatus.setText(b.statusText());
      this.bossStatus.setColor(b.mode === 'open' ? '#9fffc0' : '#ffffff');
    }
    this.levelText.setVisible(!b);
    this.levelText.setText(g.level.name.toUpperCase());
    this.touch.update(g);
  }
}
