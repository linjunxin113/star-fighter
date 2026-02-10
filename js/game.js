// 游戏状态枚举
export const GameState = {
    MENU: 'menu',
    SHIP_SELECT: 'ship_select',
    PLAYING: 'playing',
    PAUSED: 'paused',
    BOSS_INTRO: 'boss_intro',
    DEATH_SEQUENCE: 'death_sequence',
    GAME_OVER: 'game_over',
    LEADERBOARD: 'leaderboard'
};

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.state = GameState.MENU;
        this.prevState = null;

        // 设计分辨率（竖屏）
        this.designWidth = 390;
        this.designHeight = 844;
        this.scale = 1;

        // 游戏对象容器
        this.player = null;
        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.boss = null;
        this.powerups = [];
        this.particles = [];

        // 系统引用（由 main.js 注入）
        this.input = null;
        this.renderer = null;
        this.background = null;
        this.waveManager = null;
        this.powerupSystem = null;
        this.scoreSystem = null;
        this.uiManager = null;
        this.particleSystem = null;
        this.effects = null;
        this.audio = null;

        // 时间
        this.lastTime = 0;
        this.accumulator = 0;
        this.fixedDt = 1 / 60; // 60fps 逻辑步长
        this.running = false;

        // Boss intro timer
        this.bossIntroTimer = 0;
        this.bossIntroDuration = 2.0;

        // Death sequence
        this.deathSequenceTimer = 0;
        this.deathSequenceDuration = 2.5;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        // 按设计宽度等比缩放，高度自适应
        const ratio = screenW / this.designWidth;
        this.canvas.width = screenW * dpr;
        this.canvas.height = screenH * dpr;
        this.canvas.style.width = screenW + 'px';
        this.canvas.style.height = screenH + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        this.scale = ratio;
        this.width = screenW;
        this.height = screenH;

        // 更新 UI 层尺寸
        const uiLayer = document.getElementById('ui-layer');
        if (uiLayer) {
            uiLayer.style.width = screenW + 'px';
            uiLayer.style.height = screenH + 'px';
        }
    }

    setState(newState) {
        this.prevState = this.state;
        this.state = newState;
        if (this.uiManager) {
            this.uiManager.onStateChange(newState, this.prevState);
        }
    }

    startGame(shipType) {
        // 重置游戏对象
        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.boss = null;
        this.powerups = [];
        this.particles = [];

        // 初始化玩家
        const { Player } = this._playerModule;
        this.player = new Player(this, shipType);

        // 重置系统
        this.scoreSystem.reset();
        this.waveManager.reset();
        this.powerupSystem.reset();

        this.setState(GameState.PLAYING);

        // Start background music
        if (this.audio) this.audio.startMusic();
    }

    startBossIntro(boss) {
        this.boss = boss;
        this.bossIntroTimer = 0;
        if (this.background) this.background.speedMultiplier = 2.0;
        this.setState(GameState.BOSS_INTRO);
    }

    update(dt) {
        // 全局效果更新
        if (this.effects) this.effects.update(dt);

        if (this.state === GameState.PLAYING || this.state === GameState.BOSS_INTRO) {
            // 背景始终滚动
            this.background.update(dt);

            if (this.state === GameState.BOSS_INTRO) {
                this.bossIntroTimer += dt;
                // Boss 入场动画
                if (this.boss) {
                    this.boss.updateIntro(dt, this.bossIntroTimer / this.bossIntroDuration);
                }
                if (this.bossIntroTimer >= this.bossIntroDuration) {
                    if (this.background) this.background.speedMultiplier = 1.5;
                    this.setState(GameState.PLAYING);
                }
                // 粒子继续更新
                this.particleSystem.update(dt);
                // HUD 更新（boss HP bar）
                if (this.uiManager && this.uiManager.hud) {
                    this.uiManager.hud.update(dt);
                }
                return;
            }

            // 玩家更新
            if (this.player && this.player.alive) {
                this.player.update(dt);
            }

            // 子弹更新
            this.updateBullets(dt);

            // 敌机更新
            this.updateEnemies(dt);

            // Boss 更新
            if (this.boss) {
                this.boss.update(dt);
                if (!this.boss.alive) {
                    this.scoreSystem.addScore(this.boss.scoreValue);
                    // Boss kill floating text
                    if (this.uiManager && this.uiManager.hud) {
                        this.uiManager.hud.addFloatingText(this.boss.x, this.boss.y, `+${this.boss.scoreValue}`, '#ffab00', 28);
                    }
                    this.particleSystem.createExplosion(
                        this.boss.x, this.boss.y, 120, '#ff6600'
                    );
                    this.particleSystem.createDebris(this.boss.x, this.boss.y, 30, this.boss.color);
                    this.particleSystem.createPhaseTransition(this.boss.x, this.boss.y, '#ffffff');
                    // Boss 掉落多个道具
                    this.powerupSystem.spawnBossDrops(this.boss.x, this.boss.y);
                    if (this.effects) {
                        this.effects.shake(12, 0.8);
                        this.effects.flash('#ffffff', 0.4);
                        this.effects.slowMo(0.15, 2.5);
                        this.effects.hitStop(0.1);
                    }
                    if (this.audio) this.audio.playExplosionLarge();
                    if (this.audio) this.audio.setBossMode(false);
                    if (this.input) this.input.vibrate([50, 30, 50, 30, 100]);
                    if (this.background) this.background.speedMultiplier = 1.0;
                    this.boss = null;
                }
            }

            // 道具更新
            this.powerupSystem.update(dt);

            // 波次管理
            this.waveManager.update(dt);

            // 碰撞检测
            this.checkCollisions();

            // 粒子更新
            this.particleSystem.update(dt);

            // HUD 更新
            if (this.uiManager && this.uiManager.hud) {
                this.uiManager.hud.update(dt);
            }

            // 更新暗角红色（低血量）
            if (this.effects && this.player && this.player.alive) {
                const hpRatio = this.player.hp / this.player.maxHp;
                this.effects.setVignetteRed(hpRatio <= 0.4 ? (1 - hpRatio / 0.4) : 0);
            }

            // 检查玩家死亡 -> 进入死亡演出
            if (this.player && !this.player.alive) {
                if (this.audio) this.audio.stopMusic();
                this.deathSequenceTimer = 0;
                if (this.effects) {
                    this.effects.hitStop(0.1);
                    this.effects.slowMo(0.2, 1.0);
                    this.effects.shake(10, 0.6);
                }
                if (this.audio) this.audio.playExplosionLarge();
                this.setState(GameState.DEATH_SEQUENCE);
            }
        }

        // Death sequence update
        if (this.state === GameState.DEATH_SEQUENCE) {
            this.deathSequenceTimer += dt;
            this.background.update(dt);
            this.particleSystem.update(dt);
            if (this.deathSequenceTimer >= this.deathSequenceDuration) {
                this.setState(GameState.GAME_OVER);
            }
        }
    }

    updateBullets(dt) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update(dt);
            if (this.bullets[i].isOffScreen(this.width, this.height)) {
                this.bullets.splice(i, 1);
            }
        }
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            this.enemyBullets[i].update(dt);
            if (this.enemyBullets[i].isOffScreen(this.width, this.height)) {
                this.enemyBullets.splice(i, 1);
            }
        }
    }

    updateEnemies(dt) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].update(dt);
            if (this.enemies[i].isOffScreen(this.height)) {
                this.enemies.splice(i, 1);
            }
        }
    }

    checkCollisions() {
        const { checkAABB } = this._collisionModule;

        // 玩家子弹 vs 敌机
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            // vs 普通敌机
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const e = this.enemies[j];
                if (checkAABB(b, e)) {
                    e.hp -= b.damage;
                    b.alive = false;
                    if (e.hp <= 0) {
                        e.alive = false;
                        this.scoreSystem.addKill(e.scoreValue);
                        this.particleSystem.createExplosion(e.x, e.y, 25, e.color);
                        this.particleSystem.createDebris(e.x, e.y, 6, e.color);
                        // Elite enemies get extra shockwave
                        if (e.type === 'elite') {
                            this.particleSystem.createEnergyWave(e.x, e.y, e.color);
                        }
                        this.powerupSystem.trySpawn(e.x, e.y, e.dropRate);
                        this.enemies.splice(j, 1);
                        if (this.effects) {
                            this.effects.shake(2, 0.1);
                            this.effects.slowMo(0.7, 0.15);
                        }
                        if (this.audio) this.audio.playExplosionSmall();
                        // Floating score text
                        const pts = Math.floor(e.scoreValue * this.scoreSystem.multiplier);
                        if (this.uiManager && this.uiManager.hud) {
                            this.uiManager.hud.addFloatingText(e.x, e.y, `+${pts}`, '#ffffff', 14);
                        }
                    }
                    break;
                }
            }
            // vs Boss
            if (b.alive && this.boss && this.boss.alive) {
                if (checkAABB(b, this.boss)) {
                    this.boss.hp -= b.damage;
                    b.alive = false;
                    this.particleSystem.createHitSpark(b.x, b.y);
                    if (this.boss.hp <= 0) {
                        this.boss.alive = false;
                    } else if (this.effects) {
                        this.effects.hitStop(0.03);
                    }
                }
            }
            if (!b.alive) {
                this.bullets.splice(i, 1);
            }
        }

        if (!this.player || !this.player.alive) return;

        // 敌弹 vs 玩家
        if (!this.player.invincible) {
            for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
                const b = this.enemyBullets[i];
                if (checkAABB(b, this.player)) {
                    this.player.takeDamage(b.damage);
                    this.enemyBullets.splice(i, 1);
                }
            }

            // 敌机 vs 玩家
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const e = this.enemies[i];
                if (checkAABB(e, this.player)) {
                    this.player.takeDamage(1);
                    e.alive = false;
                    this.particleSystem.createExplosion(e.x, e.y, 12, e.color);
                    this.enemies.splice(i, 1);
                }
            }

            // Boss 碰撞
            if (this.boss && this.boss.alive && checkAABB(this.boss, this.player)) {
                this.player.takeDamage(2);
            }
        }

        // 道具 vs 玩家
        this.powerupSystem.checkCollection(this.player);
    }

    render() {
        const ctx = this.ctx;
        ctx.save();
        ctx.clearRect(0, 0, this.width, this.height);

        // 屏幕震动
        if (this.effects) this.effects.applyShake(ctx);

        // 背景
        this.background.render(ctx);

        if (this.state === GameState.PLAYING || this.state === GameState.BOSS_INTRO ||
            this.state === GameState.PAUSED || this.state === GameState.GAME_OVER ||
            this.state === GameState.DEATH_SEQUENCE) {

            // 道具
            this.powerupSystem.render(ctx);

            // 敌机
            for (const e of this.enemies) {
                e.render(ctx);
            }

            // Boss
            if (this.boss) {
                this.boss.render(ctx);
            }

            // 玩家
            if (this.player && this.player.alive) {
                this.player.render(ctx);
            }

            // 触摸指示器
            if (this.input) this.input.renderTouchIndicator(ctx);

            // 子弹
            for (const b of this.bullets) {
                b.render(ctx);
            }
            for (const b of this.enemyBullets) {
                b.render(ctx);
            }

            // 粒子
            this.particleSystem.render(ctx);

            // HUD
            if (this.uiManager && this.state !== GameState.DEATH_SEQUENCE) {
                this.uiManager.renderHUD(ctx);
            }

            // Death sequence fade-to-black
            if (this.state === GameState.DEATH_SEQUENCE) {
                const fadeStart = 1.5;
                const fadeDuration = 1.0;
                if (this.deathSequenceTimer > fadeStart) {
                    const alpha = Math.min(1, (this.deathSequenceTimer - fadeStart) / fadeDuration);
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(-10, -10, this.width + 20, this.height + 20);
                    ctx.restore();
                }
            }
        }

        // 全屏闪光
        if (this.effects) this.effects.renderFlash(ctx, this.width, this.height);

        // 后处理效果
        if (this.effects) {
            this.effects.renderVignette(ctx, this.width, this.height);
            this.effects.renderScanlines(ctx, this.width, this.height);
            this.effects.renderBorderGlow(ctx, this.width, this.height);
        }

        ctx.restore();
    }

    loop(timestamp) {
        if (!this.running) return;

        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        this.accumulator += dt;
        while (this.accumulator >= this.fixedDt) {
            const effectiveDt = this.effects ? this.effects.getEffectiveDt(this.fixedDt) : this.fixedDt;
            this.update(effectiveDt);
            this.accumulator -= this.fixedDt;
        }

        this.render();
        requestAnimationFrame((t) => this.loop(t));
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }
}
