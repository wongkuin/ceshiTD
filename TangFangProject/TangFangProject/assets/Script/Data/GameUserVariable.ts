import UserVariable from "../../TRFrameWork/cocos-module/component/UserVariable";


interface IClear {
    clear(): void;
};

export default class GameUserVariable<T extends UserVariable<T>> extends UserVariable<T> {


    private static variables: Array<IClear> = [];

    constructor(key: string, autoSave = false) {
        super(key, autoSave);
        GameUserVariable.variables.push(this);
    }

    /**清除所有本地存档 */
    public static clearAll(): void {
        GameUserVariable.variables.forEach(c => c.clear());
        GameUserVariable.variables = [];
    }

}