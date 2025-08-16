// 游戏核心类
class GameCore {
    constructor() {
        // 核心对象
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = null;
        
        // 游戏对象
        this.player = null;
        this.world = null;
        this.loadedModel = null;
        
        // 游戏状态
        this.gameStarted = false;
        this.isModelLoaded = false;
        this.playerVisible = true;
        this.debugMode = false;
        
        // 物理相关
        this.playerVelocity = null;
        this.playerOnGround = true;
        
        // 加载器
        this.gltfLoader = null;
        
        // 子系统
        this.worldBuilder = null;
        this.playerCreator = null;
        this.lightingSystem = null;
        this.inputManager = null;
        this.uiManager = null;
    }
    
    // 等待Three.js加载
    async waitForThree() {
        return new Promise((resolve) => {
            const checkThree = () => {
                if (typeof THREE !== 'undefined') {
                    resolve();
                } else {
                    setTimeout(checkThree, 50);
                }
            };
            checkThree();
        });
    }
    
    // 初始化游戏
    async init() {
        try {
            await this.waitForThree();
            
            // 初始化Three.js对象
            this.playerVelocity = new THREE.Vector3();
            this.clock = new THREE.Clock();
            this.gltfLoader = new SimpleGLBLoader();
            
            // 初始化子系统
            this.worldBuilder = new WorldBuilder();
            this.playerCreator = new PlayerCreator();
            this.lightingSystem = new LightingSystem();
            this.inputManager = new InputManager();
            this.uiManager = new UIManager();
            
            // 创建场景和基本组件
            this.createScene();
            this.createWorld();
            this.createPlayer();
            this.createLighting();
            this.setupControls();
            
            // UI初始化
            this.uiManager.init();
            
            this.hideLoading();
            this.showStartHint();
            
            // 添加点击开始事件
            this.renderer.domElement.addEventListener('click', () => this.startGame());
            
            console.log('游戏初始化完成');
            
        } catch (error) {
            console.error('游戏初始化失败:', error);
            this.showError('游戏加载失败: ' + error.message);
        }
    }
    
    // 创建场景
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(
            GameConfig.scene.fogColor, 
            GameConfig.scene.fogNear, 
            GameConfig.scene.fogFar
        );
        
