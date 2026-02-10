import { HUD } from './hud.js';
import { Menu } from './menu.js';
import { Leaderboard } from './leaderboard.js';
import { saveScore } from '../storage.js';
import { GameState } from '../game.js';

export class UIManager {
    constructor(game) {
        this.game = game;
        this.hud = new HUD(game);
        this.menu = new Menu(game);
        this.leaderboard = new Leaderboard(game);

        // 暂停按钮触控区域
        this._bindPauseButton();
    }

    _bindPauseButton() {
        this.game.canvas.addEventListener('click', (e) => {
            if (this.game.state !== GameState.PLAYING) return;
            const rect = this.game.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            // 右上角暂停区域
            if (x > this.game.width - 50 && y < 50) {
                this.game.setState(GameState.PAUSED);
            }
        });
    }

    onStateChange(newState, prevState) {
        const ui = document.getElementById('ui-layer');

        switch (newState) {
            case GameState.MENU:
                this.menu.showMainMenu();
                break;
            case GameState.SHIP_SELECT:
                this.menu.showShipSelect();
                break;
            case GameState.PLAYING:
                ui.innerHTML = '';
                break;
            case GameState.PAUSED:
                this.menu.showPause();
                break;
            case GameState.BOSS_INTRO:
                ui.innerHTML = '';
                break;
            case GameState.DEATH_SEQUENCE:
                ui.innerHTML = '';
                break;
            case GameState.GAME_OVER:
                this.menu.showGameOver(this.game.scoreSystem.score);
                break;
            case GameState.LEADERBOARD:
                this.leaderboard.show();
                break;
        }
    }

    showLeaderboard(highlightScore = null) {
        this.leaderboard.show(highlightScore);
        this.game.setState(GameState.LEADERBOARD);
    }

    saveAndShowLeaderboard(name, score) {
        const shipType = this.game.player ? this.game.player.shipType : 'balanced';
        saveScore(name, score, shipType);
        this.leaderboard.show(score);
    }

    renderHUD(ctx) {
        if (this.game.state === GameState.PLAYING || this.game.state === GameState.BOSS_INTRO) {
            this.hud.render(ctx);
        }
    }
}
