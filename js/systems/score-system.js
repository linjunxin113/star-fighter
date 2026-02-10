export class ScoreSystem {
    constructor(game) {
        this.game = game;
        this.score = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.comboDuration = 2.0; // 2秒内连续击杀保持连击
        this.maxCombo = 0;
        this.multiplier = 1;
        this.bonusMultiplier = 1; // 解锁加成倍率
    }

    reset() {
        this.score = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.maxCombo = 0;
        this.multiplier = 1;
    }

    addKill(baseScore) {
        this.combo++;
        this.comboTimer = this.comboDuration;
        this.multiplier = 1 + Math.floor(this.combo / 5) * 0.5;
        if (this.multiplier > 5) this.multiplier = 5;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;
        this.score += Math.floor(baseScore * this.multiplier * this.bonusMultiplier);
    }

    addScore(points) {
        this.score += Math.floor(points * this.bonusMultiplier);
    }

    update(dt) {
        if (this.combo > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) {
                this.combo = 0;
                this.multiplier = 1;
            }
        }
    }
}
