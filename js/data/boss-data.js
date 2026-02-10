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
    }
};
