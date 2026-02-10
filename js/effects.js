export class ScreenEffects {
    constructor() {
        this.shakeX = 0;
        this.shakeY = 0;
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeTimer = 0;

        this.flashColor = null;
        this.flashDuration = 0;
        this.flashTimer = 0;

        // Slow motion
        this.timeScale = 1;
        this.slowMoTarget = 1;
        this.slowMoDuration = 0;
        this.slowMoTimer = 0;

        // Hit stop (freeze frames)
        this.hitStopTimer = 0;

        // Border glow
        this.borderGlowColor = null;
        this.borderGlowDuration = 0;
        this.borderGlowTimer = 0;

        // Vignette
        this.vignetteBase = 0.3;
        this.vignetteRed = 0; // extra red vignette for low HP
    }

    shake(intensity, duration) {
        if (intensity > this.shakeIntensity) {
            this.shakeIntensity = intensity;
            this.shakeDuration = duration;
            this.shakeTimer = duration;
        }
    }

    flash(color, duration) {
        this.flashColor = color;
        this.flashDuration = duration;
        this.flashTimer = duration;
    }
    slowMo(scale, duration) {
        this.slowMoTarget = scale;
        this.slowMoDuration = duration;
        this.slowMoTimer = duration;
    }

    hitStop(duration) {
        this.hitStopTimer = duration;
    }

    borderGlow(color, duration) {
        this.borderGlowColor = color;
        this.borderGlowDuration = duration;
        this.borderGlowTimer = duration;
    }

    setVignetteRed(amount) {
        this.vignetteRed = amount;
    }

    getEffectiveDt(dt) {
        // Hit stop: freeze everything
        if (this.hitStopTimer > 0) {
            this.hitStopTimer -= dt;
            return 0;
        }
        // Slow motion
        return dt * this.timeScale;
    }

    update(dt) {
        // Shake
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
            const ratio = this.shakeTimer / this.shakeDuration;
            const intensity = this.shakeIntensity * ratio;
            this.shakeX = (Math.random() - 0.5) * 2 * intensity;
            this.shakeY = (Math.random() - 0.5) * 2 * intensity;
            if (this.shakeTimer <= 0) {
                this.shakeX = 0;
                this.shakeY = 0;
                this.shakeIntensity = 0;
            }
        }
        // Flash
        if (this.flashTimer > 0) {
            this.flashTimer -= dt;
        }
        // Slow motion
        if (this.slowMoTimer > 0) {
            this.slowMoTimer -= dt;
            const progress = 1 - (this.slowMoTimer / this.slowMoDuration);
            // Ease back to 1.0
            this.timeScale = this.slowMoTarget + (1 - this.slowMoTarget) * progress;
            if (this.slowMoTimer <= 0) {
                this.timeScale = 1;
            }
        }
        // Border glow
        if (this.borderGlowTimer > 0) {
            this.borderGlowTimer -= dt;
        }
    }
    applyShake(ctx) {
        if (this.shakeX !== 0 || this.shakeY !== 0) {
            ctx.translate(this.shakeX, this.shakeY);
        }
    }

    renderFlash(ctx, w, h) {
        if (this.flashTimer > 0 && this.flashColor) {
            const alpha = (this.flashTimer / this.flashDuration) * 0.4;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.flashColor;
            ctx.fillRect(-10, -10, w + 20, h + 20);
            ctx.restore();
        }
    }

    renderVignette(ctx, w, h) {
        // Base dark vignette
        const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.85);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, `rgba(0,0,0,${this.vignetteBase})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Red vignette for low HP
        if (this.vignetteRed > 0) {
            const rGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7);
            rGrad.addColorStop(0, 'transparent');
            rGrad.addColorStop(1, `rgba(255,0,0,${this.vignetteRed * 0.25})`);
            ctx.fillStyle = rGrad;
            ctx.fillRect(0, 0, w, h);
        }
    }

    renderScanlines(ctx, w, h) {
        ctx.save();
        ctx.globalAlpha = 0.03;
        ctx.fillStyle = '#000000';
        for (let y = 0; y < h; y += 3) {
            ctx.fillRect(0, y, w, 1);
        }
        ctx.restore();
    }

    renderBorderGlow(ctx, w, h) {
        if (this.borderGlowTimer <= 0) return;
        const alpha = (this.borderGlowTimer / this.borderGlowDuration) * 0.5;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowColor = this.borderGlowColor;
        ctx.shadowBlur = 30;
        ctx.strokeStyle = this.borderGlowColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, w, h);
        ctx.restore();
    }
}
