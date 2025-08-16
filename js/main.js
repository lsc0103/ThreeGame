// 主入口文件
let gameCore;

// 全局函数 - 供HTML调用
function resetToDefaultPlayer() {
    if (gameCore) {
        gameCore.resetToDefaultPlayer();
    }
}

function togglePlayerVisibility() {
    if (gameCore) {
        gameCore.togglePlayerVisibility();
    }
}

function toggleDebug() {
    if (gameCore) {
        gameCore.toggleDebug();
    }
}

// 游戏初始化
async function initGame() {
    try {
        gameCore = new GameCore();
        
        // 将gameCore设置为全局变量，供其他模块使用
        window.gameCore = gameCore;
        
        await gameCore.init();
        
        console.log('游戏启动成功');
        
    } catch (error) {
        console.error('游戏启动失败:', error);
        showError('游戏启动失败: ' + error.message);
    }
}

// 显示错误信息
function showError(message) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.innerHTML = message;
        loadingElement.style.color = '#ff4444';
    }
}

// 窗口大小调整事件
window.addEventListener('resize', () => {
    if (gameCore) {
        gameCore.onWindowResize();
    }
});

// 页面加载完成后启动游戏
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}