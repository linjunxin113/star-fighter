import { Entity } from './entity.js';
import { PLAYER_TYPES } from '../data/player-data.js';
import { Renderer, spriteCache, darkenColor, drawEngineFlame } from '../renderer.js';

export class Player extends Entity {
    constructor(game, shipType = 'balanced') {
        const cfg = PLAYER_TYPES[shipType];
        super(game.width / 2, game.height * 0.82);
        this.game = game;
        this.shipType = shipType;
        this.cfg = cfg;

        this.hitW = 18;
        this.hitH = 22;
        this.speed = cfg.speed;
        this.hp = cfg.maxHp;
        this.maxHp = cfg.maxHp;

        this.fireRate = cfg.fireRate;
        this.fireTimer = 0;
        this.bulletDamage = cfg.bulletDamage;
        this.fireLevel = 2;
        this.maxFireLevel = 8;

        this.invincible = false;
        this.invincibleTimer = 0;
        this.invincibleDuration = 2.5;
        this.blinkTimer = 0;

        this.shield = false;
        this.shieldTimer = 0;
        this.magnet = false;
        this.magnetTimer = 0;
        this.magnetRange = 150;
        this.spread = false;
        this.spreadTimer = 0;

        this.trailTimer = 0;
        this.time = 0;

        // 预缓存战机精灵
        this._cacheSprite();
    }

    _cacheSprite() {
        const key = `ship_${this.shipType}_${this.cfg.color}`;
        const color = this.cfg.color;
        const glow = this.cfg.glowColor;

        spriteCache.getOrCreate(key, 56, 56, (c, cx, cy) => {
            if (this.shipType === 'speed') {
                this._drawSpeedShip(c, cx, cy, color, glow);
            } else if (this.shipType === 'heavy') {
                this._drawHeavyShip(c, cx, cy, color, glow);
            } else {
                this._drawBalancedShip(c, cx, cy, color, glow);
            }
        });
    }

    _drawBalancedShip(c, cx, cy, color, glow) {
        // 猎鹰 - 经典后掠翼战斗机
        c.beginPath();
        c.moveTo(cx, cy - 22);
        c.lineTo(cx + 4, cy - 16);
        c.lineTo(cx + 6, cy - 8);
        c.lineTo(cx + 20, cy + 4);
        c.lineTo(cx + 22, cy + 8);
        c.lineTo(cx + 14, cy + 6);
        c.lineTo(cx + 8, cy + 10);
        c.lineTo(cx + 5, cy + 16);
        c.lineTo(cx + 3, cy + 18);
        c.lineTo(cx + 3, cy + 14);
        c.lineTo(cx - 3, cy + 14);
        c.lineTo(cx - 3, cy + 18);
        c.lineTo(cx - 5, cy + 16);
        c.lineTo(cx - 8, cy + 10);
        c.lineTo(cx - 14, cy + 6);
        c.lineTo(cx - 22, cy + 8);
        c.lineTo(cx - 20, cy + 4);
        c.lineTo(cx - 6, cy - 8);
        c.lineTo(cx - 4, cy - 16);
        c.closePath();
        const grad = c.createLinearGradient(cx, cy - 22, cx, cy + 18);
        grad.addColorStop(0, glow);
        grad.addColorStop(0.4, color);
        grad.addColorStop(1, darkenColor(color, 0.5));
        c.fillStyle = grad;
        c.fill();
        c.strokeStyle = glow;
        c.lineWidth = 1;
        c.stroke();

        // 驾驶舱
        c.beginPath();
        c.moveTo(cx, cy - 18);
        c.lineTo(cx + 3, cy - 10);
        c.lineTo(cx, cy - 6);
        c.lineTo(cx - 3, cy - 10);
        c.closePath();
        const cockpit = c.createLinearGradient(cx, cy - 18, cx, cy - 6);
        cockpit.addColorStop(0, 'rgba(150,220,255,0.95)');
        cockpit.addColorStop(0.4, 'rgba(200,240,255,0.8)');
        cockpit.addColorStop(1, 'rgba(50,120,200,0.6)');
        c.fillStyle = cockpit;
        c.fill();
        // 驾驶舱高光
        c.save();
        c.globalAlpha = 0.5;
        c.beginPath();
        c.ellipse(cx - 0.5, cy - 14, 1.2, 2.5, -0.2, 0, Math.PI * 2);
        c.fillStyle = '#ffffff';
        c.fill();
        c.restore();

        // 高光条（机体上方）
        c.save();
        c.globalAlpha = 0.08;
        c.beginPath();
        c.moveTo(cx, cy - 22);
        c.lineTo(cx + 4, cy - 16);
        c.lineTo(cx + 6, cy - 8);
        c.lineTo(cx - 6, cy - 8);
        c.lineTo(cx - 4, cy - 16);
        c.closePath();
        c.fillStyle = '#ffffff';
        c.fill();
        c.restore();

        // 面板线（中线 + 横线）
        c.strokeStyle = 'rgba(255,255,255,0.12)';
        c.lineWidth = 0.4;
        c.beginPath(); c.moveTo(cx, cy - 20); c.lineTo(cx, cy + 12); c.stroke();
        c.beginPath(); c.moveTo(cx - 5, cy); c.lineTo(cx + 5, cy); c.stroke();
        c.beginPath(); c.moveTo(cx - 4, cy + 6); c.lineTo(cx + 4, cy + 6); c.stroke();

        // 机翼线
        c.strokeStyle = 'rgba(255,255,255,0.15)';
        c.lineWidth = 0.5;
        c.beginPath(); c.moveTo(cx + 6, cy - 6); c.lineTo(cx + 18, cy + 5); c.stroke();
        c.beginPath(); c.moveTo(cx - 6, cy - 6); c.lineTo(cx - 18, cy + 5); c.stroke();

        // 铆钉点
        c.fillStyle = 'rgba(255,255,255,0.25)';
        for (const [rx, ry] of [[cx-3, cy+2], [cx+3, cy+2], [cx-10, cy+4], [cx+10, cy+4], [cx, cy+10]]) {
            c.beginPath(); c.arc(rx, ry, 0.6, 0, Math.PI * 2); c.fill();
        }
    }

