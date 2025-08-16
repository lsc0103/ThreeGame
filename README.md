# Genshin风格RPG游戏 - 模块化重构

## 项目结构

```
genshin-rpg/
├── index.html                    # 主页面文件
├── css/
│   └── styles.css               # 样式文件
└── js/
    ├── config.js                # 游戏配置
    ├── main.js                  # 主入口文件
    ├── core/
    │   └── GameCore.js          # 游戏核心类
    ├── loaders/
    │   └── GLBLoader.js         # GLB模型加载器
    ├── world/
    │   └── WorldBuilder.js      # 世界构建器
    ├── player/
    │   └── PlayerCreator.js     # 玩家角色创建器
    ├── lighting/
    │   └── LightingSystem.js    # 光照系统
    ├── controls/
    │   └── InputManager.js      # 输入管理器
    └── ui/
        └── UIManager.js         # UI管理器
```

## 模块说明

### 核心模块

- **GameCore.js**: 游戏的核心类，负责协调各个子系统，管理游戏状态和主循环
- **config.js**: 集中管理游戏配置参数，便于调整和维护

### 功能模块

- **GLBLoader.js**: 处理VRM/GLB模型文件的加载和解析
- **WorldBuilder.js**: 负责创建游戏世界，包括地形、建筑、装饰等
- **PlayerCreator.js**: 创建详细的玩家角色模型
- **LightingSystem.js**: 管理场景光照，包括环境光和阴影
- **InputManager.js**: 处理键盘和鼠标输入
- **UIManager.js**: 管理用户界面元素和交互

## 重构优势

### 1. 模块化设计
- 每个模块职责单一，便于理解和维护
- 模块间耦合度低，方便独立开发和测试

### 2. 可扩展性
- 新功能可以作为独立模块添加
- 现有模块可以轻松替换或升级

### 3. 代码组织
- 从1311行的单文件拆分为多个小文件
- 相关功能聚合在同一模块中

### 4. 配置管理
- 所有配置集中在config.js中
- 便于调整游戏参数和平衡性

## 使用方法

1. 将所有文件按照目录结构放置
2. 直接打开 `index.html` 即可运行游戏
3. 确保Three.js CDN可以正常加载

## 功能特性

- ✅ 3D场景渲染
- ✅ 玩家角色控制（WASD移动，空格跳跃，Shift冲刺）
- ✅ 第三人称摄像机
- ✅ VRM/GLB模型加载
- ✅ 实时阴影
- ✅ 碰撞检测
- ✅ 调试模式

## 扩展建议

### 后续可以添加的模块：

1. **物理系统** (`js/physics/PhysicsEngine.js`)
2. **动画系统** (`js/animation/AnimationManager.js`)
3. **音频系统** (`js/audio/AudioManager.js`)
4. **粒子系统** (`js/effects/ParticleSystem.js`)
5. **AI系统** (`js/ai/NPCController.js`)
6. **存档系统** (`js/save/SaveManager.js`)
7. **网络系统** (`js/network/NetworkManager.js`)

### 性能优化方向：

1. 对象池管理
2. LOD系统
3. 纹理压缩
4. 场景剔除
5. 批量渲染

## 注意事项

1. 确保所有模块加载顺序正确（config.js需要最先加载）
2. 全局变量gameCore用于模块间通信
3. 调试信息可通过UI面板开启/关闭
4. 支持的模型格式：VRM、GLB、GLTF

这个重构版本保持了原有的所有功能，同时大大提高了代码的可维护性和可扩展性。