const { ccclass, property } = cc._decorator;

enum ScrollMode {
    NO_MOVE,//不移动
    TOP_TO_BOTTOM,      // 0: 垂直向下
    LEFT_TOP_TO_RIGHT_BOTTOM,  // 1: 左上到右下
    RIGHT_TOP_TO_LEFT_BOTTOM,  // 2: 右上到左下
    RIGHT_TO_LEFT       // 3: 水平向左
}

@ccclass
export class MultiModeBackgroundScrollUI extends cc.Component {

    @property(cc.Node)
    mainBg: cc.Node = null;  // 主背景节点

    @property(cc.Node)
    cloneBg: cc.Node = null; // 克隆背景节点

    @property(cc.Node)
    cloneBg3: cc.Node = null; // 克隆背景节点

    @property(cc.Node)
    cloneBg4: cc.Node = null; // 克隆背景节点

    @property({
        type: cc.Enum(ScrollMode),
        tooltip: "滚动模式：0=垂直 1=左斜 2=右斜 3=水平"
    })
    mode: ScrollMode = ScrollMode.TOP_TO_BOTTOM;

    @property({
        visible() { return this.mode !== ScrollMode.TOP_TO_BOTTOM && this.mode !== ScrollMode.RIGHT_TO_LEFT; },
        tooltip: "斜向角度（0-89度）"
    })
    angle: number = 50;

    @property
    speed: number = 200;    // 基础滚动速度

    private texWidth: number = 0;
    private texHeight: number = 0;
    private dirX: number = 0;
    private dirY: number = 0;

    onLoad() {
        // 获取纹理尺寸
        const frame = this.mainBg.getComponent(cc.Sprite).spriteFrame;
        this.texWidth = frame.getRect().width;
        this.texHeight = frame.getRect().height;
        
        this.initClonePosition();
    }

    // 初始化克隆节点位置
    initClonePosition() {
        switch (this.mode) {
            case ScrollMode.TOP_TO_BOTTOM:
                this.cloneBg.setPosition(0, this.texHeight);
                this.cloneBg3.active = this.cloneBg4.active = false;
                break;
            case ScrollMode.LEFT_TOP_TO_RIGHT_BOTTOM:
                this.cloneBg3.active = this.cloneBg4.active = false;
                this.cloneBg3.setPosition(-this.texWidth, 0);
                this.cloneBg.setPosition(-this.texWidth, this.texHeight);
                this.cloneBg4.setPosition(0, this.texHeight);
                break;
            case ScrollMode.RIGHT_TOP_TO_LEFT_BOTTOM:
                this.cloneBg.setPosition(this.texWidth, this.texHeight);
                break;
            case ScrollMode.RIGHT_TO_LEFT:
                this.cloneBg.setPosition(this.texWidth, 0);
                break;
        }
    }

    update(dt: number) {
        this.calcDirection();
        this.moveBackground(this.mainBg, dt);
        this.moveBackground(this.cloneBg, dt);
        this.moveBackground(this.cloneBg3, dt);
        this.moveBackground(this.cloneBg4, dt);
        this.checkBoundary();
    }

    // 计算运动方向矢量
    calcDirection() {
        switch (this.mode) {
            case ScrollMode.TOP_TO_BOTTOM:
                this.dirX = 0;
                this.dirY = -1;
                break;
            case ScrollMode.LEFT_TOP_TO_RIGHT_BOTTOM: {
                const rad = this.angle * Math.PI / 180;
                this.dirX = Math.cos(rad);
                this.dirY = -Math.sin(rad);
                break;
            }
            case ScrollMode.RIGHT_TOP_TO_LEFT_BOTTOM: {
                const rad = this.angle * Math.PI / 180;
                this.dirX = -Math.cos(rad);
                this.dirY = -Math.sin(rad);
                break;
            }
            case ScrollMode.RIGHT_TO_LEFT:
                this.dirX = -1;
                this.dirY = 0;
                break;
        }
    }

    // 移动单个背景
    moveBackground(bg: cc.Node, dt: number) {
        bg.x += this.dirX * this.speed * dt;
        bg.y += this.dirY * this.speed * dt;
    }

    // 边界检测与重置
    checkBoundary() {
        const checkNodes = [this.mainBg, this.cloneBg];//this.cloneBg3,this.cloneBg4];
        
        checkNodes.forEach(bg => {
            switch (this.mode) {
                case ScrollMode.TOP_TO_BOTTOM:
                    if (bg.y < -this.texHeight) {
                        bg.y += this.texHeight * 2;
                    }
                    break;
                    
                case ScrollMode.LEFT_TOP_TO_RIGHT_BOTTOM:
                    if (bg.x > this.texWidth * 1.5 || bg.y < -this.texHeight) {
                       
                       
                        bg.x -= this.texWidth * 2;
                        bg.y += this.texHeight * 2;
                        if(bg==this.mainBg){
                            this.cloneBg4.x =this.mainBg.x;
                            this.cloneBg4.y = this.mainBg.y-this.texHeight;
                        }
                         if(bg==this.cloneBg){
                            this.cloneBg3.x =this.cloneBg.x;
                            this.cloneBg3.y = this.cloneBg.y-this.texHeight;
                        }
                        
                    }
                    break;
                    
                case ScrollMode.RIGHT_TOP_TO_LEFT_BOTTOM:
                    if (bg.x < -this.texWidth * 1.5 || bg.y < -this.texHeight) {
                        bg.x += this.texWidth * 2;
                        bg.y += this.texHeight * 2;
                    }
                    break;
                    
                case ScrollMode.RIGHT_TO_LEFT:
                    if (bg.x < -this.texWidth) {
                        bg.x += this.texWidth * 2;
                    }
                    break;
            }
        });
        // switch (this.mode) {
           
                
        //     case ScrollMode.LEFT_TOP_TO_RIGHT_BOTTOM:
        //        this.cloneBg3.x =this.cloneBg.x;
        //        this.cloneBg3.y = this.cloneBg.y-this.texWidth;

        //        this.cloneBg4.x =this.mainBg.x;
        //        this.cloneBg4.y = this.mainBg.y+this.texWidth;
        //        break;
                
        //     case ScrollMode.RIGHT_TOP_TO_LEFT_BOTTOM:
             
                
        //     case ScrollMode.RIGHT_TO_LEFT:
                
        // }


    }
}