    _drawSpeedShip(c, cx, cy, color, glow) {
        // 幻影 - 细长前掠翼隐形战机
        c.beginPath();
        c.moveTo(cx, cy - 24);
        c.lineTo(cx + 2, cy - 18);
        c.lineTo(cx + 3, cy - 6);
        c.lineTo(cx + 18, cy - 10);
        c.lineTo(cx + 16, cy - 6);
        c.lineTo(cx + 5, cy + 2);
        c.lineTo(cx + 8, cy + 10);
        c.lineTo(cx + 6, cy + 14);
        c.lineTo(cx + 3, cy + 10);
        c.lineTo(cx + 2, cy + 16);
        c.lineTo(cx - 2, cy + 16);
        c.lineTo(cx - 3, cy + 10);
        c.lineTo(cx - 6, cy + 14);
        c.lineTo(cx - 8, cy + 10);
        c.lineTo(cx - 5, cy + 2);
        c.lineTo(cx - 16, cy - 6);
        c.lineTo(cx - 18, cy - 10);
        c.lineTo(cx - 3, cy - 6);
        c.lineTo(cx - 2, cy - 18);
        c.closePath();
        const grad = c.createLinearGradient(cx, cy - 24, cx, cy + 16);
        grad.addColorStop(0, glow);
        grad.addColorStop(0.5, color);
        grad.addColorStop(1, darkenColor(color, 0.4));
        c.fillStyle = grad;
        c.fill();
        c.strokeStyle = glow;
        c.lineWidth = 0.8;
        c.stroke();

        // 驾驶舱
        c.beginPath();
        c.moveTo(cx, cy - 20);
        c.lineTo(cx + 2, cy - 12);
        c.lineTo(cx, cy - 8);
        c.lineTo(cx - 2, cy - 12);
        c.closePath();
        c.fillStyle = 'rgba(120,255,150,0.8)';
        c.fill();
        // 驾驶舱高光
        c.save();
        c.globalAlpha = 0.5;
        c.beginPath();
        c.ellipse(cx - 0.3, cy - 16, 0.8, 2, -0.2, 0, Math.PI * 2);
        c.fillStyle = '#ffffff';
        c.fill();
        c.restore();

        // 高光条（机体上方）
        c.save();
        c.globalAlpha = 0.07;
        c.beginPath();
        c.moveTo(cx, cy - 24);
        c.lineTo(cx + 2, cy - 18);
        c.lineTo(cx + 3, cy - 6);
        c.lineTo(cx - 3, cy - 6);
        c.lineTo(cx - 2, cy - 18);
        c.closePath();
        c.fillStyle = '#ffffff';
        c.fill();
        c.restore();

        // 面板线
        c.strokeStyle = 'rgba(255,255,255,0.12)';
        c.lineWidth = 0.4;
        c.beginPath(); c.moveTo(cx, cy - 22); c.lineTo(cx, cy + 14); c.stroke();
        c.beginPath(); c.moveTo(cx - 3, cy - 2); c.lineTo(cx + 3, cy - 2); c.stroke();

        // 铆钉点
        c.fillStyle = 'rgba(255,255,255,0.25)';
        for (const [rx, ry] of [[cx-2, cy+4], [cx+2, cy+4], [cx-8, cy-6], [cx+8, cy-6]]) {
            c.beginPath(); c.arc(rx, ry, 0.5, 0, Math.PI * 2); c.fill();
        }
    }

