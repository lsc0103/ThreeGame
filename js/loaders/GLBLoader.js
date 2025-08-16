// 修复的GLB加载器类 - 专门处理VRM模型（支持贴图）
class SimpleGLBLoader {
    constructor() {
        this.fileReader = new FileReader();
        this.textureLoader = new THREE.TextureLoader();
        this.loadedTextures = new Map(); // 缓存已加载的贴图
    }
    
    load(file, onLoad, onProgress, onError) {
        console.log('开始加载文件:', file.name, '大小:', file.size);
        this.updateDebugInfo('file-size', this.formatFileSize(file.size));
        this.updateDebugInfo('parse-status', '读取文件中...');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.updateDebugInfo('parse-status', '解析文件中...');
                this.parseFile(e.target.result, file.name, onLoad, onError);
            } catch (error) {
                console.error('文件解析错误:', error);
                this.updateDebugInfo('parse-status', '解析失败: ' + error.message);
                if (onError) onError(error);
            }
        };
        
        reader.onerror = () => {
            const error = new Error('文件读取失败');
            console.error(error);
            this.updateDebugInfo('parse-status', '文件读取失败');
            if (onError) onError(error);
        };
        
        reader.readAsArrayBuffer(file);
    }
    
    updateDebugInfo(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    parseFile(arrayBuffer, fileName, onLoad, onError) {
        try {
            // 检查文件魔数
            const dataView = new DataView(arrayBuffer);
            const magic = dataView.getUint32(0, true);
            
            if (magic === 0x46546C67) { // GLB magic number
                console.log('检测到GLB格式文件');
                this.parseGLB(arrayBuffer, onLoad, onError);
            } else {
                // 尝试使用Three.js内置的GLTFLoader
                console.log('尝试使用Three.js GLTFLoader');
                this.useThreeJSLoader(arrayBuffer, onLoad, onError);
            }
        } catch (error) {
            console.error('文件格式检测失败:', error);
            this.updateDebugInfo('parse-status', '不支持的文件格式');
            if (onError) onError(error);
        }
    }
    
    useThreeJSLoader(arrayBuffer, onLoad, onError) {
        try {
            // 创建URL
            const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            
            // 使用GLTFLoader (如果可用)
            if (typeof THREE !== 'undefined' && THREE.GLTFLoader) {
                const loader = new THREE.GLTFLoader();
                loader.load(url, (gltf) => {
                    URL.revokeObjectURL(url);
                    this.updateDebugInfo('parse-status', '加载成功');
                    
                    // 处理VRM特定的隐藏逻辑
                    this.processVRMModel(gltf);
                    onLoad(gltf);
                }, undefined, (error) => {
                    URL.revokeObjectURL(url);
                    console.error('GLTFLoader失败:', error);
                    this.updateDebugInfo('parse-status', 'GLTFLoader失败');
                    // 回退到简单解析
                    this.simpleGLBParse(arrayBuffer, onLoad, onError);
                });
            } else {
                // 回退到简单解析
                this.simpleGLBParse(arrayBuffer, onLoad, onError);
            }
        } catch (error) {
            console.error('Three.js加载器失败:', error);
            this.simpleGLBParse(arrayBuffer, onLoad, onError);
        }
    }
    
    processVRMModel(gltf) {
        console.log('处理VRM模型...');
        
        // 隐藏Armature对象并处理网格
        gltf.scene.traverse((child) => {
            console.log('遍历对象:', child.name, '类型:', child.type);
            
            // 隐藏骨骼对象和Armature
            if (child.type === 'Bone' || 
                child.name.toLowerCase().includes('armature') ||
                child.name.toLowerCase().includes('skeleton')) {
                child.visible = false;
                console.log('隐藏骨骼对象:', child.name);
                return;
            }
            
            // 处理SkinnedMesh（VRM的主要网格类型）
            if (child.type === 'SkinnedMesh' || child.isSkinnedMesh) {
                child.visible = true;
                child.castShadow = true;
                child.receiveShadow = true;
                child.frustumCulled = false; // 避免视锥体剔除问题
                
                // 保持原始材质，不要替换
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((mat, i) => {
                            this.enhanceVRMMaterial(mat);
                        });
                    } else {
                        this.enhanceVRMMaterial(child.material);
                    }
                }
                
                console.log('处理SkinnedMesh:', child.name, '顶点数:', child.geometry.attributes.position?.count);
            }
            
            // 处理普通Mesh
            if (child.type === 'Mesh' || child.isMesh) {
                child.visible = true;
                child.castShadow = true;
                child.receiveShadow = true;
                child.frustumCulled = false;
                
                // 保持原始材质
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((mat, i) => {
                            this.enhanceVRMMaterial(mat);
                        });
                    } else {
                        this.enhanceVRMMaterial(child.material);
                    }
                }
                
                console.log('处理Mesh:', child.name, '顶点数:', child.geometry.attributes.position?.count);
            }
            
            // 隐藏Group类型的Armature容器
            if (child.type === 'Group' && child.name.toLowerCase().includes('armature')) {
                child.visible = false;
                console.log('隐藏Armature组:', child.name);
            }
        });
        
        // 检查并处理VRM扩展数据
        if (gltf.userData && gltf.userData.vrm) {
            console.log('发现VRM扩展数据');
            gltf.isVRM = true;
        }
        
        // 确保场景可见
        gltf.scene.visible = true;
    }
    
    // 增强VRM材质（不替换，只优化）
    enhanceVRMMaterial(material) {
        if (!material) return;
        
        console.log('增强VRM材质:', material.type, material.name || '未命名');
        
        // 确保双面渲染
        material.side = THREE.DoubleSide;
        
        // 如果材质有贴图，确保贴图正确设置
        if (material.map) {
            console.log('材质包含贴图');
            material.map.encoding = THREE.sRGBEncoding; // 确保颜色空间正确
            material.needsUpdate = true;
        }
        
        // 如果是透明材质，确保正确设置
        if (material.transparent || material.alphaTest > 0) {
            material.depthWrite = true;
            material.alphaTest = material.alphaTest || 0.01;
        }
        
        // 确保材质可见
        material.visible = true;
        
        // 增加一些光照响应
        if (material.emissive) {
            material.emissiveIntensity = material.emissiveIntensity || 0.5;
        }
        
        console.log('材质增强完成:', {
            有贴图: !!material.map,
            颜色: material.color ? material.color.getHex().toString(16) : '无',
            透明: material.transparent,
            透明度: material.opacity
        });
    }
    
    parseGLB(arrayBuffer, onLoad, onError) {
        try {
            const dataView = new DataView(arrayBuffer);
            
            // 读取GLB头部
            const version = dataView.getUint32(4, true);
            const totalLength = dataView.getUint32(8, true);
            
            console.log('GLB版本:', version, '总长度:', totalLength);
            
            // 读取JSON chunk
            const jsonChunkLength = dataView.getUint32(12, true);
            const jsonChunkType = dataView.getUint32(16, true);
            
            if (jsonChunkType !== 0x4E4F534A) { // JSON chunk type
                throw new Error('无效的GLB文件格式');
            }
            
            // 提取JSON数据
            const jsonBytes = new Uint8Array(arrayBuffer, 20, jsonChunkLength);
            const jsonString = new TextDecoder().decode(jsonBytes);
            const gltfData = JSON.parse(jsonString);
            
            console.log('GLTF数据解析成功:', gltfData);
            
            // 读取二进制数据chunk
            let binaryData = null;
            if (20 + jsonChunkLength < totalLength) {
                const binaryChunkLength = dataView.getUint32(20 + jsonChunkLength, true);
                const binaryChunkType = dataView.getUint32(20 + jsonChunkLength + 4, true);
                
                if (binaryChunkType === 0x004E4942) { // BIN chunk type
                    binaryData = new Uint8Array(arrayBuffer, 20 + jsonChunkLength + 8, binaryChunkLength);
                    console.log('二进制数据长度:', binaryChunkLength);
                }
            }
            
            // 创建更完善的模型
            this.createAdvancedModel(gltfData, binaryData, onLoad, onError);
            
        } catch (error) {
            console.error('GLB解析失败:', error);
            this.updateDebugInfo('parse-status', 'GLB解析失败: ' + error.message);
            // 回退到简单解析
            this.simpleGLBParse(arrayBuffer, onLoad, onError);
        }
    }
    
    createAdvancedModel(gltfData, binaryData, onLoad, onError) {
        try {
            const group = new THREE.Group();
            let meshCount = 0;
            
            // 先解析所有图片数据
            const textures = this.parseTextures(gltfData, binaryData);
            
            // 检查是否是VRM
            const isVRM = gltfData.extensions && gltfData.extensions.VRM;
            console.log('是否为VRM:', isVRM);
            
            // 解析场景
            if (gltfData.scenes && gltfData.scenes.length > 0) {
                const scene = gltfData.scenes[0];
                if (scene.nodes) {
                    scene.nodes.forEach(nodeIndex => {
                        const nodeObject = this.parseNode(nodeIndex, gltfData, binaryData, textures);
                        if (nodeObject) {
                            group.add(nodeObject);
                        }
                    });
                }
            }
            
            // 如果没有场景数据，尝试解析网格
            if (group.children.length === 0 && gltfData.meshes && gltfData.meshes.length > 0) {
                console.log('发现网格数量:', gltfData.meshes.length);
                
                gltfData.meshes.forEach((meshData, meshIndex) => {
                    try {
                        const meshGroup = this.parseMeshData(meshData, gltfData, binaryData, textures);
                        if (meshGroup) {
                            group.add(meshGroup);
                            meshCount++;
                        }
                    } catch (error) {
                        console.warn('解析网格', meshIndex, '失败:', error);
                    }
                });
            }
            
            // 如果仍然没有内容，创建占位符
            if (group.children.length === 0) {
                console.log('没有成功解析内容，创建占位符');
                const geometry = new THREE.SphereGeometry(1, 16, 16);
                const material = new THREE.MeshLambertMaterial({ color: 0x00ff88 });
                const sphere = new THREE.Mesh(geometry, material);
                sphere.castShadow = true;
                sphere.receiveShadow = true;
                group.add(sphere);
            }
            
            const result = {
                scene: group,
                scenes: [group],
                animations: gltfData.animations || [],
                isVRM: isVRM,
                meshCount: meshCount
            };
            
            console.log('模型创建完成，网格数:', meshCount, '总对象数:', group.children.length);
            this.updateDebugInfo('parse-status', `成功 (${group.children.length}个对象)`);
            onLoad(result);
            
        } catch (error) {
            console.error('创建模型失败:', error);
            this.updateDebugInfo('parse-status', '创建模型失败');
            // 创建最基本的占位符
            this.simpleGLBParse(null, onLoad, onError);
        }
    }
    
    // 解析贴图
    parseTextures(gltfData, binaryData) {
        const textures = {};
        
        if (!gltfData.textures || !gltfData.images) {
            return textures;
        }
        
        console.log('开始解析贴图，数量:', gltfData.textures.length);
        
        gltfData.textures.forEach((textureData, index) => {
            try {
                if (textureData.source !== undefined && gltfData.images[textureData.source]) {
                    const imageData = gltfData.images[textureData.source];
                    
                    // 从二进制数据创建贴图
                    if (imageData.bufferView !== undefined && binaryData) {
                        const bufferView = gltfData.bufferViews[imageData.bufferView];
                        const imageBytes = binaryData.slice(
                            bufferView.byteOffset,
                            bufferView.byteOffset + bufferView.byteLength
                        );
                        
                        // 创建Blob和URL
                        const mimeType = imageData.mimeType || 'image/png';
                        const blob = new Blob([imageBytes], { type: mimeType });
                        const url = URL.createObjectURL(blob);
                        
                        // 加载贴图
                        const texture = this.textureLoader.load(url);
                        texture.encoding = THREE.sRGBEncoding;
                        texture.flipY = false; // GLTF贴图不需要翻转
                        
                        // 设置采样器参数
                        if (textureData.sampler !== undefined && gltfData.samplers) {
                            const sampler = gltfData.samplers[textureData.sampler];
                            this.applySampler(texture, sampler);
                        }
                        
                        textures[index] = texture;
                        console.log('贴图', index, '加载成功');
                    }
                }
            } catch (error) {
                console.warn('贴图', index, '加载失败:', error);
            }
        });
        
        return textures;
    }
    
    // 应用采样器设置
    applySampler(texture, sampler) {
        if (!sampler) return;
        
        // 设置环绕模式
        const wrapModes = {
            10497: THREE.RepeatWrapping,
            33071: THREE.ClampToEdgeWrapping,
            33648: THREE.MirroredRepeatWrapping
        };
        
        if (sampler.wrapS) texture.wrapS = wrapModes[sampler.wrapS] || THREE.RepeatWrapping;
        if (sampler.wrapT) texture.wrapT = wrapModes[sampler.wrapT] || THREE.RepeatWrapping;
        
        // 设置过滤模式
        const filterModes = {
            9728: THREE.NearestFilter,
            9729: THREE.LinearFilter,
            9984: THREE.NearestMipmapNearestFilter,
            9985: THREE.LinearMipmapNearestFilter,
            9986: THREE.NearestMipmapLinearFilter,
            9987: THREE.LinearMipmapLinearFilter
        };
        
        if (sampler.magFilter) texture.magFilter = filterModes[sampler.magFilter] || THREE.LinearFilter;
        if (sampler.minFilter) texture.minFilter = filterModes[sampler.minFilter] || THREE.LinearMipmapLinearFilter;
    }
    
    parseNode(nodeIndex, gltfData, binaryData, textures) {
        if (!gltfData.nodes || !gltfData.nodes[nodeIndex]) {
            return null;
        }
        
        const nodeData = gltfData.nodes[nodeIndex];
        const nodeObject = new THREE.Group();
        nodeObject.name = nodeData.name || `Node_${nodeIndex}`;
        
        // 应用变换
        if (nodeData.translation) {
            nodeObject.position.fromArray(nodeData.translation);
        }
        if (nodeData.rotation) {
            nodeObject.quaternion.fromArray(nodeData.rotation);
        }
        if (nodeData.scale) {
            nodeObject.scale.fromArray(nodeData.scale);
        }
        if (nodeData.matrix) {
            nodeObject.matrix.fromArray(nodeData.matrix);
            nodeObject.matrix.decompose(nodeObject.position, nodeObject.quaternion, nodeObject.scale);
        }
        
        // 隐藏Armature相关节点
        if (nodeObject.name.toLowerCase().includes('armature') || 
            nodeObject.name.toLowerCase().includes('bone')) {
            nodeObject.visible = false;
            console.log('隐藏节点:', nodeObject.name);
        }
        
        // 处理网格
        if (nodeData.mesh !== undefined) {
            const meshData = gltfData.meshes[nodeData.mesh];
            if (meshData) {
                const meshObject = this.parseMeshData(meshData, gltfData, binaryData, textures);
                if (meshObject) {
                    nodeObject.add(meshObject);
                }
            }
        }
        
        // 处理子节点
        if (nodeData.children) {
            nodeData.children.forEach(childIndex => {
                const childObject = this.parseNode(childIndex, gltfData, binaryData, textures);
                if (childObject) {
                    nodeObject.add(childObject);
                }
            });
        }
        
        return nodeObject;
    }
    
    parseMeshData(meshData, gltfData, binaryData, textures) {
        if (!meshData.primitives || meshData.primitives.length === 0) {
            return null;
        }
        
        const meshGroup = new THREE.Group();
        meshGroup.name = meshData.name || 'Mesh';
        
        meshData.primitives.forEach((primitive, index) => {
            try {
                // 创建基本几何体
                const geometry = new THREE.BufferGeometry();
                
                // 尝试获取位置数据
                if (primitive.attributes && primitive.attributes.POSITION !== undefined) {
                    const positionData = this.getAttributeData(primitive.attributes.POSITION, gltfData, binaryData);
                    if (positionData) {
                        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionData, 3));
                    }
                }
                
                // 获取法线数据
                if (primitive.attributes && primitive.attributes.NORMAL !== undefined) {
                    const normalData = this.getAttributeData(primitive.attributes.NORMAL, gltfData, binaryData);
                    if (normalData) {
                        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normalData, 3));
                    }
                }
                
                // 获取UV数据
                if (primitive.attributes && primitive.attributes.TEXCOORD_0 !== undefined) {
                    const uvData = this.getAttributeData(primitive.attributes.TEXCOORD_0, gltfData, binaryData);
                    if (uvData) {
                        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvData, 2));
                    }
                }
                
                // 获取索引数据
                if (primitive.indices !== undefined) {
                    const indexData = this.getAttributeData(primitive.indices, gltfData, binaryData);
                    if (indexData) {
                        // 修复: 正确处理不同类型的索引数据
                        if (indexData instanceof Uint16Array || indexData instanceof Uint32Array) {
                            geometry.setIndex(new THREE.BufferAttribute(indexData, 1));
                        } else {
                            // 转换为Uint16Array
                            const convertedIndices = new Uint16Array(indexData.length);
                            for (let i = 0; i < indexData.length; i++) {
                                convertedIndices[i] = indexData[i];
                            }
                            geometry.setIndex(new THREE.BufferAttribute(convertedIndices, 1));
                        }
                    }
                }
                
                // 如果没有位置数据，创建默认几何体
                if (!geometry.attributes.position) {
                    console.log('使用默认几何体');
                    geometry.copy(new THREE.BoxGeometry(1, 1, 1));
                }
                
                // 计算法线（如果缺失）
                if (!geometry.attributes.normal) {
                    geometry.computeVertexNormals();
                }
                
                // 创建材质 - 保持原始材质数据
                let material;
                if (primitive.material !== undefined && gltfData.materials && gltfData.materials[primitive.material]) {
                    material = this.parseMaterial(gltfData.materials[primitive.material], gltfData, binaryData, textures);
                } else {
                    // 默认材质 - 使用标准材质以支持贴图
                    material = new THREE.MeshStandardMaterial({ 
                        color: 0xffffff,
                        side: THREE.DoubleSide,
                        metalness: 0.0,
                        roughness: 0.5
                    });
                }
                
                const mesh = new THREE.Mesh(geometry, material);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                mesh.name = `${meshGroup.name}_Primitive_${index}`;
                
                meshGroup.add(mesh);
                
            } catch (error) {
                console.warn('解析primitive失败:', error);
                // 添加一个简单的立方体作为备选
                const fallbackGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
                const fallbackMaterial = new THREE.MeshLambertMaterial({ color: 0xff8888 });
                const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
                fallbackMesh.name = `Fallback_${index}`;
                meshGroup.add(fallbackMesh);
            }
        });
        
        return meshGroup;
    }
    
    parseMaterial(materialData, gltfData, binaryData, textures) {
        try {
            // 使用MeshStandardMaterial以获得更好的渲染效果
            const material = new THREE.MeshStandardMaterial();
            
            // PBR材质参数
            if (materialData.pbrMetallicRoughness) {
                const pbr = materialData.pbrMetallicRoughness;
                
                // 基础颜色
                if (pbr.baseColorFactor) {
                    const color = pbr.baseColorFactor;
                    material.color.setRGB(color[0], color[1], color[2]);
                    if (color[3] < 1.0) {
                        material.transparent = true;
                        material.opacity = color[3];
                    }
                }
                
                // 基础颜色贴图
                if (pbr.baseColorTexture && textures[pbr.baseColorTexture.index]) {
                    material.map = textures[pbr.baseColorTexture.index];
                    console.log('应用基础颜色贴图');
                }
                
                // 金属度和粗糙度
                material.metalness = pbr.metallicFactor !== undefined ? pbr.metallicFactor : 0.0;
                material.roughness = pbr.roughnessFactor !== undefined ? pbr.roughnessFactor : 0.5;
                
                // 金属度粗糙度贴图
                if (pbr.metallicRoughnessTexture && textures[pbr.metallicRoughnessTexture.index]) {
                    material.metalnessMap = textures[pbr.metallicRoughnessTexture.index];
                    material.roughnessMap = textures[pbr.metallicRoughnessTexture.index];
                }
            }
            
            // 法线贴图
            if (materialData.normalTexture && textures[materialData.normalTexture.index]) {
                material.normalMap = textures[materialData.normalTexture.index];
                if (materialData.normalTexture.scale !== undefined) {
                    material.normalScale.setScalar(materialData.normalTexture.scale);
                }
            }
            
            // 自发光
            if (materialData.emissiveFactor) {
                material.emissive = new THREE.Color().fromArray(materialData.emissiveFactor);
                material.emissiveIntensity = 1.0;
            }
            
            // 自发光贴图
            if (materialData.emissiveTexture && textures[materialData.emissiveTexture.index]) {
                material.emissiveMap = textures[materialData.emissiveTexture.index];
            }
            
            // 双面材质
            if (materialData.doubleSided) {
                material.side = THREE.DoubleSide;
            }
            
            // 透明度模式
            if (materialData.alphaMode === 'BLEND') {
                material.transparent = true;
            } else if (materialData.alphaMode === 'MASK') {
                material.alphaTest = materialData.alphaCutoff || 0.5;
            }
            
            return material;
            
        } catch (error) {
            console.warn('材质解析失败，使用默认材质:', error);
            return new THREE.MeshStandardMaterial({ 
                color: 0xcccccc,
                side: THREE.DoubleSide,
                metalness: 0.0,
                roughness: 0.5
            });
        }
    }
    
    simpleGLBParse(arrayBuffer, onLoad, onError) {
        try {
            // 创建一个简单的占位符模型
            console.log('使用简单解析模式');
            this.updateDebugInfo('parse-status', '使用简单模式');
            
            const group = new THREE.Group();
            
            // 创建一个彩色立方体作为占位符
            const geometry = new THREE.BoxGeometry(2, 2, 2);
            const material = new THREE.MeshLambertMaterial({ 
                color: new THREE.Color(Math.random(), Math.random(), Math.random())
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            group.add(mesh);
            
            console.log('创建占位符模型');
            
            const result = {
                scene: group,
                scenes: [group],
                animations: [],
                isVRM: false,
                isPlaceholder: true
            };
            
            this.updateDebugInfo('parse-status', '占位符模型已创建');
            onLoad(result);
            
        } catch (error) {
            console.error('简单解析失败:', error);
            this.updateDebugInfo('parse-status', '所有解析方法都失败');
            if (onError) onError(error);
        }
    }
    
    getAttributeData(accessorIndex, gltfData, binaryData) {
        try {
            if (!gltfData.accessors || !gltfData.accessors[accessorIndex]) {
                return null;
            }
            
            const accessor = gltfData.accessors[accessorIndex];
            
            if (!gltfData.bufferViews || !gltfData.bufferViews[accessor.bufferView]) {
                return null;
            }
            
            const bufferView = gltfData.bufferViews[accessor.bufferView];
            
            if (!binaryData || bufferView.byteOffset === undefined) {
                return null;
            }
            
            // 检查数据边界
            const start = bufferView.byteOffset + (accessor.byteOffset || 0);
            const componentSize = this.getComponentSize(accessor.componentType);
            const typeSize = this.getTypeSize(accessor.type);
            const totalBytes = accessor.count * componentSize * typeSize;
            
            if (start + totalBytes > binaryData.length) {
                console.warn('数据超出边界');
                return null;
            }
            
            // 提取数据
            const dataSlice = binaryData.slice(start, start + totalBytes);
            
            // 根据组件类型创建正确的类型化数组
            let typedArray;
            switch (accessor.componentType) {
                case 5120: // BYTE
                    typedArray = new Int8Array(dataSlice.buffer, dataSlice.byteOffset, accessor.count * typeSize);
                    break;
                case 5121: // UNSIGNED_BYTE
                    typedArray = new Uint8Array(dataSlice.buffer, dataSlice.byteOffset, accessor.count * typeSize);
                    break;
                case 5122: // SHORT
                    typedArray = new Int16Array(dataSlice.buffer, dataSlice.byteOffset, accessor.count * typeSize);
                    break;
                case 5123: // UNSIGNED_SHORT
                    typedArray = new Uint16Array(dataSlice.buffer, dataSlice.byteOffset, accessor.count * typeSize);
                    break;
                case 5125: // UNSIGNED_INT
                    typedArray = new Uint32Array(dataSlice.buffer, dataSlice.byteOffset, accessor.count * typeSize);
                    break;
                case 5126: // FLOAT
                    typedArray = new Float32Array(dataSlice.buffer, dataSlice.byteOffset, accessor.count * typeSize);
                    break;
                default:
                    console.warn('未知的组件类型:', accessor.componentType);
                    typedArray = new Float32Array(dataSlice.buffer, dataSlice.byteOffset, accessor.count * typeSize);
            }
            
            return typedArray;
            
        } catch (error) {
            console.warn('获取属性数据失败:', error);
            return null;
        }
    }
    
    getComponentSize(componentType) {
        switch (componentType) {
            case 5120: return 1; // BYTE
            case 5121: return 1; // UNSIGNED_BYTE
            case 5122: return 2; // SHORT
            case 5123: return 2; // UNSIGNED_SHORT
            case 5125: return 4; // UNSIGNED_INT
            case 5126: return 4; // FLOAT
            default: 
                console.warn('未知的组件类型:', componentType);
                return 4;
        }
    }
    
    getTypeSize(type) {
        switch (type) {
            case 'SCALAR': return 1;
            case 'VEC2': return 2;
            case 'VEC3': return 3;
            case 'VEC4': return 4;
            case 'MAT2': return 4;
            case 'MAT3': return 9;
            case 'MAT4': return 16;
            default: 
                console.warn('未知的类型:', type);
                return 1;
        }
    }
}