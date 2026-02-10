import { Entity } from './entity.js';
import { Bullet } from './bullet.js';
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
        const light = lightenColor(color, 0.3);
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
            ctx.globalAlpha = 1;
        }

        // 高光条（舰体上方 30%）
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

        // 装甲板纹理（更多面板线）
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 0.5;
        for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x + i * size * 0.2, y - size * 0.7);
            ctx.lineTo(x + i * size * 0.2, y + size * 0.55);
            ctx.stroke();
        }
        // 横向面板线
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

        // 能量导管（连接核心到炮台的发光线条，脉动动画）
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
            // 炮台底座
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.fillStyle = darkenColor(color, 0.5);
            ctx.fill();
            // 炮管
            ctx.fillStyle = darkenColor(color, 0.6);
            ctx.fillRect(-4, -14, 8, 28);
            ctx.fillStyle = glowColor;
            ctx.fillRect(-2, -16, 4, 4);
            // 炮口发光
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

        // 护盾气泡效果（低 HP 时闪烁的半透明球）
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
            // 内层
            ctx.beginPath();
            ctx.arc(x, y, size * 1.15, 0, Math.PI * 2);
            const shieldGrad = ctx.createRadialGradient(x, y, size * 0.5, x, y, size * 1.15);
            shieldGrad.addColorStop(0, 'transparent');
            shieldGrad.addColorStop(1, glowColor);
            ctx.fillStyle = shieldGrad;
            ctx.fill();
            ctx.restore();
        }

        // 引擎喷口（底部）- 增大
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
