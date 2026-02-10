import { Entity } from './entity.js';

export class Bullet extends Entity {
    constructor(x, y, vx, vy, damage, color, isEnemy = false) {
        super(x, y);
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.color = color;
        this.isEnemy = isEnemy;
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

    // 玩家子弹 - 激光束
    _drawLaser(ctx) {
        const { x, y, color } = this;
        // 外层光晕
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = color;
        ctx.fillRect(x - 4, y - 8, 8, 16);
        // 中层
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = color;
        ctx.fillRect(x - 2, y - 7, 4, 14);
        // 核心（白色）
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 1, y - 6, 2, 12);
        // 头部亮点
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(x, y - 6, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        // 尾部渐隐
        const tailGrad = ctx.createLinearGradient(x, y + 4, x, y + 14);
        tailGrad.addColorStop(0, color);
        tailGrad.addColorStop(1, 'transparent');
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = tailGrad;
        ctx.fillRect(x - 2, y + 4, 4, 10);
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