    _drawHeavyShip(c, cx, cy, color, glow) {
        // 堡垒 - 重型轰炸机
        c.beginPath();
        c.moveTo(cx, cy - 16);
        c.lineTo(cx + 6, cy - 14);
        c.lineTo(cx + 10, cy - 8);
        c.lineTo(cx + 12, cy - 2);
        c.lineTo(cx + 24, cy + 2);
        c.lineTo(cx + 26, cy + 8);
        c.lineTo(cx + 20, cy + 10);
        c.lineTo(cx + 14, cy + 8);
        c.lineTo(cx + 10, cy + 14);
        c.lineTo(cx + 6, cy + 18);
        c.lineTo(cx + 4, cy + 14);
        c.lineTo(cx - 4, cy + 14);
        c.lineTo(cx - 6, cy + 18);
        c.lineTo(cx - 10, cy + 14);
        c.lineTo(cx - 14, cy + 8);
        c.lineTo(cx - 20, cy + 10);
        c.lineTo(cx - 26, cy + 8);
        c.lineTo(cx - 24, cy + 2);
        c.lineTo(cx - 12, cy - 2);
        c.lineTo(cx - 10, cy - 8);
        c.lineTo(cx - 6, cy - 14);
        c.closePath();
        const grad = c.createLinearGradient(cx, cy - 16, cx, cy + 18);
        grad.addColorStop(0, glow);
        grad.addColorStop(0.3, color);
        grad.addColorStop(1, darkenColor(color, 0.4));
        c.fillStyle = grad;
        c.fill();
        c.strokeStyle = glow;
        c.lineWidth = 1.5;
        c.stroke();

        // 驾驶舱
        c.beginPath();
        c.moveTo(cx - 4, cy - 12);
        c.lineTo(cx + 4, cy - 12);
        c.lineTo(cx + 3, cy - 4);
        c.lineTo(cx - 3, cy - 4);
        c.closePath();
        const cockpitH = c.createLinearGradient(cx, cy - 12, cx, cy - 4);
        cockpitH.addColorStop(0, 'rgba(255,220,150,0.85)');
        cockpitH.addColorStop(0.3, 'rgba(255,200,120,0.7)');
        cockpitH.addColorStop(1, 'rgba(200,120,60,0.5)');
        c.fillStyle = cockpitH;
        c.fill();
        // 驾驶舱高光
        c.save();
        c.globalAlpha = 0.45;
        c.beginPath();
        c.ellipse(cx - 1, cy - 10, 1.5, 1.8, -0.2, 0, Math.PI * 2);
        c.fillStyle = '#ffffff';
        c.fill();
        c.restore();

        // 高光条（机体上方）
        c.save();
        c.globalAlpha = 0.08;
        c.beginPath();
        c.moveTo(cx, cy - 16);
        c.lineTo(cx + 6, cy - 14);
        c.lineTo(cx + 10, cy - 8);
        c.lineTo(cx - 10, cy - 8);
        c.lineTo(cx - 6, cy - 14);
        c.closePath();
        c.fillStyle = '#ffffff';
        c.fill();
        c.restore();

        // 武器舱
        c.fillStyle = 'rgba(255,255,255,0.12)';
        c.fillRect(cx + 16, cy + 2, 6, 8);
        c.fillRect(cx - 22, cy + 2, 6, 8);

        // 面板线（中线 + 横线）
        c.strokeStyle = 'rgba(255,255,255,0.12)';
        c.lineWidth = 0.4;
        c.beginPath(); c.moveTo(cx, cy - 14); c.lineTo(cx, cy + 12); c.stroke();
        c.beginPath(); c.moveTo(cx - 8, cy); c.lineTo(cx + 8, cy); c.stroke();
        c.beginPath(); c.moveTo(cx - 6, cy + 6); c.lineTo(cx + 6, cy + 6); c.stroke();

        // 装甲线
        c.strokeStyle = 'rgba(255,255,255,0.1)';
        c.lineWidth = 0.5;
        c.beginPath(); c.moveTo(cx - 8, cy - 6); c.lineTo(cx - 8, cy + 10); c.stroke();
        c.beginPath(); c.moveTo(cx + 8, cy - 6); c.lineTo(cx + 8, cy + 10); c.stroke();

        // 铆钉点
        c.fillStyle = 'rgba(255,255,255,0.25)';
        for (const [rx, ry] of [[cx-4, cy+2], [cx+4, cy+2], [cx-12, cy+4], [cx+12, cy+4], [cx-18, cy+6], [cx+18, cy+6]]) {
            c.beginPath(); c.arc(rx, ry, 0.7, 0, Math.PI * 2); c.fill();
        }
    }

