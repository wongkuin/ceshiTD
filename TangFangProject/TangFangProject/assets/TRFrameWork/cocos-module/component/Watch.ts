type CallBackInfo = { callback: Function, target: any, once: boolean };
interface IWatch {
    on(listener: Function, target: any, ...keys: Array<any>): void;
    once(listener: Function, target: any, ...keys: Array<any>): void;
    off(listener: Function, target: any, ...keys: Array<any>): void;
    targetOff(target: any): void;
}

interface IEventTarget {
    on(key: string, callback: Function, target?: any, once?: boolean): void;
    once(key: string, callback: Function, target?: any): void;
    off(key: string, callback: Function, target: any): void
    targetOff(target: any): void;
    emit(key: string, ...args: any): void;
}




/**事件监听 */
export class EventTarget implements IEventTarget {

    private callBackMap: Record<string, Array<CallBackInfo>> = {};

    public on(key: string, callback: Function, target?: any, once: boolean = false): void {

        if (this.hasEventListener(key, callback, target)) return;

        let list = this.callBackMap[key];
        if (!list) this.callBackMap[key] = list = [];
        list.push({ callback: callback, target: target, once: once });
    }

    public once(key: string, callback: Function, target?: any): void {
        this.on(key, callback, target, true);
    }

    public hasEventListener(key: string, callback: Function, target: any): boolean {

        const list = this.callBackMap[key];
        if (!list) return false;

        for (let i = 0; i < list.length; i++) {
            const info = list[i];
            if (info && info.target == target && info.callback == callback) return true;
        }
        return false;
    }

    public off(key: string, callback: Function, target: any): void {

        const list = this.callBackMap[key];
        if (!list) return;

        for (var i = list.length - 1; i >= 0; i--) {
            const info = list[i];
            if (info && info.target == target && info.callback == callback) {
                list.splice(i, 1);
                break;
            }
        }

    }

    public targetOff(target: any): void {

        Object.keys(this.callBackMap).forEach(key => {
            const list = this.callBackMap[key];
            list.filter(info => info.target == target).forEach(info => this.off(key, info.callback, info.target));
        });

    }


    public emit(key: string, ...args: any): void {
        const list = this.callBackMap[key];
        if (!list) return;
        const removes: Array<CallBackInfo> = [];

        for (let i = 0; i < list.length; i++) {
            const info = list[i];
            //自动回收无效对象，如果是未继承cocos类的基类则需要自行注销
            if (info.target instanceof cc.Component && !info.target.isValid) {
                removes.push(info);
                continue;
            }
            if (info.once) removes.push(info);
            info.callback.call(info.target, ...args);
        }

        removes.forEach(info => this.off(key, info.callback, info.target));
    }
}

/**创建的监听对象 */
export type WatchData<T extends object> = IWatch & T;

type ExcludeMethods<T> = {
    [K in keyof T as (T[K] extends Function ? never : K)]: T[K]
}

/**剔除所有方法,获取公开的属性名称 */
export type FieldNames<T> = keyof ExcludeMethods<T>;

/**
 * 获取属性或者方法的名称
 * @returns 
 * @link https://learn.microsoft.com/zh-cn/dotnet/csharp/language-reference/operators/nameof
 * @example 
 * class Test {
 *   id: number;
 * }
 * console.log(nameof<Test>().id); //output: "id"
 */
export function nameof<T>() {
    return new Proxy(
        {},
        {
            get: function (_target, prop, _receiver) {
                return prop;
            },
        }
    ) as {
            [P in keyof T]: P;
        };
}

const KEY_IGNORE = Symbol("__$ignore$");
const KEY_PROXY = Symbol('isProxy');
const KEY_RAW = Symbol('raw');

/**
 * 数据监听 
 * @example
    const p = Watch.create({ a: 1, b: 1, c: [1] });
    p.on(() => {
       console.log("数据变更", p.getSrcTarget());
    }, this);
    p.a = 2;
*/
export default class Watch<T extends object> implements ProxyHandler<T>, IWatch {

    public static readonly EventType = {
        Change: "Watch_Event_Change"
    };

    /**
     * 是否为代理
     */
    public static isProxy(target: Object): boolean {
        return target[KEY_PROXY] ?? false;
    }

    /**
     * 转换成原始对象
     * @param target 
     * @returns 
     */
    public static toRaw<T extends object>(target: T): T {
        const raw = target && target[KEY_RAW];
        return raw ? Watch.toRaw(raw) : target;
    }

    public static create<T extends object>(target: T): WatchData<T> {
        return new Proxy(target, new Watch(target)) as WatchData<T>;
    }

