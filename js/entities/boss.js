import { Entity } from './entity.js';
import { Bullet } from './bullet.js';
import { Enemy } from './enemy.js';
import { Renderer, darkenColor, lightenColor } from '../renderer.js';

export class Boss extends Entity {
    constructor(game, data) {
        super(game.width / 2, -80);
        this.game = game;
        this.name = data.name;
        this.hp = data.hp;
        this.maxHp = data.hp;
        this.scoreValue = data.scoreValue;
        this.color = data.color;
        this.glowColor = data.glowColor;
        this.size = data.size;
        this.hitW = data.hitW;
        this.hitH = data.hitH;
        this.phases = data.phases;
        this.mechanics = data.mechanics || [];

        this.targetY = 100;
        this.phase = 0;
        this.fireTimer = 0;
        this.time = 0;
        this.spiralAngle = 0;
        this.hitFlash = 0;
        this.crossAngle = 0;

        // 特殊机制状态
        this.teleporting = false;
        this.teleportTimer = 0;
        this.teleportCooldown = 8;
        this.teleportAlpha = 1;

        this.summonCooldown = 12;
        this.summonTimer = 0;

        this.shielded = false;
        this.shieldCooldown = 15;
        this.shieldTimer = 0;
        this.shieldDuration = 4;
        this.shieldActiveTimer = 0;

        // laser 攻击状态
        this.laserBurstCount = 0;
        this.laserBurstTimer = 0;
        this.laserAngle = Math.PI / 2;

        this._updatePhase();
    }

    _updatePhase() {
        const ratio = this.hp / this.maxHp;
        for (let i = this.phases.length - 1; i >= 0; i--) {
            if (ratio > this.phases[i].hpThreshold) { this.phase = i; break; }
            this.phase = i;
        }
        this.currentPhase = this.phases[this.phase];
    }