    update(dt) {
        this.time += dt;
        const input = this.game.input;

        const touchTarget = input.getTouchTarget();
        if (touchTarget) {
            const dx = touchTarget.x - this.x;
            const dy = touchTarget.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 2) {
                const moveSpeed = this.speed * dt;
                if (dist < moveSpeed) {
                    this.x = touchTarget.x;
                    this.y = touchTarget.y;
                } else {
                    this.x += (dx / dist) * moveSpeed;
                    this.y += (dy / dist) * moveSpeed;
                }
            }
        }

        const move = input.getMovement();
        if (move.keyboard) {
            this.x += move.dx * this.speed * dt;
            this.y += move.dy * this.speed * dt;
        }

        const margin = 14;
        this.x = Math.max(margin, Math.min(this.game.width - margin, this.x));
        this.y = Math.max(margin, Math.min(this.game.height - margin, this.y));

        this.fireTimer -= dt;
        if (this.fireTimer <= 0) {
            this.shoot();
            this.fireTimer = this.fireRate;
        }

        if (this.invincible) {
            this.invincibleTimer -= dt;
            this.blinkTimer += dt;
            if (this.invincibleTimer <= 0) this.invincible = false;
        }

        if (this.shield) { this.shieldTimer -= dt; if (this.shieldTimer <= 0) this.shield = false; }
        if (this.magnet) { this.magnetTimer -= dt; if (this.magnetTimer <= 0) this.magnet = false; }
        if (this.spread) { this.spreadTimer -= dt; if (this.spreadTimer <= 0) this.spread = false; }

