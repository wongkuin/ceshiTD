// Tween 管理器类
export class TweenManager {
    private static _instance: TweenManager;
    private _nodeTweenMap: Map<cc.Node, cc.Tween<any>[]> = new Map();

    static  getInstance(): TweenManager {
        if (!this._instance) {
            this._instance = new TweenManager();
        }
        return this._instance;
    }

    cleanAll(){
        this._nodeTweenMap.clear();
    }

    // 创建可追踪的 Tween
    create(target: any): cc.Tween<any> {
        const tween = cc.tween(target);
        this._trackTween(tween, target);
        return tween;
    }

    // 追踪 Tween 状态
    private _trackTween(tween: cc.Tween<any>, target: any) {
        const originalStart = tween.start.bind(tween);
        const originalStop = tween.stop.bind(tween);

      //  重写 start 方法
        tween.start = () => {
            if (target instanceof cc.Node) {
                const node = target as cc.Node;
                if (!this._nodeTweenMap.has(node)) {
                    this._nodeTweenMap.set(node, []);
                }
                this._nodeTweenMap.get(node)?.push(tween);
            }
            return originalStart();
        };

        // 重写 stop 方法
        tween.stop = () => {
            if (target instanceof cc.Node) {
                const node = target as cc.Node;
                const tweens = this._nodeTweenMap.get(node);
                if (tweens) {
                    const index = tweens.indexOf(tween);
                    if (index !== -1) {
                        tweens.splice(index, 1);
                    }
                }
            }
            return originalStop();
        };

        // 自动清理完成回调
        // tween.call(() => {
        //     this.stopTween(tween, target);
        // });
    }

    // 检查节点是否有活跃 Tween
    hasActiveTween(node: cc.Node): boolean {
        return this._nodeTweenMap.get(node)?.length > 0;
    }

    // 停止特定 Tween
    stopTween(tween: cc.Tween<any>, target: any) {
        if (target instanceof cc.Node) {
            const node = target as cc.Node;
            const tweens = this._nodeTweenMap.get(node);
            if (tweens) {
                const index = tweens.indexOf(tween);
                if (index !== -1) {
                    tweens.splice(index, 1);
                }
            }
        }
        tween.stop();
    }

    // 停止所有 Tween
    stopAllTween( target: cc.Node) {
        if (target instanceof cc.Node) {
            const node = target as cc.Node;
            let  tweens = this._nodeTweenMap.get(node);
            if (tweens) {  
                tweens= [];
            }
        }
        cc.Tween.stopAllByTarget(target);
    }
}

// 使用示例
//const node = this.node;

// 创建 Tween (必须通过管理器)
// const tween = TweenManager.getInstance.create(node)
//     .to(1, { position: cc.v3(100, 100) })
//     .start();

// // 检查是否有活跃 Tween
// if (TweenManager.getInstance.hasActiveTween(node)) {
//     console.log("该节点有正在运行的 Tween");
// }