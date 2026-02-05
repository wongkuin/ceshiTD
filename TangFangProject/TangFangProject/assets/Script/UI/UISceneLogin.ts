import SoundMgr from "../../TRFrameWork/cocos-module/mgr/SoundMgr";
import AdapterMgr, { AdapterType } from "../../TRFrameWork/UIFrame/AdapterMgr";
import CocosHelper from "../../TRFrameWork/UIFrame/CocosHelper";
import FormMgr from "../../TRFrameWork/UIFrame/FormMgr";
import { ECloseType } from "../../TRFrameWork/UIFrame/Struct";
import { UIScreen, UIWindow } from "../../TRFrameWork/UIFrame/UIForm";
import { GameBundle } from "../config/GameEnum";
import UIConfig from "../config/UIConfig";
import GameDrawHelp from "../Data/GameDrawHelp";
import GameUserData from "../Data/GameUserData";
import GameHelp from "../Mgr/GameHelp";
import LanguageMgr from "../lang/LanguageMgr";
import GameResLoad from "../Battle/GameResLoad";
import ConfigMgr from "../config/ConfigMgr";
import { PassData, MonsterData, WaveTimesData, WapenTableData } from "../config/DataDef";
import HttpMgr, { HttpType, requestParam } from "../../TRFrameWork/cocos-module/mgr/HttpMgr";
import ApiMgr from "../Mgr/ApiMgr";
import SceneMgr from "../../TRFrameWork/UIFrame/SceneMgr";
import FromResMgr from "../../TRFrameWork/UIFrame/FromResMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UISceneLogin extends UIWindow {

    @property(cc.Label)
    login_progress: cc.Label = null;

    @property(cc.Node)
    login_layout: cc.Node = null;

    @property(cc.Label)
    txt_version: cc.Label = null;

    @property(cc.Sprite)
    progress: cc.Sprite = null;

    @property(cc.Node)
    fuNode: cc.Node = null;

    @property(cc.Label)
    jzLab: cc.Label = null;

    @property(cc.Sprite)
    loginSp: cc.Sprite = null;

    @property(cc.Sprite)
    banhaoSp: cc.Sprite = null;
    @property(cc.Node)
    loadPlayer: cc.Node = null;
    // @property(cc.Node)
    // bg2: cc.Node = null;

    // protected loadingList: cc.Node[] = [];
    closeType = ECloseType.CloseAndDestory;

    progressCount: number = 100;

    protected idx = 0;

    speed = 300;
    intervalId: number = 0;
    private _tempPlayerPos: cc.Vec3 = null

    private enterGame: boolean = false;

    public async load(params: any): Promise<string> {
        AdapterMgr.getInstance().adapteByType(AdapterType.StretchHeight | AdapterType.StretchWidth, this.node);
        await FormMgr.load(UIConfig.scene_main);
        return Promise.resolve("");
    }

    public onInit(params: any): void {

        // this.loadingList = this.login_layout.children;
        GameDrawHelp.getInstance().init();
        FormMgr.load(UIConfig.ui_loading);
    }

    public async onShow(params: any): Promise<void> {
        let logo = "logo";
        let banhao = "banhao"
        this.loadSpirteFrame(`texture/${logo}`, this.loginSp, GameBundle.Bundle_loading);
        this.loadSpirteFrame(`texture/${banhao}`, this.banhaoSp, GameBundle.Bundle_loading);

        this.login_progress.string = "0%";
        this.progress.fillRange = 0.1;
        this.idx = 0;

        GameResLoad.preloadTurretPrefab('', 3);

        let self = this;
        this.loadAllBundles();
        // 加载三部分资源-
        // CocosHelper.loadDirSync('audio', cc.AudioClip, GameBundle.Bundle_commonRes, (comp: number, total: number, item: any) => {
        //     if (self.progress) {
        //         const bundleProgress = Math.round((comp / total) * 100);
        //         // console.log(`Bundle ${bundleName} 进度: ${bundleProgress}%,complet:${completed},total:${total}`);
        //         // if (bundleProgress > this._recordCompTemp) {
        //         self.progress.fillRange = bundleProgress / 100;
        //         self.login_progress.string = `${bundleProgress}%`;
        //         cc.Tween.stopAllByTarget(self.loadPlayer);
        //         let singleWidth = self.progress.node.width / 100;
        //         cc.tween(self.loadPlayer).to(0.1, { x: self._tempPlayerPos.x + bundleProgress * singleWidth }).start()
        //     }
        // }).then(async (res) => {
        //     this.idx = Math.max(this.progressCount / 2, this.idx);
        //     for (const element of res.asset) {
        //         SoundMgr.getInstance().addSoundResources(element.name, element);
        //     }
        //     self.enterGame = true;
        //     this.goToMain()
        //     // self.loadBattle();
        //     if (res.err) {
        //         console.error("loadDirSync  Audio error", res.err);
        //         return;
        //     }
        // })
        FormMgr.load(UIConfig.Main_PageWapen);
        FormMgr.load(UIConfig.Main_PagePass);
        FormMgr.load(UIConfig.ui_gameOver)
        this.txt_version.string = GameUserData.getInstance().version;

        this.schedule(() => {
            if (this.num == 0) {
                this.jzLab.string = "加载中"
            } else if (this.num == 1) {
                this.jzLab.string = "加载中."
            } else if (this.num == 2) {
                this.jzLab.string = "加载中.."
            } else if (this.num == 3) {
                this.jzLab.string = "加载中..."
            }
            this.num++;
            if (this.num > 3) {
                this.num = 0;
            }
        }, 0.3)
    }
    num = 0;

    protected loadBattle() {
        let self = this;
        FormMgr.load(UIConfig.scene_battle).then((res) => {
            this.idx += 3;
            self.schedule(self.scheduleEmpty, 0.1);
            if (!res) {
                console.error("load scene_battle error");
                return;
            }
        })
    }

    protected scheduleEmpty() {
        this.idx += 1;
        this.updateProgress();
    }

    public onHide(params: any): void {
        console.warn("onHide");
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = 0;
        }
    }

    protected goToMain() {
        // debugger;
        if (GameUserData.getInstance().lastPassLv == 1) {
            // 自动进入第一关前检查体力
            if (GameUserData.getInstance().tryConsumeEnergy(1, false)) {
                FormMgr.load(UIConfig.scene_main);
                GameHelp.getInstance().goToBattle(1);
            } else {
                let gStr = "体力不足";
                try { gStr = LanguageMgr.getInstance().getLang("energy_notEnough"); } catch (e) { }
                GameHelp.getInstance().showToast(gStr);
                FormMgr.open(UIConfig.ui_popBuyEnergy);
            }
        } else {
            console.warn("goToMain");
            FormMgr.open(UIConfig.scene_main, null);
        }

        SoundMgr.getInstance().setMusicEnabled(GameUserData.getInstance().isMusic);
        SoundMgr.getInstance().setSoundEnabled(GameUserData.getInstance().isSound);

        // FormMgr.open(UIConfig.ui_clickEffect);
    }

    protected updateProgress() {
        return;
        // if (this.idx > this.loadingList.length - 1) {
        //     return;
        // }

        // this.loadingList[this.idx].active = true;
        this.idx++;
        // console.log("idx", this.idx,this.progressCount);
        if (this.idx > this.progressCount) {
            this.idx = this.progressCount;
        }
        this.login_progress.string = (this.idx / this.progressCount * 100).toFixed(0) + "%";
        if (this.idx >= this.progressCount) {
            // this.unschedule(this.scheduleEmpty);
            // this.goToMain();
        }
        this.progress.fillRange = this.idx / this.progressCount;
        this.fuNode.x = -this.progress.node.width / 2 + (this.progress.node.width * (this.progress.fillRange));
    }

    protected update(dt: number): void {

    }



    /**
    * 加载所有Bundle
    */
    async loadAllBundles() {
        this.loadedBundles = 0;
        this.currentBundleIndex = 0;
        this._tempPlayerPos = this.loadPlayer.position;
        this.totalBundles = 1;
        // // 定义要加载的Bundle列表
        this.bundleList = [
            { name: GameBundle.Bundle_commonRes, dir: "audio" },
            // { name: GameBundle.Bundle_commonRes, dir: "effect" },
            // { name: GameBundle.Bundle_commonRes, dir: "ItemIcon" },
            // { name: GameBundle.Bundle_commonRes, dir: "spine" },
            // { name: GameBundle.Bundle_commonRes, dir: "wapen" },
            // { name: GameBundle.Bundle_bullet, dir: "texture" },
            // { name: GameBundle.Bundle_bullet, dir: "atlas" },
            // { name: GameBundle.Bundle_bullet, dir: "anim" },
            // { name: GameBundle.Bundle_monster, dir: "spine" },
            // { name: GameBundle.Bundle_monster, dir: "texture" },
            // { name: GameBundle.Bundle_GameMap }
        ];

        this.totalBundles = this.bundleList.length;
        this.loadSingleBundle(this.bundleList[this.loadedBundles], 0);
        let wpList = ConfigMgr.getInstance().getAll(WapenTableData);
        wpList = wpList.filter(wp => {
            return wp.open == 1;
        })
        // 缓存武器图标
        for (let i = 0; i < wpList.length; i++) {
            if (wpList[i].id < 30) FromResMgr.getInstance().loadDynamicRes(`wapen/${wpList[i].img}`, null, GameBundle.Bundle_commonRes, 'prefabs/SceneBattle');
            FromResMgr.getInstance().loadDynamicRes(`ItemIcon/wapenBg${wpList[i].colour}`, null, GameBundle.Bundle_commonRes, 'prefabs/SceneBattle');
            // if (wpList[i].id < 30) FromResMgr.getInstance().loadDynamicRes(`wapen/${wpList[i].img}`, null, GameBundle.Bundle_commonRes, 'prefabs/SceneMain');
            // FromResMgr.getInstance().loadDynamicRes(`ItemIcon/wapenBg${wpList[i].colour}`, null, GameBundle.Bundle_commonRes, 'prefabs/SceneMain');
        }
        // 预加载子弹prefab
        const bulletPath = [10101, 10102, 10201, 10202, 10301, 10302, 10601, 10602];
        const hitPath = [2901, 2902, 2903]
        for (let j = 0; j < bulletPath.length; j++) {
            GameResLoad.preloadBulletPrefab(`bullet_${bulletPath[j]}`);
        }
        // for (let j = 0; j < hitPath.length; j++) {
        //     GameResLoad.loadAOEPrefab(`hit_${hitPath[j]}`);
        // }
    }

    private _recordCompTemp: number = 0;
    /**
     * 加载单个Bundle
     */
    async loadSingleBundle(bundleInfo: {
        name: string;
        dir?: string;
        version?: string;
    }, index: number): Promise<void> {
        // console.error(`加载到第${index}个bundle,总共需要加载:${this.bundleList.length}个bundle`)
        this._recordCompTemp = 0;
        if (index >= this.bundleList.length) {
            this.onAllBundlesLoaded();
            return;
        }
        return new Promise((resolve, reject) => {
            this.currentBundleIndex = index;
            cc.assetManager.loadBundle(bundleInfo.name,
                (err: Error | null, bundle: cc.AssetManager.Bundle | null) => {
                    if (err) {
                        // 即使失败也继续加载下一个
                        this.loadSingleBundle(this.bundleList[++this.loadedBundles], this.loadedBundles);
                    } else {
                        console.log(`Bundle ${bundleInfo.name} 加载成功,dir:${bundleInfo.dir}`);
                        // this.onBundleLoaded(bundleInfo.name, resolve);
                        if (bundleInfo.dir) {
                            let type: any = null;
                            if (bundleInfo.dir == 'audio') type = cc.AudioClip;
                            CocosHelper.loadDirSync(bundleInfo.dir, type, bundleInfo.name, async (comp: number, total: number, item: any) => {
                                this.updateBundleProgress(comp, total, bundleInfo.name)
                            }).then(async (res) => {
                                if (bundleInfo.dir == 'audio') {
                                    // this.idx = Math.max(this.progressCount / 2, this.idx);
                                    for (const element of res.asset) {
                                        SoundMgr.getInstance().addSoundResources(element.name, (element as cc.AudioClip));
                                    }
                                }
                                this.loadSingleBundle(this.bundleList[++this.loadedBundles], this.loadedBundles);
                            })
                        } else this.loadSingleBundle(this.bundleList[++this.loadedBundles], this.loadedBundles);
                    }
                });
        })
    }

    async loadRemoteJson() {
        const url = 'https://www.pipixia.xin/tt/config.json';
        try {
            // 使用 assetManager 加载
            const response = await new Promise<any>((resolve, reject) => {
                cc.assetManager.loadRemote(url, { ext: '.json' }, (err, resource) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(resource);
                });
            });
            console.log('JSON 数据:', response);
            this.processJsonData(response);
        } catch (error) {
            console.error('加载 JSON 失败:', error);

            const xhr = new XMLHttpRequest();
            const data = await new Promise((resolve, reject) => {
                xhr.open('GET', url, true);
                xhr.responseType = 'json';
                xhr.onload = () => {
                    if (xhr.status === 200) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error(`HTTP ${xhr.status}`));
                    }
                };
                xhr.onerror = reject;
                xhr.send();
            });
            console.log('通过XMLHttpRequest加载成功:', data);
            this.processJsonData(data);
        }
    }

    processJsonData(data: any) {
        if (!data) return;
        // 处理 JSON 数据
        console.log('解析的数据:', data);
        // 例如：data.name, data.score 等
        GameUserData.getInstance().setUIDCommon(data.id);
        GameUserData.getInstance().setSerValue(data.ser);
    }

    /**
     * 更新单个Bundle的加载进度
     */
    private updateBundleProgress(completed: number, total: number, bundleName: string) {
        if (total === 0) return;
        const bundleProgress = Math.round((completed / total) * 100);
        const overallProgress = Math.round(((this.loadedBundles + (completed / total)) / this.totalBundles) * 100);
        // if (bundleProgress > this._recordCompTemp) {
        this.progress.fillRange = overallProgress / 100;
        this.login_progress.string = `${overallProgress}%`;
        cc.Tween.stopAllByTarget(this.loadPlayer);
        let singleWidth = this.progress.node.width / 100;
        cc.tween(this.loadPlayer).to(0.1, { x: this._tempPlayerPos.x + overallProgress * singleWidth }).start()
        // this._recordCompTemp = bundleProgress;
        // }
        // const overallProgress = ((this.loadedBundles + (completed / total)) / this.totalBundles) * 100;
        // const allPersent = Math.round(overallProgress);
        // //只更新总进度
        // if (allPersent > this._recordCompTemp) {
        //     // 更新进度条和文本
        //     console.log(`Bundle ${bundleName} 进度: ${bundleProgress}%，总进度:${allPersent}.complet:${completed},total:${total}`);
        //     this.progress.fillRange = overallProgress / 100;
        //     this.login_progress.string = `${allPersent}%`;
        //     cc.Tween.stopAllByTarget(this.loadPlayer);
        //     let singleWidth = this.progress.node.width / 100;
        //     cc.tween(this.loadPlayer).to(0.1, { x: this._tempPlayerPos.x + allPersent * singleWidth }).start()
        //     this._recordCompTemp = allPersent;
        // }
    }



    /**
     * 所有Bundle加载完成
     */
    private onAllBundlesLoaded() {
        console.log('所有Bundle加载完成');

        // 显示加载完成效果
        this.progress.fillRange = 1;
        this.login_progress.string = '100%';
        // this.jzLab.string = '加载完成！';

        // 延迟显示完成界面
        setTimeout(() => {
            // this.loadingNode.active = false;
            // this.loadingCompleteNode.active = true;
            this.goToMain()
            //     self.loadBattle();
            // 可以在这里初始化游戏或跳转场景
            // this.initializeGame();
        }, 500);
    }

    /**
     * 获取已加载的Bundle
     */
    getBundle(name: string): cc.AssetManager.Bundle | null {
        return cc.assetManager.getBundle(name);
    }

    /**
     * 预加载Bundle中的资源
     */
    async preloadBundleAssets(bundleName: string, assetPaths: string[]) {
        const bundle = this.getBundle(bundleName);
        if (!bundle) {
            console.error(`Bundle ${bundleName} 未找到`);
            return;
        }

        return new Promise((resolve) => {
            bundle.preloadDir('', (finish: number, total: number, item: any) => {
                const progress = (finish / total) * 100;
                console.log(`预加载 ${bundleName} 资源: ${Math.round(progress)}%`);
            }, (err: Error | null) => {
                if (err) {
                    console.error(`预加载 ${bundleName} 失败:`, err);
                } else {
                    console.log(`Bundle ${bundleName} 资源预加载完成`);
                }
                resolve(err);
            });
        });
    }
    private totalBundles: number = 0;
    private loadedBundles: number = 0;
    private currentBundleIndex: number = 0;
    private bundleList: Array<{
        name: string;
        dir?: string;
        version?: string;
    }> = [];

    private onLoadProgressCallback: ((completed: number, total: number, resolve: () => void) => void) | null = null;
}
