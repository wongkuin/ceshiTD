import { nameof } from "../../../TRFrameWork/cocos-module/component/Watch";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import List from "../../../TRFrameWork/Common/scrollview/List";
import { ModalOpacity } from "../../../TRFrameWork/UIFrame/config/SysDefine";
import { ECloseType, ModalType } from "../../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../../TRFrameWork/UIFrame/UIForm";
import GameActivityData from "../../Data/GameActivityData";
import GameUserData from "../../Data/GameUserData";
import RankItem from "./RankItem";




const { ccclass, property } = cc._decorator;

@ccclass
export default class PopRank extends UIWindow {

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

    /**\
                 * 
                 * {
                    "code": 1,
                    "message": "请求成功",
                    "data": {
                        "rankData": [
                            {
                                "rank": 1,
                                "uid": "",
                                "point": 500,
                                "name": "wongkuin",
                                "avatar": "http://gips2.baidu.com/it/u=195724436,3554684702&fm=3028&app=3028&f=JPEG&fmt=auto?w=1280&h=960"
                            }
                        ],
                        "selfRank": {
                            "rank": 1,
                            "uid": "",
                            "point": 500,
                            "name": "wongkuin",
                            "avatar": "httassets/Script/Battle/BattleMonsterUI.tsp://gips2.baidu.com/it/u=195724436,3554684702&fm=3028&app=3028&f=JPEG&fmt=auto?w=1280&h=960"
                        }
                    }
                }
                 */

    rank123List = []
    allData: any;
    public onShow(params: any): void {
        super.onShow(params);
        if (window["wx"] && cc.sys.platform == cc.sys.WECHAT_GAME) {
            window["wx"].postMessage({
                event: 'getRank'
            });
        }
        // this.allData = params.rankData;
        // this.allData.rankData.sort((a, b) => {
        //     return a.rank - b.rank;
        // });
        // this.curDatas = [];
        // this.rank123List = [];
        // const _this = this;
        // this.allData.rankData.forEach((item, index) => {
        //     if (item.rank <= 3) {
        //         _this.rank123List.push(item);
        //     } else {
        //         _this.curDatas.push(item);
        //     }
        //     // let name = GameUserData.getInstance().getBindName(item.uid);
        //     // if (!name)
        //     name = GameUserData.getInstance().getUserName(item.point);
        //     GameUserData.getInstance().bingName(item.uid, name);
        //     item.name = name;

        //     if (item.uid == GameUserData.getInstance().getGameUid()) {
        //         _this.allData.selfRank = item;
        //     }
        // });
        // //自己的名字
        // let name = GameUserData.getInstance().getBindName(this.allData.selfRank.uid);
        // if (!name) {
        //     name = GameUserData.getInstance().getRandomName();
        //     GameUserData.getInstance().bingName(this.allData.selfRank.uid, name);
        // }
        // this.allData.selfRank.name = name;

        // this.nameLab1.string = this.rank123List[0]?.name || "匿名用户";
        // this.nameLab2.string = this.rank123List[1]?.name || "匿名用户";
        // this.nameLab3.string = this.rank123List[2]?.name || "匿名用户";
        // this.passLvLab1.string = Math.floor(this.rank123List[0]?.point / 100 || 0) + "关-" + Math.floor(this.rank123List[0]?.point % 100 || 0) + "波";
        // this.passLvLab2.string = Math.floor(this.rank123List[1]?.point / 100 || 0) + "关-" + Math.floor(this.rank123List[1]?.point % 100 || 0) + "波";
        // this.passLvLab3.string = Math.floor(this.rank123List[2]?.point / 100 || 0) + "关-" + Math.floor(this.rank123List[2]?.point % 100 || 0) + "波";


        // this.myNameLab.string = this.allData.selfRank?.name || "匿名用户";
        // this.passLvLab4.string = Math.floor(this.allData.selfRank?.point / 100 || 0) + "关-" + Math.floor(this.allData.selfRank?.point % 100 || 0) + "波";
        // this.myRankNumLab.string = this.allData?.selfRank?.rank || "未上榜" + "";

        // console.error(this.curDatas.length);
        //  this.rankList.numItems = this.curDatas.length;


        // FormMgr.open(UIConfig.ui_game3in1);
    }

    onAfterShow() {
        // this.rankList.numItems = this.curDatas.length;
        // console.log("afterShow", this.rankList.numItems);
    }

    curDatas
    protected onRenderEvent(item: cc.Node, index: number) {
        // let data = this.curDatas[index];
        // item.getComponent(RankItem).initItem(data);
    }









    // update (dt) {}
}

