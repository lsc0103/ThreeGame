// 游戏配置文件
const GameConfig = {
    // 玩家相关配置
    player: {
        speed: 8,
        jumpHeight: 12,
        sprintMultiplier: 2,
        defaultPosition: { x: 0, y: 2, z: 0 }
    },
    
    // 世界相关配置
    world: {
        size: 150,
        gravity: 25
    },
    
    // 相机配置
    camera: {
        fov: 75,
        near: 0.1,
        far: 1000,
        followDistance: 10,
        followHeight: 5
    },
    
    // 光照配置
    lighting: {
        ambient: {
            color: 0x404040,
            intensity: 0.4
        },
        sun: {
            color: 0xffffff,
            intensity: 0.8,
            position: { x: 30, y: 50, z: 30 },
            shadow: {
                mapSize: 2048,
                camera: {
                    near: 0.5,
                    far: 200,
                    left: -50,
                    right: 50,
                    top: 50,
                    bottom: -50
                }
            }
        }
    },
    
    // 世界生成配置
    worldGeneration: {
        colorfulBoxes: {
            count: 30,
            colors: [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xffa500, 0x9b59b6, 0x2ecc71],
            minSize: 1,
            maxSize: 4
        },
        trees: {
            count: 50
        },
        buildings: {
            count: 8,
            colors: [0xe74c3c, 0x3498db, 0xf39c12, 0x9b59b6, 0x1abc9c]
        }
    },
    
    // 场景配置
    scene: {
        background: 0x87CEEB,
        fogColor: 0x87CEEB,
        fogNear: 10,
        fogFar: 200
    }
};

// 导出配置（如果需要模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
}