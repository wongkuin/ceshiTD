import UserKey from "../../ThirdSDK/UserKey";
import Watch, { FieldNames } from "./Watch";

interface IEmit {
    emit(type: string, fieldName: PropertyKey, key: PropertyKey): void;
}

const FieldsKey = "_$nonSerializedKeys";
/**
 * 不需要序列化的属性 注解/装饰器
 * @link https://docs.unity.cn/cn/2019.4/ScriptReference/NonSerialized.html
 * @returns 
 */
export function nonSerialized(): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        let arr: Array<string | symbol> = target[FieldsKey];
        if (!arr) {
            arr = [];
            target[FieldsKey] = arr;
        }
        arr.push(propertyKey);
    }
}

/**用户数据 */
export default class UserVariable<T extends UserVariable<T>> {


    public static getInstance<T extends UserVariable<T>>(this: new () => T): T {
        if (!(this as any)._ins) {
            const instance = new this();
            instance.create();
            (this as any)._ins = instance._$watch;
        }
        return (this as any)._ins;
    }

    /**key 增加前缀防止重名 */
    @nonSerialized()
    private _$key: string;
    /**autoSave 增加前缀防止重名 */
    @nonSerialized()
    private _$autoSave = false;;
    /**watch 增加前缀防止重名 */
    @nonSerialized()
    private _$watch: Watch<T> = null;

    constructor(key: string, autoSave = false) {
        key = UserKey.getInstance().getUserOnlyKey(key);
        this._$key = key;
        this._$autoSave = autoSave;
    }

    /**不要尝试在构造方法中调用此方法 */
    protected create(): void {
        const jsonValue = UserKey.getInstance().getJsonValue(this._$key) ?? null;
        let first = true;
        if (jsonValue) {
            const localValue = JSON.parse(jsonValue);
            Object.assign(this, localValue);
            first = false;
        }

        this.init(first);
        if (first) this.save();

        this._$watch = Watch.create(this) as any;
        this._$watch.on(() => this.dataChange(), this);
    }

    /**首次初始化用 */
    protected init(first: boolean): void {

    }

    protected dataChange(): void {
        if (this._$autoSave) this.save()
    }

    /**
  * 监听事件
  * @param listener 
  * @param target 
  */
    public on(listener: (key?: PropertyKey, value?: any) => void, target: any, ...fieldNames: Array<FieldNames<T>>): void {
        this._$watch.on(listener, target, ...fieldNames);
    }

    /**
     * 监听一次事件
     * @param listener 
     * @param target 
     */
    public once(listener: (key?: PropertyKey, value?: any) => void, target: any, ...fieldNames: Array<FieldNames<T>>): void {
        this._$watch.once(listener, target, ...fieldNames);
    }

    /**
     * 移除事件监听
     * @param listener 
     * @param target 
     */
    public off(listener: () => void, target: any, ...fieldNames: Array<FieldNames<T>>): void {
        this._$watch.off(listener, target, ...fieldNames);
    }

    /**
     * 移除目标上的所有注册事件。
     * @param target 
     */
    public targetOff(target: any): void {
        this._$watch.targetOff(target);
    }


    /**手动触发事件 */
    public emitItem(...fieldNames: Array<FieldNames<T>>): void {
        // console.log("emit", fieldNames);
        for (const element of fieldNames) {
            (this._$watch as unknown as IEmit)?.emit(Watch.EventType.Change, element, element);
        }

    }


    private serialize(): string {
        const nonSerializedKeys: Array<string | symbol> = this[FieldsKey];
        return JSON.stringify(this, (key: string, value: any) => {
            return nonSerializedKeys?.includes(key) ? undefined : value;
        });
    }


    /**保存数据 */
    public save(): void {
        // const nonSerializedKeys: Array<string | symbol> = this[FieldsKey];
        // const jsonStr = JSON.stringify(this, (key: string, value: any) => {
        //     if (nonSerializedKeys?.includes(key))
        //         return undefined;
        //     return value;
        // });
        UserKey.getInstance().saveJsonValue(this._$key, this.serialize());
    }

    public clear(): void {
        UserKey.getInstance().removeJsonValue(this._$key);
        //@ts-ignore
        this.constructor._ins = null;
    }

    public getSaveValue() {
        // const nonSerializedKeys: Array<string | symbol> = this[FieldsKey];
        // const jsonStr = JSON.stringify(this, (key: string, value: any) => {
        //     if (nonSerializedKeys?.includes(key))
        //         return undefined;
        //     return value;
        // });

        return this.serialize();
    }

}


