import Singleton from "../../TRFrameWork/UIFrame/Singleton";
import { eGameAttr } from "../config/EnumDef";



export class AttrType {
    type: eGameAttr;
    value: number;

    constructor(type: eGameAttr, value: number) {
        this.type = type;
        this.value = value;
    }
}

export class AttrTypeList {
    private _attrs: Array<AttrType> = [];

    public getAttr(type: eGameAttr): AttrType {
        let getAttr = this._attrs.find((t) => {
            return type == t.type;
        })
        return getAttr;
    }

    public setAttr(type: eGameAttr, value: number) {
        let fAttr = this.getAttr(type);
        if (fAttr) {
            fAttr.value = value;
        } else {
            this._attrs.push(new AttrType(type, value));
        }
    }

    public removeAttr(type: eGameAttr): boolean {

        let idx = this._attrs.findIndex((attr) => {
            return type == attr.type;
        })
        if (idx >= 0) {
            this._attrs.splice(idx, 1);
            return true;
        }
        return false;

    }
}


 export default class GameAttrCalcMgr extends Singleton<GameAttrCalcMgr> {

 }
