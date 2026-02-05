import { nameof } from "../../../TRFrameWork/cocos-module/component/Watch";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import List from "../../../TRFrameWork/Common/scrollview/List";
import { ModalOpacity } from "../../../TRFrameWork/UIFrame/config/SysDefine";
import { ECloseType, ModalType } from "../../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../../TRFrameWork/UIFrame/UIForm";
import GameActivityData from "../../Data/GameActivityData";
import PopRank from "../activity/PopRank";
import RankItem from "./HurtRankItem";




const { ccclass, property } = cc._decorator;

@ccclass
export default class PopHurtRank extends UIWindow {

    
        @property(ButtonPlus)
        btnClose: ButtonPlus = null;
    
        @property({ type: List })
        rankList: List = null;
    
        @property({ type: cc.Label, tooltip: "第一名" })
        protected nameLab1: cc.Label = null;
        @property({ type: cc.Label, tooltip: "第2名" })
        protected nameLab2: cc.Label = null;
        @property({ type: cc.Label, tooltip: "第3名" })
        protected nameLab3: cc.Label = null;
        @property({ type: cc.Label, tooltip: "自己" })
        protected myNameLab: cc.Label = null;
    
    
        @property({ type: cc.Label, tooltip: "第一名" })
        protected passLvLab1: cc.Label = null;
        @property({ type: cc.Label, tooltip: "第2名" })
        protected passLvLab2: cc.Label = null;
        @property({ type: cc.Label, tooltip: "第3名" })
        protected passLvLab3: cc.Label = null;
        @property({ type: cc.Label, tooltip: "自己" })
        protected passLvLab4: cc.Label = null;
    
        @property({ type: cc.Label, tooltip: "自己" })
        protected myRankNumLab: cc.Label = null;


    closeType = ECloseType.CloseAndDestory;
    modalType = new ModalType(ModalOpacity.OpacityHalf, true);

    public onInit(params: any): void {
        super.onInit(params);
        this.btnClose.addClick(this.onBtnClicked, this);


    }

    public onBtnClicked(evt: cc.Event.EventTouch): void {
        if (evt.target == this.btnClose.node) {
            this.closeSelf();
        }
    }

  

    rank123List = []
    allData: any;
    public onShow(params: any): void {
        super.onShow(params);

        this.allData = params.rankData;
        this.allData.ranks.sort((a, b) => {
            return a.rank - b.rank;
        });
        this.curDatas = [];
        this.rank123List = [];
        this.allData.ranks.forEach((item, index) => {
            if (item.rank <= 3) {
                this.rank123List.push(item);
            } else {
                this.curDatas.push(item);
            }
        });

        this.nameLab1.string = this.rank123List[0].nickname || "匿名用户";
        this.nameLab2.string = this.rank123List[1].nickname || "匿名用户";
        this.nameLab3.string = this.rank123List[2].nickname || "匿名用户";
        this.passLvLab1.string =this.getHurtLab(this.rank123List[0].score);
        this.passLvLab2.string =this.getHurtLab(this.rank123List[1].score);
        this.passLvLab3.string = this.getHurtLab(this.rank123List[2].score);



        this.myNameLab.string = this.allData.selfRank?.nickname || "匿名用户";
        this.passLvLab4.string = this.getHurtLab(this.allData?.selfRank?.score || 0);
        this.myRankNumLab.string = this.allData?.selfRank?.rank || "未上榜" + "";

        console.error(this.curDatas.length);
        //  this.rankList.numItems = this.curDatas.length;


        // FormMgr.open(UIConfig.ui_game3in1);
    }

       getHurtLab(hurt: number, xiaoshu: number = 1): string {
        let str = "";
        if (hurt >= 10000 && hurt < 100000000) {
            let num = hurt % 10000;
            if (num > 0) {
                str = (hurt / 10000).toFixed(1) + "万";
            } else {
                str = (hurt / 10000).toFixed(0) + "万";
            }
        } else if (hurt > 100000000) {
            str = (hurt / 100000000).toFixed(xiaoshu) + "亿";
        } else {
            str = hurt + "";
        }

        return "伤害："+str;
    }

    onAfterShow() {
        this.rankList.numItems = this.curDatas.length;
        console.log("afterShow", this.rankList.numItems);

    }


    curDatas
    protected onRenderEvent(item: cc.Node, index: number) {

        let data = this.curDatas[index];
        item.getComponent(RankItem).initItem(data);


    }









    // update (dt) {}
}

