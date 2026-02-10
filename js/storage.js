const STORAGE_KEY = 'starfighter_leaderboard';
const PROGRESS_KEY = 'starfighter_progress';

export function loadLeaderboard() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function saveScore(name, score, shipType) {
    const board = loadLeaderboard();
    board.push({ name, score, shipType, date: Date.now() });
    board.sort((a, b) => b.score - a.score);
    const top10 = board.slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(top10));
    return top10;
}

export function loadProgress() {
    try {
        const data = localStorage.getItem(PROGRESS_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            return {
                highestWave: parsed.highestWave || 0,
                totalScore: parsed.totalScore || 0,
                gamesPlayed: parsed.gamesPlayed || 0,
                unlocked: parsed.unlocked || [],
            };
        }
    } catch { /* ignore */ }
    return { highestWave: 0, totalScore: 0, gamesPlayed: 0, unlocked: [] };
}

export function saveProgress(data) {
    try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
    } catch { /* ignore */ }
}
