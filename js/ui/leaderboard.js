import { loadLeaderboard } from '../storage.js';

export class Leaderboard {
    constructor(game) {
        this.game = game;
    }

    show(highlightScore = null) {
        const ui = document.getElementById('ui-layer');
        ui.innerHTML = '';

        const board = loadLeaderboard();

        const screen = document.createElement('div');
        screen.className = 'menu-screen';

        let html = '<div class="menu-title" style="font-size:22px;">排行榜</div>';
        html += '<ul class="leaderboard-list">';

        if (board.length === 0) {
            html += '<li class="leaderboard-item"><span style="color:rgba(255,255,255,0.3)">暂无记录</span></li>';
        } else {
            for (let i = 0; i < board.length; i++) {
                const entry = board[i];
                const isHighlight = highlightScore !== null && entry.score === highlightScore;
                html += `
                    <li class="leaderboard-item${isHighlight ? ' highlight' : ''}">
                        <span class="rank">${i + 1}.</span>
                        <span class="name">${this._escapeHtml(entry.name)}</span>
                        <span class="score">${entry.score.toLocaleString()}</span>
                    </li>
                `;
            }
        }

        html += '</ul>';
        html += '<button class="menu-btn" id="btn-back-menu" style="margin-top:12px;">返回主菜单</button>';

        screen.innerHTML = html;
        ui.appendChild(screen);

        document.getElementById('btn-back-menu').addEventListener('click', () => {
            if (this.game.audio) this.game.audio.playUIClick();
            this.game.uiManager.menu.showMainMenu();
            this.game.setState('menu');
        });
    }

    _escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}
