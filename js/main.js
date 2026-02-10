import { Game, GameState } from './game.js';
import { InputManager } from './input.js';
import { Background } from './systems/background.js';
import { WaveManager } from './systems/wave-manager.js';
import { PowerUpSystem } from './systems/powerup-system.js';
import { ScoreSystem } from './systems/score-system.js';
import { ParticleSystem } from './particle.js';
import { UIManager } from './ui/ui-manager.js';
import { ScreenEffects } from './effects.js';
import { AudioSystem } from './systems/audio.js';
import * as CollisionModule from './collision.js';
import * as BulletModule from './entities/bullet.js';
import * as PlayerModule from './entities/player.js';

// 初始化
const canvas = document.getElementById('game-canvas');
const game = new Game(canvas);

// 注入模块引用（避免循环依赖）
game._collisionModule = CollisionModule;
game._bulletModule = BulletModule;
game._playerModule = PlayerModule;

// 初始化系统
game.input = new InputManager(game);
game.background = new Background(game);
game.scoreSystem = new ScoreSystem(game);
game.waveManager = new WaveManager(game);
game.powerupSystem = new PowerUpSystem(game);
game.particleSystem = new ParticleSystem(game);
game.effects = new ScreenEffects();
game.audio = new AudioSystem();
game.uiManager = new UIManager(game);

// 用户手势解锁音频
const unlockAudio = () => {
    game.audio.init();
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
};
document.addEventListener('click', unlockAudio);
document.addEventListener('touchstart', unlockAudio);

// 显示主菜单
game.setState(GameState.MENU);

// 启动游戏循环
game.start();
