// 三种机型配置
export const PLAYER_TYPES = {
    balanced: {
        name: '猎鹰',
        desc: '均衡型 - 攻守兼备',
        speed: 300,
        fireRate: 0.09,    // 射击间隔（秒）
        bulletDamage: 1,
        maxHp: 8,
        color: '#00e5ff',
        glowColor: '#00bcd4',
        // 属性条（0-1）
        stats: { speed: 0.6, firepower: 0.6, defense: 0.6 }
    },
    speed: {
        name: '幻影',
        desc: '速度型 - 灵活闪避',
        speed: 400,
        fireRate: 0.07,
        bulletDamage: 0.8,
        maxHp: 5,
        color: '#76ff03',
        glowColor: '#64dd17',
        stats: { speed: 1.0, firepower: 0.4, defense: 0.3 }
    },
    heavy: {
        name: '堡垒',
        desc: '重火力型 - 火力压制',
        speed: 220,
        fireRate: 0.12,
        bulletDamage: 1.8,
        maxHp: 12,
        color: '#ff6e40',
        glowColor: '#ff3d00',
        stats: { speed: 0.3, firepower: 1.0, defense: 0.8 }
    }
};
