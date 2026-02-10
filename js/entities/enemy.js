import { Entity } from './entity.js';
import { ENEMY_TYPES } from '../data/enemy-data.js';
import { Renderer, darkenColor, lightenColor } from '../renderer.js';
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

    // 小型 - 精密四叶无人机
    _drawDrone(ctx, x, y, size, color, time) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(time * 1.8);

        const dark = darkenColor(color, 0.4);
        const light = lightenColor(color, 0.3);

        // 四叶片
        for (let i = 0; i < 4; i++) {
            ctx.save();
            ctx.rotate((Math.PI / 2) * i);
            // 叶片主体（带渐变模拟顶光）
            ctx.beginPath();
            ctx.moveTo(0, -2.5);
            ctx.quadraticCurveTo(size * 0.4, -size * 0.3, size * 0.95, -size * 0.12);
            ctx.lineTo(size, 0);
            ctx.lineTo(size * 0.95, size * 0.12);
            ctx.quadraticCurveTo(size * 0.4, size * 0.3, 0, 2.5);
            ctx.closePath();
            const bladeGrad = ctx.createLinearGradient(0, -size * 0.3, 0, size * 0.3);
            bladeGrad.addColorStop(0, light);
            bladeGrad.addColorStop(0.4, color);
            bladeGrad.addColorStop(1, dark);
            ctx.fillStyle = bladeGrad;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
            // 叶片中线面板线
            ctx.beginPath();
            ctx.moveTo(size * 0.15, 0);
            ctx.lineTo(size * 0.85, 0);
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 0.4;
            ctx.stroke();
            // 叶尖脉动发光点
            const tipPulse = 0.4 + 0.6 * Math.sin(time * 6 + i * 1.5);
            ctx.globalAlpha = tipPulse;
            ctx.beginPath();
            ctx.arc(size * 0.9, 0, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.restore();
        }

        // 多层 3D 球体核心
        // 底层暗色
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = dark;
        ctx.fill();
        // 径向渐变主体
        const coreGrad = ctx.createRadialGradient(-size * 0.08, -size * 0.08, 0, 0, 0, size * 0.35);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.3, light);
        coreGrad.addColorStop(0.7, color);
        coreGrad.addColorStop(1, dark);
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.32, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.fill();
        // 镜面高光椭圆
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.ellipse(-size * 0.06, -size * 0.1, size * 0.12, size * 0.06, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
        // 脉动传感器眼
        const eyePulse = 0.6 + 0.4 * Math.sin(time * 5);
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${eyePulse})`;
        ctx.fill();

        ctx.restore();

        // 外发光
        Renderer.drawGlow(ctx, x, y, size + 4, color, 0.15);
    }

    // 中型 - 多段式巡洋舰
    _drawCruiser(ctx, x, y, size, color, time) {
        ctx.save();
        ctx.translate(x, y);

        const dark = darkenColor(color, 0.4);
        const light = lightenColor(color, 0.3);
        const s = size;

        // === 引擎段（后部） ===
        ctx.beginPath();
        ctx.moveTo(-s * 0.5, s * 0.6);
        ctx.lineTo(-s * 0.6, s * 0.35);
        ctx.lineTo(s * 0.6, s * 0.35);
        ctx.lineTo(s * 0.5, s * 0.6);
        ctx.closePath();
        const engGrad = ctx.createLinearGradient(0, s * 0.35, 0, s * 0.6);
        engGrad.addColorStop(0, color);
        engGrad.addColorStop(1, dark);
        ctx.fillStyle = engGrad;
        ctx.fill();

        // 双引擎喷口（动态火焰）
        for (const ox of [-s * 0.25, s * 0.25]) {
            const flameLen = 6 + Math.sin(time * 15 + ox) * 3;
            const fGrad = ctx.createLinearGradient(ox, s * 0.6, ox, s * 0.6 + flameLen);
            fGrad.addColorStop(0, '#ffab00');
            fGrad.addColorStop(0.5, color);
            fGrad.addColorStop(1, 'transparent');
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.moveTo(ox - 3, s * 0.6);
            ctx.lineTo(ox, s * 0.6 + flameLen);
            ctx.lineTo(ox + 3, s * 0.6);
            ctx.closePath();
            ctx.fillStyle = fGrad;
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // 段间接缝线
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(-s * 0.58, s * 0.35);
        ctx.lineTo(s * 0.58, s * 0.35);
        ctx.stroke();

        // === 主舰体（中部） ===
        ctx.beginPath();
        ctx.moveTo(-s * 0.7, s * 0.35);
        ctx.lineTo(-s * 0.85, 0);
        ctx.lineTo(-s * 0.7, -s * 0.3);
        ctx.lineTo(s * 0.7, -s * 0.3);
        ctx.lineTo(s * 0.85, 0);
        ctx.lineTo(s * 0.7, s * 0.35);
        ctx.closePath();
        const bodyGrad = ctx.createLinearGradient(0, -s * 0.3, 0, s * 0.35);
        bodyGrad.addColorStop(0, light);
        bodyGrad.addColorStop(0.35, color);
        bodyGrad.addColorStop(1, dark);
        ctx.fillStyle = bodyGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // 高光条（上方 30%）
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.beginPath();
        ctx.rect(-s * 0.65, -s * 0.3, s * 1.3, s * 0.2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();

        // 面板线
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 0.4;
        ctx.beginPath(); ctx.moveTo(0, -s * 0.28); ctx.lineTo(0, s * 0.33); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-s * 0.6, s * 0.05); ctx.lineTo(s * 0.6, s * 0.05); ctx.stroke();

        // 铆钉点
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        for (const [rx, ry] of [[-s*0.4, -s*0.15], [s*0.4, -s*0.15], [-s*0.4, s*0.2], [s*0.4, s*0.2]]) {
            ctx.beginPath(); ctx.arc(rx, ry, 0.8, 0, Math.PI * 2); ctx.fill();
        }

        // === 两侧武器舱 ===
        for (const side of [-1, 1]) {
            const wx = side * s * 0.95;
            ctx.fillStyle = dark;
            ctx.fillRect(wx - 4, -s * 0.15, 8, s * 0.3);
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 0.4;
            ctx.strokeRect(wx - 4, -s * 0.15, 8, s * 0.3);
            // 武器舱内部细节线
            ctx.beginPath(); ctx.moveTo(wx - 3, 0); ctx.lineTo(wx + 3, 0); ctx.stroke();
            // 武器端点脉动
            const pulse = 0.4 + 0.6 * Math.sin(time * 5 + side);
            ctx.globalAlpha = pulse;
            ctx.beginPath(); ctx.arc(wx, -s * 0.15, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff'; ctx.fill();
            ctx.globalAlpha = 1;
        }

        // 段间接缝线（前）
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(-s * 0.68, -s * 0.3);
        ctx.lineTo(s * 0.68, -s * 0.3);
        ctx.stroke();

        // === 舰桥（前部） ===
        ctx.beginPath();
        ctx.moveTo(-s * 0.5, -s * 0.3);
        ctx.lineTo(-s * 0.3, -s * 0.7);
        ctx.lineTo(0, -s * 0.85);
        ctx.lineTo(s * 0.3, -s * 0.7);
        ctx.lineTo(s * 0.5, -s * 0.3);
        ctx.closePath();
        const bridgeGrad = ctx.createLinearGradient(0, -s * 0.85, 0, -s * 0.3);
        bridgeGrad.addColorStop(0, light);
        bridgeGrad.addColorStop(0.5, color);
        bridgeGrad.addColorStop(1, dark);
        ctx.fillStyle = bridgeGrad;
        ctx.fill();

        // 舰桥窗口（半透明蓝色椭圆 + 高光）
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.5, s * 0.18, s * 0.1, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100,180,255,0.6)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(150,220,255,0.8)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        // 窗口高光
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.ellipse(-s * 0.04, -s * 0.53, s * 0.08, s * 0.03, -0.2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();

        // 镜面反射点
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.ellipse(-s * 0.15, -s * 0.15, s * 0.08, s * 0.04, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }

    // 精英 - 重装战列舰
    _drawWarship(ctx, x, y, size, color, time) {
        ctx.save();
        ctx.translate(x, y);

        const dark = darkenColor(color, 0.4);
        const light = lightenColor(color, 0.3);
        const s = size;

        // === 多层装甲舰体（菱形轮廓） ===
        ctx.beginPath();
        ctx.moveTo(0, -s * 1.05);
        ctx.lineTo(s * 0.45, -s * 0.7);
        ctx.lineTo(s * 0.9, -s * 0.15);
        ctx.lineTo(s * 1.0, s * 0.1);
        ctx.lineTo(s * 0.8, s * 0.5);
        ctx.lineTo(s * 0.4, s * 0.75);
        ctx.lineTo(0, s * 0.85);
        ctx.lineTo(-s * 0.4, s * 0.75);
        ctx.lineTo(-s * 0.8, s * 0.5);
        ctx.lineTo(-s * 1.0, s * 0.1);
        ctx.lineTo(-s * 0.9, -s * 0.15);
        ctx.lineTo(-s * 0.45, -s * 0.7);
        ctx.closePath();
        const bodyGrad = ctx.createLinearGradient(0, -s * 1.05, 0, s * 0.85);
        bodyGrad.addColorStop(0, light);
        bodyGrad.addColorStop(0.3, color);
        bodyGrad.addColorStop(0.7, color);
        bodyGrad.addColorStop(1, dark);
        ctx.fillStyle = bodyGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // 高光条（上方 30%）
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.beginPath();
        ctx.moveTo(0, -s * 1.0);
        ctx.lineTo(s * 0.4, -s * 0.7);
        ctx.lineTo(s * 0.85, -s * 0.15);
        ctx.lineTo(-s * 0.85, -s * 0.15);
        ctx.lineTo(-s * 0.4, -s * 0.7);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();

        // 装甲板纹理（面板线 + 铆钉阵列）
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 0.4;
        // 纵线
        ctx.beginPath(); ctx.moveTo(0, -s * 0.9); ctx.lineTo(0, s * 0.7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-s * 0.4, -s * 0.5); ctx.lineTo(-s * 0.4, s * 0.6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s * 0.4, -s * 0.5); ctx.lineTo(s * 0.4, s * 0.6); ctx.stroke();
        // 横线
        ctx.beginPath(); ctx.moveTo(-s * 0.85, -s * 0.15); ctx.lineTo(s * 0.85, -s * 0.15); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-s * 0.75, s * 0.3); ctx.lineTo(s * 0.75, s * 0.3); ctx.stroke();
        // 铆钉阵列
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        const rivets = [
            [-s*0.6, -s*0.15], [s*0.6, -s*0.15],
            [-s*0.6, s*0.3], [s*0.6, s*0.3],
            [-s*0.2, -s*0.5], [s*0.2, -s*0.5],
            [-s*0.2, s*0.5], [s*0.2, s*0.5],
        ];
        for (const [rx, ry] of rivets) {
            ctx.beginPath(); ctx.arc(rx, ry, 0.9, 0, Math.PI * 2); ctx.fill();
        }

        // === 4 个旋转炮台 ===
        const turretSpeed = 2;
        const turretPositions = [
            [-s * 0.65, -s * 0.3], [s * 0.65, -s * 0.3],
            [-s * 0.55, s * 0.35], [s * 0.55, s * 0.35],
        ];
        for (let ti = 0; ti < turretPositions.length; ti++) {
            const [tx, ty] = turretPositions[ti];
            const side = ti % 2 === 0 ? -1 : 1;
            ctx.save();
            ctx.translate(tx, ty);
            ctx.rotate(time * turretSpeed * side + ti * 0.8);
            // 炮台底座
            ctx.beginPath();
            ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = dark;
            ctx.fill();
            // 炮管
            ctx.fillStyle = darkenColor(color, 0.6);
            ctx.fillRect(-2, -8, 4, 16);
            // 炮口发光
            ctx.globalAlpha = 0.5 + 0.4 * Math.sin(time * 6 + ti);
            ctx.beginPath();
            ctx.arc(0, -8, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.restore();
        }

        // === 中央能量核心（六边形 + 内核 + 能量脉冲环） ===
        ctx.save();
        ctx.rotate(time * 3);
        // 六边形外环
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i;
            const r = s * 0.28;
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        // 内核
        const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.2);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.4, light);
        coreGrad.addColorStop(0.8, color);
        coreGrad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.globalAlpha = 0.7 + 0.3 * Math.sin(time * 4);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();

        // 能量脉冲环（不随核心旋转）
        const pulseR = s * 0.3 + s * 0.08 * Math.sin(time * 3);
        ctx.beginPath();
        ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = 0.3 + 0.2 * Math.sin(time * 3);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // === 两侧护盾发生器（旋转弧线） ===
        for (const side of [-1, 1]) {
            ctx.save();
            ctx.translate(side * s * 0.9, s * 0.1);
            const shieldAngle = time * 4 * side;
            ctx.rotate(shieldAngle);
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.2, 0, Math.PI * 1.2);
            ctx.strokeStyle = light;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.4;
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.restore();
        }

        // === 引擎排气口（3 个，带动态火焰） ===
        for (const ox of [-s * 0.25, 0, s * 0.25]) {
            const flameLen = 8 + Math.sin(time * 14 + ox) * 4;
            const fGrad = ctx.createLinearGradient(ox, s * 0.85, ox, s * 0.85 + flameLen);
            fGrad.addColorStop(0, light);
            fGrad.addColorStop(0.4, color);
            fGrad.addColorStop(1, 'transparent');
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.moveTo(ox - 3, s * 0.85);
            ctx.lineTo(ox, s * 0.85 + flameLen);
            ctx.lineTo(ox + 3, s * 0.85);
            ctx.closePath();
            ctx.fillStyle = fGrad;
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // 镜面反射点
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.ellipse(-s * 0.2, -s * 0.45, s * 0.1, s * 0.05, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }
}
