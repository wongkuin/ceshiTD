

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuideMaskLayer extends cc.Component {

    @property(cc.Node)
    stencil: cc.Node = null;

    followNode: cc.Node = null;
    extHight: number;
    bStop = false;
    onLoad() {
        // this.init();
    }

    init() {
        this.node.targetOff(this);
        this.node.on(cc.Node.EventType.TOUCH_START, function (event: cc.Event.EventTouch) {
            this._onMaskTouchStart(event);
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_END, function (event: cc.Event.EventTouch) {
            if (this.bStop == false) {
                this._onMaskTouchEnd(event);
            }
        }, this);

       
    }

    _onMaskTouchStart(event: cc.Event.EventTouch) {
        let pt = this.stencil.convertToNodeSpaceAR(event.getLocation());


        let rect = cc.rect(-this.stencil.width * this.followNode.anchorX, -this.stencil.height * this.followNode.anchorY, this.stencil.width, this.stencil.height);

        let nd = this.node as any;
        // 点中空洞，返回false,触摸事件继续派发
        if (rect.contains(pt)) {
            nd._touchListener.setSwallowTouches(false);
            this.bStop = false;
        }
        else {
            nd._touchListener.setSwallowTouches(true);
            event.stopPropagation();
            this.bStop = true;
        }
    }

    _onMaskTouchEnd(event: cc.Event.EventTouch) {
        // 点击中了空洞
        //console.log('click sucess');
        // this.Hide();
    }

    Hide() {
        this.node.destroy();
    }

    initStencil(node: cc.Node, extHight: number) {
        
        if (node == null) {
            this.followNode = null;
            this.stencil.width = 210;
            this.stencil.height = 210;
            this.stencil.setPosition(cc.v2(0, 300));
            this.stencil.active = true;

            this.init();
            return;
        }
        this.followNode = node;
        let contentSize = node.getContentSize();
        this.stencil.width = contentSize.width*node.scaleX+ 20;
        this.stencil.height = contentSize.height*node.scaleX + 20 + extHight;
        this.stencil.setAnchorPoint(this.followNode.anchorX, this.followNode.anchorY);
        this.extHight = extHight;
        this.stencil.active =false;
        this.scheduleOnce( ()=>{
             this.stencil.active =true;
        })


        this.init();
    }

    update() {
        // 跟随目标已经消失 被销毁
        if (cc.isValid(this.followNode) === false) { return; }

        let node = this.followNode;
        let pos = node.parent.convertToWorldSpaceAR(node.position);
        let localpos = this.stencil.parent.convertToNodeSpaceAR(pos);
        this.stencil.setPosition(cc.v2(localpos.x, localpos.y + this.extHight / 2));

        this.followNode = node;
        this.stencil.active = true;
    }


}