import { CHAPTERS } from '../data/chapter-data.js';

export class Background {
    constructor(game) {
        this.game = game;
        this.farStars = [];
        this.midStars = [];
        this.nearStars = [];
        this.nebulas = [];
        this.planets = [];
        this.meteors = [];
        this.time = 0;
        this.speedMultiplier = 1;

        // 主题系统
        this.theme = CHAPTERS[0].theme;
        this._currentBg = { ...this.theme.bg };
        this._targetBg = { ...this.theme.bg };
        this._transitionTimer = 0;
        this._transitionDuration = 0;

        this._initStars();
        this._initNebulas();
    }

    setTheme(theme, duration = 2) {
        this.theme = theme;
        this._targetBg = { ...theme.bg };
        this._transitionTimer = duration;
        this._transitionDuration = duration;
        // 更新星云颜色（立即替换，视觉上不突兀）
        for (let i = 0; i < this.nebulas.length && i < theme.nebulas.length; i++) {
            this.nebulas[i].colors = theme.nebulas[i];
        }
        // 更新近景星颜色
        for (const s of this.nearStars) {
            s.color = theme.starColors[Math.floor(Math.random() * theme.starColors.length)];
        }
    }

    _lerpColor(a, b, t) {
        // 解析 hex 颜色并插值
        const pa = this._parseHex(a);
        const pb = this._parseHex(b);
        if (!pa || !pb) return b;
        const r = Math.round(pa.r + (pb.r - pa.r) * t);
        const g = Math.round(pa.g + (pb.g - pa.g) * t);
        const bl = Math.round(pa.b + (pb.b - pa.b) * t);
        return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`;
    }

    _parseHex(hex) {
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
    }

    _initStars() {
        const w = 500, h = 1000;
        const starColors = this.theme.starColors;
        // 远景星 - 小而暗，慢速
        for (let i = 0; i < 60; i++) {
            this.farStars.push({
                x: Math.random() * w, y: Math.random() * h,
                size: 0.3 + Math.random() * 0.7,
                speed: 8 + Math.random() * 12,
                alpha: 0.2 + Math.random() * 0.3,
            });
        }
        // 中景星 - 中等
        for (let i = 0; i < 40; i++) {
            this.midStars.push({
                x: Math.random() * w, y: Math.random() * h,
                size: 0.8 + Math.random() * 1.2,
                speed: 20 + Math.random() * 25,
                alpha: 0.4 + Math.random() * 0.4,
                twinkleSpeed: 2 + Math.random() * 3,
                twinkleOffset: Math.random() * Math.PI * 2,
            });
        }
        // 近景星 - 大而亮，快速
        for (let i = 0; i < 15; i++) {
            this.nearStars.push({
                x: Math.random() * w, y: Math.random() * h,
                size: 1.5 + Math.random() * 2,
                speed: 40 + Math.random() * 30,
                alpha: 0.6 + Math.random() * 0.4,
                color: starColors[Math.floor(Math.random() * starColors.length)],
            });
        }
    }

    _initNebulas() {
        const nebulaColors = this.theme.nebulas;
        for (let i = 0; i < 4; i++) {
            this.nebulas.push({
                x: Math.random() * 500,
                y: Math.random() * 1000,
                r: 100 + Math.random() * 150,
                speed: 6 + Math.random() * 10,
                colors: nebulaColors[i],
                phase: Math.random() * Math.PI * 2,
                deformSpeed: 0.3 + Math.random() * 0.4,
            });
        }
    }

    _maybeSpawnPlanet() {
        if (this.planets.length >= 1 || Math.random() > 0.0008) return;
        const w = this.game.width;
        const r = 30 + Math.random() * 50;
        const colors = this.theme.planetColors;
        const c = colors[Math.floor(Math.random() * colors.length)];
        this.planets.push({
            x: r + Math.random() * (w - r * 2),
            y: -r * 2,
            r,
            speed: 3 + Math.random() * 5,
            base: c.base,
            light: c.light,
            hasRing: c.ring !== null && Math.random() > 0.4,
            ringColor: c.ring,
            rotation: Math.random() * Math.PI,
        });
    }

    _maybeSpawnMeteor() {
        if (this.meteors.length >= 2 || Math.random() > 0.003) return;
        const w = this.game.width;
        this.meteors.push({
            x: Math.random() * w,
            y: -10,
            speed: 300 + Math.random() * 200,
            angle: Math.PI * 0.55 + Math.random() * 0.3,
            length: 20 + Math.random() * 30,
            alpha: 0.4 + Math.random() * 0.4,
            life: 1.5 + Math.random(),
        });
    }

    update(dt) {
        this.time += dt;
        const w = this.game.width;
        const h = this.game.height;
        const sm = this.speedMultiplier;

        // 主题过渡插值
        if (this._transitionTimer > 0) {
            this._transitionTimer -= dt;
            const t = 1 - Math.max(0, this._transitionTimer) / this._transitionDuration;
            this._currentBg.top = this._lerpColor(this._currentBg.top, this._targetBg.top, Math.min(1, t * 0.05 + 0.02));
            this._currentBg.mid1 = this._lerpColor(this._currentBg.mid1, this._targetBg.mid1, Math.min(1, t * 0.05 + 0.02));
            this._currentBg.mid2 = this._lerpColor(this._currentBg.mid2, this._targetBg.mid2, Math.min(1, t * 0.05 + 0.02));
            this._currentBg.bottom = this._lerpColor(this._currentBg.bottom, this._targetBg.bottom, Math.min(1, t * 0.05 + 0.02));
            if (this._transitionTimer <= 0) {
                this._currentBg = { ...this._targetBg };
            }
        }

        const updateLayer = (stars) => {
            for (const s of stars) {
                s.y += s.speed * dt * sm;
                if (s.y > h + 5) { s.y = -5; s.x = Math.random() * w; }
            }
        };
        updateLayer(this.farStars);
        updateLayer(this.midStars);
        updateLayer(this.nearStars);

        for (const n of this.nebulas) {
            n.y += n.speed * dt * sm;
            n.phase += n.deformSpeed * dt;
            if (n.y > h + n.r * 1.5) { n.y = -n.r * 1.5; n.x = Math.random() * w; }
        }

        // 行星
        this._maybeSpawnPlanet();
        for (let i = this.planets.length - 1; i >= 0; i--) {
            const p = this.planets[i];
            p.y += p.speed * dt * sm;
            if (p.y > h + p.r * 3) this.planets.splice(i, 1);
        }

        // 流星
        this._maybeSpawnMeteor();
        for (let i = this.meteors.length - 1; i >= 0; i--) {
            const m = this.meteors[i];
            m.x += Math.cos(m.angle) * m.speed * dt * sm;
            m.y += Math.sin(m.angle) * m.speed * dt * sm;
            m.life -= dt;
            if (m.life <= 0 || m.y > h + 20 || m.x < -20 || m.x > w + 20) {
                this.meteors.splice(i, 1);
            }
        }
    }

    render(ctx) {
        const w = this.game.width;
        const h = this.game.height;
        const bg = this._currentBg;

        // 背景渐变
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, bg.top);
        grad.addColorStop(0.3, bg.mid1);
        grad.addColorStop(0.7, bg.mid2);
        grad.addColorStop(1, bg.bottom);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // 星云（最底层）
        for (const n of this.nebulas) {
            const deform = 1 + 0.15 * Math.sin(n.phase);
            const rx = n.r * deform;
            const ry = n.r / deform;
            ctx.save();
            ctx.translate(n.x, n.y);
            ctx.scale(rx / n.r, ry / n.r);
            // 外层
            const g1 = ctx.createRadialGradient(0, 0, 0, 0, 0, n.r * 1.2);
            g1.addColorStop(0, n.colors.inner);
            g1.addColorStop(0.6, n.colors.outer);
            g1.addColorStop(1, 'transparent');
            ctx.fillStyle = g1;
            ctx.fillRect(-n.r * 1.5, -n.r * 1.5, n.r * 3, n.r * 3);
            // 内核
            const g2 = ctx.createRadialGradient(0, 0, 0, 0, 0, n.r * 0.4);
            g2.addColorStop(0, n.colors.inner);
            g2.addColorStop(1, 'transparent');
            ctx.fillStyle = g2;
            ctx.fillRect(-n.r * 0.5, -n.r * 0.5, n.r, n.r);
            ctx.restore();
        }

        // 远景行星
        for (const p of this.planets) {
            this._renderPlanet(ctx, p);
        }

        // 远景星
        ctx.fillStyle = '#ffffff';
        for (const s of this.farStars) {
            ctx.globalAlpha = s.alpha;
            ctx.fillRect(s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
        }

        // 中景星（带闪烁）
        for (const s of this.midStars) {
            const twinkle = 0.7 + 0.3 * Math.sin(this.time * s.twinkleSpeed + s.twinkleOffset);
            ctx.globalAlpha = s.alpha * twinkle;
            ctx.fillRect(s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
        }

        // 近景星（带颜色和十字光芒）
        for (const s of this.nearStars) {
            ctx.globalAlpha = s.alpha;
            ctx.fillStyle = s.color;
            ctx.fillRect(s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
            // 十字光芒
            ctx.globalAlpha = s.alpha * 0.3;
            ctx.fillRect(s.x - s.size * 2, s.y - 0.3, s.size * 4, 0.6);
            ctx.fillRect(s.x - 0.3, s.y - s.size * 2, 0.6, s.size * 4);
            ctx.fillStyle = '#ffffff';
        }
        ctx.globalAlpha = 1;

        // 流星
        for (const m of this.meteors) {
            this._renderMeteor(ctx, m);
        }
    }

    _renderPlanet(ctx, p) {
        ctx.save();
        ctx.globalAlpha = 0.3;

        // 行星体
        const pg = ctx.createRadialGradient(
            p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.1,
            p.x, p.y, p.r
        );
        pg.addColorStop(0, p.light);
        pg.addColorStop(0.7, p.base);
        pg.addColorStop(1, '#000000');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = pg;
        ctx.fill();

        // 大气层光晕
        ctx.globalAlpha = 0.1;
        const ag = ctx.createRadialGradient(p.x, p.y, p.r * 0.9, p.x, p.y, p.r * 1.3);
        ag.addColorStop(0, p.light);
        ag.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 1.3, 0, Math.PI * 2);
        ctx.fillStyle = ag;
        ctx.fill();

        // 光环
        if (p.hasRing) {
            ctx.globalAlpha = 0.2;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.scale(1, 0.3);
            ctx.beginPath();
            ctx.arc(0, 0, p.r * 1.6, 0, Math.PI * 2);
            ctx.strokeStyle = p.ringColor;
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, p.r * 1.8, 0, Math.PI * 2);
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
        }

        ctx.restore();
    }

    _renderMeteor(ctx, m) {
        ctx.save();
        const tailX = m.x - Math.cos(m.angle) * m.length;
        const tailY = m.y - Math.sin(m.angle) * m.length;

        const mg = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        mg.addColorStop(0, 'transparent');
        mg.addColorStop(0.7, `rgba(255,200,100,${m.alpha * 0.5})`);
        mg.addColorStop(1, `rgba(255,255,255,${m.alpha})`);

        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        const perpX = Math.cos(m.angle + Math.PI / 2) * 1.5;
        const perpY = Math.sin(m.angle + Math.PI / 2) * 1.5;
        ctx.lineTo(tailX + perpX, tailY + perpY);
        ctx.lineTo(tailX - perpX, tailY - perpY);
        ctx.closePath();
        ctx.fillStyle = mg;
        ctx.fill();

        // 头部亮点
        ctx.globalAlpha = m.alpha;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.restore();
    }
}