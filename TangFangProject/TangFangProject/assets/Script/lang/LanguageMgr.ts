

import Singleton from "../../TRFrameWork/UIFrame/Singleton";
import { lang_zh } from "./lang_zh";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LanguageMgr extends Singleton<LanguageMgr> {

    private _curLang = "zh";
    private _langData: any = {};

    constructor() {
        super();
        this.init();
    }

    public init() {
        this._langData = lang_zh;
    }

    public getLang(key: string) {
        return this._langData[key];
    }
}
