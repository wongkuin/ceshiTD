
export default class Singleton<T> {

	public static getInstance<T extends {}>(this: new () => T): T {
		if (!(<any>this).ins) {
			(<any>this).ins = new this();
		}
		return (<any>this).ins;
	}

}

//@singleton 注解
export function singleton(target: any) {
	const original = target;
	let instance = undefined;
	const f: any = function (...args) {
		instance = instance === undefined ? new original(...args) : instance;
		return instance;
	};
	f.prototype = original.prototype;
	return f;
}