    /**eventTarget*/
    private _$eventTarget = new EventTarget();
    /**srcTarget*/
    private _$srcTarget: T = null;
    private _$dict: WeakMap<object, { proxy: object, fieldName: PropertyKey }> = new WeakMap();
    private _$hackKeys: Array<PropertyKey> = ["on", "once", "off", "targetOff", "emit", "_$eventTarget", "_$srcTarget", "_$dict", KEY_IGNORE];

    constructor(target: T) {
        this._$srcTarget = target;
    }

    get(target: object, key: PropertyKey, receiver?: any) {
        if (key === KEY_PROXY) return true;
        if (key === KEY_RAW) return target;


        if (target === this._$srcTarget && this._$hackKeys.includes(key)) {
            return Reflect.get(this, key);
        }

        const res = Reflect.get(target, key, receiver);

        if (!this.isObject(res)) return res;

        if (Watch.isProxy(res)) return res;

        const names: Array<PropertyKey> = target[KEY_IGNORE];
        if (names?.includes(key)) return res;

        let cache = this._$dict.get(res);
        if (!cache) {
            const proxy = new Proxy(res, this);
            let fieldName = key;
            if (target != this._$srcTarget) {
                const parent = this._$dict.get(target);
                if (parent) fieldName = parent.fieldName;
            }

            cache = { proxy: proxy, fieldName: fieldName };
            this._$dict.set(res, cache);
        }

        return cache.proxy;
    }

    set(target: object, key: PropertyKey, value: any, receiver?: any) {
        const oldValue = Reflect.get(target, key, receiver);
        let result = Reflect.set(target, key, value, receiver);

        if (this.hasChanged(value, oldValue)) {

            let fieldName = key;
            if (target != this._$srcTarget) {
                const cache = this._$dict.get(target);
                if (cache) fieldName = cache.fieldName;
            }

            this.emit(Watch.EventType.Change, fieldName, key, value, oldValue);
        }
        return result;
    }

    protected isObject(value: any): boolean {
        return value != null && typeof value === "object";
    }


    protected hasChanged(value: any, oldValue: any): boolean {
        return value !== oldValue && (value === value || oldValue === oldValue);
    }


    //=====implement IWatch
    /**
    * 监听事件
    * @param listener 
    * @param target 
    * @param fieldNames 字段名称
    */
    public on(listener: (key: PropertyKey, value: any) => void, target: any, ...fieldNames: Array<FieldNames<T>>): void {
        fieldNames?.forEach(name => this._$eventTarget.on(Watch.EventType.Change + "_" + String(name), listener, target));
        if (!fieldNames || fieldNames.length <= 0)
            this._$eventTarget.on(Watch.EventType.Change, listener, target);
    }

    /**
     * 监听一次事件
     * @param listener 
     * @param target 
     * @param fieldNames 字段名称
     */
    public once(listener: (key: PropertyKey, value: any) => void, target: any, ...fieldNames: Array<FieldNames<T>>): void {
        fieldNames?.forEach(name => this._$eventTarget.once(Watch.EventType.Change + "_" + String(name), listener, target));
        if (!fieldNames || fieldNames.length <= 0)
            this._$eventTarget.once(Watch.EventType.Change, listener, target);
    }

    /**
     * 移除事件监听
     * @param listener 
     * @param target 
     * @param fieldNames 字段名称
     */
    public off(listener: (key: PropertyKey, value: any) => void, target: any, ...fieldNames: Array<FieldNames<T>>): void {
        fieldNames?.forEach(name => this._$eventTarget.off(Watch.EventType.Change + "_" + String(name), listener, target));
        if (!fieldNames || fieldNames.length <= 0)
            this._$eventTarget.off(Watch.EventType.Change, listener, target);
    }

    /**
     * 移除目标上的所有注册事件。
     * @param target 
     */
    public targetOff(target: any): void {
        this._$eventTarget.targetOff(target);
    }

    protected emit(type: string, fieldName: PropertyKey, key: PropertyKey, value: any, oldValue: any): void {
        const names: Array<PropertyKey> = this?._$srcTarget[KEY_IGNORE];
        if (names && names.includes(fieldName)) return;

        if (!type) type = Watch.EventType.Change;
        if (fieldName != undefined && fieldName != null)
            this._$eventTarget.emit(type + "_" + String(fieldName), key, value, oldValue);

        this._$eventTarget.emit(type, key, value, oldValue);
    }

    public toString(): string {
        return JSON.stringify(this._$srcTarget);
    }

}

/**
 * 忽略的属性(数据变更不会触发事件) 注解/装饰器
 * @returns 
 */
export function ignoreWatch(): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {

        let arr: Array<string | symbol> = target[KEY_IGNORE];
        if (!arr) {
            arr = [];
            target[KEY_IGNORE] = arr;
        }
        arr.push(propertyKey);
    }
}
