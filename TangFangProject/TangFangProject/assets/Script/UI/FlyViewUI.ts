

import { Bezier } from "../../TRFrameWork/cocos-module/Bezier/Tools/Bezier";
import { EaseType } from "../../TRFrameWork/cocos-module/Bezier/Tools/EaseType";
import SpriteFrame from "../../TRFrameWork/cocos-module/component/SpriteFrame";
import SoundMgr from "../../TRFrameWork/cocos-module/mgr/SoundMgr";
import Random from "../../TRFrameWork/cocos-module/utils/Random";
import MotionTrail from "../../TRFrameWork/Common/Components/MotionTrail";
import { ECloseType } from "../../TRFrameWork/UIFrame/Struct";
import ToastMgr from "../../TRFrameWork/UIFrame/ToastMgr";
import { UITips, UIToast } from "../../TRFrameWork/UIFrame/UIForm";
import ConfigMgr from "../config/ConfigMgr";
import { ItemBaseData } from "../config/DataDef";
import { GameBundle } from "../config/GameEnum";

const { ccclass, property } = cc._decorator;


export type FlyViewParams = {
    startWPos: cc.Vec3,
    endWPos: cc.Vec3,
    target: cc.Node,   // 飞行的节点
    duration: number,   // 动画时长
    scale?: number[],  // 初始缩放和结束缩放
    animType?: eFlyAnimType,  // 动画类型
    num?: number,            //数量
    blockInput?: boolean, // 阻挡输入
    callBack?: Function,  // 回调
    nodeNum?: number,//飞行道具数量
    itemId?: number,//道具id
}

export enum eFlyAnimType {
    Default = 1,  // 默认飞行动画
    Line,  // 直线飞行动画
    Bezier, // 贝塞尔曲线飞行动画
}


@ccclass
export default class FlyViewUI extends UIToast {

    @property(cc.Node)
    fRoot: cc.Node = null;

    @property([cc.Prefab])
    dropItemList: cc.Prefab[] = [];


    closeType: ECloseType = ECloseType.CloseAndDestory;

    maxNodeNum = 0;

    public onInit(params: any): void {
        this.setBlockInput(true);
        super.onInit(params);
    }

    public onShow(params: any): void {
        super.onShow(params);
        this.fRoot.removeAllChildren();
        let flyParams: FlyViewParams[] = params as FlyViewParams[];
        if (!flyParams) {
            this.closeToast();
            return;
        }

        if (flyParams[0]?.blockInput) {
            this.setBlockInput(true);
        } else {
            this.setBlockInput(false);
        }

        this.maxNodeNum = 0;
        flyParams.forEach((flyItem) => {


            let num = flyItem?.nodeNum || 1;
            if (this.maxNodeNum < num) {
                this.maxNodeNum = num;
            }

        });

        flyParams.forEach((flyItem) => {

            if (!flyItem || !cc.isValid(flyItem.target) && flyItem.animType != eFlyAnimType.Bezier) {
                this.closeToast()
                return;
            }
            let num = flyItem?.nodeNum || 1;

            if (!flyItem.animType || flyItem.animType == eFlyAnimType.Default) {
                this.defualeAnim(flyItem);
            } else if (flyItem.animType == eFlyAnimType.Line) {
                for (let i = 0; i < num; i++) {
                    let node = flyItem.target;
                    if (i > 0) {
                        node = cc.instantiate(flyItem.target);
                    }
                    // console.log("lineAnim", i,  this.maxNodeNum, i == this.maxNodeNum - 1);
                    this.lineAnim(flyItem, node, i, i == num - 1, (i == this.maxNodeNum - 1));
                }
            } else if (flyItem.animType == eFlyAnimType.Bezier) {
                let color = 1;
                if (flyItem.itemId) {
                    let itemData = ConfigMgr.getInstance().getById(flyItem.itemId, ItemBaseData);
                    color = itemData.colour || 1;
                }
                // color = 5;
                for (let i = 0; i < num; i++) {
                    let node = cc.instantiate(this.dropItemList[color - 1]);
                    this.BezierAnim(flyItem, node, i, i == num - 1, (i == this.maxNodeNum - 1));
                }
            }

        })
    }


