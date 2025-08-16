// 输入管理器类
class InputManager {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.isPointerLocked = false;
    }
    
    // 初始化输入系统
    init() {
        this.setupKeyboardControls();
    }
    
    // 设置键盘控制
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        console.log('键盘控制初始化完成');
    }
    
    // 设置鼠标控制
    setupPointerLock(canvas) {
        canvas.addEventListener('click', () => {
            canvas.requestPointerLock();
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === canvas;
            console.log('指针锁定状态:', this.isPointerLocked);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.isPointerLocked) {
                this.mouse.x -= e.movementX * 0.002;
                this.mouse.y += e.movementY * 0.002;
                this.mouse.y = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.mouse.y));
            }
        });
        
        console.log('鼠标控制初始化完成');
    }
    
    // 检查按键是否被按下
    isKeyPressed(keyCode) {
        return !!this.keys[keyCode];
    }
    
    // 获取鼠标状态
    getMouseState() {
        return { ...this.mouse };
    }
    
    // 重置输入状态
    reset() {
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
    }
}