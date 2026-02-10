import { Entity } from './entity.js';
import { Bullet } from './bullet.js';
import { Renderer, darkenColor } from '../renderer.js';

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

        this.targetY = 100;
        this.phase = 0;
        this.fireTimer = 0;
        this.time = 0;
        this.spiralAngle = 0;
        this.hitFlash = 0;

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
        // ease-out-back easing for bounce feel
        const c1 = 1.70158;
        const c3 = c1 + 1;
        const p = Math.min(1, progress);
        const eased = 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
        this.y = -80 + (this.targetY + 80) * eased;
        this.time += dt;
        // Random spark particles during intro
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
        // Phase transition effect
        if (this.phase !== prevPhase && this.phase > prevPhase) {
            this.game.particleSystem.createPhaseTransition(this.x, this.y, this.glowColor);
            if (this.game.effects) {
                this.game.effects.flash(this.glowColor, 0.3);
                this.game.effects.shake(6, 0.3);
            }
        }
        if (this.hitFlash > 0) this.hitFlash -= dt;

        const moveRange = this.game.width * 0.35;
        this.x = this.game.width / 2 + Math.sin(this.time * 0.8) * moveRange;
        this.y = this.targetY + Math.sin(this.time * 0.5) * 20;

        this.fireTimer -= dt;
        if (this.fireTimer <= 0) {
            this.fireTimer = this.currentPhase.fireRate;
            this._fire(this.currentPhase.pattern);
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
        }
    }

    render(ctx) {
        const { x, y, size, color, glowColor, time } = this;
        ctx.save();

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
        bodyGrad.addColorStop(0, glowColor);
        bodyGrad.addColorStop(0.4, color);
        bodyGrad.addColorStop(1, darkenColor(color, 0.3));
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
            ctx.globalAlpha = 1;
        }

        // 装甲板纹理
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 0.5;
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(x + i * size * 0.25, y - size * 0.6);
            ctx.lineTo(x + i * size * 0.25, y + size * 0.5);
            ctx.stroke();
        }

        // 左右炮台
        const turretSpeed = 1 + this.phase;
        for (const side of [-1, 1]) {
            ctx.save();
            ctx.translate(x + side * size * 0.85, y);
            ctx.rotate(time * turretSpeed * side);
            // 炮管
            ctx.fillStyle = darkenColor(color, 0.6);
            ctx.fillRect(-4, -12, 8, 24);
            ctx.fillStyle = glowColor;
            ctx.fillRect(-2, -14, 4, 4);
            // 炮口发光
            ctx.globalAlpha = 0.5 + 0.4 * Math.sin(time * 6);
            ctx.beginPath();
            ctx.arc(0, -14, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.restore();
        }

        // 中心能量核心
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(time * (2 + this.phase));
        // 外环
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
        // 内核
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

        // 引擎喷口（底部）
        for (const ox of [-size * 0.3, 0, size * 0.3]) {
            const flameLen = 8 + Math.sin(time * 15 + ox) * 4;
            const grad = ctx.createLinearGradient(x + ox, y + size * 0.5, x + ox, y + size * 0.5 + flameLen);
            grad.addColorStop(0, glowColor);
            grad.addColorStop(1, 'transparent');
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.moveTo(x + ox - 4, y + size * 0.5);
            ctx.lineTo(x + ox, y + size * 0.5 + flameLen);
            ctx.lineTo(x + ox + 4, y + size * 0.5);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        ctx.restore();
    }
}
