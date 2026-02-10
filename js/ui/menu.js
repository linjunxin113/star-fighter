import { PLAYER_TYPES } from '../data/player-data.js';
import { CHAPTERS } from '../data/chapter-data.js';
import { darkenColor } from '../renderer.js';
import { GameState } from '../game.js';

export class Menu {
    constructor(game) {
        this.game = game;
        this.selectedShip = 'balanced';
    }

    _transition(callback) {
        const ui = document.getElementById('ui-layer');
        const current = ui.querySelector('.menu-screen, .pause-overlay');
        if (current) {
            current.classList.add('fade-out');
            setTimeout(() => callback(), 250);
        } else {
            callback();
        }
    }

    showMainMenu() {
        this._transition(() => {
            const ui = document.getElementById('ui-layer');
            ui.innerHTML = '';

        const screen = document.createElement('div');
        screen.className = 'menu-screen';

        screen.innerHTML = `
            <div class="menu-title">STAR FIGHTER</div>
            <div class="menu-subtitle">-- 星际战机 --</div>
            <button class="menu-btn" id="btn-start">开始游戏</button>
            <button class="menu-btn" id="btn-leaderboard">排行榜</button>
            <button class="menu-btn" id="btn-achievements" style="background:transparent; border-color:rgba(255,171,0,0.3); color:rgba(255,171,0,0.8);">成就</button>
        `;

        ui.appendChild(screen);

        document.getElementById('btn-start').addEventListener('click', () => {
            if (this.game.audio) this.game.audio.playUIClick();
            this.showShipSelect();
        });
        document.getElementById('btn-leaderboard').addEventListener('click', () => {
            if (this.game.audio) this.game.audio.playUIClick();
            this.game.uiManager.showLeaderboard();
        });
        document.getElementById('btn-achievements').addEventListener('click', () => {
            if (this.game.audio) this.game.audio.playUIClick();
            this.showAchievements();
        });
        }); // end _transition
    }

