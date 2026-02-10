// 章节定义：主题色、波次范围、Boss 分配
export const CHAPTERS = [
    // 章节 1：深空（波 1-10）
    {
        name: '深空',
        nameEn: 'DEEP SPACE',
        waveStart: 0,  // 0-indexed
        waveEnd: 9,
        bosses: { 4: 'boss1', 9: 'boss2' },  // waveIndex -> bossKey
        theme: {
            bg: {
                top: '#040610',
                mid1: '#080c1a',
                mid2: '#0a0e20',
                bottom: '#0c1028',
            },
            nebulas: [
                { inner: 'rgba(30,60,180,0.04)', outer: 'rgba(20,40,120,0.02)' },
                { inner: 'rgba(120,20,160,0.04)', outer: 'rgba(80,10,100,0.02)' },
                { inner: 'rgba(20,140,100,0.03)', outer: 'rgba(10,80,60,0.015)' },
                { inner: 'rgba(160,40,40,0.03)', outer: 'rgba(100,20,20,0.015)' },
            ],
            starColors: ['#ffffff', '#aaccff', '#ffddaa', '#aaffee'],
            planetColors: [
                { base: '#2a4a7a', light: '#4a7aba', ring: 'rgba(100,160,255,0.15)' },
                { base: '#7a3a2a', light: '#ba6a4a', ring: 'rgba(255,140,100,0.12)' },
                { base: '#3a6a4a', light: '#5aaa6a', ring: 'rgba(100,255,140,0.1)' },
                { base: '#6a4a7a', light: '#9a6aba', ring: null },
            ],
        },
    },
    // 章节 2：星云禁区（波 11-20）
    {
        name: '星云禁区',
        nameEn: 'NEBULA ZONE',
        waveStart: 10,
        waveEnd: 19,
        bosses: { 14: 'boss3', 19: 'boss4' },
        theme: {
            bg: {
                top: '#0c0418',
                mid1: '#140828',
                mid2: '#1a0c35',
                bottom: '#200e40',
            },
            nebulas: [
                { inner: 'rgba(140,40,200,0.05)', outer: 'rgba(100,20,160,0.025)' },
                { inner: 'rgba(200,40,180,0.04)', outer: 'rgba(150,20,120,0.02)' },
                { inner: 'rgba(60,20,200,0.04)', outer: 'rgba(40,10,140,0.02)' },
                { inner: 'rgba(180,60,220,0.03)', outer: 'rgba(120,30,160,0.015)' },
            ],
            starColors: ['#eeddff', '#cc99ff', '#ff99dd', '#aabbff'],
            planetColors: [
                { base: '#5a2a7a', light: '#8a4aba', ring: 'rgba(180,100,255,0.15)' },
                { base: '#7a2a5a', light: '#ba4a8a', ring: 'rgba(255,100,200,0.12)' },
                { base: '#3a3a7a', light: '#5a5aba', ring: 'rgba(140,140,255,0.1)' },
                { base: '#6a2a6a', light: '#aa4aaa', ring: null },
            ],
        },
    },
    // 章节 3：炼狱核心（波 21-30）
    {
        name: '炼狱核心',
        nameEn: 'INFERNO CORE',
        waveStart: 20,
        waveEnd: 29,
        bosses: { 24: 'boss5', 29: 'boss6' },
        theme: {
            bg: {
                top: '#180804',
                mid1: '#28100a',
                mid2: '#35140c',
                bottom: '#401a0e',
            },
            nebulas: [
                { inner: 'rgba(220,60,20,0.05)', outer: 'rgba(160,30,10,0.025)' },
                { inner: 'rgba(255,120,20,0.04)', outer: 'rgba(200,80,10,0.02)' },
                { inner: 'rgba(200,40,40,0.04)', outer: 'rgba(140,20,20,0.02)' },
                { inner: 'rgba(255,80,0,0.03)', outer: 'rgba(180,50,0,0.015)' },
            ],
            starColors: ['#ffddcc', '#ffaa77', '#ff8844', '#ffccaa'],
            planetColors: [
                { base: '#7a3a1a', light: '#ba6a3a', ring: 'rgba(255,160,80,0.15)' },
                { base: '#7a2a2a', light: '#ba4a4a', ring: 'rgba(255,100,100,0.12)' },
                { base: '#6a4a1a', light: '#aa7a3a', ring: 'rgba(255,200,100,0.1)' },
                { base: '#7a3a3a', light: '#ba5a5a', ring: null },
            ],
        },
    },
];

export const TOTAL_WAVES = 30;

export function getChapterForWave(waveIndex) {
    const idx = waveIndex % TOTAL_WAVES;
    for (let i = 0; i < CHAPTERS.length; i++) {
        if (idx >= CHAPTERS[i].waveStart && idx <= CHAPTERS[i].waveEnd) {
            return i;
        }
    }
    return 0;
}
