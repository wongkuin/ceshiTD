


const { ccclass, property } = cc._decorator;

@ccclass
export default class RankItem extends cc.Component {




    @property({ type: cc.Label, tooltip: "排行" })
    protected rankNumLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "名字" })
    protected nameLab: cc.Label = null;

    @property({ type: cc.Label, tooltip: "进度" })
    protected jdLab: cc.Label = null;


    protected onLoad(): void {

    }

    /**
     * 
     * @param data  {
                                "rank": 1,
                                "uid": "",
                                "point": 500,
                                "name": "wongkuin",
                                "avatar": "http://gips2.baidu.com/it/u=195724436,3554684702&fm=3028&app=3028&f=JPEG&fmt=auto?w=1280&h=960"
                            }
     */
    initItem(data: any) {
        this.rankNumLab.string = data.rank;
        this.nameLab.string = data.name || "匿名用户";
        this.jdLab.string = Math.floor(data.point / 100) + "关-" + Math.floor(data.point % 100) + "波";
    }

}