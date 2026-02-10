export class HUD {
    constructor(game) {
        this.game = game;
        this.displayScore = 0;
        this.scoreScale = 1;
        this.comboScale = 1;
        this.floatingTexts = [];
        this.hpShakeTimer = 0;
        this.bossDisplayHp = 1;
        this.prevCombo = 0;
        this.prevHp = -1;
        this.unlockToast = null;
    }

    addFloatingText(x, y, text, color = '#ffffff', size = 16) {
        this.floatingTexts.push({
            x, y, text, color, size,
            vy: -60, life: 1.0, maxLife: 1.0
        });
    }

    showUnlockToast(name, desc) {
        this.unlockToast = { name, desc, timer: 3.0, maxTimer: 3.0 };
        if (this.game.effects) {
            this.game.effects.borderGlow('#ffab00', 2);
        }
    }

    update(dt) {
        const score = this.game.scoreSystem;
        // Smooth score interpolation
        this.displayScore += (score.score - this.displayScore) * Math.min(1, dt * 10);
        if (Math.abs(this.displayScore - score.score) < 1) this.displayScore = score.score;

        // Score scale bounce
        if (this.scoreScale > 1) {
            this.scoreScale = Math.max(1, this.scoreScale - dt * 3);
        }

        // Combo scale bounce
        if (this.comboScale > 1) {
            this.comboScale = Math.max(1, this.comboScale - dt * 4);
        }

        // Detect combo change
        if (score.combo > this.prevCombo && score.combo > 2) {
            this.comboScale = 1.5;
            // Combo milestone audio
            if ((score.combo === 5 || score.combo === 10 || score.combo === 15 || score.combo % 10 === 0) && this.game.audio) {
                this.game.audio.playComboMilestone();
            }
        }
        this.prevCombo = score.combo;

        // Score pop on change
        if (score.score > Math.floor(this.displayScore) + 10) {
            this.scoreScale = 1.3;
        }

        // HP shake detection
        const player = this.game.player;
        if (player) {
            if (this.prevHp > 0 && player.hp < this.prevHp) {
                this.hpShakeTimer = 0.3;
            }
            this.prevHp = player.hp;
        }
        if (this.hpShakeTimer > 0) this.hpShakeTimer -= dt;

        // Boss HP smooth
        if (this.game.boss) {
            const targetHp = this.game.boss.hp / this.game.boss.maxHp;
            this.bossDisplayHp += (targetHp - this.bossDisplayHp) * Math.min(1, dt * 8);
        }

        // Floating texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy * dt;
            ft.life -= dt;
            if (ft.life <= 0) this.floatingTexts.splice(i, 1);
        }

        // Unlock toast
        if (this.unlockToast) {
            this.unlockToast.timer -= dt;
            if (this.unlockToast.timer <= 0) this.unlockToast = null;
        }
    }
    render(ctx) {
        const game = this.game;
        const player = game.player;
        const score = game.scoreSystem;
        if (!player) return;

        ctx.save();
        const padding = 12;
        const w = game.width;

        // Score (top-left) with scale animation
        ctx.save();
        const scoreX = padding;
        const scoreY = padding + 30;
        ctx.translate(scoreX, scoreY);
        ctx.scale(this.scoreScale, this.scoreScale);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(Math.floor(this.displayScore).toLocaleString(), 0, 0);
        ctx.restore();

        // Combo (below score) with glow and scale
        if (score.combo > 2) {
            ctx.save();
            const comboX = padding;
            const comboY = padding + 52;
            ctx.translate(comboX, comboY);
            ctx.scale(this.comboScale, this.comboScale);
            ctx.fillStyle = '#ffab00';
            ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            // Glow effect
            ctx.shadowColor = '#ffab00';
            ctx.shadowBlur = 8;
            ctx.fillText(`${score.combo} COMBO x${score.multiplier.toFixed(1)}`, 0, 0);
            ctx.restore();
        }

        // Wave (top-right) - 章节名 + 章内波次
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '12px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        const chapterName = game.waveManager.getChapterName();
        const waveInChapter = game.waveManager.getWaveInChapter();
        ctx.fillText(`${chapterName} W-${waveInChapter}`, w - padding, padding + 30);
        // HP (bottom-left) - rounded rects with glow
        const hpY = game.height - padding - 20;
        const hpShakeOff = this.hpShakeTimer > 0 ? (Math.random() - 0.5) * 4 : 0;
        for (let i = 0; i < player.maxHp; i++) {
            const hx = padding + i * 16 + hpShakeOff;
            const hy = hpY + (this.hpShakeTimer > 0 ? (Math.random() - 0.5) * 3 : 0);
            const filled = i < player.hp;
            ctx.save();
            if (filled) {
                ctx.fillStyle = player.cfg.color;
                // Low HP pulse
                if (player.hp <= 2) {
                    const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.008);
                    ctx.shadowColor = '#ff0000';
                    ctx.shadowBlur = 6 + pulse * 8;
                }
                // Full HP glow
                if (player.hp === player.maxHp) {
                    ctx.shadowColor = player.cfg.glowColor;
                    ctx.shadowBlur = 4;
                }
            } else {
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
            }
            // Rounded rect
            const rw = 11, rh = 11, r = 2;
            ctx.beginPath();
            ctx.moveTo(hx + r, hy);
            ctx.lineTo(hx + rw - r, hy);
            ctx.quadraticCurveTo(hx + rw, hy, hx + rw, hy + r);
            ctx.lineTo(hx + rw, hy + rh - r);
            ctx.quadraticCurveTo(hx + rw, hy + rh, hx + rw - r, hy + rh);
            ctx.lineTo(hx + r, hy + rh);
            ctx.quadraticCurveTo(hx, hy + rh, hx, hy + rh - r);
            ctx.lineTo(hx, hy + r);
            ctx.quadraticCurveTo(hx, hy, hx + r, hy);
            ctx.fill();
            ctx.restore();
        }

        // Fire level
        if (player.fireLevel > 1) {
            ctx.fillStyle = '#ff6d00';
            ctx.font = '11px "Segoe UI", system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`FIRE Lv.${player.fireLevel}`, padding, hpY - 14);
        }

        // Status icons (bottom-right)
        const statusY = game.height - padding - 16;
        let statusX = w - padding;
        ctx.font = '11px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        if (player.shield) {
            ctx.fillStyle = '#40c4ff';
            ctx.fillText(`SHIELD ${Math.ceil(player.shieldTimer)}s`, statusX, statusY);
            statusX -= 80;
        }
        if (player.spread) {
            ctx.fillStyle = '#ffab00';
            ctx.fillText(`SPREAD ${Math.ceil(player.spreadTimer)}s`, statusX, statusY);
            statusX -= 80;
        }
        if (player.magnet) {
            ctx.fillStyle = '#e040fb';
            ctx.fillText(`MAGNET ${Math.ceil(player.magnetTimer)}s`, statusX, statusY);
        }
        // Wave announcement - enhanced
        if (game.waveManager.isAnnouncing()) {
            const timer = game.waveManager.waveAnnounceTimer;
            const alpha = Math.min(1, timer);
            const isBoss = game.boss !== null;
            const chName = game.waveManager.getChapterName();
            const wInCh = game.waveManager.getWaveInChapter();
            const text = isBoss ? 'WARNING' : `${chName} - WAVE ${wInCh}`;
            const textColor = isBoss ? '#ff3d00' : '#ffffff';

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const cy = game.height * 0.35;

            // Scale-in animation
            const entryProgress = Math.min(1, (1.5 - timer) / 0.3);
            const scale = 1 + (1 - entryProgress) * 0.5;
            ctx.translate(w / 2, cy);
            ctx.scale(scale, scale);

            // Decorative lines
            ctx.strokeStyle = textColor;
            ctx.lineWidth = 1;
            ctx.globalAlpha = alpha * 0.5;
            ctx.beginPath(); ctx.moveTo(-100, 0); ctx.lineTo(-40, 0); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(40, 0); ctx.lineTo(100, 0); ctx.stroke();

            ctx.globalAlpha = alpha;
            ctx.fillStyle = textColor;
            ctx.font = 'bold 24px "Segoe UI", system-ui, sans-serif';
            ctx.fillText(text, 0, 0);

            // Boss warning: red pulsing bar
            if (isBoss) {
                const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.01);
                ctx.globalAlpha = alpha * pulse * 0.3;
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(-w / 2, -20, w, 40);
            }

            ctx.restore();
        }

        // Boss HP bar (drawn in HUD instead of boss.js)
        if (game.boss && game.boss.alive) {
            this._renderBossHPBar(ctx, w);
        }

        // Floating texts
        for (const ft of this.floatingTexts) {
            const alpha = ft.life / ft.maxLife;
            const scale = 0.7 + 0.3 * alpha;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(ft.x, ft.y);
            ctx.scale(scale, scale);
            ctx.fillStyle = ft.color;
            ctx.font = `bold ${ft.size}px "Segoe UI", system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = ft.color;
            ctx.shadowBlur = 4;
            ctx.fillText(ft.text, 0, 0);
            ctx.restore();
        }

        // Unlock toast notification
        if (this.unlockToast) {
            const toast = this.unlockToast;
            const elapsed = toast.maxTimer - toast.timer;
            // Slide in from top (0-0.3s), stay (0.3-2.5s), slide out (2.5-3.0s)
            let slideY;
            if (elapsed < 0.3) {
                slideY = -50 + 50 * (elapsed / 0.3);
            } else if (toast.timer < 0.5) {
                slideY = 50 * (toast.timer / 0.5) - 50;
            } else {
                slideY = 0;
            }
            ctx.save();
            ctx.translate(0, slideY);
            const toastW = 240;
            const toastH = 44;
            const toastX = (w - toastW) / 2;
            const toastY = padding + 50;
            // Background
            ctx.fillStyle = 'rgba(40,30,0,0.85)';
            ctx.strokeStyle = '#ffab00';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            const tr = 8;
            ctx.moveTo(toastX + tr, toastY);
            ctx.lineTo(toastX + toastW - tr, toastY);
            ctx.quadraticCurveTo(toastX + toastW, toastY, toastX + toastW, toastY + tr);
            ctx.lineTo(toastX + toastW, toastY + toastH - tr);
            ctx.quadraticCurveTo(toastX + toastW, toastY + toastH, toastX + toastW - tr, toastY + toastH);
            ctx.lineTo(toastX + tr, toastY + toastH);
            ctx.quadraticCurveTo(toastX, toastY + toastH, toastX, toastY + toastH - tr);
            ctx.lineTo(toastX, toastY + tr);
            ctx.quadraticCurveTo(toastX, toastY, toastX + tr, toastY);
            ctx.fill();
            ctx.stroke();
            // Star icon
            ctx.fillStyle = '#ffab00';
            ctx.font = '16px "Segoe UI", system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('\u2605', toastX + 10, toastY + toastH / 2);
            // Text
            ctx.fillStyle = '#ffab00';
            ctx.font = 'bold 12px "Segoe UI", system-ui, sans-serif';
            ctx.fillText(toast.name, toastX + 30, toastY + 14);
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.font = '10px "Segoe UI", system-ui, sans-serif';
            ctx.fillText(toast.desc, toastX + 30, toastY + 30);
            ctx.restore();
        }

        // Pause button
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '20px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText('\u23F8', w - padding, padding + 2);

        ctx.restore();
    }

    _renderBossHPBar(ctx, w) {
        const boss = this.game.boss;
        const barW = w * 0.6;
        const barH = 6;
        const barX = (w - barW) / 2;
        const barY = 30;

        // Background
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(barX, barY, barW, barH);

        // HP fill with color gradient (green -> yellow -> red)
        const ratio = Math.max(0, this.bossDisplayHp);
        let hpColor;
        if (ratio > 0.5) hpColor = '#4caf50';
        else if (ratio > 0.25) hpColor = '#ffeb3b';
        else hpColor = '#f44336';

        ctx.fillStyle = hpColor;
        ctx.fillRect(barX, barY, barW * ratio, barH);

        // Phase dividers
        if (boss.phases) {
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.lineWidth = 1;
            for (const phase of boss.phases) {
                if (phase.hpThreshold > 0 && phase.hpThreshold < 1) {
                    const px = barX + barW * phase.hpThreshold;
                    ctx.beginPath();
                    ctx.moveTo(px, barY);
                    ctx.lineTo(px, barY + barH);
                    ctx.stroke();
                }
            }
        }

        // Boss name with glow
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '12px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = boss.glowColor;
        ctx.shadowBlur = 6;
        ctx.fillText(boss.name, w / 2, barY - 6);
        ctx.restore();
    }
}