    updateIntro(dt, progress) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        const p = Math.min(1, progress);
        const eased = 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
        this.y = -80 + (this.targetY + 80) * eased;
        this.time += dt;
        if (Math.random() < 0.3) {
            const ox = (Math.random() - 0.5) * this.size * 2;
            const oy = (Math.random() - 0.5) * this.size;
            this.game.particleSystem.createHitSpark(this.x + ox, this.y + oy);
        }
    }

    update(dt) {
        this.time += dt;
        const prevPhase = this.phase;
        this._updatePhase();
        if (this.phase !== prevPhase && this.phase > prevPhase) {
            this.game.particleSystem.createPhaseTransition(this.x, this.y, this.glowColor);
            if (this.game.effects) {
                this.game.effects.flash(this.glowColor, 0.3);
                this.game.effects.shake(6, 0.3);
            }
        }
        if (this.hitFlash > 0) this.hitFlash -= dt;

        // 特殊机制更新
        this._updateMechanics(dt);

        // 移动（瞬移期间不移动）
        if (!this.teleporting) {
            const moveRange = this.game.width * 0.35;
            this.x = this.game.width / 2 + Math.sin(this.time * 0.8) * moveRange;
            this.y = this.targetY + Math.sin(this.time * 0.5) * 20;
        }

        // laser burst 连射
        if (this.laserBurstCount > 0) {
            this.laserBurstTimer -= dt;
            if (this.laserBurstTimer <= 0) {
                this._fireLaserBullet();
                this.laserBurstCount--;
                this.laserBurstTimer = 0.06;
            }
        }

        // 普通射击
        this.fireTimer -= dt;
        if (this.fireTimer <= 0 && !this.teleporting) {
            this.fireTimer = this.currentPhase.fireRate;
            this._fire(this.currentPhase.pattern);
        }
    }

    _updateMechanics(dt) {
        // 瞬移
        if (this.mechanics.includes('teleport')) {
            this.teleportTimer += dt;
            if (this.teleporting) {
                // 渐隐/渐显
                if (this.teleportTimer < 0.3) {
                    this.teleportAlpha = 1 - this.teleportTimer / 0.3;
                } else if (this.teleportTimer < 0.4) {
                    // 瞬移到新位置
                    if (this.teleportAlpha <= 0.05) {
                        this.x = 60 + Math.random() * (this.game.width - 120);
                        this.y = 60 + Math.random() * 80;
                    }
                    this.teleportAlpha = 0;
                } else if (this.teleportTimer < 0.7) {
                    this.teleportAlpha = (this.teleportTimer - 0.4) / 0.3;
                } else {
                    this.teleportAlpha = 1;
                    this.teleporting = false;
                    this.teleportTimer = 0;
                }
            } else if (this.teleportTimer >= this.teleportCooldown) {
                this.teleporting = true;
                this.teleportTimer = 0;
            }
        }

        // 自动召唤
        if (this.mechanics.includes('summonTimer')) {
            this.summonTimer += dt;
            if (this.summonTimer >= this.summonCooldown) {
                this.summonTimer = 0;
                this._summonMinions();
            }
        }

        // 护盾
        if (this.mechanics.includes('shield')) {
            if (this.shielded) {
                this.shieldActiveTimer -= dt;
                if (this.shieldActiveTimer <= 0) {
                    this.shielded = false;
                    this.shieldTimer = 0;
                }
            } else {
                this.shieldTimer += dt;
                if (this.shieldTimer >= this.shieldCooldown) {
                    this.shielded = true;
                    this.shieldActiveTimer = this.shieldDuration;
                }
            }
        }
    }

    _summonMinions() {
        const count = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
            const ox = (i - (count - 1) / 2) * 50;
            const enemy = new Enemy(this.game, 'small', this.x + ox, this.y + 30, 'sine');
            this.game.enemies.push(enemy);
        }
        if (this.game.effects) {
            this.game.effects.flash(this.glowColor, 0.15);
        }
    }

    _fire(pattern) {
        const speed = 160;
        switch (pattern) {
            case 'spread': {
                const count = 5;
                for (let i = 0; i < count; i++) {
                    const angle = Math.PI / 2 + (i - (count - 1) / 2) * 0.3;
                    this.game.enemyBullets.push(new Bullet(this.x, this.y + this.size / 2, Math.cos(angle) * speed, Math.sin(angle) * speed, 1, this.color, true));
                }
                break;
            }
            case 'spiral': {
                this.spiralAngle += 0.5;
                for (let i = 0; i < 3; i++) {
                    const angle = this.spiralAngle + (Math.PI * 2 / 3) * i;
                    this.game.enemyBullets.push(new Bullet(this.x, this.y + this.size / 2, Math.cos(angle) * speed, Math.sin(angle) * speed, 1, this.glowColor, true));
                }
                break;
            }
            case 'barrage': {
                const count = 8;
                for (let i = 0; i < count; i++) {
                    const angle = (Math.PI * 2 / count) * i + this.time * 0.5;
                    this.game.enemyBullets.push(new Bullet(this.x, this.y, Math.cos(angle) * speed * 0.9, Math.sin(angle) * speed * 0.9, 1, '#ffab00', true));
                }
                break;
            }
            case 'laser': {
                // 快速连射直线弹幕，方向缓慢旋转
                this.laserAngle = Math.PI / 2 + Math.sin(this.time * 0.6) * 0.8;
                this.laserBurstCount = 8;
                this.laserBurstTimer = 0;
                break;
            }
            case 'summon': {
                // 召唤小兵 + 散射
                this._summonMinions();
                for (let i = 0; i < 3; i++) {
                    const angle = Math.PI / 2 + (i - 1) * 0.5;
                    this.game.enemyBullets.push(new Bullet(this.x, this.y + this.size / 2, Math.cos(angle) * speed, Math.sin(angle) * speed, 1, this.glowColor, true));
                }
                break;
            }
            case 'cross': {
                // 十字形 4 方向射击，每次旋转
                this.crossAngle += 0.15;
                for (let i = 0; i < 4; i++) {
                    const angle = this.crossAngle + (Math.PI / 2) * i;
                    for (let j = 0; j < 3; j++) {
                        const s = speed * (0.7 + j * 0.2);
                        this.game.enemyBullets.push(new Bullet(this.x, this.y, Math.cos(angle) * s, Math.sin(angle) * s, 1, this.color, true));
                    }
                }
                break;
            }
        }
    }

    _fireLaserBullet() {
        const speed = 220;
        this.game.enemyBullets.push(new Bullet(
            this.x, this.y + this.size / 2,
            Math.cos(this.laserAngle) * speed,
            Math.sin(this.laserAngle) * speed,
            1, '#ffffff', true
        ));
        this.laserAngle += 0.04;
    }

    render(ctx) {
        const { x, y, size, color, glowColor, time } = this;
        const light = lightenColor(color, 0.3);
        ctx.save();

        // 瞬移透明度
        if (this.teleporting) {
            ctx.globalAlpha = this.teleportAlpha;
        }

        // 发光
        Renderer.drawGlow(ctx, x, y, size + 30, glowColor, 0.15);

        // 主舰体
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size * 0.4, y - size * 0.7);
        ctx.lineTo(x + size * 0.8, y - size * 0.3);
        ctx.lineTo(x + size * 1.1, y);
        ctx.lineTo(x + size * 0.9, y + size * 0.4);
        ctx.lineTo(x + size * 0.5, y + size * 0.7);
        ctx.lineTo(x, y + size * 0.5);
        ctx.lineTo(x - size * 0.5, y + size * 0.7);
        ctx.lineTo(x - size * 0.9, y + size * 0.4);
        ctx.lineTo(x - size * 1.1, y);
        ctx.lineTo(x - size * 0.8, y - size * 0.3);
        ctx.lineTo(x - size * 0.4, y - size * 0.7);
        ctx.closePath();
        const bodyGrad = ctx.createLinearGradient(x, y - size, x, y + size * 0.7);
        bodyGrad.addColorStop(0, light);
        bodyGrad.addColorStop(0.3, glowColor);
        bodyGrad.addColorStop(0.6, color);
        bodyGrad.addColorStop(1, darkenColor(color, 0.4));
        ctx.fillStyle = bodyGrad;
        ctx.fill();
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 受击闪白
        if (this.hitFlash > 0) {
            ctx.globalAlpha = this.hitFlash * 3;
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.globalAlpha = this.teleporting ? this.teleportAlpha : 1;
        }

        // 高光条
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size * 0.4, y - size * 0.7);
        ctx.lineTo(x + size * 0.8, y - size * 0.3);
        ctx.lineTo(x - size * 0.8, y - size * 0.3);
        ctx.lineTo(x - size * 0.4, y - size * 0.7);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();

        // 镜面反射点
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.ellipse(x - size * 0.2, y - size * 0.5, size * 0.12, size * 0.06, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();

        // 装甲板纹理
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 0.5;
        for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x + i * size * 0.2, y - size * 0.7);
            ctx.lineTo(x + i * size * 0.2, y + size * 0.55);
            ctx.stroke();
        }
        for (let j = -2; j <= 2; j++) {
            ctx.beginPath();
            ctx.moveTo(x - size * 0.9, y + j * size * 0.2);
            ctx.lineTo(x + size * 0.9, y + j * size * 0.2);
            ctx.stroke();
        }

        // 铆钉阵列
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        const rivetPositions = [
            [-0.6, -0.4], [0.6, -0.4], [-0.6, 0.2], [0.6, 0.2],
            [-0.3, -0.6], [0.3, -0.6], [-0.3, 0.4], [0.3, 0.4],
            [0, -0.8], [0, 0.35],
        ];
        for (const [rx, ry] of rivetPositions) {
            ctx.beginPath();
            ctx.arc(x + rx * size, y + ry * size, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }

        // 能量导管
        const conduitPulse = 0.3 + 0.3 * Math.sin(time * 5);
        ctx.save();
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = conduitPulse;
        for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(
                x + side * size * 0.4, y - size * 0.1,
                x + side * size * 0.85, y
            );
            ctx.stroke();
        }
        ctx.restore();

        // 左右炮台
        const turretSpeed = 1 + this.phase;
        for (const side of [-1, 1]) {
            ctx.save();
            ctx.translate(x + side * size * 0.85, y);
            ctx.rotate(time * turretSpeed * side);
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.fillStyle = darkenColor(color, 0.5);
            ctx.fill();
            ctx.fillStyle = darkenColor(color, 0.6);
            ctx.fillRect(-4, -14, 8, 28);
            ctx.fillStyle = glowColor;
            ctx.fillRect(-2, -16, 4, 4);
            ctx.globalAlpha = 0.5 + 0.4 * Math.sin(time * 6);
            ctx.beginPath();
            ctx.arc(0, -16, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.restore();
        }

        // 中心能量核心
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(time * (2 + this.phase));
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i;
            const r = size * 0.3;
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.2);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.5, glowColor);
        coreGrad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(time * 4);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();

        // 护盾气泡效果
        if (this.shielded) {
            // 激活护盾：全亮
            const shieldAlpha = 0.3 + 0.15 * Math.sin(time * 6);
            ctx.save();
            ctx.globalAlpha = shieldAlpha;
            ctx.beginPath();
            ctx.arc(x, y, size * 1.3, 0, Math.PI * 2);
            ctx.strokeStyle = '#40c4ff';
            ctx.lineWidth = 3;
            ctx.stroke();
            const shieldGrad = ctx.createRadialGradient(x, y, size * 0.5, x, y, size * 1.3);
            shieldGrad.addColorStop(0, 'transparent');
            shieldGrad.addColorStop(1, 'rgba(64,196,255,0.3)');
            ctx.beginPath();
            ctx.arc(x, y, size * 1.3, 0, Math.PI * 2);
            ctx.fillStyle = shieldGrad;
            ctx.fill();
            ctx.restore();
        } else {
            // 低 HP 时闪烁的半透明球
            const hpRatio = this.hp / this.maxHp;
            if (hpRatio < 0.5) {
                const shieldAlpha = (0.1 + 0.15 * Math.sin(time * 8)) * (1 - hpRatio);
                ctx.save();
                ctx.globalAlpha = shieldAlpha;
                ctx.beginPath();
                ctx.arc(x, y, size * 1.2, 0, Math.PI * 2);
                ctx.strokeStyle = glowColor;
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x, y, size * 1.15, 0, Math.PI * 2);
                const sGrad = ctx.createRadialGradient(x, y, size * 0.5, x, y, size * 1.15);
                sGrad.addColorStop(0, 'transparent');
                sGrad.addColorStop(1, glowColor);
                ctx.fillStyle = sGrad;
                ctx.fill();
                ctx.restore();
            }
        }

        // 引擎喷口
        for (const ox of [-size * 0.4, -size * 0.1, size * 0.1, size * 0.4]) {
            const flameLen = 12 + Math.sin(time * 15 + ox) * 6;
            const grad = ctx.createLinearGradient(x + ox, y + size * 0.5, x + ox, y + size * 0.5 + flameLen);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, glowColor);
            grad.addColorStop(1, 'transparent');
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.moveTo(x + ox - 5, y + size * 0.5);
            ctx.lineTo(x + ox, y + size * 0.5 + flameLen);
            ctx.lineTo(x + ox + 5, y + size * 0.5);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        ctx.restore();
    }
}