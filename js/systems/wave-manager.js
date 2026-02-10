import { Enemy } from '../entities/enemy.js';
import { Boss } from '../entities/boss.js';
import { WAVE_DATA } from '../data/wave-data.js';
import { BOSS_DATA } from '../data/boss-data.js';

export class WaveManager {
    constructor(game) {
        this.game = game;
        this.currentWave = 0;
        this.waveTimer = 0;
        this.spawnQueue = [];
        this.waveActive = false;
        this.waveClearDelay = 2.0;
        this.waveClearTimer = 0;
        this.waveAnnounceTimer = 0;
        this.announcing = false;
        this.difficultyScale = 1;
        this.waveClearShown = false;
    }

    reset() {
        this.currentWave = 0;
        this.waveTimer = 0;
        this.spawnQueue = [];
        this.waveActive = false;
        this.waveClearTimer = 0;
        this.waveAnnounceTimer = 0;
        this.announcing = false;
        this.difficultyScale = 1;
        this._startWave();
    }

    _startWave() {
        const waveIndex = this.currentWave % WAVE_DATA.length;
        const wave = WAVE_DATA[waveIndex];
        // 每轮循环增加难度
        const loop = Math.floor(this.currentWave / WAVE_DATA.length);
        this.difficultyScale = 1 + loop * 0.3;

        this.announcing = true;
        this.waveAnnounceTimer = 1.5;

        if (wave.boss) {
            // Boss 波
            const bossKey = wave.boss;
            const bossData = { ...BOSS_DATA[bossKey] };
            bossData.hp = Math.floor(bossData.hp * this.difficultyScale);
            const boss = new Boss(this.game, bossData);
            this.game.startBossIntro(boss);
            if (this.game.audio) {
                this.game.audio.playBossWarning();
                this.game.audio.setBossMode(true);
            }
            this.waveActive = true;
            this.spawnQueue = [];
        } else {
            // 普通波
            this.spawnQueue = [];
            for (const group of wave.groups) {
                for (let i = 0; i < group.count; i++) {
                    const spawnTime = group.delay + i * group.interval;
                    const x = this._getFormationX(group.formation, i, group.count);
                    this.spawnQueue.push({
                        time: spawnTime,
                        type: group.type,
                        pattern: group.pattern,
                        x: x,
                    });
                }
            }
            this.spawnQueue.sort((a, b) => a.time - b.time);
            this.waveTimer = 0;
            this.waveActive = true;
        }
    }

    _getFormationX(formation, index, count) {
        const w = this.game.width;
        const margin = 40;
        switch (formation) {
            case 'line':
                return margin + ((w - margin * 2) / (count + 1)) * (index + 1);
            case 'left':
                return margin + Math.random() * (w * 0.3);
            case 'right':
                return w * 0.7 + Math.random() * (w * 0.3 - margin);
            case 'center':
                return w / 2 + (Math.random() - 0.5) * 40;
            case 'spread':
                return margin + Math.random() * (w - margin * 2);
            default:
                return Math.random() * w;
        }
    }

    update(dt) {
        // 计分系统更新
        this.game.scoreSystem.update(dt);

        // 波次公告
        if (this.announcing) {
            this.waveAnnounceTimer -= dt;
            if (this.waveAnnounceTimer <= 0) {
                this.announcing = false;
            }
        }

        if (!this.waveActive) return;

        // Boss 波：等 Boss 被击败
        if (this.game.boss) return;

        // 生成敌机
        this.waveTimer += dt;
        while (this.spawnQueue.length > 0 && this.spawnQueue[0].time <= this.waveTimer) {
            const spawn = this.spawnQueue.shift();
            const enemy = new Enemy(this.game, spawn.type, spawn.x, -30, spawn.pattern);
            // 难度缩放
            enemy.hp = Math.ceil(enemy.hp * this.difficultyScale);
            enemy.maxHp = enemy.hp;
            enemy.speed *= (1 + (this.difficultyScale - 1) * 0.3);
            this.game.enemies.push(enemy);
        }

        // 检查波次完成
        if (this.spawnQueue.length === 0 && this.game.enemies.length === 0) {
            // Wave clear celebration (once)
            if (!this.waveClearShown) {
                this.waveClearShown = true;
                if (this.game.uiManager && this.game.uiManager.hud) {
                    this.game.uiManager.hud.addFloatingText(
                        this.game.width / 2, this.game.height * 0.4,
                        'WAVE CLEAR!', '#4caf50', 22
                    );
                }
                // Celebration particles
                const cx = this.game.width / 2;
                const cy = this.game.height * 0.4;
                this.game.particleSystem.createPickupEffect(cx, cy, '#4caf50');
                if (this.game.audio) this.game.audio.playWaveClear();
            }
            this.waveClearTimer += dt;
            if (this.waveClearTimer >= this.waveClearDelay) {
                this.waveClearTimer = 0;
                this.waveActive = false;
                this.waveClearShown = false;
                this.currentWave++;
                this._startWave();
            }
        } else {
            this.waveClearTimer = 0;
        }
    }

    getWaveNumber() {
        return this.currentWave + 1;
    }

    isAnnouncing() {
        return this.announcing;
    }
}
