import SpriteFrame from "../../TRFrameWork/cocos-module/component/SpriteFrame";
import SoundMgr from "../../TRFrameWork/cocos-module/mgr/SoundMgr";
import Utils from "../../TRFrameWork/cocos-module/utils/Utils";
import ButtonPlus from "../../TRFrameWork/Common/Components/ButtonPlus";
import PlatformMgr from "../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import { ModalOpacity } from "../../TRFrameWork/UIFrame/config/SysDefine";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import SceneMgr from "../../TRFrameWork/UIFrame/SceneMgr";
import { ModalType, ECloseType } from "../../TRFrameWork/UIFrame/Struct";
import { UIWindow } from "../../TRFrameWork/UIFrame/UIForm";
import ConfigMgr from "../config/ConfigMgr";
import { ItemBaseData, KvData } from "../config/DataDef";
import UIConfig from "../config/UIConfig";
import GameActivityData from "../Data/GameActivityData";
import GameSignData from "../Data/GameSignData";
import UserItemsData, { ItemVo } from "../Data/UserItemsData";
import { FlyViewParams, eFlyAnimType } from "./FlyViewUI";
import UISceneMain from "./UISceneMain";


const { ccclass, property } = cc._decorator;



@ccclass
export default class PopGetMoneyByAD extends UIWindow {

    @property(ButtonPlus)
    btnClose: ButtonPlus = null;

    @property(ButtonPlus)
    btnAD: ButtonPlus = null;


    @property(cc.Label)
    titalLab: cc.Label = null;

    @property(cc.Label)
    numLab: cc.Label = null;

    @property(sp.Skeleton)
    bigImg: sp.Skeleton = null;

    @property(SpriteFrame)
    smallImg: SpriteFrame = null;

    @property(sp.Skeleton)
    spine1: sp.Skeleton = null;

      @property(cc.Label)
    tips: cc.Label = null;


    // @property(ButtonPlus)
    // btnExit: ButtonPlus = null;



    modalType = new ModalType(ModalOpacity.OpacityHalf, true);
    closeType: ECloseType.CloseAndDestory;
    itemType: 1 | 2

    award: ItemVo = null;

    public onInit(params: any): void {
        super.onInit(params);

        this.btnClose.addClick(this.closeSelf, this);
        this.btnAD.addClick(this.onBtnAD, this);

    }

    public onShow(params: any): void {
        super.onShow(params);
        this.initView(params.type);
         this.hideBoneByName(this.spine1, "yingzi");
    }
    /**1元宝，2  灵石*/
    initView(type: 1 | 2) {
        this.titalLab.string = (type == 1 ? "元宝补给" : "灵石补给");
        this.itemType = type;
        this.getAwardVo();
        let guangtype = type ==1?2:1
        this.bigImg.setAnimation(0, "baoxiang"+guangtype,true);
        this.smallImg.setFrameByIndex(type - 1);
        this.numLab.string = "x" + this.award.num.toString();
        this.tips.string = (type==1)?"今日元宝补给剩余"+(10-GameActivityData.getInstance().yuanBaoBuyNum)+"/10次":"今日灵石补给剩余"+(10-GameActivityData.getInstance().lingShiBuyNum)+"/10次";
        let num = (type==1)?GameActivityData.getInstance().yuanBaoBuyNum:GameActivityData.getInstance().lingShiBuyNum;
        Utils.setAllChildrenSpGray(this.btnAD.node, num>=10);
        this.btnAD.interactable = num<10;
      
    }

    getAwardVo() {
        let id = (this.itemType == 1 ? 8 : 9);
        let vo = parseInt(ConfigMgr.getInstance().getById(id, KvData).val);
        let putId = (this.itemType == 1 ? 5 : 6);
        let num = UserItemsData.getInstance().getRealAwardNum(putId, vo);
        this.award = new ItemVo(this.itemType, num);

    }

    onBtnAD() {
        let adTitle = (this.itemType == 1 ? "buttom_title4" : "buttom_title5");
        
        PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
            if (!cc.isValid(this)) return;
            this.onSuccessFunc(b);
        }, this, { scene: adTitle })
    }

    onSuccessFunc(b) {
        if (!b) {
            return;
        }
        if(this.itemType==1){
            GameActivityData.getInstance().yuanBaoBuyNum++;
        }else{
            GameActivityData.getInstance().lingShiBuyNum++;
        }
        this.playFlyAffect([this.award]);
        this.initView(this.itemType);

    }


    hideBoneByName(spine: sp.Skeleton, boneName: string) {

        const skeleton = spine.skeletonData;
        // 找到该骨骼对应的所有bones
        const bones = skeleton["_skeletonJson"].bones;
        // console.log("skeleton",sk,skeleton,bones);
        for (let i = 0; i < bones.length; i++) {
            const bone = bones[i];
            if (bone.name === boneName) {
                bone.scaleX = 0;
                bone.scaleY = 0; // 设置透明度为0
            }
        }



    }


    playFlyAffect(award: ItemVo[]) {
        let idList = [1, 2, 3];
        let fpList = [];
        award.forEach((item, index) => {
            if (idList.indexOf(item.itemID) >= 0) {
                let itemNode = this.bigImg.node;
                fpList.push(this.addPropEffect(itemNode, item.itemID, item.num));
            }


        })
        if (fpList.length > 0) {
            //  console.log(fpList);
            FormMgr.open(UIConfig.ui_flyView, fpList, { quick: true });
        }
    }

    // 飞银币动画
    public addPropEffect(node1: cc.Node, itemId, itemNum) {
        let main = SceneMgr.getCurrScene() as UISceneMain;
        if (!main.btn_equip || !cc.isValid(node1)) {
            return;
        }

        let startPos = node1.parent.convertToWorldSpaceAR(node1.position);
        let eIcon: cc.Node
        switch (itemId) {
            case 1://元宝
                eIcon = main.btn_yuanbao.node.getChildByName('icon');
                break;
            case 2://灵石
                eIcon = main.btn_lingshi.node.getChildByName('icon');
                break;

            case 3://免广
                eIcon = main.btn_adTiket.node.getChildByName('icon');
                break;


        }

        let endPos = eIcon.parent.convertToWorldSpaceAR(eIcon.position);

        let node = cc.instantiate(eIcon);

        let fp: FlyViewParams = {
            startWPos: startPos,
            endWPos: endPos,
            target: node,
            duration: 0.4,
            scale: [eIcon.scale * 1.2, 1],
            blockInput: false, // 阻挡输入
            callBack: () => {
                UserItemsData.getInstance().pushItem(itemId, itemNum);
                let itemData = ConfigMgr.getInstance().getById(itemId, ItemBaseData);
                if (itemData.type == 0) {
                    let kvId = (itemData.typeArgs == 1) ? 18 : 19;
                    let soundName = ConfigMgr.getInstance().getById(kvId, KvData).val
                    SoundMgr.getInstance().playSound(soundName);
                }
            },  // 回调
            animType: eFlyAnimType.Line,
            nodeNum: Math.min(8, itemNum)
        }
        return fp;
    }



    // update (dt) {}
}

