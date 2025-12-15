/**
 * Phaser 懶載入器
 * 只在需要時載入 Phaser.js（~400KB）
 */

let phaserLoaded = false;
let phaserGame = null;

/**
 * 載入 Phaser 3 函式庫
 * @returns {Promise<boolean>}
 */
async function loadPhaser() {
    if (phaserLoaded) {
        console.log('[Phaser Loader] 已載入，跳過');
        return true;
    }

    console.log('[Phaser Loader] 開始載入 Phaser 3...');

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js';

        script.onload = () => {
            phaserLoaded = true;
            console.log('[Phaser Loader] Phaser 3 載入成功');
            resolve(true);
        };

        script.onerror = (error) => {
            console.error('[Phaser Loader] Phaser 3 載入失敗', error);
            reject(error);
        };

        document.head.appendChild(script);
    });
}

/**
 * 初始化 Phaser 遊戲實例
 * @param {Object} config - Phaser 遊戲配置
 * @returns {Promise<Phaser.Game>}
 */
async function initPhaserGame(config) {
    // 確認 Phaser 已載入
    if (!phaserLoaded) {
        throw new Error('Phaser 尚未載入，請先呼叫 loadPhaser()');
    }

    if (!phaserGame) {
        console.log('[Phaser Loader] 建立遊戲實例');
        phaserGame = new Phaser.Game(config);
    } else {
        console.log('[Phaser Loader] 使用現有遊戲實例');
    }

    return phaserGame;
}

/**
 * 銷毀 Phaser 遊戲實例
 */
function destroyPhaserGame() {
    if (phaserGame) {
        console.log('[Phaser Loader] 銷毀遊戲實例');
        phaserGame.destroy(true);
        phaserGame = null;
    }
}

/**
 * 取得當前遊戲實例
 * @returns {Phaser.Game|null}
 */
function getPhaserGame() {
    return phaserGame;
}

/**
 * 檢查 Phaser 是否已載入
 * @returns {boolean}
 */
function isPhaserLoaded() {
    return phaserLoaded;
}
