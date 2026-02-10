export const ENEMY_TYPES = {
    small: {
        hp: 1,
        speed: 100,
        scoreValue: 100,
        dropRate: 0.18,
        color: '#ff5252',
        size: 12,
        hitW: 20,
        hitH: 20,
        fireRate: 0,  // 不射击
    },
    medium: {
        hp: 3,
        speed: 70,
        scoreValue: 250,
        dropRate: 0.35,
        color: '#ff9100',
        size: 18,
        hitW: 30,
        hitH: 30,
        fireRate: 2.0,  // 每2秒射击
    },
    elite: {
        hp: 6,
        speed: 55,
        scoreValue: 500,
        dropRate: 0.55,
        color: '#e040fb',
        size: 20,
        hitW: 34,
        hitH: 34,
        fireRate: 1.2,
    }
};
