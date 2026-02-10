import { Entity } from './entity.js';
import { ENEMY_TYPES } from '../data/enemy-data.js';
import { Renderer, darkenColor } from '../renderer.js';
import { Bullet } from './bullet.js';

export class Enemy extends Entity {
    constructor(game, type, x, y, pattern = 'straight') {
        super(x, y);
        this.game = game;
        const cfg = ENEMY_TYPES[type];
        this.type = type;
        this.hp = cfg.hp;
        this.maxHp = cfg.hp;
        this.speed = cfg.speed;
        this.scoreValue = cfg.scoreValue;
        this.dropRate = cfg.dropRate;
        this.color = cfg.color;
        this.size = cfg.size;
        this.hitW = cfg.hitW;
        this.hitH = cfg.hitH;
        this.fireRate = cfg.fireRate;
        this.fireTimer = 1 + Math.random() * 2;

        this.pattern = pattern;
        this.time = 0;
        this.startX = x;
        this.sinAmp = 40 + Math.random() * 40;
        this.sinFreq = 1.5 + Math.random();
    }

    update(dt) {
        this.time += dt;
        switch (this.pattern) {
            case 'straight': this.y += this.speed * dt; break;
            case 'sine':
                this.y += this.speed * dt;
                this.x = this.startX + Math.sin(this.time * this.sinFreq) * this.sinAmp;
                break;
            case 'zigzag':
                this.y += this.speed * dt;
                this.x += Math.sign(Math.sin(this.time * 2)) * this.speed * 0.5 * dt;
                break;
            case 'dive':
                this.y += this.speed * dt * (1 + this.time * 0.3);
                break;
        }
        if (this.fireRate > 0) {
            this.fireTimer -= dt;
            if (this.fireTimer <= 0 && this.y > 0 && this.y < this.game.height * 0.7) {
                this.fire();
                this.fireTimer = this.fireRate;
            }
        }
    }

    fire() {
        const player = this.game.player;
        if (!player || !player.alive) return;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = 180;
        this.game.enemyBullets.push(new Bullet(
            this.x, this.y + this.size / 2,
            (dx / dist) * speed, (dy / dist) * speed,
            1, '#ff5252', true
        ));
    }

    isOffScreen(h) {
        return this.y > h + 60 || this.x < -60 || this.x > this.game.width + 60;
    }

    render(ctx) {
        const { x, y, size, color, time, type } = this;
        ctx.save();

        switch (type) {
            case 'small': this._drawDrone(ctx, x, y, size, color, time); break;
            case 'medium': this._drawCruiser(ctx, x, y, size, color, time); break;
            case 'elite': this._drawWarship(ctx, x, y, size, color, time); break;
        }

        // 血量条
        if (this.hp < this.maxHp && this.hp > 0) {
            Renderer.drawHealthBar(ctx, x, y - size - 6, size * 2, 2, this.hp / this.maxHp, '#ff5252');
        }
        ctx.restore();
    }

    // 小型 - 旋转三叉无人机
    _drawDrone(ctx, x, y, size, color, time) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(time * 1.5);

        // 三叉臂
        for (let i = 0; i < 3; i++) {
            ctx.save();
            ctx.rotate((Math.PI * 2 / 3) * i);
            ctx.beginPath();
            ctx.moveTo(0, -2);
            ctx.quadraticCurveTo(size * 0.4, -size * 0.3, size * 0.9, -size * 0.15);
            ctx.lineTo(size, 0);
            ctx.lineTo(size * 0.9, size * 0.15);
            ctx.quadraticCurveTo(size * 0.4, size * 0.3, 0, 2);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.restore();
        }

        // 中心核心
        const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.35);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.5, color);
        coreGrad.addColorStop(1, darkenColor(color, 0.3));
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.fill();

        ctx.restore();

        // 外发光
        Renderer.drawGlow(ctx, x, y, size + 4, color, 0.15);
    }

    // 中型 - 碟形巡逻舰
    _drawCruiser(ctx, x, y, size, color, time) {
        ctx.save();
        ctx.translate(x, y);

        // 碟体
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.8);
        ctx.bezierCurveTo(size * 0.5, -size * 0.6, size, -size * 0.2, size, 0);
        ctx.bezierCurveTo(size, size * 0.2, size * 0.5, size * 0.5, 0, size * 0.6);
        ctx.bezierCurveTo(-size * 0.5, size * 0.5, -size, size * 0.2, -size, 0);
        ctx.bezierCurveTo(-size, -size * 0.2, -size * 0.5, -size * 0.6, 0, -size * 0.8);
        ctx.closePath();
        const grad = ctx.createRadialGradient(0, -size * 0.2, 0, 0, 0, size);
        grad.addColorStop(0, color);
        grad.addColorStop(1, darkenColor(color, 0.3));
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 中心舱室
        ctx.beginPath();
        ctx.ellipse(0, -size * 0.1, size * 0.3, size * 0.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fill();

        // 武器挂架
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(size * 0.7, 0); ctx.lineTo(size * 1.1, size * 0.15); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-size * 0.7, 0); ctx.lineTo(-size * 1.1, size * 0.15); ctx.stroke();

        // 武器端点脉动
        const pulse = 0.5 + 0.5 * Math.sin(time * 5);
        ctx.globalAlpha = pulse;
        ctx.beginPath(); ctx.arc(size * 1.1, size * 0.15, 2, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
        ctx.beginPath(); ctx.arc(-size * 1.1, size * 0.15, 2, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;

        ctx.restore();
    }

    // 精英 - 重型战舰
    _drawWarship(ctx, x, y, size, color, time) {
        ctx.save();
        ctx.translate(x, y);

        // 主体
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.bezierCurveTo(size * 0.3, -size * 0.8, size * 0.8, -size * 0.3, size, 0);
        ctx.bezierCurveTo(size * 0.8, size * 0.3, size * 0.3, size * 0.8, 0, size * 0.7);
        ctx.bezierCurveTo(-size * 0.3, size * 0.8, -size * 0.8, size * 0.3, -size, 0);
        ctx.bezierCurveTo(-size * 0.8, -size * 0.3, -size * 0.3, -size * 0.8, 0, -size);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, -size, 0, size);
        grad.addColorStop(0, color);
        grad.addColorStop(1, darkenColor(color, 0.3));
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 装甲板
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(-size * 0.6, -size * 0.15, size * 1.2, size * 0.3);

        // 侧翼炮台
        const turretAngle = time * 2;
        for (const side of [-1, 1]) {
            ctx.save();
            ctx.translate(side * size * 0.7, 0);
            ctx.rotate(turretAngle * side);
            ctx.fillStyle = darkenColor(color, 0.7);
            ctx.fillRect(-3, -6, 6, 12);
            ctx.fillStyle = '#fff';
            ctx.globalAlpha = 0.5 + 0.3 * Math.sin(time * 4);
            ctx.beginPath(); ctx.arc(0, -6, 2, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
            ctx.restore();
        }

        // 中心能量核心
        ctx.save();
        ctx.rotate(time * 3);
        const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.25);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.5, color);
        coreGrad.addColorStop(1, 'transparent');
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const a = (Math.PI / 2) * i;
            const px = Math.cos(a) * size * 0.2;
            const py = Math.sin(a) * size * 0.2;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = coreGrad;
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }
}
