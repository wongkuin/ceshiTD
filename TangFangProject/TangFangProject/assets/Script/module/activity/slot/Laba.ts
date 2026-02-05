import GlobalEventMgr from "../../../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import SoundMgr from "../../../../TRFrameWork/cocos-module/mgr/SoundMgr";
import { GlobalEventID } from "../../../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Random from "../../../../TRFrameWork/cocos-module/utils/Random";
import SceneMgr from "../../../../TRFrameWork/UIFrame/SceneMgr";
import GameControl from "../../../Battle/GameControl";
import ConfigMgr from "../../../config/ConfigMgr";
import { WapenTableData } from "../../../config/DataDef";
import { GameBundle } from "../../../config/GameEnum";
import ResultGroup from "./ResultGroup";


const { ccclass, property } = cc._decorator;

@ccclass
export default class Laba extends cc.Component {


    @property([cc.Node])
    items: cc.Node[] = [];


    @property({ tooltip: "对应结果组", type: cc.Node })
    public labagroup: cc.Node = null


    @property(cc.SpriteFrame)
    wenhaoSp: cc.SpriteFrame = null;
    // @property([cc.Node])
    // beginbtn: cc.Node = null;

    /**
     * 想象里面的滚动时由个锤子往下拉 这是拉的高度，可根据滚多少圈，到那一项来计算
     */
    height: number = 0;

    /**是否正在滚动中 */
    doRuning: number = 0;

    /**
     * 当前转了多少时间
     */
    runTime: number = 0;


    beginItemPos: Array<number> = [];

    //滚动是否结束
    isRunOver: boolean = true;







    //初始化符号原坐标
    initbeginItemPos() {
        this.beginItemPos = [];
        for (let index = 0; index < this.items.length; index++) {
            this.beginItemPos.push(this.items[index].y);
        }
    }



    public resetbeginItemPos() {
        for (let index = 0; index < this.items.length; index++) {
            this.items[index].y = this.beginItemPos[index];
        }
    }

    resetItemPos() {
        let pos = 0;
        for (let i = this.items.length - 1; i >= 0; i--) {

            this.items[i].y = pos;
            // pos += this.height;
            pos += this.height;
        }
    }

    private _soundtime: number = 0;
    //帧 驱动  滚动
    moving(dt: number) {
        // console.log(
        //     "开始滚动  2222222~~~~~~~~~~~~~~~~~"
        // );

        // let moveDelta = this.moveDown(dt);  

        let moveDelta = 60; //不被时间影响 转动停止

        for (let i = 0; i < this.items.length; i++) {
            let n = this.items[i];
            n.y -= moveDelta;
        }



        for (let i = 0; i < this.items.length; i++) {
            let n = this.items[i];
            // if(n.y < -1 * 400) {
            if (n.y < -1 * 230) {
                // console.log("yy===",n.y,"     height===",-1 * this.height);

                let k = (i + 1) >= this.items.length ? 0 : i + 1;
                n.y = this.items[k].y + this.height;


                this.changeItemImge(this.items[i]);
            }
        }



        this._soundtime += dt;
        // console.log("this._soundtime==",this._soundtime);
        if (this._soundtime > 0.06) {
            this._soundtime = 0;
            //  FortuneTiger_SoundPreloadMgr.getInsteance().playSound("dada");
        }

    }




    doStart() {
        this.resetbeginItemPos();

        this.runTime = 0;

        this.doRuning = 1;

        this.isRunOver = false;
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.node.opacity = 0;
        // this.height = 115;
        //每个格子之间的距离
        this.height = 197;

        this.addEvent();
        this.initbeginItemPos();

    }


    addEvent(): void {
        //控制laba停止
        GlobalEventMgr.getInstance().on(GlobalEventID.stopLaba, this.stopLaba, this);


    }

    removeEvent(): void {
        //拉霸移动
    }

    update(dt) {

        if (this.doRuning == 1) {
            this.moving(dt);
        } else {
            // this.resetbeginItemPos();
            // console.log("拉霸旋转完毕==============");


            //选择完毕后续事件
            if (!this.isRunOver) {
                // console.log("拉霸旋转完毕==============",this.node.name);
                this.isRunOver = true;
                //滚动结束 发送后续事件请求

                this.node.opacity = 0;
                // JollyTreasures_EventMgr.emitEvent(JollyTreasures_EventEnum.resultLabaGroup,[this.node.name]);

                //掉落声音
                //  FortuneTiger_SoundPreloadMgr.getInsteance().playSound("labaend");




                //slot模式  结果组下落
                this.labagroup.getComponent(ResultGroup).onShowResultGrop();



                this.resetbeginItemPos();




                // JollyTreasures_SoundMgr.playSound("stop");
            }

        }
    }

    public onbeginClick() {
        this.node.opacity = 255;
        if (this.node.name == "group1") {
            SoundMgr.getInstance().playSound("lottery1");
        }

        // console.log("当前组===",this.node.name);
        this.initlaba();

        this.doStart();
    }


    onDisable(): void {
        this.removeEvent();

    }

    onDestroy(): void {
        this.removeEvent();

    }

    //初始化
    public initlaba() {

        this.initLabaBox();

        this.node.opacity = 255;

    }


    //laba box 赋值
    initLabaBox() {
        // console.log("laba box 赋值laba box 赋值laba box 赋值");




        //正常slot
        for (let index = 0; index < this.items.length; index++) {
            let box = this.items[index];
            this.changeItemImge(box);

            //  box.children[0].getComponent(cc.Sprite).spriteFrame = this.itemIcons[index];
        }


    }

    //初始化slot类型的lababox
    public initSlotLabaBox() {
        for (let index = 0; index < this.items.length; index++) {
            let box = this.items[index];
            this.changeItemImge(box);
            //   box.children[0].getComponent(cc.Sprite).spriteFrame = this.itemIcons[index];
        }
    }



    //控制laba停止 
    /**
     * @param groupname   组名
     * @param delay   延迟停止laba组
     * @param downdelay  下落延迟   下落有个顺序
     */
    public stopLaba(delay) {

        // console.log("delay==",para.delay,"  this.node.name=",this.node.name);


        this.scheduleOnce(() => {
            this.doRuning = 0;
            this.node.opacity = 0;
        }, delay)
    }


    //继续滚动laba
    public moveLaba() {
        this.doRuning = 1;

        this.isRunOver = true;
        //滚动结束 发送后续事件请求

        this.node.opacity = 255;

    }




    //变换 itme 图标
    changeItemImge(item) {
        let all = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
        //  let all = GameControl.getInstance().getAllFightTurret();
        let index = Random.range(0, all.length - 1);
        //let id = all[index].tid;
        let id = all[index];
        let icon = ConfigMgr.getInstance().getById(id, WapenTableData).img;
        SceneMgr.getCurrScene().loadSpirteFrame(`wapen/${icon}`, item.children[0].getComponent(cc.Sprite), GameBundle.Bundle_commonRes);
    }







}

