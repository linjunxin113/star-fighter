export class InputManager {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.touchActive = false;
        this.touchX = 0;
        this.touchY = 0;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.playerOffsetX = 0;
        this.playerOffsetY = 0;

        this._bindKeyboard();
        this._bindTouch();
    }

    _bindKeyboard() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Escape') {
                this._handlePause();
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    _bindTouch() {
        const canvas = this.game.canvas;

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            this.touchX = touch.clientX - rect.left;
            this.touchY = touch.clientY - rect.top;
            this.touchStartX = this.touchX;
            this.touchStartY = this.touchY;

            if (this.game.player && this.game.player.alive) {
                this.playerOffsetX = this.game.player.x - this.touchX;
                this.playerOffsetY = this.game.player.y - this.touchY;
            }
            this.touchActive = true;
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            this.touchX = touch.clientX - rect.left;
            this.touchY = touch.clientY - rect.top;
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchActive = false;
        }, { passive: false });

        canvas.addEventListener('touchcancel', (e) => {
            this.touchActive = false;
        });
    }

    _handlePause() {
        if (this.game.state === 'playing') {
            this.game.setState('paused');
        } else if (this.game.state === 'paused') {
            this.game.setState('playing');
        }
    }

    getMovement() {
        let dx = 0, dy = 0;

        // 键盘
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) dx -= 1;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) dx += 1;
        if (this.keys['ArrowUp'] || this.keys['KeyW']) dy -= 1;
        if (this.keys['ArrowDown'] || this.keys['KeyS']) dy += 1;

        // 归一化
        if (dx !== 0 && dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;
        }

        return { dx, dy, keyboard: dx !== 0 || dy !== 0 };
    }

    getTouchTarget() {
        if (!this.touchActive) return null;
        return {
            x: this.touchX + this.playerOffsetX,
            y: this.touchY + this.playerOffsetY
        };
    }

    isShooting() {
        return this.keys['Space'] || this.keys['KeyZ'] || this.touchActive;
    }

    vibrate(pattern) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    renderTouchIndicator(ctx) {
        if (!this.touchActive) return;
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.touchX + this.playerOffsetX, this.touchY + this.playerOffsetY, 30, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
    }
}
