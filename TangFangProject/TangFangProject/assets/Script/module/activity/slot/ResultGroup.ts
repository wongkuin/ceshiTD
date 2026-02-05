// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GlobalEventMgr from "../../../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import SceneMgr from "../../../../TRFrameWork/UIFrame/SceneMgr";
import ConfigMgr from "../../../config/ConfigMgr";
import { PowUpData, WapenTableData } from "../../../config/DataDef";
import { GameBundle } from "../../../config/GameEnum";
import Laba from "./Laba";




const { ccclass, property } = cc._decorator;

@ccclass
export default class ResultGroup extends cc.Component {
    @property({ tooltip: "对应的模糊组", type: cc.Node })
    public labagroup: cc.Node = null


    //是否移动
    private _isMove: boolean = false;



    start() {
    }

    update(dt) {
        this.moving();
    }



    //初始化数据
    public initData(type, id?: number) {
        if (type == 1) {// /** 类型，//1:格子升级；2：强化效果*/
            let cfg = ConfigMgr.getInstance().getById(id, WapenTableData);
            let icon = cfg.img;
            SceneMgr.getCurrScene().loadSpirteFrame(`wapen/${icon}`, this.node.getComponentInChildren(cc.Sprite), GameBundle.Bundle_commonRes);
        } else if (type == 2) {
            let cfg = ConfigMgr.getInstance().getById(id, PowUpData);
            console.log("cfg=", JSON.stringify(cfg), id);
            let icon = cfg.icon;
            SceneMgr.getCurrScene().loadSpirteFrame(`powupIcon/${icon}`, this.node.getComponentInChildren(cc.Sprite), GameBundle.Bundle_commonRes);
        }

    }








    //起始滚动
    public onStartUpResultGroup() {
        //显示最后一个元素   处理  红包飞到老虎手上禁用mask造成的不好效果  
        //this.node.children[this.node.children.length - 1].opacity = 255;

        cc.tween(this.node)
            // .to(0.5, { y:0},{easing:"bounceOut"})
            .to(0.1, { y: 100 }, { easing: "smooth" })
            .call(() => {
                cc.tween(this.node)
                    .to(0.1, { y: 74 }, { easing: "smooth" })
                    .call(() => {

                        //调用对应的 模糊组列
                        // this.playSpin();
                        this.labagroup.getComponent(Laba).onbeginClick();


                        // this.onDelAllItem();
                        // //重新生成元素数据
                        // this.initData();
                        this.node.y = 280 + 3 * 60;
                    })
                    .start();
            })
            .start();
    }


    //结果组开始下落
    /**
     * 显示结果组的方法
     * 该方法用于触发显示结果组的相关操作
     * 通过设置_move标志为true来控制显示状态
     */
    /**
     * 显示结果分组的方法
     * 该方法用于控制结果分组的显示状态，通过设置移动状态标志为true来实现
     */
    public onShowResultGrop() {
        this._isMove = true;
    }




    //帧 驱动  滚动
    moving() {
        if (this._isMove) {
            this.node.y -= 60;
            if (this.node.y <= 120) {
                this._isMove = false;
                this.onDownResultGroup();
            }
        }
    }


    //掉落缓动操作
    onDownResultGroup() {
        cc.tween(this.node)
            // .to(0.5, { y:0},{easing:"bounceOut"})
            .to(0.5, { y: 74 }, { easing: "elasticOut" })
            .call(() => {
                // onSuccess();
                // ,{easing:"bounceOut"}


                // console.log("掉落完成！！！  this.node.name=",this.node.name);
                //关闭布局
                this.node.getComponent(cc.Layout).enabled = false;


                //隐藏最后一个元素    处理  红包飞到老虎手上禁用mask造成的不好效果  
                // this.node.children[this.node.children.length - 1].opacity = 0;

                //最后一个组
                if (this.node.name == "resultGroup5") {
                    // FortuneTiger_SoundPreloadMgr.getInsteance().playSound("reel_stop");

                    //  GlobalEventMgr.getInstance().emit(FortuneTiger_EventEnum.resultLabaGroup, [this.node.name]);
                }

            })
            .start();
    }







    //初始化slot模式  lababox 
    public onInitResultGroup() {
        this.labagroup.getComponent(Laba).initSlotLabaBox();
    }





}











