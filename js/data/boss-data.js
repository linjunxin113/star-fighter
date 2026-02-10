export const BOSS_DATA = {
    boss1: {
        name: '守卫者',
        hp: 80,
        scoreValue: 3000,
        color: '#ff3d00',
        glowColor: '#ff6e40',
        size: 50,
        hitW: 80,
        hitH: 60,
        mechanics: [],
        phases: [
            {
                hpThreshold: 0.6,
                pattern: 'spread',
                fireRate: 1.0,
                moveSpeed: 60,
            },
            {
                hpThreshold: 0.3,
                pattern: 'spiral',
                fireRate: 0.6,
                moveSpeed: 90,
            },
            {
                hpThreshold: 0,
                pattern: 'barrage',
                fireRate: 0.3,
                moveSpeed: 120,
            }
        ]
    },
    boss2: {
        name: '毁灭者',
        hp: 140,
        scoreValue: 6000,
        color: '#aa00ff',
        glowColor: '#d500f9',
        size: 55,
        hitW: 90,
        hitH: 65,
        mechanics: [],
        phases: [
            {
                hpThreshold: 0.7,
                pattern: 'spread',
                fireRate: 0.8,
                moveSpeed: 70,
            },
            {
                hpThreshold: 0.4,
                pattern: 'spiral',
                fireRate: 0.5,
                moveSpeed: 100,
            },
            {
                hpThreshold: 0,
                pattern: 'barrage',
                fireRate: 0.2,
                moveSpeed: 130,
            }
        ]
    },
    boss3: {
        name: '幻影',
        hp: 100,
        scoreValue: 8000,
        color: '#00e5ff',
        glowColor: '#18ffff',
        size: 48,
        hitW: 78,
        hitH: 58,
        mechanics: ['teleport'],
        phases: [
            {
                hpThreshold: 0.6,
                pattern: 'spread',
                fireRate: 0.9,
                moveSpeed: 80,
            },
            {
                hpThreshold: 0.3,
                pattern: 'laser',
                fireRate: 0.4,
                moveSpeed: 100,
            },
            {
                hpThreshold: 0,
                pattern: 'spiral',
                fireRate: 0.3,
                moveSpeed: 120,
            }
        ]
    },
    boss4: {
        name: '深渊领主',
        hp: 180,
        scoreValue: 12000,
        color: '#7b1fa2',
        glowColor: '#ce93d8',
        size: 58,
        hitW: 95,
        hitH: 70,
        mechanics: ['summonTimer'],
        phases: [
            {
                hpThreshold: 0.6,
                pattern: 'spiral',
                fireRate: 0.7,
                moveSpeed: 65,
            },
            {
                hpThreshold: 0.3,
                pattern: 'summon',
                fireRate: 0.5,
                moveSpeed: 85,
            },
            {
                hpThreshold: 0,
                pattern: 'barrage',
                fireRate: 0.2,
                moveSpeed: 110,
            }
        ]
    },
    boss5: {
        name: '烈焰将军',
        hp: 140,
        scoreValue: 15000,
        color: '#ff6d00',
        glowColor: '#ffab40',
        size: 52,
        hitW: 85,
        hitH: 62,
        mechanics: ['shield'],
        phases: [
            {
                hpThreshold: 0.6,
                pattern: 'cross',
                fireRate: 0.8,
                moveSpeed: 75,
            },
            {
                hpThreshold: 0.3,
                pattern: 'spread',
                fireRate: 0.4,
                moveSpeed: 95,
            },
            {
                hpThreshold: 0,
                pattern: 'barrage',
                fireRate: 0.2,
                moveSpeed: 125,
            }
        ]
    },
    boss6: {
        name: '终焉',
        hp: 250,
        scoreValue: 25000,
        color: '#e0e0e0',
        glowColor: '#ffffff',
        size: 60,
        hitW: 100,
        hitH: 75,
        mechanics: ['teleport', 'summonTimer', 'shield'],
        phases: [
            {
                hpThreshold: 0.7,
                pattern: 'laser',
                fireRate: 0.6,
                moveSpeed: 70,
            },
            {
                hpThreshold: 0.4,
                pattern: 'summon',
                fireRate: 0.4,
                moveSpeed: 90,
            },
            {
                hpThreshold: 0,
                pattern: 'cross',
                fireRate: 0.15,
                moveSpeed: 130,
            }
        ]
    },
};