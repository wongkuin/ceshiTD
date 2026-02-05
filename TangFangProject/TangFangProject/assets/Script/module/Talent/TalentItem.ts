import SpriteFrame from "../../../TRFrameWork/cocos-module/component/SpriteFrame";
import GlobalEventMgr from "../../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import SoundMgr from "../../../TRFrameWork/cocos-module/mgr/SoundMgr";
import { GlobalEventID } from "../../../TRFrameWork/cocos-module/utils/GlobalEvent";
import Utils from "../../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../../TRFrameWork/Common/Components/ButtonPlus";
import { CommonUtils } from "../../../TRFrameWork/Common/Utils/CommonUtils";
import FormMgr from "../../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../../TRFrameWork/UIFrame/SceneMgr";
import ConfigMgr from "../../config/ConfigMgr";
import { KvData, TalentData, WapenTableData, WapenUpData } from "../../config/DataDef";
import { GameBundle } from "../../config/GameEnum";
import UIConfig from "../../config/UIConfig";
import GameUserData from "../../Data/GameUserData";
import GameWapenData, { WapenVo } from "../../Data/GameWapenData";
import UserItemsData from "../../Data/UserItemsData";
import GameHelp from "../../Mgr/GameHelp";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TalentItem extends cc.Component {

    @property({ type: cc.Node, tooltip: "普通" })
    protected normalRoot: cc.Node = null;

    @property({ type: cc.Node, tooltip: "第一个节点" })
    protected startRoot: cc.Node = null;

    @property({ type: ButtonPlus, tooltip: "血量" })
    protected btn1: ButtonPlus = null;

    @property({ type: ButtonPlus, tooltip: "战力" })
    protected btn2: ButtonPlus = null;

    @property({ type: ButtonPlus, tooltip: "防御" })
    protected btn3: ButtonPlus = null;

    @property({ type: cc.Node, tooltip: "" })
    protected item1: cc.Node = null;

    @property({ type: cc.Node, tooltip: "" })
    protected item2: cc.Node = null;

    @property({ type: cc.Node, tooltip: "" })
    protected item3: cc.Node = null;

    @property({ type: sp.Skeleton, tooltip: "升级动效" })
    protected lvUpSpine: sp.Skeleton = null;


    @property({ type: ButtonPlus, tooltip: "" })
    protected btnBreakthrough: ButtonPlus = null;

    @property({ type: cc.Label, tooltip: "" })
    protected breakthroughName: cc.Label = null;


    @property({ type: cc.Label, tooltip: "突破丹数量" })
    protected breakthroughLab: cc.Label = null;

    @property({ type: [SpriteFrame], tooltip: "突破进度条颜色" })
    protected jdtSFList: SpriteFrame[] = [];

    @property({ type: cc.Node, tooltip: "" })
    protected huoNode: cc.Node = null;




    data: TalentData = null;
    /**1,普通升级，2 突破丹升级 */
    itemType: 1 | 2;
    protected onLoad(): void {
        this.btn1.node["talentAttr"] = 1;
        this.btn2.node["talentAttr"] = 2;
        this.btn3.node["talentAttr"] = 3;
        this.btn1.addClick(this.onClickGet1, this);
        this.btn2.addClick(this.onClickGet1, this);
        this.btn3.addClick(this.onClickGet1, this);
        this.btnBreakthrough.addClick(this.onClickBtnBreakthrough, this);

    }

    initItem(data: TalentData) {

        this.data = data;
        this.itemType = data["itemType"];

        if (this.data.lv == 0) {
            this.normalRoot.active = false;
            this.startRoot.active = true;
            Utils.setAllChildrenSpGray(this.startRoot, false)
            this.breakthroughName.string = this.data.breakName;
            this.breakthroughLab.node.parent.active = false;
            this.huoNode.active = true;
            this.jdtSFList.forEach((jdtSf, i) => {
                jdtSf.setFrameByIndex(1);
            })
            return;
        } else if (this.itemType == 2) {
            this.normalRoot.active = false;
            this.startRoot.active = true;
            this.breakthroughName.string = this.data.breakName;
            this.breakthroughLab.string = data.costBreak[1] + "";
            let color = cc.Color.WHITE;
            this.huoNode.active = GameUserData.getInstance().breakthroughLv > data.breakLv;
            let state = true;

            // let guang = Utils.getWidget("guang", this.startRoot);
            // this.playGuangAni(guang)
            // guang.active = false;
            if (GameUserData.getInstance().talentHpLv >= this.data.lv && GameUserData.getInstance().talentAtkLv >= this.data.lv
                && GameUserData.getInstance().talentSpLv >= this.data.lv) {
                state = false;
                //  guang.active = true;
            }
            Utils.setAllChildrenSpGray(this.startRoot, state);
            if (UserItemsData.getInstance().getItemNum(data.costBreak[0]) < data.costBreak[1]) {

                color = cc.Color.RED;
            }
            this.breakthroughLab.node.color = color;
            this.breakthroughLab.node.parent.active = GameUserData.getInstance().breakthroughLv == data.breakLv;

            let sfIndex = (GameUserData.getInstance().breakthroughLv > data.breakLv) ? 1 : 0;
            this.jdtSFList.forEach((jdtSf, i) => {
                jdtSf.setFrameByIndex(sfIndex);
            })

            return;

        } else {
            this.normalRoot.active = true;
            this.startRoot.active = false
        }
        let dw = "";
        let length = ConfigMgr.getInstance().getAll(TalentData).length;
        for (let i = 1; i <= 3; i++) {
            let curlv = GameUserData.getInstance().talentHpLv;
            let sx = "hp";
            let cost = "costHp"
            dw = "";
            let item = this["item" + i];
            if (i == 2) {
                curlv = GameUserData.getInstance().talentAtkLv;
                sx = "atk";
                cost = "costAtk"
                dw = "%"

                if (this.data.atk[0] == 0) {//固定值
                    dw = ""
                }

                Utils.getWidget("ui_x_xin", item).getComponent(SpriteFrame).setFrameByIndex(this.data.atk[0]);
            } else if (i == 3) {
                sx = "sp";
                cost = "costSp"
                curlv = GameUserData.getInstance().talentSpLv;
                dw = "";
            }

            if (this.data.lv != length) {
                Utils.getWidget("jdt1", item).active = this.data.costBreak.length == 0;
                Utils.getWidget("jdt1_1", item).active = this.data.costBreak.length != 0;;
            } else {
                Utils.getWidget("jdt1", item).active = false;
                Utils.getWidget("jdt1_1", item).active = false;
            }

            if (curlv >= data.lv) {//已解锁
                Utils.getWidget("redDot", item).active = false;
                Utils.getWidget("ui_jh", item).active = true;
                if (Utils.getWidget("ui_lock", item)) Utils.getWidget("ui_lock", item).active = false;
                Utils.getWidget("costRoot", item).active = false;
                let guang = Utils.getWidget("guang", item)
                guang.active = false;
                this.playGuangAni(guang);
                Utils.getWidget("ui_up", item).active = false;
                Utils.getWidget("jdt1", item).getComponent(SpriteFrame).setFrameByIndex(1);
                Utils.getWidget("jdt1_1", item).getComponent(SpriteFrame).setFrameByIndex(1);
                Utils.setAllChildrenSpGray(item, false);
                Utils.getWidget("itemBg", item).getComponent(SpriteFrame).setFrameByIndex(1);
            } else {//未解锁

                Utils.getWidget("ui_jh", item).active = false;
                if (Utils.getWidget("ui_lock", item)) Utils.getWidget("ui_lock", item).active = true;
                Utils.getWidget("costRoot", item).active = true;
                Utils.getWidget("costNum", item).getComponent(cc.Label).string = data[cost][1] + "";

                let color = cc.color().fromHEX("#FFFFFF");
                Utils.getWidget("ui_up", item).active = false;
                let guang = Utils.getWidget("guang", item)
                if ((curlv + 1 == data.lv) && GameUserData.getInstance().breakthroughLv >= data.breakLv) {
                    guang.active = true;
                    this.playGuangAni(guang);
                    if (UserItemsData.getInstance().getItemNum(data[cost][0]) >= (data[cost][1] || 0)) {
                        Utils.getWidget("redDot", item).active = true;
                        color = cc.color().fromHEX("#FFFFFF");
                        Utils.getWidget("ui_up", item).active = true;

                    } else {
                        Utils.getWidget("redDot", item).active = false;
                        color = cc.color().fromHEX("#fe2b2b");
                    }
                    Utils.setAllChildrenSpGray(item, false)
                } else {

                    Utils.getWidget("redDot", item).active = false;
                    guang.active = false;
                    // Utils.setAllChildrenSpGray(Utils.getWidget("costRoot", item), true)
                    Utils.setAllChildrenSpGray(item, true)
                }
                Utils.getWidget("costNum", item).color = color;





                if ((curlv + 1 == data.lv) && UserItemsData.getInstance().getItemNum(data[cost][0]) >= (data[cost][1] || 0)) {






                } else {


                }

                Utils.getWidget("itemBg", item).getComponent(SpriteFrame).setFrameByIndex(0);

                Utils.getWidget("jdt1", item).getComponent(SpriteFrame).setFrameByIndex(0);

            }
            Utils.getWidget("attrLab", item).getComponent(cc.Label).string = "+" + data[sx] + dw;

            if (i == 2) {
                Utils.getWidget("attrLab", item).getComponent(cc.Label).string = "+" + data.atk[1] + dw;
            }

        }






    }

    hideJdt() {
        for (let i = 1; i <= 3; i++) {
            let item = this["item" + i];
            Utils.getWidget("jdt1", item).active = false;
        }
    }

    playGuangAni(node: cc.Node) {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .by(3, { angle: 360 })
            .repeatForever()
            .start()
    }

    onClickBtnBreakthrough() {
        if (GameUserData.getInstance().breakthroughLv > this.data.breakLv) {
            GameHelp.getInstance().showToast("已突破");
            return;
        }
        if (this.itemType != 2) {
            return;
        }
        if (GameUserData.getInstance().talentHpLv < this.data.lv) {
            GameHelp.getInstance().showToast("血量天赋未达成");
            return;
        }
        if (GameUserData.getInstance().talentAtkLv < this.data.lv) {
            GameHelp.getInstance().showToast("攻击天赋未达成");
            return;
        }
        if (GameUserData.getInstance().talentSpLv < this.data.lv) {
            GameHelp.getInstance().showToast("防御天赋未达成");
            return;
        }

        if (UserItemsData.getInstance().getItemNum(this.data.costBreak[0]) < this.data.costBreak[1]) {
            debugger;
            GameHelp.getInstance().showToast("资源不足,不可突破");
            return;
        } else {
            GameUserData.getInstance().breakthroughLv++;
            UserItemsData.getInstance().spliceItem(this.data.costBreak[0], this.data.costBreak[1]);
            GameHelp.getInstance().showToast("突破成功");
        }
    }

    onClickGet1(evt) {

        let attr = evt.target["talentAttr"];
        let curlv = GameUserData.getInstance().talentHpLv;
        if (GameUserData.getInstance().breakthroughLv < this.data.breakLv) {
            GameHelp.getInstance().showToast("当前不可解锁");
            return;
        }



        let sx = "hp";
        let cost = "costHp"
        let x = -260;
        if (attr == 2) {
            curlv = GameUserData.getInstance().talentAtkLv;
            sx = "atk";
            cost = "costAtk"
            x = 0;
        } else if (attr == 3) {
            sx = "sp";
            cost = "costSp"
            curlv = GameUserData.getInstance().talentSpLv;
            x = 260
        }
        if (curlv >= this.data.lv) {
            GameHelp.getInstance().showToast("已解锁");
            return
        }

        if ((curlv + 1 == this.data.lv) && UserItemsData.getInstance().getItemNum(this.data[cost][0]) >= (this.data[cost][1] || 0)) {
            UserItemsData.getInstance().spliceItem(this.data[cost][0], this.data[cost][1]);
            if (attr == 1) {
                GameUserData.getInstance().talentHpLv++;
            } else if (attr == 2) {
                GameUserData.getInstance().talentAtkLv++;
                if (GameUserData.getInstance().talentAtkLv == 1) {
                    this.scheduleOnce(() => {
                        GlobalEventMgr.getInstance().emit(GlobalEventID.checkTalentGuide);
                    }, 0.1)

                }
            } else if (attr == 3) {
                GameUserData.getInstance().talentSpLv++;
            }
            let kvId = 23;
            let soundName = ConfigMgr.getInstance().getById(kvId, KvData).val
            SoundMgr.getInstance().playSound(soundName);
            this.playLvUpSpine(x);
        } else {
            GameHelp.getInstance().showToast("当前不可解锁");
            // if (curlv + 1 == this.data.lv) {
            //     FormMgr.open(UIConfig.ui_PopGetMoneyByAD, { type: 2 });
            // }
        }
    }


    playLvUpSpine(x) {
        this.lvUpSpine.node.x = x;
        this.lvUpSpine.node.active = true;
        this.lvUpSpine.setAnimation(0, "animation", false);
        this.lvUpSpine.setCompleteListener(() => {
            this.lvUpSpine.node.active = false;
            this.lvUpSpine.setCompleteListener(null);
        });
    }


}