// 离屏 Canvas 缓存
export class SpriteCache {
    constructor() {
        this.cache = new Map();
    }

    getOrCreate(key, width, height, drawFn) {
        if (this.cache.has(key)) return this.cache.get(key);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const canvas = document.createElement('canvas');
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        drawFn(ctx, width / 2, height / 2);
        const entry = { canvas, width, height };
        this.cache.set(key, entry);
        return entry;
    }

    draw(ctx, key, x, y) {
        const entry = this.cache.get(key);
        if (!entry) return;
        ctx.drawImage(entry.canvas, x - entry.width / 2, y - entry.height / 2, entry.width, entry.height);
    }
}

export const spriteCache = new SpriteCache();

// 颜色工具
export function darkenColor(hex, factor) {
    if (hex.startsWith('rgb')) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.floor(r * factor)},${Math.floor(g * factor)},${Math.floor(b * factor)})`;
}

export function lightenColor(hex, factor) {
    if (hex.startsWith('rgb')) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.min(255, Math.floor(r + (255 - r) * factor))},${Math.min(255, Math.floor(g + (255 - g) * factor))},${Math.min(255, Math.floor(b + (255 - b) * factor))})`;
}

// 引擎喷焰
export function drawEngineFlame(ctx, x, y, width, length, color) {
    ctx.save();
    const grad = ctx.createLinearGradient(x, y, x, y + length);
    grad.addColorStop(0, 'rgba(255,255,255,0.9)');
    grad.addColorStop(0.2, color);
    grad.addColorStop(0.6, 'rgba(255,100,0,0.5)');
    grad.addColorStop(1, 'rgba(255,50,0,0)');
    ctx.beginPath();
    ctx.moveTo(x - width, y);
    ctx.quadraticCurveTo(x - width * 0.4, y + length * 0.6, x, y + length);
    ctx.quadraticCurveTo(x + width * 0.4, y + length * 0.6, x + width, y);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    // 内焰
    ctx.beginPath();
    ctx.moveTo(x - width * 0.3, y);
    ctx.quadraticCurveTo(x, y + length * 0.5, x, y + length * 0.7);
    ctx.quadraticCurveTo(x, y + length * 0.5, x + width * 0.3, y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fill();
    ctx.restore();
}

export class Renderer {
    static drawTriangle(ctx, x, y, w, h, color, strokeColor = null) {
        ctx.beginPath();
        ctx.moveTo(x, y - h / 2);
        ctx.lineTo(x - w / 2, y + h / 2);
        ctx.lineTo(x + w / 2, y + h / 2);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }

    static drawDiamond(ctx, x, y, w, h, color, strokeColor = null) {
        ctx.beginPath();
        ctx.moveTo(x, y - h / 2);
        ctx.lineTo(x + w / 2, y);
        ctx.lineTo(x, y + h / 2);
        ctx.lineTo(x - w / 2, y);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }

    static drawHexagon(ctx, x, y, r, color, strokeColor = null) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const px = x + r * Math.cos(angle);
            const py = y + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }

    static drawCircle(ctx, x, y, r, color) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }

    static drawGlow(ctx, x, y, r, color, alpha = 0.3) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    static drawHealthBar(ctx, x, y, w, h, ratio, color = '#00e5ff', bgColor = 'rgba(255,255,255,0.15)') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(x - w / 2, y, w, h);
        ctx.fillStyle = color;
        ctx.fillRect(x - w / 2, y, w * Math.max(0, ratio), h);
    }
}
