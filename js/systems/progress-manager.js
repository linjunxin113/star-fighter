import { loadProgress, saveProgress } from '../storage.js';

const MILESTONES = [
    {
        id: 'fire_start',
        name: '火力先发',
        condition: '到达章节 2（波 11）',
        reward: '起始火力 +1',
        check: (data) => data.highestWave >= 10,
        bonus: { startFireLevel: 1 },
    },
    {
        id: 'damage_up',
        name: '强化弹药',
        condition: '到达章节 3（波 21）',
        reward: '伤害 +15%',
        check: (data) => data.highestWave >= 20,
        bonus: { damageMultiplier: 1.15 },
    },
    {
        id: 'hp_up',
        name: '装甲强化',
        condition: '通关章节 3（波 30）',
        reward: '最大 HP +2',
        check: (data) => data.highestWave >= 29,
        bonus: { maxHpBonus: 2 },
    },
    {
        id: 'score_mult',
        name: '赏金猎人',
        condition: '累计 50,000 分',
        reward: '分数倍率 +10%',
        check: (data) => data.totalScore >= 50000,
        bonus: { scoreMultiplier: 1.1 },
    },
    {
        id: 'magnet_range',
        name: '引力增幅',
        condition: '累计 150,000 分',
        reward: '磁铁范围 +25%',
        check: (data) => data.totalScore >= 150000,
        bonus: { magnetRangeMultiplier: 1.25 },
    },
    {
        id: 'shield_dur',
        name: '持久护盾',
        condition: '累计 300,000 分',
        reward: '护盾时长 +5s',
        check: (data) => data.totalScore >= 300000,
        bonus: { shieldDurationBonus: 5 },
    },
];

export class ProgressManager {
    constructor() {
        this.data = loadProgress();
    }

    getMilestones() {
        return MILESTONES;
    }

    isUnlocked(id) {
        return this.data.unlocked.includes(id);
    }

    getActiveBonus() {
        const bonus = {
            startFireLevel: 0,
            damageMultiplier: 1,
            maxHpBonus: 0,
            scoreMultiplier: 1,
            magnetRangeMultiplier: 1,
            shieldDurationBonus: 0,
        };
        for (const m of MILESTONES) {
            if (this.data.unlocked.includes(m.id) && m.bonus) {
                for (const [key, val] of Object.entries(m.bonus)) {
                    if (key === 'damageMultiplier' || key === 'scoreMultiplier' || key === 'magnetRangeMultiplier') {
                        bonus[key] *= val;
                    } else {
                        bonus[key] += val;
                    }
                }
            }
        }
        return bonus;
    }

    onGameEnd(wave, score) {
        this.data.highestWave = Math.max(this.data.highestWave, wave);
        this.data.totalScore += score;
        this.data.gamesPlayed++;
        const newUnlocks = this.checkUnlocks();
        saveProgress(this.data);
        return newUnlocks;
    }

    checkUnlocks() {
        const newUnlocks = [];
        for (const m of MILESTONES) {
            if (!this.data.unlocked.includes(m.id) && m.check(this.data)) {
                this.data.unlocked.push(m.id);
                newUnlocks.push(m);
            }
        }
        return newUnlocks;
    }
}