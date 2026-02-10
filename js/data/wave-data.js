// 波次配置（30 波，3 章节）
export const WAVE_DATA = [
    // === 章节 1：深空（波 1-10）===
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
    // Wave 5: Boss 1（守卫者）
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
    // Wave 10: Boss 2（毁灭者）
    { boss: 'boss2' },

    // === 章节 2：星云禁区（波 11-20）===
    // Wave 11: 中型为主 + sine/zigzag 混合
    {
        groups: [
            { type: 'medium', count: 5, pattern: 'sine', delay: 0, interval: 0.6, formation: 'line' },
            { type: 'small', count: 4, pattern: 'zigzag', delay: 1.5, interval: 0.3, formation: 'spread' },
        ]
    },
    // Wave 12: 精英穿插 + 中型编队
    {
        groups: [
            { type: 'elite', count: 1, pattern: 'zigzag', delay: 0, interval: 0, formation: 'center' },
            { type: 'medium', count: 4, pattern: 'sine', delay: 0.5, interval: 0.5, formation: 'spread' },
            { type: 'small', count: 6, pattern: 'straight', delay: 1.5, interval: 0.25, formation: 'line' },
        ]
    },
    // Wave 13: 密集 zigzag + dive 组合
    {
        groups: [
            { type: 'medium', count: 6, pattern: 'zigzag', delay: 0, interval: 0.4, formation: 'line' },
            { type: 'small', count: 8, pattern: 'dive', delay: 1, interval: 0.2, formation: 'spread' },
        ]
    },
    // Wave 14: 精英双出 + 中型护卫
    {
        groups: [
            { type: 'elite', count: 2, pattern: 'sine', delay: 0, interval: 0.8, formation: 'spread' },
            { type: 'medium', count: 3, pattern: 'zigzag', delay: 0.5, interval: 0.6, formation: 'line' },
            { type: 'small', count: 6, pattern: 'dive', delay: 1.5, interval: 0.2, formation: 'spread' },
        ]
    },
    // Wave 15: Boss 3（幻影）
    { boss: 'boss3' },
    // Wave 16: 密集小型 dive 编队
    {
        groups: [
            { type: 'small', count: 12, pattern: 'dive', delay: 0, interval: 0.2, formation: 'line' },
            { type: 'medium', count: 4, pattern: 'sine', delay: 1, interval: 0.5, formation: 'spread' },
        ]
    },
    // Wave 17: 精英双出 + 小型蜂群
    {
        groups: [
            { type: 'elite', count: 2, pattern: 'zigzag', delay: 0, interval: 1.0, formation: 'spread' },
            { type: 'small', count: 10, pattern: 'zigzag', delay: 0.5, interval: 0.15, formation: 'line' },
        ]
    },
    // Wave 18: 全类型混编
    {
        groups: [
            { type: 'elite', count: 1, pattern: 'sine', delay: 0, interval: 0, formation: 'center' },
            { type: 'medium', count: 5, pattern: 'zigzag', delay: 0.5, interval: 0.4, formation: 'spread' },
            { type: 'small', count: 8, pattern: 'dive', delay: 1.5, interval: 0.2, formation: 'line' },
        ]
    },
    // Wave 19: 精英重甲 + dive 蜂群
    {
        groups: [
            { type: 'elite', count: 2, pattern: 'sine', delay: 0, interval: 0.8, formation: 'spread' },
            { type: 'medium', count: 4, pattern: 'dive', delay: 0.5, interval: 0.4, formation: 'line' },
            { type: 'small', count: 10, pattern: 'dive', delay: 1.5, interval: 0.15, formation: 'spread' },
        ]
    },
    // Wave 20: Boss 4（深渊领主）
    { boss: 'boss4' },

    // === 章节 3：炼狱核心（波 21-30）===
    // Wave 21: 精英三出 + 全类型混编
    {
        groups: [
            { type: 'elite', count: 3, pattern: 'zigzag', delay: 0, interval: 0.6, formation: 'spread' },
            { type: 'medium', count: 4, pattern: 'dive', delay: 1, interval: 0.4, formation: 'line' },
        ]
    },
    // Wave 22: 极限密度 dive
    {
        groups: [
            { type: 'small', count: 14, pattern: 'dive', delay: 0, interval: 0.15, formation: 'line' },
            { type: 'elite', count: 2, pattern: 'sine', delay: 1, interval: 0.8, formation: 'spread' },
        ]
    },
    // Wave 23: 精英重甲编队
    {
        groups: [
            { type: 'elite', count: 3, pattern: 'sine', delay: 0, interval: 0.5, formation: 'line' },
            { type: 'medium', count: 6, pattern: 'zigzag', delay: 1, interval: 0.3, formation: 'spread' },
            { type: 'small', count: 8, pattern: 'dive', delay: 2, interval: 0.15, formation: 'spread' },
        ]
    },
    // Wave 24: 全面进攻
    {
        groups: [
            { type: 'elite', count: 2, pattern: 'zigzag', delay: 0, interval: 0.6, formation: 'spread' },
            { type: 'medium', count: 5, pattern: 'dive', delay: 0.5, interval: 0.3, formation: 'line' },
            { type: 'small', count: 12, pattern: 'zigzag', delay: 1.5, interval: 0.12, formation: 'spread' },
        ]
    },
    // Wave 25: Boss 5（烈焰将军）
    { boss: 'boss5' },
    // Wave 26: 精英蜂群
    {
        groups: [
            { type: 'elite', count: 3, pattern: 'dive', delay: 0, interval: 0.5, formation: 'spread' },
            { type: 'small', count: 10, pattern: 'zigzag', delay: 0.5, interval: 0.12, formation: 'line' },
        ]
    },
    // Wave 27: 重甲编队 + 小型蜂群
    {
        groups: [
            { type: 'elite', count: 2, pattern: 'sine', delay: 0, interval: 0.8, formation: 'spread' },
            { type: 'medium', count: 6, pattern: 'dive', delay: 0.5, interval: 0.3, formation: 'line' },
            { type: 'small', count: 14, pattern: 'dive', delay: 1.5, interval: 0.1, formation: 'spread' },
        ]
    },
    // Wave 28: 极限混编
    {
        groups: [
            { type: 'elite', count: 3, pattern: 'zigzag', delay: 0, interval: 0.4, formation: 'line' },
            { type: 'medium', count: 5, pattern: 'sine', delay: 0.5, interval: 0.3, formation: 'spread' },
            { type: 'small', count: 12, pattern: 'dive', delay: 1, interval: 0.1, formation: 'spread' },
        ]
    },
    // Wave 29: 最终防线
    {
        groups: [
            { type: 'elite', count: 4, pattern: 'sine', delay: 0, interval: 0.5, formation: 'spread' },
            { type: 'medium', count: 6, pattern: 'zigzag', delay: 1, interval: 0.25, formation: 'line' },
            { type: 'small', count: 10, pattern: 'dive', delay: 2, interval: 0.1, formation: 'spread' },
        ]
    },
    // Wave 30: Boss 6（终焉）
    { boss: 'boss6' },
];