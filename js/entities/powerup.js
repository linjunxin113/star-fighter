import { Entity } from './entity.js';
import { Renderer, darkenColor } from '../renderer.js';

export const POWERUP_TYPES = {
    fireup: { color: '#ff6d00', label: 'F', duration: 0 },
    spread: { color: '#ffab00', label: 'S', duration: 8 },
    shield: { color: '#40c4ff', label: 'D', duration: 10 },
    bomb:   { color: '#ff1744', label: 'B', duration: 0 },
    heal:   { color: '#69f0ae', label: '+', duration: 0 },
    magnet: { color: '#e040fb', label: 'M', duration: 10 },
};

export class PowerUp extends Entity {
    constructor(x, y, type) {
        super(x, y);
        this.type = type;
        const cfg = POWERUP_TYPES[type];
        this.color = cfg.color;
        this.label = cfg.label;
        this.duration = cfg.duration;
        this.hitW = 24;
        this.hitH = 24;
        this.speed = 60;
        this.time = 0;
        this.lifetime = 8;
    }

    update(dt) {
        this.time += dt;
        this.y += this.speed * dt;
        this.lifetime -= dt;
        if (this.lifetime <= 0) this.alive = false;
    }

    attract(targetX, targetY, dt) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
            const attractSpeed = 300;
            this.x += (dx / dist) * attractSpeed * dt;
            this.y += (dy / dist) * attractSpeed * dt;
        }
    }

    isOffScreen(h) {
        return this.y > h + 30;
    }

    render(ctx) {
        const { x, y, color, type, time } = this;
        const bob = Math.sin(time * 3) * 3;
        const dy = y + bob;
        const pulse = 1 + 0.08 * Math.sin(time * 5);
        const rot = time * 1.5;

        // 快消失时闪烁
        if (this.lifetime < 2) {
            ctx.globalAlpha = 0.4 + 0.4 * Math.sin(time * 10);
        }

        ctx.save();

        // 外层光晕
        Renderer.drawGlow(ctx, x, dy, 20 * pulse, color, 0.2);

        // 旋转外环
        ctx.save();
        ctx.translate(x, dy);
        ctx.rotate(rot);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i;
            const r = 13 * pulse;
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.4;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.restore();

        // 内部背景圆
        ctx.beginPath();
        ctx.arc(x, dy, 10, 0, Math.PI * 2);
        const bgGrad = ctx.createRadialGradient(x, dy, 0, x, dy, 10);
        bgGrad.addColorStop(0, 'rgba(0,0,0,0.6)');
        bgGrad.addColorStop(1, 'rgba(0,0,0,0.3)');
        ctx.fillStyle = bgGrad;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 图标绘制
        ctx.save();
        ctx.translate(x, dy);
        this._drawIcon(ctx, type, color);
        ctx.restore();

        ctx.restore();
    }

    _drawIcon(ctx, type, color) {
        switch (type) {
            case 'fireup':
                // 向上箭头
                ctx.beginPath();
                ctx.moveTo(0, -6);
                ctx.lineTo(-4, -1);
                ctx.lineTo(-2, -1);
                ctx.lineTo(-2, 5);
                ctx.lineTo(2, 5);
                ctx.lineTo(2, -1);
                ctx.lineTo(4, -1);
                ctx.closePath();
                ctx.fillStyle = color;
                ctx.fill();
                break;
            case 'spread':
                // 三条扇形线
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.5;
                for (const angle of [-0.4, 0, 0.4]) {
                    ctx.beginPath();
                    ctx.moveTo(0, 3);
                    ctx.lineTo(Math.sin(angle) * 6, -5);
                    ctx.stroke();
                }
                // 顶部小点
                ctx.fillStyle = color;
                for (const angle of [-0.4, 0, 0.4]) {
                    ctx.beginPath();
                    ctx.arc(Math.sin(angle) * 6, -5, 1.2, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            case 'shield':
                // 盾牌形状
                ctx.beginPath();
                ctx.moveTo(0, -6);
                ctx.lineTo(5, -3);
                ctx.lineTo(5, 1);
                ctx.quadraticCurveTo(5, 6, 0, 7);
                ctx.quadraticCurveTo(-5, 6, -5, 1);
                ctx.lineTo(-5, -3);
                ctx.closePath();
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.fillStyle = color;
                ctx.globalAlpha = 0.2;
                ctx.fill();
                ctx.globalAlpha = 1;
                break;
            case 'bomb':
                // 炸弹圆形 + 引线
                ctx.beginPath();
                ctx.arc(0, 1, 4, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(2, -3);
                ctx.quadraticCurveTo(4, -6, 2, -7);
                ctx.stroke();
                // 火花
                ctx.fillStyle = '#ffeb3b';
                ctx.beginPath();
                ctx.arc(2, -7, 1.5, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'heal':
                // 十字
                ctx.fillStyle = color;
                ctx.fillRect(-1.5, -5, 3, 10);
                ctx.fillRect(-5, -1.5, 10, 3);
                break;
            case 'magnet':
                // U形磁铁
                ctx.beginPath();
                ctx.arc(0, 0, 4, 0, Math.PI);
                ctx.strokeStyle = color;
                ctx.lineWidth = 2.5;
                ctx.stroke();
                ctx.fillStyle = '#ff1744';
                ctx.fillRect(-4, -1, 2.5, 5);
                ctx.fillStyle = '#448aff';
                ctx.fillRect(1.5, -1, 2.5, 5);
                break;
        }
    }
}
