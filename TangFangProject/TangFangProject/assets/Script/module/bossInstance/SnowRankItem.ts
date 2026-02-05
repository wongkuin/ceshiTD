import SpriteFrame from "../../../TRFrameWork/cocos-module/component/SpriteFrame";



const { ccclass, property } = cc._decorator;

@ccclass
export default class SnowRankItem extends cc.Component {




    @property({ type: cc.Label, tooltip: "排行" })
    protected rankNumLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "名字" })
    protected nameLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "战力" })
    protected powerLab: cc.Label = null;

     @property({ type: SpriteFrame, tooltip: "" })
    protected sp: SpriteFrame= null;




    protected onLoad(): void {

    }

    initItem(data: any) {
        if(data.rank<=3){
            this.sp.node.active = true;
            this.sp.setFrameByIndex(data.rank - 1);
        }else{
            this.sp.node.active = false;
        }
        this.rankNumLab.string = data.rank;
        this.nameLab.string = data.nickname || "匿名用户";
        this.powerLab.string = this.getHurtLab(data.score);
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

        return str;
    }

}

