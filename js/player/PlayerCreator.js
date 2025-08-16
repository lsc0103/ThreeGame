// 玩家角色创建器
class PlayerCreator {
    constructor() {}
    
    // 创建玩家角色
    createPlayer() {
        const playerGroup = new THREE.Group();
        
        // 创建身体各部分
        this.createBody(playerGroup);
        this.createSkirtSystem(playerGroup);
        this.createLegsAndBoots(playerGroup);
        this.createSleeveSystem(playerGroup);
        this.createHeadSystem(playerGroup);
        this.createHairSystem(playerGroup);
        this.createFacialFeatures(playerGroup);
        this.createAccessories(playerGroup);
        
        return playerGroup;
    }
    
    // 创建身体核心
    createBody(playerGroup) {
        // 躯干 - 紧身胸衣风格
        const bodyGeometry = new THREE.BoxGeometry(0.9, 1.6, 0.4);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a }); // 深黑色胸衣
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.3;
        body.castShadow = true;
        playerGroup.add(body);
        
        // 胸衣装饰 - 白色蕾丝边
        const laceTrimGeometry = new THREE.BoxGeometry(0.95, 0.3, 0.41);
        const laceTrimMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const laceTrim = new THREE.Mesh(laceTrimGeometry, laceTrimMaterial);
        laceTrim.position.y = 2.0;
        laceTrim.castShadow = true;
        playerGroup.add(laceTrim);
    }
    
    // 创建裙装系统
    createSkirtSystem(playerGroup) {
        // 主裙子 - 黑色长裙
        const mainSkirtGeometry = new THREE.CylinderGeometry(2.2, 1.0, 2.0, 16);
        const mainSkirtMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        const mainSkirt = new THREE.Mesh(mainSkirtGeometry, mainSkirtMaterial);
        mainSkirt.position.y = 0.2;
        mainSkirt.castShadow = true;
        playerGroup.add(mainSkirt);
        
        // 内层裙摆 - 稍浅色
        const innerSkirtGeometry = new THREE.CylinderGeometry(2.0, 0.9, 1.8, 16);
        const innerSkirtMaterial = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
        const innerSkirt = new THREE.Mesh(innerSkirtGeometry, innerSkirtMaterial);
        innerSkirt.position.y = 0.3;
        playerGroup.add(innerSkirt);
        
        // 裙摆装饰层
        const skirtDecoGeometry = new THREE.CylinderGeometry(2.3, 1.1, 0.3, 16);
        const skirtDecoMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const skirtDeco = new THREE.Mesh(skirtDecoGeometry, skirtDecoMaterial);
        skirtDeco.position.y = -0.6;
        skirtDeco.castShadow = true;
        playerGroup.add(skirtDeco);
    }
    
    // 创建腿部和鞋履
    createLegsAndBoots(playerGroup) {
        // 修长的腿部
        const legGeometry = new THREE.CylinderGeometry(0.12, 0.15, 1.4, 12);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac }); // 肌肤色
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.25, -0.5, 0);
        leftLeg.castShadow = true;
        playerGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.25, -0.5, 0);
        rightLeg.castShadow = true;
        playerGroup.add(rightLeg);
        
        // 高筒靴
        const bootGeometry = new THREE.CylinderGeometry(0.18, 0.2, 0.8, 12);
        const bootMaterial = new THREE.MeshLambertMaterial({ color: 0x0a0a0a });
        
        const leftBoot = new THREE.Mesh(bootGeometry, bootMaterial);
        leftBoot.position.set(-0.25, -1.4, 0);
        leftBoot.castShadow = true;
        playerGroup.add(leftBoot);
        
        const rightBoot = new THREE.Mesh(bootGeometry, bootMaterial);
        rightBoot.position.set(0.25, -1.4, 0);
        rightBoot.castShadow = true;
        playerGroup.add(rightBoot);
    }
    
    // 创建袖装系统
    createSleeveSystem(playerGroup) {
        // 蓬松袖子 - 上臂部分
        const upperSleeveGeometry = new THREE.SphereGeometry(0.4, 12, 8);
        const upperSleeveMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        
        const leftUpperSleeve = new THREE.Mesh(upperSleeveGeometry, upperSleeveMaterial);
        leftUpperSleeve.position.set(-0.8, 1.6, 0);
        leftUpperSleeve.scale.set(1, 0.8, 0.8);
        leftUpperSleeve.castShadow = true;
        playerGroup.add(leftUpperSleeve);
        
        const rightUpperSleeve = new THREE.Mesh(upperSleeveGeometry, upperSleeveMaterial);
        rightUpperSleeve.position.set(0.8, 1.6, 0);
        rightUpperSleeve.scale.set(1, 0.8, 0.8);
        rightUpperSleeve.castShadow = true;
        playerGroup.add(rightUpperSleeve);
        
        // 前臂 - 紧身袖套
        const forearmGeometry = new THREE.CylinderGeometry(0.11, 0.13, 1.2, 12);
        const forearmMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        
        const leftForearm = new THREE.Mesh(forearmGeometry, forearmMaterial);
        leftForearm.position.set(-0.8, 0.8, 0);
        leftForearm.castShadow = true;
        playerGroup.add(leftForearm);
        
        const rightForearm = new THREE.Mesh(forearmGeometry, forearmMaterial);
        rightForearm.position.set(0.8, 0.8, 0);
        rightForearm.castShadow = true;
        playerGroup.add(rightForearm);
        
        // 手部
        const handGeometry = new THREE.SphereGeometry(0.13, 10, 8);
        const handMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
        
        const leftHand = new THREE.Mesh(handGeometry, handMaterial);
        leftHand.position.set(-0.8, 0.1, 0);
        leftHand.castShadow = true;
        playerGroup.add(leftHand);
        
        const rightHand = new THREE.Mesh(handGeometry, handMaterial);
        rightHand.position.set(0.8, 0.1, 0);
        rightHand.castShadow = true;
        playerGroup.add(rightHand);
    }
    
    // 创建头部系统
    createHeadSystem(playerGroup) {
        // 头部基础
        const headGeometry = new THREE.SphereGeometry(0.55, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.8;
        head.castShadow = true;
        playerGroup.add(head);
    }
    
    // 创建银色长发系统
    createHairSystem(playerGroup) {
        // 主要发型 - 银白色
        const hairMainGeometry = new THREE.SphereGeometry(0.6, 16, 16);
        const hairMainMaterial = new THREE.MeshLambertMaterial({ color: 0xc0c0c0 }); // 银白色
        const hairMain = new THREE.Mesh(hairMainGeometry, hairMainMaterial);
        hairMain.position.y = 2.9;
        hairMain.scale.set(1, 1.3, 1);
        hairMain.castShadow = true;
        playerGroup.add(hairMain);
        
        // 长发后垂
        const longHairGeometry = new THREE.CylinderGeometry(0.3, 0.15, 3.0, 12);
        const longHairMaterial = new THREE.MeshLambertMaterial({ color: 0xb8b8b8 });
        const longHair = new THREE.Mesh(longHairGeometry, longHairMaterial);
        longHair.position.set(0, 1.5, -0.4);
        longHair.castShadow = true;
        playerGroup.add(longHair);
        
        // 侧发流海
        const sideHairGeometry = new THREE.SphereGeometry(0.25, 10, 8);
        const sideHairMaterial = new THREE.MeshLambertMaterial({ color: 0xc0c0c0 });
        
        const leftSideHair = new THREE.Mesh(sideHairGeometry, sideHairMaterial);
        leftSideHair.position.set(-0.5, 2.7, 0.3);
        leftSideHair.scale.set(1.2, 1.8, 0.8);
        leftSideHair.castShadow = true;
        playerGroup.add(leftSideHair);
        
        const rightSideHair = new THREE.Mesh(sideHairGeometry, sideHairMaterial);
        rightSideHair.position.set(0.5, 2.7, 0.3);
        rightSideHair.scale.set(1.2, 1.8, 0.8);
        rightSideHair.castShadow = true;
        playerGroup.add(rightSideHair);
        
        // 黄色发饰
        const hairAccGeometry = new THREE.BoxGeometry(0.15, 0.4, 0.1);
        const hairAccMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 }); // 金黄色
        
        const leftHairAcc = new THREE.Mesh(hairAccGeometry, hairAccMaterial);
        leftHairAcc.position.set(-0.6, 3.1, 0.2);
        leftHairAcc.castShadow = true;
        playerGroup.add(leftHairAcc);
        
        const rightHairAcc = new THREE.Mesh(hairAccGeometry, hairAccMaterial);
        rightHairAcc.position.set(0.6, 3.1, 0.2);
        rightHairAcc.castShadow = true;
        playerGroup.add(rightHairAcc);
    }
    
    // 创建面部特征
    createFacialFeatures(playerGroup) {
        // 红色眼睛
        const eyeGeometry = new THREE.SphereGeometry(0.08, 10, 10);
        const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0xcc0000 }); // 深红色
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.18, 2.85, 0.5);
        leftEye.scale.set(1, 1.4, 0.6);
        playerGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.18, 2.85, 0.5);
        rightEye.scale.set(1, 1.4, 0.6);
        playerGroup.add(rightEye);
        
        // 眼部高光
        const eyeHighlightGeometry = new THREE.SphereGeometry(0.03, 6, 6);
        const eyeHighlightMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        
        const leftHighlight = new THREE.Mesh(eyeHighlightGeometry, eyeHighlightMaterial);
        leftHighlight.position.set(-0.15, 2.9, 0.52);
        playerGroup.add(leftHighlight);
        
        const rightHighlight = new THREE.Mesh(eyeHighlightGeometry, eyeHighlightMaterial);
        rightHighlight.position.set(0.21, 2.9, 0.52);
        playerGroup.add(rightHighlight);
    }
    
    // 创建装饰细节
    createAccessories(playerGroup) {
        // 颈部装饰 - 黑色choker
        const chokerGeometry = new THREE.CylinderGeometry(0.58, 0.58, 0.08, 16);
        const chokerMaterial = new THREE.MeshLambertMaterial({ color: 0x0a0a0a });
        const choker = new THREE.Mesh(chokerGeometry, chokerMaterial);
        choker.position.y = 2.3;
        choker.castShadow = true;
        playerGroup.add(choker);
        
        // 胸前装饰
        const chestDecoGeometry = new THREE.SphereGeometry(0.06, 8, 8);
        const chestDecoMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const chestDeco = new THREE.Mesh(chestDecoGeometry, chestDecoMaterial);
        chestDeco.position.set(0, 1.8, 0.42);
        chestDeco.castShadow = true;
        playerGroup.add(chestDeco);
    }
}