        this.camera = new THREE.PerspectiveCamera(
            GameConfig.camera.fov,
            window.innerWidth / window.innerHeight,
            GameConfig.camera.near,
            GameConfig.camera.far
        );
        this.camera.position.set(0, 5, 10);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(GameConfig.scene.background);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.getElementById('game-container').appendChild(this.renderer.domElement);
    }
    
    // 创建世界
    createWorld() {
        this.world = this.worldBuilder.createWorld(this.scene);
    }
    
    // 创建玩家
    createPlayer() {
        this.player = this.playerCreator.createPlayer();
        this.player.position.set(
            GameConfig.player.defaultPosition.x,
            GameConfig.player.defaultPosition.y,
            GameConfig.player.defaultPosition.z
        );
        this.scene.add(this.player);
    }
    
    // 创建光照
    createLighting() {
        this.lightingSystem.setupLighting(this.scene);
    }
    
    // 设置控制
    setupControls() {
        this.inputManager.init();
    }
    
    // 开始游戏
    startGame() {
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.hideStartHint();
            
            // 请求鼠标锁定
            const canvas = this.renderer.domElement;
            canvas.requestPointerLock();
            
            this.inputManager.setupPointerLock(canvas);
            this.animate();
        }
    }
    
    // 加载GLB模型
    loadGLBModel(file) {
        console.log('开始加载模型文件:', file.name);
        this.uiManager.updateModelStatus('加载中...');
        
        this.gltfLoader.load(file, (gltf) => {
            console.log('模型加载成功:', gltf);
            
            // 移除旧模型
            if (this.loadedModel) {
                this.scene.remove(this.loadedModel);
                console.log('移除了旧模型');
            }
            
            // 添加新模型
            this.loadedModel = gltf.scene;
            
            // 设置模型属性
            this.loadedModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    console.log('设置网格阴影:', child.name || '未命名');
                }
            });
            
            // 调整模型大小和位置
            this.adjustModelTransform(gltf);
            
            this.scene.add(this.loadedModel);
            this.isModelLoaded = true;
            
            // 隐藏默认角色
            if (this.player) {
                this.player.visible = false;
                console.log('隐藏默认角色');
            }
            
            // 更新UI
            const modelType = gltf.isVRM ? 'VRM' : (gltf.isPlaceholder ? '占位符' : 'GLB');
            this.uiManager.updateModelInfo(file.name, modelType);
            this.uiManager.updateModelStatus('加载成功');
            
            console.log('模型设置完成');
            
        }, (error) => {
            console.error('模型加载失败:', error);
            this.uiManager.updateModelStatus('加载失败');
            alert('模型加载失败: ' + error.message);
        });
    }
    
    // 调整模型变换
    adjustModelTransform(gltf) {
        const box = new THREE.Box3().setFromObject(this.loadedModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        console.log('模型边界框:', { center, size });
        
        // 计算缩放比例
        const maxSize = Math.max(size.x, size.y, size.z);
        let targetSize = 2; // 目标大小
        
        if (gltf.isVRM) {
            targetSize = 1.8; // VRM模型通常需要更小的缩放
            console.log('检测到VRM模型');
        } else if (gltf.isPlaceholder) {
            targetSize = 1; // 占位符模型
            console.log('使用占位符模型');
        }
        
        const scale = maxSize > 0 ? targetSize / maxSize : 1;
        this.loadedModel.scale.setScalar(scale);
        console.log('应用缩放:', scale);
        
        // 设置位置 - 放在玩家位置
        this.loadedModel.position.copy(this.player.position);
        this.loadedModel.position.y = 0; // 确保在地面上
        
        // VRM模型朝向调整
        if (gltf.isVRM) {
            this.loadedModel.rotation.y = Math.PI; // VRM模型通常需要旋转180度
        }
    }
    
    // 重置为默认角色
    resetToDefaultPlayer() {
        if (this.loadedModel) {
            this.scene.remove(this.loadedModel);
            this.loadedModel = null;
            this.isModelLoaded = false;
            console.log('移除了加载的模型');
        }
        
        if (this.player) {
            this.player.visible = true;
            this.playerVisible = true;
            console.log('显示默认角色');
        }
        
        this.uiManager.resetModelInfo();
    }
    
    // 切换角色显示/隐藏
    togglePlayerVisibility() {
        const currentPlayer = this.isModelLoaded ? this.loadedModel : this.player;
        if (currentPlayer) {
            this.playerVisible = !this.playerVisible;
            currentPlayer.visible = this.playerVisible;
            console.log('切换角色可见性:', this.playerVisible);
        }
    }
    
    // 切换调试模式
    toggleDebug() {
        this.debugMode = !this.debugMode;
        const debugElement = document.getElementById('debug-info');
        if (debugElement) {
            debugElement.style.display = this.debugMode ? 'block' : 'none';
        }
    }
    
    // 更新玩家
    updatePlayer(deltaTime) {
        const currentPlayer = this.isModelLoaded ? this.loadedModel : this.player;
        if (!currentPlayer) return;
        
        const keys = this.inputManager.keys;
        const mouse = this.inputManager.mouse;
        
        // 获取摄像机方向 - 基于鼠标旋转
        const cameraDirection = new THREE.Vector3();
        cameraDirection.x = -Math.sin(mouse.x);
        cameraDirection.z = -Math.cos(mouse.x);
        cameraDirection.normalize();
        
        const rightDirection = new THREE.Vector3();
        rightDirection.x = Math.cos(mouse.x);
        rightDirection.z = -Math.sin(mouse.x);
        rightDirection.normalize();
        
        const inputVector = new THREE.Vector3();
        let isMoving = false;
        
        if (keys['KeyW']) {
            inputVector.add(cameraDirection);
            isMoving = true;
        }
        if (keys['KeyS']) {
            inputVector.sub(cameraDirection);
            isMoving = true;
        }
        if (keys['KeyA']) {
            inputVector.sub(rightDirection);
            isMoving = true;
        }
        if (keys['KeyD']) {
            inputVector.add(rightDirection);
            isMoving = true;
        }
        
        if (inputVector.length() > 0) {
            inputVector.normalize();
            const speed = GameConfig.player.speed * (keys['ShiftLeft'] ? GameConfig.player.sprintMultiplier : 1);
            inputVector.multiplyScalar(speed);
            
            this.playerVelocity.x = inputVector.x;
            this.playerVelocity.z = inputVector.z;
            
            // 更新人物朝向 - 让人物面向移动方向
            const targetAngle = Math.atan2(inputVector.x, inputVector.z);
            
            // 平滑旋转到目标角度
            let currentAngle = currentPlayer.rotation.y;
            let angleDifference = targetAngle - currentAngle;
            
            // 确保选择最短的旋转路径
            while (angleDifference > Math.PI) angleDifference -= 2 * Math.PI;
            while (angleDifference < -Math.PI) angleDifference += 2 * Math.PI;
            
            // 平滑插值旋转
            const rotationSpeed = 8; // 旋转速度
            currentPlayer.rotation.y += angleDifference * rotationSpeed * deltaTime;
            
        } else {
            this.playerVelocity.x *= 0.8;
            this.playerVelocity.z *= 0.8;
        }
        
        // 跳跃
        if (this.playerOnGround && keys['Space']) {
            this.playerVelocity.y = GameConfig.player.jumpHeight;
            this.playerOnGround = false;
        }
        
        // 重力
        if (!this.playerOnGround) {
            this.playerVelocity.y -= GameConfig.world.gravity * deltaTime;
        }
        
        // 更新位置
        currentPlayer.position.add(this.playerVelocity.clone().multiplyScalar(deltaTime));
        
        // 地面碰撞检测
        if (currentPlayer.position.y <= GameConfig.player.defaultPosition.y) {
            currentPlayer.position.y = GameConfig.player.defaultPosition.y;
            this.playerVelocity.y = 0;
            this.playerOnGround = true;
        }
        
        // 更新摄像机
        this.updateCamera();
    }
    
    // 更新摄像机
    updateCamera() {
        const currentPlayer = this.isModelLoaded ? this.loadedModel : this.player;
        if (!currentPlayer) return;
        
        const mouse = this.inputManager.mouse;
        
        // 第三人称摄像机设置
        const distance = GameConfig.camera.followDistance;
        const height = GameConfig.camera.followHeight;
        
        // 基于mouseX和mouseY计算摄像机位置
        const horizontalDistance = distance * Math.cos(mouse.y);
        const verticalOffset = distance * Math.sin(mouse.y);
        
        const cameraX = currentPlayer.position.x + horizontalDistance * Math.sin(mouse.x);
        const cameraZ = currentPlayer.position.z + horizontalDistance * Math.cos(mouse.x);
        const cameraY = currentPlayer.position.y + height + verticalOffset;
        
        this.camera.position.set(cameraX, cameraY, cameraZ);
        
        // 始终看向玩家
        this.camera.lookAt(currentPlayer.position.x, currentPlayer.position.y + 1, currentPlayer.position.z);
    }
    
    // 动画循环
    animate() {
        if (!this.gameStarted) return;
        
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = Math.min(this.clock.getDelta(), 0.1);
        
        this.updatePlayer(deltaTime);
        
        this.renderer.render(this.scene, this.camera);
    }
    
    // UI辅助方法
    hideLoading() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
    
    showStartHint() {
        const startHintElement = document.getElementById('start-hint');
        if (startHintElement) {
            startHintElement.style.display = 'block';
        }
    }
    
    hideStartHint() {
        const startHintElement = document.getElementById('start-hint');
        if (startHintElement) {
            startHintElement.style.display = 'none';
        }
    }
    
    showError(message) {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.innerHTML = message;
        }
    }
    
    // 窗口大小调整
    onWindowResize() {
        if (this.camera && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
}