        this.trailTimer += dt;
        if (this.trailTimer > 0.03) {
            this.trailTimer = 0;
            this.game.particleSystem.createTrail(this.x, this.y + 14, this.cfg.glowColor);
        }
    }

    shoot() {
        const { Bullet } = this.game._bulletModule;
        const bx = this.x, by = this.y - 14;
        const dmg = this.bulletDamage;
        const color = this.cfg.color;
        const fl = this.fireLevel;

        if (this.game.audio) this.game.audio.playLaser(this.shipType);
        this.game.particleSystem.createMuzzleFlash(bx, by, color);

        if (this.spread) {
            // Spread 模式增强: 弹数 = 5 + floor(fireLevel/2)*2，最高 11 发扇形
            const count = Math.min(5 + Math.floor(fl / 2) * 2, 11);
            const totalAngle = 0.5 + count * 0.03; // 扇面角度随弹数微增
            for (let i = 0; i < count; i++) {
                const a = -totalAngle / 2 + (totalAngle / (count - 1)) * i;
                this.game.bullets.push(new Bullet(bx, by, Math.sin(a) * 420, -Math.cos(a) * 420, dmg * 0.85, color, false, fl));
            }
        } else {
            switch (fl) {
                case 1:
                    this.game.bullets.push(new Bullet(bx, by, 0, -450, dmg, color, false, fl));
                    break;
                case 2:
                    this.game.bullets.push(new Bullet(bx - 6, by, 0, -450, dmg, color, false, fl));
                    this.game.bullets.push(new Bullet(bx + 6, by, 0, -450, dmg, color, false, fl));
                    break;
                case 3:
                    this.game.bullets.push(new Bullet(bx, by, 0, -460, dmg, color, false, fl));
                    this.game.bullets.push(new Bullet(bx - 10, by + 4, 0, -440, dmg * 0.8, color, false, fl));
                    this.game.bullets.push(new Bullet(bx + 10, by + 4, 0, -440, dmg * 0.8, color, false, fl));
                    break;
                case 4:
                    this.game.bullets.push(new Bullet(bx - 5, by, 0, -460, dmg, color, false, fl));
                    this.game.bullets.push(new Bullet(bx + 5, by, 0, -460, dmg, color, false, fl));
                    this.game.bullets.push(new Bullet(bx - 14, by + 4, -20, -440, dmg * 0.7, color, false, fl));
                    this.game.bullets.push(new Bullet(bx + 14, by + 4, 20, -440, dmg * 0.7, color, false, fl));
                    break;
                case 5:
                    this.game.bullets.push(new Bullet(bx, by - 2, 0, -480, dmg * 1.2, color, false, fl));
                    this.game.bullets.push(new Bullet(bx - 8, by, 0, -460, dmg, color, false, fl));
                    this.game.bullets.push(new Bullet(bx + 8, by, 0, -460, dmg, color, false, fl));
                    this.game.bullets.push(new Bullet(bx - 16, by + 4, -30, -440, dmg * 0.7, color, false, fl));
                    this.game.bullets.push(new Bullet(bx + 16, by + 4, 30, -440, dmg * 0.7, color, false, fl));
                    break;
                case 6:
                    // 6发: 中央双发 + 两侧各一对斜射
                    this.game.bullets.push(new Bullet(bx - 4, by, 0, -470, dmg * 1.1, color, false, fl));
                    this.game.bullets.push(new Bullet(bx + 4, by, 0, -470, dmg * 1.1, color, false, fl));
                    this.game.bullets.push(new Bullet(bx - 12, by + 2, -40, -450, dmg * 0.8, color, false, fl));
                    this.game.bullets.push(new Bullet(bx + 12, by + 2, 40, -450, dmg * 0.8, color, false, fl));
                    this.game.bullets.push(new Bullet(bx - 20, by + 6, -70, -420, dmg * 0.6, color, false, fl));
                    this.game.bullets.push(new Bullet(bx + 20, by + 6, 70, -420, dmg * 0.6, color, false, fl));
                    break;
                case 7:
                    // 8发: 中央三发 + 两侧扇形 + 后方斜射
                    this.game.bullets.push(new Bullet(bx, by - 2, 0, -490, dmg * 1.3, color, false, fl));
                    this.game.bullets.push(new Bullet(bx - 6, by, 0, -470, dmg, color, false, fl));
                    this.game.bullets.push(new Bullet(bx + 6, by, 0, -470, dmg, color, false, fl));
                    this.game.bullets.push(new Bullet(bx - 14, by + 2, -50, -450, dmg * 0.8, color, false, fl));
                    this.game.bullets.push(new Bullet(bx + 14, by + 2, 50, -450, dmg * 0.8, color, false, fl));
                    this.game.bullets.push(new Bullet(bx - 22, by + 6, -90, -400, dmg * 0.6, color, false, fl));
                    this.game.bullets.push(new Bullet(bx + 22, by + 6, 90, -400, dmg * 0.6, color, false, fl));
                    this.game.bullets.push(new Bullet(bx - 10, by + 10, -120, -300, dmg * 0.5, color, false, fl));
                    this.game.bullets.push(new Bullet(bx + 10, by + 10, 120, -300, dmg * 0.5, color, false, fl));
                    break;
                default: {
                    // 等级8+: 11-13发全方位密集弹幕，覆盖前方120°扇面
                    const count = Math.min(11 + (fl - 8) * 2, 13);
                    const fanAngle = Math.PI * 2 / 3; // 120度
                    // 中央强化弹
                    this.game.bullets.push(new Bullet(bx, by - 4, 0, -500, dmg * 1.5, color, false, fl));
                    for (let i = 0; i < count - 1; i++) {
                        const a = -fanAngle / 2 + (fanAngle / (count - 2)) * i;
                        const spd = 460 - Math.abs(a) * 60;
                        const d = dmg * (1.0 - Math.abs(a) * 0.5);
                        const ox = Math.sin(a) * 8;
                        this.game.bullets.push(new Bullet(bx + ox, by + Math.abs(a) * 8, Math.sin(a) * spd, -Math.cos(a) * spd, d, color, false, fl));
                    }
                    break;
                }
            }
        }
    }

    takeDamage(amount) {
        if (this.invincible) return;
        if (this.shield) {
            this.shield = false;
            this.shieldTimer = 0;
            this.game.particleSystem.createExplosion(this.x, this.y, 10, '#40c4ff');
            this.invincible = true;
            this.invincibleTimer = 0.5;
            if (this.game.audio) this.game.audio.playShieldHit();
            return;
        }
        this.hp -= amount;
        this.game.particleSystem.createExplosion(this.x, this.y, 8, this.cfg.color);
        if (this.game.effects) {
            this.game.effects.shake(5, 0.2);
            this.game.effects.flash('#ff0000', 0.15);
            this.game.effects.borderGlow('#ff0000', 0.3);
        }
        if (this.game.audio) this.game.audio.playPlayerDamage();
        if (this.game.input) this.game.input.vibrate(100);
        if (this.hp <= 0) {
            this.alive = false;
            this.game.particleSystem.createExplosion(this.x, this.y, 40, this.cfg.color);
            if (this.game.input) this.game.input.vibrate([100, 50, 200]);
        } else {
            this.invincible = true;
            this.invincibleTimer = this.invincibleDuration;
            this.blinkTimer = 0;
        }
    }

    render(ctx) {
        if (this.invincible && Math.floor(this.blinkTimer * 10) % 2 === 0) return;

        const { x, y, cfg } = this;
        ctx.save();

        // 发光
        Renderer.drawGlow(ctx, x, y, 35, cfg.glowColor, 0.12);

        // 引擎喷焰（实时绘制）- 增大 40%
        if (this.shipType === 'heavy') {
            drawEngineFlame(ctx, x - 7, y + 16, 7, 17 + Math.sin(this.time * 18) * 7, cfg.glowColor);
            drawEngineFlame(ctx, x + 7, y + 16, 7, 17 + Math.sin(this.time * 18 + 0.5) * 7, cfg.glowColor);
            // 中央白色喷焰
            drawEngineFlame(ctx, x, y + 16, 4, 12 + Math.sin(this.time * 22) * 5, '#ffffff');
        } else if (this.shipType === 'speed') {
            drawEngineFlame(ctx, x - 2, y + 14, 3.5, 10 + Math.sin(this.time * 25) * 4, cfg.glowColor);
            drawEngineFlame(ctx, x + 2, y + 14, 3.5, 10 + Math.sin(this.time * 25 + 1) * 4, cfg.glowColor);
        } else {
            drawEngineFlame(ctx, x, y + 16, 5.6, 14 + Math.sin(this.time * 20) * 5.6, cfg.glowColor);
        }

        // 缓存的机体精灵
        const key = `ship_${this.shipType}_${cfg.color}`;
        spriteCache.draw(ctx, key, x, y);

        // 护盾 - 旋转能量环
        if (this.shield) {
            this._drawShield(ctx, x, y);
        }

        ctx.restore();
    }

    _drawShield(ctx, x, y) {
        const t = this.time * 3;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(t);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            const r = 24 + Math.sin(t * 2 + i) * 2;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(64,196,255,${0.5 + 0.3 * Math.sin(t * 4)})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        // 第二层反向
        ctx.rotate(-t * 2);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i + Math.PI / 6;
            const px = Math.cos(angle) * 28;
            const py = Math.sin(angle) * 28;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(64,196,255,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }
}
