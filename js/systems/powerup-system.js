import { PowerUp, POWERUP_TYPES } from '../entities/powerup.js';
import { checkAABB } from '../collision.js';

export class PowerUpSystem {
    constructor(game) {
        this.game = game;
    }

    reset() {
        this.game.powerups = [];
    }

    trySpawn(x, y, dropRate) {
        if (Math.random() < dropRate) {
            const types = Object.keys(POWERUP_TYPES);
            // 加权随机：火力升级和治疗更常见
            const weights = [30, 15, 12, 8, 20, 15]; // fireup, spread, shield, bomb, heal, magnet
            const total = weights.reduce((a, b) => a + b, 0);
            let r = Math.random() * total;
            let type = types[0];
            for (let i = 0; i < weights.length; i++) {
                r -= weights[i];
                if (r <= 0) { type = types[i]; break; }
            }
            this.game.powerups.push(new PowerUp(x, y, type));
        }
    }

    spawnBossDrops(x, y) {
        // Boss 掉落 3-4 个道具
        const count = 3 + Math.floor(Math.random() * 2);
        const types = Object.keys(POWERUP_TYPES);
        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const ox = (Math.random() - 0.5) * 60;
            const oy = (Math.random() - 0.5) * 40;
            this.game.powerups.push(new PowerUp(x + ox, y + oy, type));
        }
    }

    checkCollection(player) {
        for (let i = this.game.powerups.length - 1; i >= 0; i--) {
            const p = this.game.powerups[i];

            // 磁铁吸附
            if (player.magnet) {
                const dx = player.x - p.x;
                const dy = player.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < player.magnetRange) {
                    p.attract(player.x, player.y, this.game.fixedDt);
                }
            }

            if (checkAABB(p, player)) {
                this._applyPowerUp(player, p);
                this.game.particleSystem.createPickupEffect(p.x, p.y, p.color);
                if (this.game.audio) this.game.audio.playPowerup();
                if (this.game.input) this.game.input.vibrate(30);
                this.game.powerups.splice(i, 1);
            }
        }
    }

    _applyPowerUp(player, powerup) {
        switch (powerup.type) {
            case 'fireup':
                if (player.fireLevel < player.maxFireLevel) {
                    player.fireLevel++;
                }
                break;
            case 'spread':
                player.spread = true;
                player.spreadTimer = powerup.duration;
                break;
            case 'shield':
                player.shield = true;
                player.shieldTimer = powerup.duration;
                break;
            case 'bomb':
                this._clearScreen();
                break;
            case 'heal':
                player.hp = Math.min(player.hp + 2, player.maxHp);
                break;
            case 'magnet':
                player.magnet = true;
                player.magnetTimer = powerup.duration;
                break;
        }
    }

    _clearScreen() {
        // 清屏炸弹
        const game = this.game;
        for (const e of game.enemies) {
            game.scoreSystem.addKill(e.scoreValue);
            game.particleSystem.createExplosion(e.x, e.y, 10, e.color);
        }
        game.enemies = [];
        game.enemyBullets = [];

        // Boss 受到伤害但不直接击杀
        if (game.boss && game.boss.alive) {
            game.boss.hp -= 15;
            game.particleSystem.createExplosion(game.boss.x, game.boss.y, 25, '#ffab00');
        }

        // 全屏闪白效果
        game.particleSystem.createExplosion(game.width / 2, game.height / 2, 50, '#ffffff');
    }

    update(dt) {
        for (let i = this.game.powerups.length - 1; i >= 0; i--) {
            this.game.powerups[i].update(dt);
            if (!this.game.powerups[i].alive || this.game.powerups[i].isOffScreen(this.game.height)) {
                this.game.powerups.splice(i, 1);
            }
        }
    }

    render(ctx) {
        for (const p of this.game.powerups) {
            p.render(ctx);
        }
    }
}
