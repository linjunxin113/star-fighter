import { Entity } from './entity.js';

export class Bullet extends Entity {
    constructor(x, y, vx, vy, damage, color, isEnemy = false, fireLevel = 1) {
        super(x, y);
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.color = color;
        this.isEnemy = isEnemy;
        this.fireLevel = fireLevel;
        this.hitW = isEnemy ? 6 : 5;
        this.hitH = isEnemy ? 6 : 10;
        this.time = 0;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.time += dt;
    }

    isOffScreen(w, h) {
        return this.x < -20 || this.x > w + 20 || this.y < -20 || this.y > h + 20;
    }

    render(ctx) {
        ctx.save();
        if (this.isEnemy) {
            this._drawEnergyBall(ctx);
        } else {
            this._drawLaser(ctx);
        }
        ctx.restore();
    }

    // 玩家子弹 - 激光束（随 fireLevel 缩放）
    _drawLaser(ctx) {
        const { x, y, color, fireLevel } = this;
        const scale = 1 + (fireLevel - 1) * 0.08; // 最高约 1.56x at level 8
        const w = 2 * scale;
        const hw = w * 2; // 外层宽度
        const len = 6 * scale;
        const hlen = 7 * scale;
        const tailBase = 14 + fireLevel * 2;
        const headR = 2 * scale;

        // 外层光晕
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = color;
        ctx.fillRect(x - hw, y - len - 2, hw * 2, hlen * 2 + 2);
        // 中层
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = color;
        ctx.fillRect(x - w, y - hlen, w * 2, hlen * 2);
        // 核心（白色）
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - w * 0.5, y - len, w, len * 2);
        // 头部亮点
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(x, y - len, headR, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        // 尾部渐隐
        const tailGrad = ctx.createLinearGradient(x, y + 4, x, y + 4 + tailBase);
        tailGrad.addColorStop(0, color);
        tailGrad.addColorStop(1, 'transparent');
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = tailGrad;
        ctx.fillRect(x - w, y + 4, w * 2, tailBase);
    }

    // 敌方子弹 - 能量球
    _drawEnergyBall(ctx) {
        const { x, y, color, time } = this;
        const pulse = 1 + 0.15 * Math.sin(time * 12);
        // 外层光晕
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.arc(x, y, 7 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        // 中层
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 4 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        // 核心
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }
}
