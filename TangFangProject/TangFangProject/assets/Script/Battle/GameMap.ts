

import GlobalEventMgr from "../../TRFrameWork/cocos-module/mgr/GlobalEventMgr";
import SoundMgr from "../../TRFrameWork/cocos-module/mgr/SoundMgr";
import { GlobalEventID } from "../../TRFrameWork/cocos-module/utils/GlobalEvent";
import PlatformMgr from "../../TRFrameWork/ThirdSDK/cocos-multi-platform/PlatformManager";
import SceneMgr from "../../TRFrameWork/UIFrame/SceneMgr";
import ConfigMgr from "../config/ConfigMgr";
import { KvData, MapConfigData, WapenFusionData } from "../config/DataDef";
import CharHeroInfo, { MapConfigInfo, TurretInfo } from "../config/DataInfo";
import { WapenType } from "../Data/GameWapenData";
import LanguageMgr from "../lang/LanguageMgr";
import GameHelp from "../Mgr/GameHelp";
import GameTrackHelp from "../Mgr/GameTrackHelp";
import BullectEffectUI from "../UI/BullectEffectUI";
import BattleCharUI from "./BattleCharUI";
import GameControl from "./GameControl";
import GameMapTree from "./GameMapTree";
import GameResLoad from "./GameResLoad";
import SectorBlockItem from "./SectorBlockItem";
import TurretBaseUI from "./TurretBaseUI";
import TurretMoveUI from "./TurretMoveUI";

const { ccclass, property } = cc._decorator;

export type BlockWaveLockInfo = {
    blockId: number,
    wave: number,
}

export type MapExtInfo = {
    videoBlocks: number[],
    waveLocks: BlockWaveLockInfo[],
}

@ccclass
export default class GameMap extends cc.Component {

    @property(cc.Node)
    bg: cc.Node = null;

    @property(cc.Node)
    treeRoot: cc.Node = null;

    @property(cc.Prefab)
    blockLevel1Prefab: cc.Prefab = null;
    @property(cc.Prefab)
    blockLevel2Prefab: cc.Prefab = null;
    @property(cc.Prefab)
    blockLevel3Prefab: cc.Prefab = null;

    @property(cc.Prefab)
    blockChipPrefab: cc.Prefab = null;

    public gridRoot: cc.Node = null;
    // 缓存用于碰撞检测的 coillRect 节点，避免每帧重复查找
    protected _coillRectCache: cc.Node[] = null;
    // 节流上次播放无效提示的时间戳
    protected _lastInvalidSoundTs: number = 0;

    public blockLevel1Root: cc.Node = null;

    public blockLevel2Root: cc.Node = null;

    public turntableRoot: cc.Node = null;

    public downEffect: cc.Node = null;

    public gRoot: cc.Node = null;

    public HRoot: cc.Node = null;

    public bulletRoot: cc.Node = null;

    public lasetRoot: cc.Node = null;

    public upEffect: cc.Node = null;

    public buyChipsRoot: cc.Node = null;

    private _init: boolean = false;

    protected blocks: SectorBlockItem[] = [];
    protected lastSelectBlock: SectorBlockItem = null;
    /**队友格子 */
    protected teamerBlocks: SectorBlockItem[] = [];
    // protected _startMoveBlock: GridBlockItem = null;

    protected turretList: TurretBaseUI[] = [];
    /**队友炮台 */
    protected teamerTurretList: TurretBaseUI[] = [];

    protected _mapConfig: MapConfigInfo = null;

    protected _arrowIdx: number = 0;

    protected _mapTrees: GameMapTree[] = [];

    protected _fakeCharNodeList: { node: cc.Node, index: number }[] = [];

    protected noCharIdxList: number[] = [];

    protected lastSelectFakeChar: cc.Node = null;

    /**转盘小节点*/
    private turnbleSpr: cc.Node = null;
    private debugTurnbleEdit: cc.EditBox = null;
    private debugTurnble_tempHeight = 280;

    onLoad() {
    }


    start() {
        GlobalEventMgr.getInstance().on(GlobalEventID.TURRET_DEL, this.onTurretDel, this);
    }

    getBlocksNum() {
        return this.blocks.length;
    }

    getAllBlocks() {
        return this.blocks;
    }
    /**队友格子 */
    getTeamerBlocks(): SectorBlockItem[] {
        return this.getAllBlocks().filter(block => {
            return GameControl.getInstance().teamBlocks.indexOf(block.idx) >= 0;
        });
    }

    getEmptyTeamerBlocks(): SectorBlockItem[] {
        let list = []
        for (let block of this.getTeamerBlocks()) {
            if (!block.isHasTurret()) {
                list.push(block)
            }
        }
        return list;
    }

    checkTeamerHasEmptyBlock(): boolean {
        let result = false;
        for (let block of this.teamerBlocks) {
            if (!block.isHasTurret()) {
                result = true;
                break;
            }
        }
        return result;
    }

    public getAllVaildBlocks() {
        let blocks = this.getAllBlocks();
        blocks = blocks.filter((block: SectorBlockItem) => {
            return !block.isLock();
        });
        return blocks;
    }

