//资源管理器

export default class AdEventComponent  {

	private _events = {};

	public on(eventname: string, callback: Function, target?: any) {
		if (this._events[eventname] == undefined) {
			this._events[eventname] = [];
		}

		this._events[eventname].push({
			callback: callback,
			target: target,
		});
		// cc.log(this._events);
	};

	public off(eventname: string, callback: Function, target?: any) {
		var handlers = this._events[eventname];
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

	public emit(eventname: string, ...params:any[]) {
		var handlers = this._events[eventname];
		if (handlers != undefined && handlers != null) {
			for (var index = 0; index < handlers.length; index++) {
				var handler = handlers[index];
				handler.callback.call(handler.target, ...params);
			}
		}
	};

	public clear(node: any) {
		for (let k in this._events) {
			let handlers = this._events[k];
			if (handlers) {
				let i = 0;
				while (i < handlers.length) {
					if (handlers[i].target == node) {
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
