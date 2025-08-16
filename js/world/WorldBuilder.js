// 世界构建器类
class WorldBuilder {
    constructor() {
        this.world = null;
    }
    
    // 创建世界
    createWorld(scene) {
        this.world = new THREE.Group();
        scene.add(this.world);

        // 创建地面
        this.createGround();
        
        // 创建彩色方块作为装饰
        this.createColorfulBoxes();
        
        // 创建简单的树木
        this.createSimpleTrees();
        
        // 创建建筑
        this.createSimpleBuildings();
        
        return this.world;
    }
    
    // 创建地面
    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(
            GameConfig.world.size, 
            GameConfig.world.size
        );
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4a9f4a
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.world.add(ground);
    }

    // 创建彩色方块装饰
    createColorfulBoxes() {
        const config = GameConfig.worldGeneration.colorfulBoxes;
        
        for (let i = 0; i < config.count; i++) {
            const size = config.minSize + Math.random() * (config.maxSize - config.minSize);
            const boxGeometry = new THREE.BoxGeometry(size, size, size);
            const boxMaterial = new THREE.MeshLambertMaterial({ 
                color: config.colors[Math.floor(Math.random() * config.colors.length)]
            });
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            
            box.position.x = (Math.random() - 0.5) * GameConfig.world.size * 0.8;
            box.position.z = (Math.random() - 0.5) * GameConfig.world.size * 0.8;
            box.position.y = size / 2;
            box.castShadow = true;
            box.receiveShadow = true;
            
            this.world.add(box);
        }
    }

    // 创建简单的树木
    createSimpleTrees() {
        const config = GameConfig.worldGeneration.trees;
        
        for (let i = 0; i < config.count; i++) {
            const treeGroup = new THREE.Group();
            
            // 树干
            const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4, 8);
            const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 2;
            trunk.castShadow = true;
            treeGroup.add(trunk);
            
            // 树叶 - 使用圆锥体
            const leavesGeometry = new THREE.ConeGeometry(2, 4, 8);
            const leavesMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x228B22
            });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.y = 5;
            leaves.castShadow = true;
            treeGroup.add(leaves);
            
            treeGroup.position.x = (Math.random() - 0.5) * GameConfig.world.size * 0.9;
            treeGroup.position.z = (Math.random() - 0.5) * GameConfig.world.size * 0.9;
            
            this.world.add(treeGroup);
        }
    }

    // 创建简单建筑
    createSimpleBuildings() {
        const config = GameConfig.worldGeneration.buildings;
        
        for (let i = 0; i < config.count; i++) {
            const buildingGroup = new THREE.Group();
            
            // 主体
            const width = 4 + Math.random() * 4;
            const height = 6 + Math.random() * 8;
            const depth = 4 + Math.random() * 4;
            
            const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
            const buildingMaterial = new THREE.MeshLambertMaterial({ 
                color: config.colors[Math.floor(Math.random() * config.colors.length)]
            });
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            building.position.y = height / 2;
            building.castShadow = true;
            building.receiveShadow = true;
            buildingGroup.add(building);
            
            // 屋顶
            const roofGeometry = new THREE.ConeGeometry(Math.max(width, depth) * 0.7, 3, 4);
            const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.y = height + 1.5;
            roof.rotation.y = Math.PI / 4;
            roof.castShadow = true;
            buildingGroup.add(roof);
            
            buildingGroup.position.x = (Math.random() - 0.5) * 80;
            buildingGroup.position.z = (Math.random() - 0.5) * 80;
            
            this.world.add(buildingGroup);
        }
    }
}