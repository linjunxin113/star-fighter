// 波次配置
export const WAVE_DATA = [
    // Wave 1: 简单直线小兵
    {
        groups: [
            { type: 'small', count: 5, pattern: 'straight', delay: 0, interval: 0.6, formation: 'line' },
        ]
    },
    // Wave 2: 两侧小兵
    {
        groups: [
            { type: 'small', count: 4, pattern: 'straight', delay: 0, interval: 0.4, formation: 'left' },
            { type: 'small', count: 4, pattern: 'straight', delay: 1.5, interval: 0.4, formation: 'right' },
        ]
    },
    // Wave 3: 正弦移动
    {
        groups: [
            { type: 'small', count: 6, pattern: 'sine', delay: 0, interval: 0.5, formation: 'line' },
            { type: 'medium', count: 1, pattern: 'straight', delay: 2, interval: 0, formation: 'center' },
        ]
    },
    // Wave 4: 混合
    {
        groups: [
            { type: 'medium', count: 3, pattern: 'sine', delay: 0, interval: 0.8, formation: 'spread' },
            { type: 'small', count: 6, pattern: 'zigzag', delay: 1, interval: 0.3, formation: 'line' },
        ]
    },
    // Wave 5: Boss wave (handled by wave manager)
    { boss: 'boss1' },
    // Wave 6: 加强
    {
        groups: [
            { type: 'small', count: 8, pattern: 'straight', delay: 0, interval: 0.3, formation: 'line' },
            { type: 'medium', count: 3, pattern: 'sine', delay: 1, interval: 0.6, formation: 'spread' },
        ]
    },
    // Wave 7: 精英出场
    {
        groups: [
            { type: 'elite', count: 1, pattern: 'sine', delay: 0, interval: 0, formation: 'center' },
            { type: 'small', count: 6, pattern: 'straight', delay: 0.5, interval: 0.4, formation: 'spread' },
        ]
    },
    // Wave 8: 密集
    {
        groups: [
            { type: 'small', count: 10, pattern: 'dive', delay: 0, interval: 0.25, formation: 'line' },
            { type: 'medium', count: 4, pattern: 'zigzag', delay: 1.5, interval: 0.5, formation: 'spread' },
        ]
    },
    // Wave 9: 精英 + 中型
    {
        groups: [
            { type: 'elite', count: 2, pattern: 'sine', delay: 0, interval: 1.0, formation: 'spread' },
            { type: 'medium', count: 4, pattern: 'straight', delay: 0.5, interval: 0.5, formation: 'line' },
            { type: 'small', count: 8, pattern: 'zigzag', delay: 2, interval: 0.2, formation: 'spread' },
        ]
    },
    // Wave 10: Boss 2
    { boss: 'boss2' },
];
