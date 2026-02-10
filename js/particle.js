class Particle {
    constructor(x, y, vx, vy, life, size, color, shape = 'square', gravity = 0) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.size = size;
        this.color = color;
        this.shape = shape; // 'square', 'circle', 'triangle'
        this.alive = true;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 8;
        this.friction = 0.98;
        this.gravity = gravity;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += this.gravity * dt;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.rotation += this.rotSpeed * dt;
        this.life -= dt;
        if (this.life <= 0) this.alive = false;
    }

    render(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        const s = this.size * (0.3 + 0.7 * alpha);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;

        switch (this.shape) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(this.x, this.y, s / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'triangle':
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.beginPath();
                ctx.moveTo(0, -s * 0.6);
                ctx.lineTo(-s * 0.5, s * 0.4);
                ctx.lineTo(s * 0.5, s * 0.4);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                break;
            default: // square
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.fillRect(-s / 2, -s / 2, s, s);
                ctx.restore();
                break;
        }
        ctx.globalAlpha = 1;
    }
}

// 冲击波环
class Shockwave {
    constructor(x, y, maxRadius, color, duration = 0.4) {
        this.x = x;
        this.y = y;
        this.maxRadius = maxRadius;
        this.color = color;
        this.duration = duration;
        this.time = 0;
        this.alive = true;
    }

    update(dt) {
        this.time += dt;
        if (this.time >= this.duration) this.alive = false;
    }

    render(ctx) {
        const progress = this.time / this.duration;
        const radius = this.maxRadius * progress;
        const alpha = 1 - progress;
        ctx.save();
        ctx.globalAlpha = alpha * 0.6;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2 * (1 - progress) + 0.5;
        ctx.stroke();
        ctx.restore();
    }
}

export class ParticleSystem {
    constructor(game) {
        this.game = game;
        this.shockwaves = [];
    }

    createExplosion(x, y, count = 20, color = '#ff6600') {
        const colors = [color, '#ffaa00', '#ff4400', '#ffffff'];
        const shapes = ['square', 'circle', 'triangle'];
        const bigExplosion = count >= 30;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 150;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 0.3 + Math.random() * 0.6;
            const size = 2 + Math.random() * (bigExplosion ? 6 : 4);
            const c = colors[Math.floor(Math.random() * colors.length)];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            this.game.particles.push(new Particle(x, y, vx, vy, life, size, c, shape));
        }

        // 大爆炸加冲击波
        if (bigExplosion) {
            this.shockwaves.push(new Shockwave(x, y, count * 2.5, color, 0.5));
        }
    }

    createHitSpark(x, y) {
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 40 + Math.random() * 80;
            this.game.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed, Math.sin(angle) * speed,
                0.15 + Math.random() * 0.15, 2, '#ffffff', 'circle'
            ));
        }
    }

    createTrail(x, y, color = '#00bcd4') {
        this.game.particles.push(new Particle(
            x + (Math.random() - 0.5) * 4, y,
            (Math.random() - 0.5) * 10, 30 + Math.random() * 20,
            0.2 + Math.random() * 0.2, 2 + Math.random() * 2, color, 'circle'
        ));
    }

    createPickupEffect(x, y, color = '#ffeb3b') {
        for (let i = 0; i < 14; i++) {
            const angle = (Math.PI * 2 / 14) * i;
            const speed = 60 + Math.random() * 40;
            const shape = i % 2 === 0 ? 'circle' : 'square';
            this.game.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed, Math.sin(angle) * speed,
                0.3 + Math.random() * 0.3, 3, color, shape
            ));
        }
        this.shockwaves.push(new Shockwave(x, y, 30, color, 0.3));
    }

    createEnergyWave(x, y, color = '#ffffff') {
        this.shockwaves.push(new Shockwave(x, y, 120, color, 0.6));
        this.shockwaves.push(new Shockwave(x, y, 80, '#ffffff', 0.4));
    }

    createDebris(x, y, count = 5, color = '#888888') {
        const colors = [color, '#aaaaaa', '#666666'];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 30 + Math.random() * 100;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed - 40;
            const life = 0.8 + Math.random() * 0.7;
            const size = 4 + Math.random() * 6;
            const c = colors[Math.floor(Math.random() * colors.length)];
            const shape = Math.random() > 0.5 ? 'square' : 'triangle';
            this.game.particles.push(new Particle(x, y, vx, vy, life, size, c, shape, 200));
        }
    }

    createMuzzleFlash(x, y, color = '#ffffff') {
        for (let i = 0; i < 4; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 20 + Math.random() * 30;
            this.game.particles.push(new Particle(
                x + (Math.random() - 0.5) * 4, y,
                Math.cos(angle) * speed, Math.sin(angle) * speed - 20,
                0.04 + Math.random() * 0.03, 3 + Math.random() * 2, color, 'circle'
            ));
        }
    }

    createPhaseTransition(x, y, color = '#ffffff') {
        // Multi-layer concentric shockwaves
        this.shockwaves.push(new Shockwave(x, y, 150, color, 0.6));
        this.shockwaves.push(new Shockwave(x, y, 100, color, 0.4));
        this.shockwaves.push(new Shockwave(x, y, 60, '#ffffff', 0.3));
        // Radial particle ring
        for (let i = 0; i < 24; i++) {
            const angle = (Math.PI * 2 / 24) * i;
            const speed = 80 + Math.random() * 60;
            this.game.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed, Math.sin(angle) * speed,
                0.4 + Math.random() * 0.3, 2 + Math.random() * 2, color, 'circle'
            ));
        }
    }

    update(dt) {
        for (let i = this.game.particles.length - 1; i >= 0; i--) {
            this.game.particles[i].update(dt);
            if (!this.game.particles[i].alive) {
                this.game.particles.splice(i, 1);
            }
        }
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            this.shockwaves[i].update(dt);
            if (!this.shockwaves[i].alive) {
                this.shockwaves.splice(i, 1);
            }
        }
    }

    render(ctx) {
        for (const p of this.game.particles) {
            p.render(ctx);
        }
        for (const sw of this.shockwaves) {
            sw.render(ctx);
        }
    }
}
