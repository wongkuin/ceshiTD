//资源管理器

import Singleton from "../../UIFrame/Singleton";


export default class GlobalEventMgr extends Singleton<GlobalEventMgr> {
    private _events = {};

    public on(eventname: string, callback: Function, target: any) {
        if (this._events[eventname] == undefined) {
            this._events[eventname] = [];
        }

        this._events[eventname].push({
            callback: callback,
            target: target,
        });
        // cc.log(this._events);
    };

    public off(eventname: string, callback: Function, target: any) {
        var handlers = this._events[eventname];
        if (!handlers) {
            return;
        }
        for (var index = handlers.length - 1; index >= 0; index--) {
            var handler = handlers[index];
            if (target == handler.target && callback.toString() == handler.callback.toString()) {
                handlers.splice(index, 1);
                break;
            };
        }
        if (handlers.length == 0) {
            delete this._events[eventname];
        }
        // cc.log(this._events);
    };

    public emit(eventname: string, ...params: any[]) {
        var handlers = this._events[eventname];
        if (handlers != undefined && handlers != null) {
            //自动回收无效对象，如果是未继承cocos类的基类则需要自行注销
            for (var i = handlers.length - 1; i >= 0; i--) {
                let handler = handlers[i];
                if (!handler.target.isValid) {
                    handlers.splice(i, 1);
                }
            }

            for (var i = 0; i < handlers.length; i++) {
                var handler = handlers[i];
                handler.callback.call(handler.target, ...params);
            }
        }
    };

    public clear(target: any) {
        for (let k in this._events) {
            let handlers = this._events[k];
            if (handlers) {
                let i = 0;
                while (i < handlers.length) {
                    if (handlers[i].target == target) {
                        handlers[i] = null;
                        handlers.splice(i, 1);
                        i--;
                    }
                    i++;
                }
                if (handlers.length == 0)
                    delete this._events[k];
            }
        }
        // cc.log(this._events);
    };

}
