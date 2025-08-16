// 光照系统类
class LightingSystem {
    constructor() {}
    
    // 设置光照
    setupLighting(scene) {
        this.createAmbientLight(scene);
        this.createSunLight(scene);
    }
    
    // 创建环境光
    createAmbientLight(scene) {
        const ambientLight = new THREE.AmbientLight(
            GameConfig.lighting.ambient.color,
            GameConfig.lighting.ambient.intensity
        );
        scene.add(ambientLight);
        console.log('创建环境光');
    }
    
    // 创建主光源
    createSunLight(scene) {
        const sunLight = new THREE.DirectionalLight(
            GameConfig.lighting.sun.color,
            GameConfig.lighting.sun.intensity
        );
        
        sunLight.position.set(
            GameConfig.lighting.sun.position.x,
            GameConfig.lighting.sun.position.y,
            GameConfig.lighting.sun.position.z
        );
        
        // 设置阴影
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = GameConfig.lighting.sun.shadow.mapSize;
        sunLight.shadow.mapSize.height = GameConfig.lighting.sun.shadow.mapSize;
        
        const shadowCamera = GameConfig.lighting.sun.shadow.camera;
        sunLight.shadow.camera.near = shadowCamera.near;
        sunLight.shadow.camera.far = shadowCamera.far;
        sunLight.shadow.camera.left = shadowCamera.left;
        sunLight.shadow.camera.right = shadowCamera.right;
        sunLight.shadow.camera.top = shadowCamera.top;
        sunLight.shadow.camera.bottom = shadowCamera.bottom;
        
        scene.add(sunLight);
        console.log('创建主光源');
    }
}