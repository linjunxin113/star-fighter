const STORAGE_KEY = 'starfighter_leaderboard';

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
