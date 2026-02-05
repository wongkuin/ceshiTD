const { ccclass, property } = cc._decorator;

@ccclass
export class UIParams extends cc.Component {
    public static readonly EventType = { Change: "UIParams_Event_Change" };

    /**
     * 
     * @param owner UI
     * @param index 索引
     * @param defaultVal 默认值 
     * @returns 
     */
    public static parse<T>(owner: cc.Node | cc.Component, index: number, defaultVal: T = undefined): T {
        let params = owner.getComponent(UIParams)?.params;

        if (params && params?.length > index) return params[index];
        return defaultVal;
    }

    private _params: Array<any>;
    public get params(): Array<any> {
        return this._params;
    }
    public set params(value: Array<any>) {
        this._params = value;
        this.node.emit(UIParams.EventType.Change, value);
    }
}