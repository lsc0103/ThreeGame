// UI管理器类
class UIManager {
    constructor() {
        this.elements = {};
    }
    
    // 初始化UI系统
    init() {
        this.cacheElements();
        this.setupFileInput();
        console.log('UI管理器初始化完成');
    }
    
    // 缓存DOM元素
    cacheElements() {
        this.elements = {
            modelInfo: document.getElementById('model-info'),
            modelStatus: document.getElementById('model-status'),
            fileSize: document.getElementById('file-size'),
            parseStatus: document.getElementById('parse-status'),
            fileInput: document.getElementById('file-input'),
            debugInfo: document.getElementById('debug-info')
        };
    }
    
    // 设置文件输入
    setupFileInput() {
        if (this.elements.fileInput) {
            this.elements.fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && window.gameCore) {
                    console.log('选择了文件:', file.name);
                    this.updateModelStatus('加载中...');
                    window.gameCore.loadGLBModel(file);
                }
            });
        }
    }
    
    // 更新模型信息
    updateModelInfo(fileName, modelType) {
        if (this.elements.modelInfo) {
            this.elements.modelInfo.textContent = `当前: ${fileName} (${modelType})`;
        }
    }
    
    // 更新模型状态
    updateModelStatus(status) {
        if (this.elements.modelStatus) {
            this.elements.modelStatus.textContent = status;
        }
    }
    
    // 更新文件大小
    updateFileSize(size) {
        if (this.elements.fileSize) {
            this.elements.fileSize.textContent = size;
        }
    }
    
    // 更新解析状态
    updateParseStatus(status) {
        if (this.elements.parseStatus) {
            this.elements.parseStatus.textContent = status;
        }
    }
    
    // 重置模型信息
    resetModelInfo() {
        this.updateModelInfo('默认角色', '');
        this.updateModelStatus('默认角色');
        this.updateFileSize('-');
        this.updateParseStatus('-');
        
        if (this.elements.fileInput) {
            this.elements.fileInput.value = '';
        }
    }
    
    // 显示/隐藏调试信息
    toggleDebugInfo(show) {
        if (this.elements.debugInfo) {
            this.elements.debugInfo.style.display = show ? 'block' : 'none';
        }
    }
}