    protected lineAnim(flyParams: FlyViewParams, target: cc.Node, index: number, isPush: boolean, isLast: boolean) {
        target.parent = this.fRoot;
        target.setPosition(this.fRoot.convertToNodeSpaceAR(flyParams.startWPos));
        let x1 = 0;
        let y1 = 0;
        if (index > 0) {
            x1 = Random.range(-60, 60);
            y1 = Random.range(-60, 60);
        }

        target.active = true;
        let endPos = this.fRoot.convertToNodeSpaceAR(flyParams.endWPos);
        //let goTo = cc.tween().to(flyParams.duration, { x: endPos.x ,y: endPos.y,scale:flyParams.scale[1]||1});
        // let toY = cc.tween().to(flyParams.duration, { y: endPos.y });
        let toScale = null;
        if (flyParams.scale) {
            target.scale = flyParams.scale[0];
            toScale = cc.tween().to(flyParams.duration, { scale: flyParams.scale[1] });
        }
        let nodeNum = flyParams?.nodeNum || 1;
        let time = (nodeNum > 1) ? 0.3 : 0.3;

        if (flyParams.itemId && target.getComponent(cc.Sprite)) {
            let itemData = ConfigMgr.getInstance().getById(flyParams.itemId, ItemBaseData);
            this.loadSpirteFrame(`ItemIcon/${itemData.img}`, target.getComponent(cc.Sprite), GameBundle.Bundle_commonRes);
        }
        //console.log("index", index, "isLast", isLast, x1, y1);

        cc.tween(target)
            .by(time, { x: x1, y: y1 }, { easing: "sineOut" })
            .delay(index * 0.03)
            .to(flyParams.duration, { x: endPos.x, y: endPos.y, scale: flyParams?.scale[1] || target.scale })
            .call(() => {
                target.setPosition(endPos);
                // console.error("isLast", index, isLast);
                isPush && flyParams.callBack && flyParams.callBack();
            })
            .delay(0.2)
            .call(() => {

                if (isLast) {
                    this.fRoot.removeAllChildren();
                    ToastMgr.close(this, null);
                    // ToastMgr.clearToasts();
                }

            }).start();


    }

    //贝塞尔曲线飞行动画
    protected BezierAnim(flyParams: FlyViewParams, target: cc.Node, index: number, isPush: boolean, isLast: boolean) {
        target.parent = this.fRoot;
        target.setPosition(this.fRoot.convertToNodeSpaceAR(flyParams.startWPos));
        target.active = true;
        let endPos = this.fRoot.convertToNodeSpaceAR(flyParams.endWPos);
        if (flyParams.scale) {
            target.scale = flyParams.scale[0];

        }

        let fuhaoX = Random.range(0, 10) > 5 ? -1 : 1;
        let fuhaoY = Random.range(0, 10) > 5 ? -1 : 1;


        let posArr = [new cc.Vec3(target.x, target.y, 0), new cc.Vec3(target.x + Random.range(100, 250) * fuhaoX, target.y + Random.range(50, 350) * fuhaoY, 0), endPos];
        // 移动(返回一个Bezier对象, 通过该对象可以暂停、恢复、停止)
        Bezier.Move(target, posArr, 1.5, EaseType.InOutQuart, null, () => {

            cc.tween(target)
                .call(() => {
                    target.setPosition(endPos);
                    isPush && flyParams.callBack && flyParams.callBack();
                })
                .call(() => {
                    if (isLast) {
                        this.fRoot.removeAllChildren();
                        ToastMgr.close(this, null);
                    }

                }).start();
        })




    }





    // 默认飞行动画 飞体力等
    protected defualeAnim(flyParams: FlyViewParams) {
        this.fRoot.addChild(flyParams.target);
        if (flyParams.itemId && flyParams.target.getComponent(cc.Sprite)) {
            let itemData = ConfigMgr.getInstance().getById(flyParams.itemId, ItemBaseData);
            this.loadSpirteFrame(`ItemIcon/${itemData.img}`, flyParams.target.getComponent(cc.Sprite), GameBundle.Bundle_commonRes);
        }
        flyParams.target.setPosition(this.fRoot.convertToNodeSpaceAR(flyParams.startWPos));
        flyParams.target.scale = flyParams.scale[0];
        flyParams.target.active = true;
        let endPos = this.fRoot.convertToNodeSpaceAR(flyParams.endWPos);

        let toX = cc.tween().to(flyParams.duration, { x: endPos.x }, { easing: "expoOut" });
        let toY = cc.tween().to(flyParams.duration, { y: endPos.y }, { easing: "expoIn" });
        let toScale = null;
        if (flyParams.scale) {
            toScale = cc.tween().to(flyParams.duration, { scale: flyParams.scale[1] });
        }
        cc.tween(flyParams.target)
            .parallel(toX, toScale, toY)
            .call(() => {
                flyParams.target.setPosition(endPos);
                flyParams.callBack && flyParams.callBack();
            })
            .delay(0.2)
            .call(() => {
                ToastMgr.close(this, null);
            }).start();
    }

    public onHide(): void {

    }

    protected closeToast(): void {
        ToastMgr.close(this, null);
    }
    // update (dt) {}
}

