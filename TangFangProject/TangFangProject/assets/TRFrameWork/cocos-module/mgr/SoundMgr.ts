import ConfigMgr from "../../../Script/config/ConfigMgr";
import { KvData } from "../../../Script/config/DataDef";
import GameGlobalData from "../../../Script/Data/GameGlobalData";



export default class SoundMgr {

    //声音集合  中保存的是音乐的名称和音频对象的 key-value 键值对
    public _sounds: { [key: string]: any } = {};

    //声音开关
    private _enabled_music: boolean = true;
    private _enabled_sound: boolean = true;

    private _music: string = "bgm_mg_main";

    //当前音效
    // private curaudioID: any = null;

    //当前音效名称
    private curAdName: string = "";


    private soundMap: Map<string, number> = new Map();

    /**添加资源成功，下次不在添加 */
    addResourcesSuccess: boolean = false;



    private static _instance: SoundMgr;

    public static getInstance(): SoundMgr {
        if (!this._instance) {
            this._instance = new SoundMgr();
            this._instance.setEffectsVolume(0.5);
            cc.audioEngine.setMaxAudioInstance(5);
        }
        return this._instance;
    }

    setAddRResourcesSuccess() {
        this.addResourcesSuccess = true;
    }

    getAddRResourcesSuccess(): boolean {
        return this.addResourcesSuccess
    }


    public static clear() {
        this._instance = null;
    }

    //添加声音资源
    addSoundResources(key: string, clip: cc.AudioClip) {
        if (this.addResourcesSuccess) {
            return;
        }
        this._sounds[key] = clip;
    }

    /**
     * 读表播放 音效
     * @param id 
     * @param loop loop: 默认不循环
     * @param type type == 1 同时只能播放一个
     * @returns 
     */
    public playSoundByID(id: number, loop?: boolean, type?: number) {
        let vData = ConfigMgr.getInstance().getById(id, KvData);
        if (vData) {
            return this.playSound(vData.val, loop, type);
        } else {
            console.warn('not VioceData id :', id);
        }
        return 0;
    }

    /**播放音效: loop: 默认不循环,  type == 1 同时只能播放一个 */
    playSound(fxName: string, loop?: boolean, type?: number) {

        // console.log("playSound: name", fxName)
        if (!this._enabled_sound) {
            return;
        }

        if (!GameGlobalData.getInstance().effectEnabled) {
            return 0;
        }

        if (type == 1 && this.isPlayingSound(fxName)) {
            return;
        }

        if (this._sounds[fxName]) {
            let curaudioID = cc.audioEngine.playEffect(this._sounds[fxName], !!loop);
            this.soundMap.set(fxName, curaudioID);
            this.curAdName = fxName;
        }
        else {
            console.log("not found sound:", fxName);
        }
    }

    /**获取音效ID */
    public getAudioID(name: string) {
        return this.soundMap.get(name);
    }

    /**是否正在播放音效 */
    isPlayingSound(name: string) {
        let aId = this.soundMap.get(name);
        if (aId != undefined) {
            let st = cc.audioEngine.getState(aId);
            if (st == cc.audioEngine.AudioState.PLAYING) {
                return true;
            }
        }
        return false;
    }

    /**
     * 播放背景音乐
     */
    playMusic(musicName: string, loop: boolean = true, endFunc?: Function): number {
        if (!this._enabled_music) {
            return 0;
        }
        if (!GameGlobalData.getInstance().musicEnabled) {
            return 0;
        }


        if (this.isPlayingSound(musicName)) {
            return 0;
        }

        //这里根据外面的声音标识 处理
        this._music = musicName;
        if (this._sounds[musicName]) {
            let aId = cc.audioEngine.playMusic(this._sounds[musicName], loop);
            this.soundMap.set(musicName, aId);
            // console.log("playMusic---musicName:", aId);
            cc.audioEngine.setFinishCallback(aId, () => {
                // console.log("播放结束");
                endFunc && endFunc();
            });
            // endFunc && cc.audioEngine.setFinishCallback(aId, endFunc);
        }
        else {
            // console.log("背景音乐不存在：", musicName);
        }
    }


    /**
    * 停止播放背景音乐
    */
    public stopMusic() {
        cc.audioEngine.stopMusic();
    }

    /**暂停音乐 */
    public pauseMusic() {
        cc.audioEngine.pauseMusic();
    }

    /**恢复音乐 */
    public resumeMusic() {
        cc.audioEngine.resumeMusic();
    }

    //停止播放当前音效
    public stopSound(name?: string) {
        name = name || this.curAdName;
        // if (name) {
        let aId = this.soundMap.get(name);
        if (aId != undefined) {
            cc.audioEngine.stop(aId);
            this.soundMap.delete(name);
        }
        // }
        // else {
        //     if (this.curaudioID) {
        //         cc.audioEngine.stop(this.curaudioID);

        //     }
        // }
    }

    //是否播放背景应该
    public setMusicEnabled(enabled: boolean) {
        this._enabled_music = enabled;
        if (this._enabled_music) {
            // console.log("播放bgm");
            this.playMusic(this._music)
        } else {
            this.stopMusic();
        }
    }

    public setSoundEnabled(enabled: boolean) {
        this._enabled_sound = enabled;
    }

    // getEnable() {
    //     return this._enabled_music;
    // }



    //设置音效音量
    public setSoundVolume(aid: number, volume: number) {
        cc.audioEngine.setVolume(aid, volume);

        cc.audioEngine.setEffectsVolume
    }

    //停止所有音效
    public stopallSound() {
        cc.audioEngine.stopAllEffects();
    }

    setEffectsVolume(volume) {
        cc.audioEngine.setEffectsVolume(volume);
        cc.audioEngine.setMusicVolume(volume)

    }

    /**不播通用音效的话，节点stopBtnSound设true */
    static SetButtonSound(): void {
        if (cc.Button.prototype["touchBeganClone"]) return;

        cc.Button.prototype["touchBeganClone"] = cc.Button.prototype["_onTouchEnded"];

        cc.Button.prototype["_onTouchEnded"] = function (event) {

            if (this.interactable && this.enabledInHierarchy && (!this.node?.stopBtnSound)) {

                // 播放自己的按钮音效
                let effect = 'BUTTONPUSH';
                SoundMgr.getInstance().playSound(effect, false);

            }

            this.touchBeganClone(event);

        }

    }
}