    public doUpdate(dt: number) {
        if (!this._init) return;
        for (let turret of this.turretList) {
            turret.doUpdate(dt);
        }

        for (let block of this.blocks) {
            block.doUpdate(dt); // 
        }

        this.checkTree(dt);
    }

    // 检查移动
    public checkTurretMove(block: SectorBlockItem, turret: cc.Node): boolean {

        // console.log("addTurret", block, turret);
        if (!block || !turret || block.isLock()) {
            return false;
        }

        //  没有移动
        if (turret == block.getTurret()) {
            this.add2Blocks(block, turret);
            return true;
        }
        let tInfo = turret.getComponent(TurretBaseUI).turretInfo;
        // 有炮塔
        if (block.isHasTurret()) {
            // 升级
            let rRet = block.checkLvup(turret);

            if (rRet) {
                this.hideSelectEffect(block);
                // 需要广告
                if (tInfo.needVideo) {
                    PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
                        if (!cc.isValid(this)) return;
                        if (b) {
                            tInfo.needVideo = false; // 升级
                            block.doLvup(turret); // 升级
                            let wapenId = tInfo.getID();
                            GameTrackHelp.getInstance().track_WapenUse(wapenId, true);
                        } else {
                            turret.getComponent(TurretBaseUI).moveBack();
                            this.hideSelectEffect(this.lastSelectBlock);
                            this.lastSelectBlock = null;
                        }
                    }, this, { key: "battle", scene: "unlock_turret" });
                    return;
                } else if (tInfo.locked && tInfo.getWapenPrice() > GameControl.getInstance().getPassInfo().gameCoin) {
                    // turret.getComponent(TurretBaseUI).moveBack(); // 金币不足
                    GameHelp.getInstance().showToast("金币不足，无法合成");
                    ;
                } else {
                    block.doLvup(turret); // 升级
                    this.hideSelectEffect(this.lastSelectBlock);
                    this.lastSelectBlock = null;
                    return
                }
            }
            // 换炮塔
            if (!tInfo.locked) {
                block.checkSwape(turret);
                SoundMgr.getInstance().playSoundByID(24);
            } else {
                turret.getComponent(TurretBaseUI).moveBack();
            }
            this.hideSelectEffect(this.lastSelectBlock);
            this.lastSelectBlock = null;
            return;
        }

        if (tInfo.needVideo) {
            PlatformMgr.instance.showRewardVideo((b: boolean, key: string) => {
                if (!cc.isValid(this)) return;
                if (b) {
                    tInfo.needVideo = false; // 升级
                    // 从列表中删除
                    // GlobalEventMgr.getInstance().emit(GlobalEventID.TURRET_DEL, turret);
                    this.add2Blocks(block, turret); // 添加炮塔
                    let wapenId = tInfo.getID();
                    GameTrackHelp.getInstance().track_WapenUse(wapenId, true);
                    GlobalEventMgr.getInstance().emit(GlobalEventID.TURRET_CHECK_UP);
                } else {
                    turret.getComponent(TurretBaseUI).moveBack();
                    this.hideSelectEffect(this.lastSelectBlock);
                    this.lastSelectBlock = null;
                }
            }, this, { key: "battle", scene: "unlock_turret" });
            return;
        } else if (tInfo.locked && !tInfo.buyed && tInfo.getWapenPrice() > GameControl.getInstance().getPassInfo().gameCoin) {
            turret.getComponent(TurretBaseUI).moveBack(); // 金币不足
            this.hideSelectEffect(this.lastSelectBlock);
            this.lastSelectBlock = null;

            let str = LanguageMgr.getInstance().getLang('game_silver_not_enough')
            GameHelp.getInstance().showToast(str);
            return;
        }
        let isAddEquip = true;
        /**如果点位上存在英雄，判定是否可升级
         * 只允许两个短棍子合成长棍子，其他的组合都不给放置
        */
        if (block.isHasHero()) {
            const blockLv = block.getHero().data.maxLevel;
            const turretLv = tInfo.data.shootBagId[0];
            //如果拖动得棍子是可合成得，且等级相等
            if (tInfo.data.fusionOutput && turretLv == blockLv) {
                this.hideSelectEffect(block);
                const heroInfo: CharHeroInfo = block.getHero();
                if (heroInfo.data.equipID) {
                    let wapenFusion = ConfigMgr.getInstance().getById(heroInfo.data.equipID, WapenFusionData)
                    if (wapenFusion.fusionOutput) {
                        //如果已有得角色id喝equipID一致 且 已经角色得升级方式是自身，即可升级
                        if (tInfo.data.fusionInput == -1 && tInfo.data.id == heroInfo.data.equipID) {
                            //更新一下格子中得英雄-数据。表现层面需要stick中进行处理
                            let newWapenInfo = ConfigMgr.getInstance().getById(wapenFusion.fusionOutput, WapenFusionData)
                            block.doHeroLvUp(newWapenInfo.shootBagId[0]);
                            this.hideSelectEffect(this.lastSelectBlock);
                            this.lastSelectBlock = null;
                            //隐藏拖入gameMap中的WeaponItem
                            block.resetTurret(turret);
                            isAddEquip = false;
                        }
                    }
                }
            } else {
                return false;
            }

        }
        let wapenId = tInfo.getID();
        GameTrackHelp.getInstance().track_WapenUse(wapenId, false);
        this.add2Blocks(block, turret, true, isAddEquip);

        GlobalEventMgr.getInstance().emit(GlobalEventID.TURRET_CHECK_UP);
    }

    // 队友炮台上阵
    public checkTurretMoveTeamerAI(block: SectorBlockItem, turret: cc.Node): boolean {
        // 有炮塔
        if (block.isHasTurret()) {
            // 升级
            let rRet = block.checkLvup(turret);
            if (rRet) {
                block.doLvup(turret); // 升级
                return
            }
        }

        this.add2Blocks(block, turret, false, true, null, true);
        GlobalEventMgr.getInstance().emit(GlobalEventID.TURRET_CHECK_UP);
    }

    protected add2Blocks(block: SectorBlockItem, tNode: cc.Node, playSound = true,
        isAddEquip: boolean = true, turrInfo?: TurretInfo, team?: boolean) {
        let tInfo = turrInfo ? turrInfo : tNode.getComponent(TurretBaseUI).turretInfo;
        if (tInfo.locked) {
            if (tNode) GlobalEventMgr.getInstance().emit(GlobalEventID.TURRET_DEL_LIST, tNode);
            tInfo.locked = false; // 解锁
            tInfo.buyed = false;
        } else {
            // turret.parent.parent.getComponent(GridBlockItem).turretRoot = null; // 清空父节点
            for (const element of this.blocks) {
                if (element.getTurret() == tNode) {
                    element.removeTurretNode();
                }
            }
        }

        let turret = tNode.getComponent(TurretBaseUI);
        const ctr = GameControl.getInstance();
        //队友组队副本中添加塔
        if (ctr.isTeamBaid() && ctr.teamBlocks.indexOf(block.idx) >= 0) {
            if (this.teamerTurretList.indexOf(turret) < 0) {
                this.teamerTurretList.push(turret);
                tNode.active = false;
                turret.setTeamerTurret(true);
            }
        }

        if (isAddEquip) {
            //如果是棍子-不需要创建turretList，直接创建hero
            if (tInfo.data.wapenType == WapenType.stick) {
                let charInfo = new CharHeroInfo(tInfo.data.shootBagId[0]);
                let idx = Math.floor(block.node.angle / 90);
                GameControl.getInstance().sceneBattle.addCharHero(charInfo, idx, team);
                this.hideSelectEffect(this.lastSelectBlock);
                this.lastSelectBlock = null;
                //隐藏拖入gameMap中的WeaponItem
                if (tNode) block.resetTurret(tNode);
                block.addHero(charInfo)
                return;
            }
        }

        if (this.turretList.indexOf(turret) < 0) {
            this.turretList.push(turret);
        }

        if (isAddEquip) block.addTurret(tNode);


        this.hideSelectEffect(this.lastSelectBlock);
        this.lastSelectBlock = null;
        if (playSound) {
            SoundMgr.getInstance().playSoundByID(24);
        }
        // turret.checkUpgradeLv5(); // 检查是否可以升级到5级,播放神器特效

        GlobalEventMgr.getInstance().emit(GlobalEventID.add_mapTurret, turret);

    }

    hideAllSelectEffect() {
        for (const block of this.blocks) {
            this.hideSelectEffect(block);
        }
        this.lastSelectBlock = null;
    }

    public relife() {

    }

    // public del2Block(tNode: cc.Node) {
    //     if (!tNode) {
    //         return;
    //     }

    //     if (this.turretList.indexOf(tNode) >= 0) {
    //         this.turretList.splice(this.turretList.indexOf(tNode), 1);
    //     }
    //     return false;
    // }

    protected onTurretDel(tNode: cc.Node) {
        // this.removeTurretFormBlock();
        if (!tNode) {
            return;
        }

        let turret = tNode.getComponent(TurretBaseUI);
        // 列表中移除
        if (this.turretList.indexOf(turret) >= 0) {
            this.turretList.splice(this.turretList.indexOf(turret), 1);
        }

        if (this.teamerTurretList.indexOf(turret) >= 0) {
            this.teamerTurretList.splice(this.teamerTurretList.indexOf(turret), 1);
        }



        // 方块中移除
        for (const element of this.blocks) {
            if (element.getTurret() == tNode) {
                element.cleanAndDelTurret();
            }
        }
    }

    public getAllTurretList(): TurretBaseUI[] {
        return this.turretList;
    }

    getMyAllTurretList(): TurretBaseUI[] {
        let list = [];
        this.turretList.forEach((turret) => {
            if (this.teamerTurretList.indexOf(turret) == -1) {
                list.push(turret);
            }
        })
        return list;
    }

    public getAllTeamerTurretList(): TurretBaseUI[] {
        return this.teamerTurretList;
    }
    getTeamBlockByPosId(posId: number): SectorBlockItem {
        let list = [];
        this.teamerBlocks.forEach((block) => {
            // list.push(block.posId);
        })
        // console.warn("posIdList:", JSON.stringify(list));
        for (let i = 0; i < this.teamerBlocks.length; i++) {
            // if (this.teamerBlocks[i].posId == posId) {
            // return this.teamerBlocks[i]
            // }
        }
        return null;
    }



    public switchMap() {

        let newBg = this.node.getChildByName('BG2')
        let ef = this.node.getChildByName('effectSwitch')
        let wt = 0.25;

        if (ef) {
            ef.active = true;
            let ssp = ef.getComponent(sp.Skeleton);
            wt = ssp.findAnimation("animation").duration;
            ssp.setAnimation(0, "animation", false);
        }
        newBg.active = true;
        newBg.opacity = 0;
        cc.tween(newBg).to(wt, { opacity: 255 }).call(() => {
            ef && (ef.active = false);
            this.bg.active = false; // 旧的隐藏
        }).start();
    }
    getMySelfBlocks() {
        let allBlacks = [];
        if (GameControl.getInstance().isTeamBaid()) {
            this.blocks.forEach((black) => {
                if (this.teamerBlocks.indexOf(black) == -1) {
                    allBlacks.push(black);
                }
            })
            return allBlacks;
        } else {
            return this.blocks;
        }
    }

    public checkMoveInBlock(wpos: cc.Vec3, stickID: number = 0, wapenID: number = 0): any {
        let lPos = this.gridRoot.convertToNodeSpaceAR(wpos);
        for (let i = 0; i < this.blocks.length; i++) {//扇形区域
            let block = this.blocks[i];
            let radius = block.node.width / 2, centerX = block.node.position.x, centerY = block.node.position.y;
            let startAngle = block.getStartAngle(), endAngle = block.getEndAngle();
            if (block) {
                if (GameControl.getInstance().isTeamBaid()) {
                    //团队副本接收提示
                    if (GameControl.getInstance().teamBlocks.indexOf(block.idx) >= 0) {
                        continue;
                    }
                }

                //如果移动的是棍子，那只判定棍子
                if (stickID > 0) {
                    if (i < this._mapConfig.levelBlockCount * 2) continue;
                    const bHero = block.getHero();
                    if (bHero?.data.equipID) {
                        let bData = ConfigMgr.getInstance().getById(bHero.data.equipID, WapenFusionData)
                        if (bData.shootBagId[0] == 1 || bData.shootBagId[0] == 2) {
                            //格子不能升级
                            if (bData && !bData.fusionInput) continue;
                            //能升级但是材料不对
                            if (bData && bData.fusionInput && (bData.fusionInput == -1 && bData.id != wapenID)) continue;
                        }
                    }
                }

                //如果移动是武器，不判定棍子
                if (!stickID && i >= this._mapConfig.levelBlockCount * 2) continue;
                const isLock = block.isLock();
                if (stickID) {
                    startAngle -= 45;
                    endAngle -= 45;
                }
                const isInBlock = GameHelp.getInstance().isInSectorArea(lPos.x, lPos.y - 50, centerX, centerY, radius, startAngle, endAngle);
                if (!isLock && isInBlock) {
                    if (this.lastSelectBlock != block) {
                        this.hideSelectEffect(this.lastSelectBlock);
                        this.lastSelectBlock = block;
                        this.showSelectEffect(block);
                    }
                    return block;
                }
            }
        }
        if (this.lastSelectBlock) {
            this.hideSelectEffect(this.lastSelectBlock);
        }
        this.lastSelectBlock = null;
        return null;
    }

    /**
     * 返回指定世界坐标下所有命中的扇形块（可能包含不同层级的块）
     * 顺序未保证；调用方可根据需要选择最合适的块
     */
    public getBlocksAtWorldPos(wpos: cc.Vec3): SectorBlockItem[] {
        let ret: SectorBlockItem[] = [];
        let lPos = this.gridRoot.convertToNodeSpaceAR(wpos);
        for (const block of this.blocks) {
            let radius = block.node.width / 2;
            let centerX = block.node.position.x;
            let centerY = block.node.position.y;
            let startAngle = block.getStartAngle();
            let endAngle = block.getEndAngle();
            if (!block.isLock() && GameHelp.getInstance().isInSectorArea(lPos.x, lPos.y, centerX, centerY, radius, startAngle, endAngle)) {
                ret.push(block);
            }
        }
        return ret;
    }

    public getLastSelectBlock(): SectorBlockItem {
        return this.lastSelectBlock;
    }

    public showGameUI() {
        for (let i = 0; i < this.blocks.length; i++) {
            let element = this.blocks[i];
            element.showGameUI();
            element.resetNewWave(this._mapConfig.levelBlockCount);
        }
        this.gRoot.active = false;
        this.schedule(this.checkShowArrow, 1);
        this.turntableRoot.setPosition(cc.Vec3.ZERO);
        this.updateTurnbleState(true);
        GlobalEventMgr.getInstance().emit(GlobalEventID.CHAR_RESET);
        const curWave = GameControl.getInstance().getCurWave();
        //第一波之后每关加点钱
        if (curWave >= 1) {
            setTimeout(() => {
                let waveCoin = Number(ConfigMgr.getInstance().getById(76, KvData).val);
                let passInfo = GameControl.getInstance().getPassInfo();
                if (curWave == 1 && passInfo.data.id == 1) {
                    waveCoin += 20;
                }
                GlobalEventMgr.getInstance().emit(GlobalEventID.game_addMoney, waveCoin, cc.v3(cc.winSize.width / 2, cc.winSize.height / 2 + 300), 2);
            }, 500)
        }
    }

    public hideGameUI() {
        for (const element of this.blocks) {
            element.onFightStart();
        }
        this.unschedule(this.checkShowArrow);
        this.updateTurnbleState(false);
        this.gRoot.active = true;
    }

    public updateTurnbleState(reset: boolean = true) {
        let resultHeight = this.debugTurnble_tempHeight - cc.winSize.height / 2
        if (reset) resultHeight = GameControl.getInstance().isTeamBaid() ? 0 : 50;
        // if (reset) resultHeight = 50;
        this.turntableRoot.setPosition(cc.v3(0, resultHeight));
        const tbScale = reset ? 1 : 1;
        this.turntableRoot.setScale(tbScale);

        GameControl.getInstance().sceneBattle.charList.forEach((char) => {
            if (char.charInfo.teamID > 0) {
                char.node.active = !reset;
            }
        })
    }

    protected checkShowArrow() {
    }


    protected showSelectEffect(block: SectorBlockItem) {
        if (block) {
            block.showSelectEffect();
        }
    }

    protected hideSelectEffect(block: SectorBlockItem) {
        if (block) {
            block.hideSelectEffect();
        }
    }

    protected async loadRoots() {
        this.gridRoot = this.createRoot("gridRoot");
        this.turntableRoot = this.createRoot("turntableRoot");
        this.blockLevel2Root = this.createRoot("blockLevel2Root", this.turntableRoot);
        this.blockLevel1Root = this.createRoot("blockLevel1Root", this.turntableRoot);
        this.buyChipsRoot = this.createRoot("buyChipsRoot", this.turntableRoot);
        this.downEffect = this.createRoot("downEffect");
        this.gRoot = this.createRoot("gRoot");
        this.HRoot = this.createRoot("HRoot");
        this.bulletRoot = this.createRoot("bulletRoot");
        this.lasetRoot = this.createRoot("lasetRoot");
        this.upEffect = this.createRoot("upEffect");

        let idx = 0;
        let nb = this.node.getChildByName('BG2');
        let ceffect = this.node.getChildByName('effectSwitch');
        this.bg.setSiblingIndex(idx++);
        nb && nb.setSiblingIndex(idx++);
        this.gridRoot.setSiblingIndex(idx++);
        // this.blockLevel2Root.setSiblingIndex(idx++);
        // this.blockLevel1Root.setSiblingIndex(idx++);
        this.downEffect.setSiblingIndex(idx++);
        this.turntableRoot.setSiblingIndex(idx++);
        this.gRoot.setSiblingIndex(idx++);
        this.HRoot.setSiblingIndex(idx++);
        this.bulletRoot.setSiblingIndex(idx++);
        this.lasetRoot.setSiblingIndex(idx++);
        this.treeRoot.setSiblingIndex(idx++);
        this.upEffect.setSiblingIndex(idx++);
        ceffect && ceffect.setSiblingIndex(idx++);
        // this.buyChipsRoot.setSiblingIndex(idx++);

        this.downEffect.addComponent(BullectEffectUI).isUp = false;
        this.upEffect.addComponent(BullectEffectUI).isUp = true;

        for (const element of this.treeRoot.children) {
            element.zIndex = -element.y + 3000;
            let tree = element.addComponent(GameMapTree);
            element.anchorY = 0.0;
            this._mapTrees.push(tree);
        }
    }

    private createRoot(name: string, parent?: cc.Node): cc.Node {
        let node = new cc.Node(name);
        if (!parent) parent = this.node;
        parent.addChild(node);
        return node;
    }

    public async doInit(config: MapConfigInfo, ext?: MapExtInfo, passLv?: number) {
        if (!this._init) {
            this._mapConfig = config;
            this.loadRoots();
            this._init = true;
        }
        await SceneMgr.getCurrScene().loadRes(`prefabs/TurnbleNode`, cc.Prefab, 'GameMap').then((res: cc.Prefab) => {
            if (!cc.isValid(this)) return;
            if (!this.turnbleSpr) this.turnbleSpr = cc.instantiate(res);
            if (GameControl.getInstance().isTeamBaid()) {
                this.turnbleSpr.getChildByName('luopan1').active = true;
            } else {
                this.turnbleSpr.getChildByName('luopan1').active = false;
            }
            this.turntableRoot.addChild(this.turnbleSpr);
            this.turnbleSpr.setSiblingIndex(0);
        });
        let videoBlocl = ext?.videoBlocks || [];
        let wblocks = ext?.waveLocks || [];
        for (let i = 0; i < config.blockInfoList.length; i++) {
            let chipVal = config.blockInfoList[i];
            let prefab = this.getBlockPrefabByIdx(i);
            let node = cc.instantiate(prefab);
            let block = node.getComponent(SectorBlockItem);
            let isW = wblocks.find((e) => {
                return e.blockId == i;
            })
            block.doInit(i, videoBlocl.indexOf(i) >= 0, isW?.wave || 0, this._mapConfig.levelBlockCount);
            this.blocks.push(block);
            let root = this.getBlockRootByIdx(i);
            root.addChild(node, 0);
            if (chipVal > 0) {
                let chipNode = cc.instantiate(this.blockChipPrefab);
                block.addBuyChips(chipNode, this.buyChipsRoot, chipVal);
            }
        }
        await SceneMgr.getCurrScene().loadRes(`prefabs/TurnbleNode1`, cc.Prefab, 'GameMap').then((res: cc.Prefab) => {
            if (!cc.isValid(this)) return;
            let sp = cc.instantiate(res);
            this.turntableRoot.addChild(sp);
            sp.setPosition(cc.v2(0, 0));
            sp.setSiblingIndex(99);
        });
    }

    async addGuideWaveLock() {
    }

    async resetMap(config: MapConfigInfo) {

    }

    public addTripod(tNode: cc.Node) {
        if (this.turntableRoot.getChildByName("triop")) return;
        this.turntableRoot.addChild(tNode, 0, 'triop');
        let resultHeight = this.debugTurnble_tempHeight - cc.winSize.height / 2
        tNode.setPosition(0, resultHeight);
        tNode.opacity = 1;
    }

    public reviceEffect(idx: number) {
        let block = this.blocks[idx];
        cc.Tween.stopAllByTarget(block.node);
        cc.tween(block.node)
            .to(0.32, { scale: 1.05 })
            .delay(0.2)
            .to(0.32, { scale: 1 })
            .start();
    }

    public reviceBlock(idx: number, actMan: BattleCharUI) {
        if (idx >= this.blocks.length) {
            console.error("idx is out of range of blocks length")
            return;
        }
        let block = this.blocks[idx];
        block.addAmm(1, actMan);
    }

    /**
     * 获取指定索引的格子
     * @param idx 索引
     * @returns 
     */
    public getBlockByIndex(idx: number): SectorBlockItem {
        return this.blocks[idx];
    }

    curSpaceTS: number = 0;
    spaceTS: number = 0;
    protected checkTree(dt: number) {
        this.curSpaceTS += 1;
        if (this.curSpaceTS >= 3) {
            this.curSpaceTS = 0;
            for (let i = 0; i < this._mapTrees.length; i++) {
                if ((this.spaceTS + i) % 10 == 0) {
                    this._mapTrees[i].checkTree();
                }
                this.spaceTS += 1;
            }
        }
    }

    protected getBlockPrefabByIdx(idx: number): cc.Prefab {
        let level = Math.floor(idx / this._mapConfig.levelBlockCount) + 1;
        if (level == 1) return this.blockLevel1Prefab;
        else if (level == 2) return this.blockLevel2Prefab;
        else if (level == 3) return this.blockLevel3Prefab;
    }

    protected getBlockRootByIdx(idx: number): cc.Node {
        let level = Math.floor(idx / this._mapConfig.levelBlockCount) + 1;
        if (level == 1) {
            return this.blockLevel1Root;
        } else {
            return this.blockLevel2Root;
        }
    }

    public async showAddFakeChar(charList: BattleCharUI[], selectCharInfo: CharHeroInfo) {
        this.noCharIdxList = [];
        let maxCharIdxList: number[] = [];
        let selectCharID = selectCharInfo.data.id;
        for (let i = 0; i < this._mapConfig.stickMaxNum; i++) {
            for (let j = 0; j < charList.length; j++) {
                if (charList[j].startIndex == i) {
                    if (selectCharID == charList[j].charInfo.data.id && !charList[j].isMaxLevel()) {
                        this.noCharIdxList[i] = charList[j].getCurLevel();
                    }
                    else {
                        maxCharIdxList[i] = charList[j].getCurLevel();
                    }
                    break;
                }
            }
        }

        for (let i = 0; i < this._mapConfig.stickMaxNum; i++) {
            if (!this.noCharIdxList[i] && !maxCharIdxList[i]) {
                this.noCharIdxList[i] = 0;
            }
        }
        let cartPath = selectCharInfo.getPrefabName();
        for (let i = 0; i < this._mapConfig.stickMaxNum; i++) {
            if (this.noCharIdxList[i] != null) {
                let node = await GameResLoad.LoadCharPrefab(cartPath);
                if (!node) {
                    cc.error(`error load cart ${cartPath}`)
                    break;
                }

                this.node.addChild(node);
                let angle = this._mapConfig.getStickStartAngleByIndex(i);
                node.angle = angle
                let distance = (this.noCharIdxList[i]) * 100
                let radians = angle * Math.PI / 180;
                let dirX = Math.cos(radians);
                let dirY = Math.sin(radians);
                let direction = cc.v3(dirX, dirY);
                direction.normalizeSelf();
                let displacement = direction.mul(distance);
                node.setPosition(displacement);
                node.opacity = 150;
                // 标记为假角色，便于后续反馈处理
                node['_isFakeChar'] = true;
                this._fakeCharNodeList.push({ node: node, index: i });
            }
        }
    }

    public removeAllFakeChar() {
        this._fakeCharNodeList.forEach(fakeData => {
            GameResLoad.putNode(fakeData.node);
        });
        this._fakeCharNodeList = [];
        this.lastSelectFakeChar = null;
    }

    public checkMoveInFakeStick(wpos: cc.Vec3): number {
        let posRect = new cc.Rect(wpos.x, wpos.y, 150, 10)

        // 构建 coillRect 缓存（懒初始化）
        if (!this._coillRectCache) {
            this._coillRectCache = [];
            for (const block of this.blocks) {
                if (block && block.coillRect) {
                    this._coillRectCache.push(block.coillRect);
                }
            }
        }

        // 先检查内圈 coillRect（优先判定为内圈命中 -> 不可放置）
        let innerHit = false;
        for (const crect of this._coillRectCache) {
            try {
                if (crect && cc.isValid(crect)) {
                    let brect = crect.getBoundingBoxToWorld();
                    if (brect.intersects(posRect)) {
                        innerHit = true;
                        break;
                    }
                }
            } catch (e) {
                // ignore
            }
        }

        if (innerHit) {
            // 内圈：不可放置，给出视觉/音效反馈（节流）
            if (this.lastSelectFakeChar) {
                this.lastSelectFakeChar.opacity = 120;
                this.lastSelectFakeChar = null;
            }
            let now = Date.now();
            if (now - this._lastInvalidSoundTs > 200) {
                this._lastInvalidSoundTs = now;
                try { SoundMgr.getInstance().playSound && SoundMgr.getInstance().playSound('invalid_place'); } catch (e) { }
            }
            return null;
        }

        // 再检查外圈（扇形区域）是否允许放置
        let outerBlocks = this.getBlocksAtWorldPos(wpos);
        if (!outerBlocks || outerBlocks.length == 0) {
            // 不在外圈范围，也不可放置
            if (this.lastSelectFakeChar) {
                this.lastSelectFakeChar.opacity = 150;
                this.lastSelectFakeChar = null;
            }
            return null;
        }

        // 要求 fake 节点的 stick 实际长度足以接触目标方块：以 stick 的世界矩形与方块节点世界矩形相交为准
        const allowedFakeIdx = new Set<number>();
        for (const charData of this._fakeCharNodeList) {
            try {
                let stickNode = charData.node.getChildByName("stick");
                if (!stickNode || !cc.isValid(stickNode)) continue;
                let stickRect = stickNode.getBoundingBoxToWorld();
                for (const block of outerBlocks) {
                    try {
                        if (!block || !block.node) continue;
                        let blockRect = block.node.getBoundingBoxToWorld();
                        if (stickRect.intersects(blockRect)) {
                            allowedFakeIdx.add(charData.index);
                            break;
                        }
                    } catch (e) { }
                }
            } catch (e) {
                // ignore
            }
        }

        if (allowedFakeIdx.size == 0) {
            // 没有 fake 的 stick 足够长到达外圈方块，视为不可放置
            if (this.lastSelectFakeChar) {
                this.lastSelectFakeChar.opacity = 150;
                this.lastSelectFakeChar = null;
            }
            return null;
        }

        // 外圈允许放置且 stick 足够长，继续原有的假角色选择逻辑，但仅限被允许的 fake
        for (const charData of this._fakeCharNodeList) {
            if (!allowedFakeIdx.has(charData.index)) continue;
            let rect = charData.node.getChildByName("stick").getBoundingBoxToWorld();
            if (rect.intersects(posRect)) {//contains
                if (this.lastSelectFakeChar != charData.node) {
                    if (this.lastSelectFakeChar) {
                        this.lastSelectFakeChar.opacity = 150;
                    }
                    this.lastSelectFakeChar = charData.node
                    this.lastSelectFakeChar.opacity = 255;
                }
                return charData.index;
            }
        }
        if (this.lastSelectFakeChar) {
            this.lastSelectFakeChar.opacity = 150;
            this.lastSelectFakeChar = null;
        }
        return null;
    }


    //----------------------------------一键合成炮台数据-----------------------
    /**整理炮台 */
    async organizeTeamerTurret() {
        //队友炮台数据
        this.scheduleOnce(async () => {
            let list = this.getTeamTurretInfoList();
            console.error("未合并前数据:", this.getBlackTurretInfoList(), ":", this.getBlackTurretInfoList().length, list.length)
            //合并升级炮台
            let organizeList = this.autoMergTurretInfo(list);
            //删除全部炮台
            this.deleteAllTeamTurret();
            //重新添加炮台
            await this.addAllTeamTurret(organizeList);
            console.error("重新添加炮台", this.teamerTurretList.length, this.turretList);
        }, 1)
    }

    getBlackTurretInfoList(): TurretInfo[] {
        let list = [];
        this.blocks.forEach(blocks => {
            let turret = blocks.getTurret();
            if (turret) {
                list.push(turret.getComponent(TurretBaseUI).turretInfo.data.id)
            }

        });
        return list;
    }
    getTeamTurretInfoList(): TurretInfo[] {
        let list = [];
        this.teamerTurretList.forEach(turret => {
            list.push(turret.turretInfo)
        });
        return list;
    }
    /**删除全部队友炮台 */
    deleteAllTeamTurret() {

        for (let i = this.teamerTurretList.length - 1; i >= 0; i--) {
            this.onTurretDel(this.teamerTurretList[i].node);
        }

        console.log("删除全部队友炮台", this.teamerTurretList.length, this.turretList);
    }
    //一键合成能合成的炮台数据
    autoMergTurretInfo(list: TurretInfo[]): TurretInfo[] {

        list.sort((a, b) => {
            if (a.data.level != b.data.level) {
                return a.data.level - b.data.level;
            } else {
                return a.data.id - b.data.id;
            }
        })

        for (let i = 0; i < list.length; i++) {
            let index = this.checkFusionInput(i, list);
            if (index >= 0) {
                list[i].doLevelUp(list[i].getFusionOutput())
                list.splice(index, 1);
                return this.autoMergTurretInfo(list);

            }
        }
        return list;
    }
    /**获取升级炮台对应的炮台位置 */
    checkFusionInput(ind, list: TurretInfo[]): number {
        let index = -1;
        let turret = list[ind];
        for (let i = 0; i < list.length; i++) {
            if (turret.getFusionInput() == list[i].data.id && ind != i) {
                index = i;
                break;
            }
        }
        return index;

    }

    async addAllTeamTurret(list: TurretInfo[]) {
        list.sort((a, b) => {
            return b.data.aiP3 - a.data.aiP3;
        })

        let id = GameControl.getInstance().getPassInfo().mapConfig.data.id;
        let mapConfig: MapConfigData = ConfigMgr.getInstance().getById(id, MapConfigData);

        let path = JSON.parse(JSON.stringify(mapConfig.path));
        //path.reverse();
        path.splice(path.length - 1, 1);//配置路径

        let teamerEmptyBlockIdList = [];//队友的空格子id列表
        for (let i = 0; i < mapConfig.block.length; i++) {
            let isOpenTeamBlock = GameControl.getInstance().teamBlocks.indexOf(i) >= 0;
            if (isOpenTeamBlock && mapConfig.block[i] == 0) {
                teamerEmptyBlockIdList.push(i);
            }
            // console.log("posId",path[i],"   y:",mapConfig.block[2 * path[i] + 1]);
        }
        let posList = this.sortUniqueByFrequency(teamerEmptyBlockIdList);
        let curScene = GameControl.getInstance().sceneBattle;
        let gameMap: GameMap = curScene.gameMap;
        for (let i = 0; i < list.length; i++) {
            let pInfo = list[i];
            // await this.wapen2List(list[i], posList[i]);
            let block = gameMap.getAllBlocks()[posList[i]];
            //console.error("加载炮塔资源,到底加载了个啥啊:",wapen.data.id,wapen.data.name);
            // await gameMap.wapen2List(wapen, posId);
            let node = await GameResLoad.loadTurretPrefab(pInfo.getTurretPath());
            if (node) {
                let pn = node.getComponent(TurretBaseUI);
                // pInfo.needVideo = videoList[i];
                pn.init(pInfo);
                //棍子信息
                let tm = node.getComponent(TurretMoveUI);
                if (pInfo.data.wapenType == 4)
                    tm && (tm.setStickID(pInfo.data.typeId));
                else
                    tm && (tm.setStickID(0));

                node.getComponent(TurretBaseUI).onShowSingleIcon();
            }
            else {
                console.log('load turret res failed :', pInfo.getTurretPath());
            }
            console.error(`_____index:${posList[i]}_______尝试添加队友武器:${pInfo.data.id}`);
            this.checkTurretMoveTeamerAI(block, node);
        }

        if (GameControl.getInstance().isTeamBaid()) {
            GameControl.getInstance().sceneBattle.charList.forEach((char) => {
                if (char.charInfo.teamID > 0) {
                    char.node.active = false;
                }
            })
        }

    }
    //对数组中按数字重复出现的数次，从多到少依次排序，用新数组输出去重后的数据，
    sortUniqueByFrequency(numbers: number[]): number[] {
        if (numbers.length === 0) return [];

        // 1. 使用对象统计频率
        const frequencyObj: { [key: number]: number } = {};
        for (const num of numbers) {
            frequencyObj[num] = (frequencyObj[num] || 0) + 1;
        }

        // 2. 获取去重后的数字（对象的键）
        const uniqueNumbers = Object.keys(frequencyObj).map(Number);

        // 3. 按频率降序排序，频率相同按数值升序
        return uniqueNumbers.sort((a, b) => {
            // 频率从高到低
            if (frequencyObj[b] !== frequencyObj[a]) {
                return frequencyObj[b] - frequencyObj[a];
            }
            // 数值从小到大
            return a - b;
        });
    };

    // 加载炮塔资源 并添加到列表
    async wapen2List(wapen: TurretInfo, posId: number) {

    }
}
