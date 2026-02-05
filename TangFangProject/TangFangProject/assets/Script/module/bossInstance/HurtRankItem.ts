import RankItem from "../activity/RankItem";



const { ccclass, property } = cc._decorator;

@ccclass
export default class HurtRankItem extends RankItem {







    protected onLoad(): void {

    }

    initItem(data: any) {
        this.rankNumLab.string = data.rank;
        this.nameLab.string = data.nickname || "匿名用户";
        this.jdLab.string = this.getHurtLab(data.score);
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

}