    showShipSelect() {
        this._transition(() => {
        const ui = document.getElementById('ui-layer');
        ui.innerHTML = '';

        const screen = document.createElement('div');
        screen.className = 'menu-screen';

        let html = '<div class="menu-title" style="font-size:22px;">选择战机</div>';

        for (const [key, cfg] of Object.entries(PLAYER_TYPES)) {
            const selected = key === this.selectedShip ? ' selected' : '';
            html += `
                <div class="ship-card${selected}" data-ship="${key}">
                    <canvas class="ship-preview" data-type="${key}" width="50" height="50"></canvas>
                    <div class="ship-info">
                        <div class="ship-name">${cfg.name}</div>
                        <div class="ship-desc">${cfg.desc}</div>
                        <div class="ship-stats">
                            <div class="stat-bar">
                                <div class="stat-label">速度</div>
                                <div class="stat-track"><div class="stat-fill" style="width:${cfg.stats.speed * 100}%"></div></div>
                            </div>
                            <div class="stat-bar">
                                <div class="stat-label">火力</div>
                                <div class="stat-track"><div class="stat-fill" style="width:${cfg.stats.firepower * 100}%; background:#ff6d00"></div></div>
                            </div>
                            <div class="stat-bar">
                                <div class="stat-label">防御</div>
                                <div class="stat-track"><div class="stat-fill" style="width:${cfg.stats.defense * 100}%; background:#69f0ae"></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        html += '<button class="menu-btn" id="btn-go" style="margin-top:8px;">出击</button>';
        html += '<button class="menu-btn" id="btn-back" style="background:transparent; border-color:rgba(255,255,255,0.15); color:rgba(255,255,255,0.5);">返回</button>';

        screen.innerHTML = html;
        ui.appendChild(screen);

        // 绘制战机预览
        this._drawShipPreviews();

        // 选择事件
        const cards = screen.querySelectorAll('.ship-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                cards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedShip = card.dataset.ship;
            });
        });

        document.getElementById('btn-go').addEventListener('click', () => {
            if (this.game.audio) this.game.audio.playUIClick();
            ui.innerHTML = '';
            this.game.startGame(this.selectedShip);
        });
        document.getElementById('btn-back').addEventListener('click', () => {
            if (this.game.audio) this.game.audio.playUIClick();
            this.showMainMenu();
        });
        }); // end _transition
    }

    _drawShipPreviews() {
        const canvases = document.querySelectorAll('.ship-preview');
        canvases.forEach(cvs => {
            const ctx = cvs.getContext('2d');
            const type = cvs.dataset.type;
            const cfg = PLAYER_TYPES[type];
            const cx = 25, cy = 25;
            const color = cfg.color;
            const glow = cfg.glowColor;

            ctx.clearRect(0, 0, 50, 50);

            if (type === 'speed') {
                this._drawSpeedPreview(ctx, cx, cy, color, glow);
            } else if (type === 'heavy') {
                this._drawHeavyPreview(ctx, cx, cy, color, glow);
            } else {
                this._drawBalancedPreview(ctx, cx, cy, color, glow);
            }
        });
    }

    _drawBalancedPreview(c, cx, cy, color, glow) {
        c.beginPath();
        c.moveTo(cx, cy - 18);
        c.lineTo(cx + 3, cy - 13);
        c.lineTo(cx + 5, cy - 6);
        c.lineTo(cx + 16, cy + 3);
        c.lineTo(cx + 18, cy + 6);
        c.lineTo(cx + 11, cy + 5);
        c.lineTo(cx + 6, cy + 8);
        c.lineTo(cx + 4, cy + 13);
        c.lineTo(cx + 2, cy + 15);
        c.lineTo(cx + 2, cy + 11);
        c.lineTo(cx - 2, cy + 11);
        c.lineTo(cx - 2, cy + 15);
        c.lineTo(cx - 4, cy + 13);
        c.lineTo(cx - 6, cy + 8);
        c.lineTo(cx - 11, cy + 5);
        c.lineTo(cx - 18, cy + 6);
        c.lineTo(cx - 16, cy + 3);
        c.lineTo(cx - 5, cy - 6);
        c.lineTo(cx - 3, cy - 13);
        c.closePath();
        const grad = c.createLinearGradient(cx, cy - 18, cx, cy + 15);
        grad.addColorStop(0, glow);
        grad.addColorStop(0.4, color);
        grad.addColorStop(1, darkenColor(color, 0.5));
        c.fillStyle = grad;
        c.fill();
        c.strokeStyle = glow;
        c.lineWidth = 0.8;
        c.stroke();
        // 驾驶舱
        c.beginPath();
        c.moveTo(cx, cy - 15);
        c.lineTo(cx + 2, cy - 8);
        c.lineTo(cx, cy - 5);
        c.lineTo(cx - 2, cy - 8);
        c.closePath();
        c.fillStyle = 'rgba(150,220,255,0.8)';
        c.fill();
    }

    _drawSpeedPreview(c, cx, cy, color, glow) {
        c.beginPath();
        c.moveTo(cx, cy - 20);
        c.lineTo(cx + 2, cy - 15);
        c.lineTo(cx + 2, cy - 5);
        c.lineTo(cx + 14, cy - 8);
        c.lineTo(cx + 13, cy - 5);
        c.lineTo(cx + 4, cy + 1);
        c.lineTo(cx + 6, cy + 8);
        c.lineTo(cx + 5, cy + 11);
        c.lineTo(cx + 2, cy + 8);
        c.lineTo(cx + 2, cy + 13);
        c.lineTo(cx - 2, cy + 13);
        c.lineTo(cx - 2, cy + 8);
        c.lineTo(cx - 5, cy + 11);
        c.lineTo(cx - 6, cy + 8);
        c.lineTo(cx - 4, cy + 1);
        c.lineTo(cx - 13, cy - 5);
        c.lineTo(cx - 14, cy - 8);
        c.lineTo(cx - 2, cy - 5);
        c.lineTo(cx - 2, cy - 15);
        c.closePath();
        const grad = c.createLinearGradient(cx, cy - 20, cx, cy + 13);
        grad.addColorStop(0, glow);
        grad.addColorStop(0.5, color);
        grad.addColorStop(1, darkenColor(color, 0.4));
        c.fillStyle = grad;
        c.fill();
        c.strokeStyle = glow;
        c.lineWidth = 0.6;
        c.stroke();
        c.beginPath();
        c.moveTo(cx, cy - 16);
        c.lineTo(cx + 1.5, cy - 10);
        c.lineTo(cx, cy - 7);
        c.lineTo(cx - 1.5, cy - 10);
        c.closePath();
        c.fillStyle = 'rgba(120,255,150,0.7)';
        c.fill();
    }

    _drawHeavyPreview(c, cx, cy, color, glow) {
        c.beginPath();
        c.moveTo(cx, cy - 13);
        c.lineTo(cx + 5, cy - 11);
        c.lineTo(cx + 8, cy - 6);
        c.lineTo(cx + 10, cy - 2);
        c.lineTo(cx + 20, cy + 1);
        c.lineTo(cx + 21, cy + 6);
        c.lineTo(cx + 16, cy + 8);
        c.lineTo(cx + 11, cy + 6);
        c.lineTo(cx + 8, cy + 11);
        c.lineTo(cx + 5, cy + 15);
        c.lineTo(cx + 3, cy + 11);
        c.lineTo(cx - 3, cy + 11);
        c.lineTo(cx - 5, cy + 15);
        c.lineTo(cx - 8, cy + 11);
        c.lineTo(cx - 11, cy + 6);
        c.lineTo(cx - 16, cy + 8);
        c.lineTo(cx - 21, cy + 6);
        c.lineTo(cx - 20, cy + 1);
        c.lineTo(cx - 10, cy - 2);
        c.lineTo(cx - 8, cy - 6);
        c.lineTo(cx - 5, cy - 11);
        c.closePath();
        const grad = c.createLinearGradient(cx, cy - 13, cx, cy + 15);
        grad.addColorStop(0, glow);
        grad.addColorStop(0.3, color);
        grad.addColorStop(1, darkenColor(color, 0.4));
        c.fillStyle = grad;
        c.fill();
        c.strokeStyle = glow;
        c.lineWidth = 1;
        c.stroke();
        c.beginPath();
        c.moveTo(cx - 3, cy - 10);
        c.lineTo(cx + 3, cy - 10);
        c.lineTo(cx + 2, cy - 3);
        c.lineTo(cx - 2, cy - 3);
        c.closePath();
        c.fillStyle = 'rgba(255,180,100,0.7)';
        c.fill();
    }

    showPause() {
        const ui = document.getElementById('ui-layer');
        ui.innerHTML = '';

        const overlay = document.createElement('div');
        overlay.className = 'pause-overlay';
        overlay.innerHTML = `
            <div class="pause-title">暂停</div>
            <button class="menu-btn" id="btn-resume" style="width:200px;">继续</button>
            <button class="menu-btn" id="btn-quit" style="width:200px; background:transparent; border-color:rgba(255,255,255,0.15); color:rgba(255,255,255,0.5);">退出</button>
        `;
        ui.appendChild(overlay);

        document.getElementById('btn-resume').addEventListener('click', () => {
            if (this.game.audio) this.game.audio.playUIClick();
            ui.innerHTML = '';
            this.game.setState('playing');
        });
        document.getElementById('btn-quit').addEventListener('click', () => {
            if (this.game.audio) this.game.audio.playUIClick();
            ui.innerHTML = '';
            this.game.setState('menu');
        });
    }

    showGameOver(score) {
        const ui = document.getElementById('ui-layer');
        ui.innerHTML = '';

        const screen = document.createElement('div');
        screen.className = 'menu-screen';
        screen.innerHTML = `
            <div class="menu-title gameover-stage" style="font-size:24px; color:#ff5252; animation-delay:0s;">GAME OVER</div>
            <div class="score-label gameover-stage" style="animation-delay:0.5s;">最终得分</div>
            <div class="score-display gameover-stage" id="score-counter" style="animation-delay:0.8s;">0</div>
            <input class="name-input gameover-stage" id="player-name" type="text" placeholder="输入名字" maxlength="10" value="Player" style="animation-delay:2.3s;">
            <button class="menu-btn gameover-stage" id="btn-save" style="animation-delay:2.3s;">保存分数</button>
        `;
        ui.appendChild(screen);

        // Score counting animation
        const scoreEl = document.getElementById('score-counter');
        const duration = 1500;
        const startTime = performance.now() + 800; // delay to match stage reveal
        const animate = (now) => {
            const elapsed = now - startTime;
            if (elapsed < 0) { requestAnimationFrame(animate); return; }
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(score * eased);
            scoreEl.textContent = current.toLocaleString();
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);

        const nameInput = document.getElementById('player-name');
        setTimeout(() => { nameInput.focus(); nameInput.select(); }, 2400);

        document.getElementById('btn-save').addEventListener('click', () => {
            if (this.game.audio) this.game.audio.playUIClick();
            const name = nameInput.value.trim() || 'Player';
            this.game.uiManager.saveAndShowLeaderboard(name, score);
        });
    }

    showChapterTransition() {
        const ui = document.getElementById('ui-layer');
        ui.innerHTML = '';

        const wm = this.game.waveManager;
        const chapter = CHAPTERS[wm.currentChapter];

        const screen = document.createElement('div');
        screen.className = 'menu-screen';
        screen.style.background = 'rgba(0,0,0,0.6)';
        screen.innerHTML = `
            <div class="chapter-transition">
                <div class="chapter-label gameover-stage" style="animation-delay:0s; color:rgba(255,255,255,0.5); font-size:14px; letter-spacing:4px;">CHAPTER ${wm.currentChapter + 1}</div>
                <div class="chapter-name gameover-stage" style="animation-delay:0.3s; font-size:28px; font-weight:bold; color:#ffffff; margin:8px 0;">${chapter.name}</div>
                <div class="chapter-name-en gameover-stage" style="animation-delay:0.5s; font-size:14px; color:rgba(255,255,255,0.4); letter-spacing:2px;">${chapter.nameEn}</div>
                <button class="menu-btn gameover-stage" id="btn-chapter-continue" style="animation-delay:1s; margin-top:30px;">继续</button>
            </div>
        `;
        ui.appendChild(screen);

        if (this.game.effects) {
            this.game.effects.flash('#ffffff', 0.3);
            const themeColor = chapter.theme.bg.bottom;
            this.game.effects.borderGlow(themeColor, 2);
        }

        document.getElementById('btn-chapter-continue').addEventListener('click', () => {
            if (this.game.audio) this.game.audio.playUIClick();
            ui.innerHTML = '';
            this.game.chapterTransitionTimer = 3.0; // 立即结束过渡
        });
    }

    showAchievements() {
        this._transition(() => {
        const ui = document.getElementById('ui-layer');
        ui.innerHTML = '';

        const pm = this.game.progressManager;
        if (!pm) return;

        const screen = document.createElement('div');
        screen.className = 'menu-screen';

        let html = '<div class="menu-title" style="font-size:22px;">成就</div>';
        html += '<div style="width:100%; max-width:320px; margin:0 auto;">';

        const milestones = pm.getMilestones();
        for (const m of milestones) {
            const unlocked = pm.isUnlocked(m.id);
            const opacity = unlocked ? '1' : '0.4';
            const icon = unlocked ? '&#9733;' : '&#9734;';
            const color = unlocked ? '#ffab00' : 'rgba(255,255,255,0.3)';
            html += `
                <div style="display:flex; align-items:center; padding:8px 12px; margin:4px 0; background:rgba(255,255,255,0.05); border-radius:6px; opacity:${opacity};">
                    <span style="font-size:20px; color:${color}; margin-right:10px;">${icon}</span>
                    <div style="flex:1;">
                        <div style="font-size:13px; font-weight:bold; color:#ffffff;">${m.name}</div>
                        <div style="font-size:11px; color:rgba(255,255,255,0.5);">${unlocked ? m.reward : m.condition}</div>
                    </div>
                </div>
            `;
        }

        html += '</div>';
        html += '<button class="menu-btn" id="btn-ach-back" style="margin-top:12px; background:transparent; border-color:rgba(255,255,255,0.15); color:rgba(255,255,255,0.5);">返回</button>';

        screen.innerHTML = html;
        ui.appendChild(screen);

        document.getElementById('btn-ach-back').addEventListener('click', () => {
            if (this.game.audio) this.game.audio.playUIClick();
            this.showMainMenu();
        });
        }); // end _transition
    }
}
