// //资源管理器

// import Singleton from "../component/Singleton";

// export default class ResManager extends Singleton<ResManager> {

// 	public frames = {};

// 	// public loadRes(url: string, bundleName?: string, finishCall?: (err: Error, asset: any) => void, caller?: any, assetType?: typeof cc.Asset)
// 	// {
// 	// 	var callback = (err: Error, asset: any)=>{
// 	// 		if (!err)
// 	// 		{
// 	// 			if (assetType?.name == "cc_SpriteFrame")
// 	// 			{
// 	// 				if (asset.shift)
// 	// 				{
// 	// 					asset.forEach(element => {
// 	// 						// cc.log(element)
// 	// 						this.frames[url + element.name] = element;	
// 	// 					});
// 	// 				}
// 	// 				else
// 	// 					this.frames[url] = asset;
// 	// 			}
// 	// 		}
// 	// 		finishCall?.call(caller, err, asset);
// 	// 	};

// 	// 	if (bundleName)
// 	// 		this.loadResFromBundle(url, bundleName, callback, assetType);
// 	// 	else
// 	// 		this.loadResFromResources(url, callback, assetType);
// 	// }

// 	// public loadResFormArray<T extends cc.Asset>( urls:Array<string>,finishCall?: (asset: Array<T>) => void, caller?: any,assetType?: typeof cc.Asset):void{
// 	// 	if (urls.length == 0) { finishCall?.call(caller); return; }
// 	// 	let index = 0;
// 	// 	let arr = [];
		
// 	// 	urls.forEach( url => {

// 	// 		this.loadRes(url,null,(err: Error, asset: any)=>{

// 	// 			index++;
// 	// 			arr.push(asset);
// 	// 			if (err) cc.log("loadResFormArray err", err);
// 	// 			if (index == urls.length) finishCall?.call(caller,arr);

// 	// 		},this,assetType);

// 	// 	});
		
// 	// }

// 	// 预加载资源包
// 	public preloadBundles(bundleNames: string[], finishCall?: Function, caller?: any) {
// 		if (bundleNames.length == 0) { finishCall?.call(caller); return; }
// 		let index = 0;
// 		bundleNames.forEach((bundleName) => {
// 			cc.assetManager.loadBundle(bundleName, (err: Error, bundle: cc.AssetManager.Bundle) => {
// 				index ++;
// 				if (err) cc.log("loadBundle err", err);
// 				if (index == bundleNames.length) finishCall?.call(caller);
// 			});
// 		});
// 	}

// 	private loadResFromResources(url: string, onComplete: (err: Error, asset: any) => void, assetType?: typeof cc.Asset)
// 	{
// 		if (this.isDir(url))
// 			cc.resources.loadDir(url, assetType, onComplete);
// 		else
// 			cc.resources.load(url, assetType, onComplete);
// 	}

// 	private loadResFromBundle(url: string, bundleName: string, onComplete?: (err: Error, asset: any) => void, assetType?: typeof cc.Asset)
// 	{
// 		let tmpBundle = cc.assetManager.getBundle(bundleName);
// 		if (tmpBundle) {
// 			if (this.isDir(url))
// 				tmpBundle.loadDir(url, assetType, onComplete);
// 			else
// 				tmpBundle.load(url, assetType, onComplete);
// 		}
// 		else {
// 			cc.assetManager.loadBundle(bundleName, (err: Error, bundle: cc.AssetManager.Bundle) => {
// 				if (!err) {
// 					if (this.isDir(url))
// 						tmpBundle.loadDir(url, assetType, onComplete);
// 					else
// 						bundle.load(url, assetType, onComplete);
// 				}
// 				else {
// 					cc.log("loadBundle err", err);
// 				}
// 			});
// 		}
// 	}

// 	private isDir(url: string)
// 	{
// 		return url[url.length - 1] == '/';
// 	}


// 	public static readonly EventType = { Progress: "ResMgr_Event_Progress" };
	
// 		private eventTarget: EventTarget = new EventTarget();
	
// 		/**远程加载地址 */
// 		public remoteUrl = "";
	
// 		/**
// 		 * 获取Bundle
// 		 * @param bundleName 
// 		 * @returns 
// 		 */
// 		public getBundle(bundleName: string): Promise<{ bundle: cc.AssetManager.Bundle, err?: Error }> {
	
// 			return new Promise(resolve => {
	
// 				const bundle = bundleName ? cc.assetManager.getBundle(bundleName) : cc.assetManager.resources;
// 				if (!bundle) {
// 					const baseUrl = (cc.sys.isBrowser || cc.sys.isNative) ? "" : this.remoteUrl;
// 					cc.assetManager.loadBundle(baseUrl + bundleName, { onProgress: (finish: number, total: number) => this.onProgress(0, bundleName, finish, total), onFileProgress: () => { } }, (err: Error, bundle: cc.AssetManager.Bundle) => {
// 						if (err) console.log(err);
// 						resolve({ err: err, bundle: bundle });
// 					});
// 				} else {
// 					resolve({ bundle: bundle });
// 				}
// 			});
// 		}
	
// 		/**
// 		 * 加载资源，去除reject,在回调中处理
// 		 * @param url 
// 		 * @param type 
// 		 * @param bundleName 
// 		 * @returns 
// 		 */
// 		public loadRes<T extends cc.Asset>(url: string, type: new () => T, bundleName?: string, onProgress?: (url: string, bundleName: string, finish: number, total: number) => void): Promise<{ asset: T, err?: Error }> {
	
// 			return new Promise(resolve => {
	
// 				const bundle = bundleName ? this.getBundle(bundleName) : Promise.resolve({ bundle: cc.resources });
	
// 				bundle.then(b => {
	
// 					//@ts-ignore
// 					if (type == cc.SceneAsset) {
// 						b.bundle.loadScene(url, (finish, total) => {
// 							if (onProgress) onProgress(url, bundleName, finish, total);
// 						}, (err, asset) => {
// 							if (err) console.log(bundleName, err);
// 							//@ts-ignore
// 							resolve({ err: err, asset: asset });
// 						});
	
// 					} else {
	
// 						b.bundle.load<T>(url, type, (finish, total) => {
// 							if (onProgress) onProgress(url, bundleName, finish, total);
// 						}, (err: Error, asset: T) => {
// 							if (err) console.log(bundleName, err);
// 							resolve({ err: err, asset: asset });
// 						});
	
// 					}
	
	
	
// 				});
	
// 			});
	
// 		}
	
	
// 		/**
// 		 * 加载文件夹下所有资源，去除reject,在回调中处理
// 		 * @param url 
// 		 * @param type 
// 		 * @param bundleName 
// 		 * @returns 
// 		 */
// 		public loadDir<T extends cc.Asset>(url: string, type: new () => T, bundleName?: string, onProgress?: (url: string, bundleName: string, finish: number, total: number) => void): Promise<{ asset: Array<T>, err?: Error }> {
	
// 			return new Promise(resolve => {
	
// 				const bundle = bundleName ? this.getBundle(bundleName) : Promise.resolve({ bundle: cc.resources });
	
// 				bundle.then(b => {
	
// 					b.bundle.loadDir<T>(url, type, (finish, total) => {
// 						if (onProgress) onProgress(url, bundleName, finish, total);
// 					}, (err: Error, asset: Array<T>) => {
// 						if (err) console.log(bundleName, err);
// 						resolve({ err: err, asset: asset });
// 					});
// 				});
	
// 			});
	
// 		}
	
	
	
	
// 		public setSpriteFrame(sprite: cc.Sprite, url: string, bundleName?: string): Promise<void> {
	
// 			return new Promise(resolve => {
	
// 				this.loadRes(url, cc.SpriteFrame, bundleName).then(r => {
// 					if (r.err) console.log(r.err);
// 					if (sprite?.isValid) sprite.spriteFrame = r.asset;
// 					resolve();
// 				});
	
// 			});
	
// 		}

	
	
// 		protected onProgress(type: number, name: string, finish: number, total: number): void {
// 			const info: ProgressInfo = { name: name, total: total, finish: finish };
// 			this.eventTarget.emit(ResMgr.EventType.Progress, info);
// 		}
	
	
// 		public on(key: string, callback: (info?: ProgressInfo) => void, target?: any): void {
// 			this.eventTarget.on(key, callback, target);
// 		}
	
// 		public once(key: string, callback: (info?: ProgressInfo) => void, target?: any): void {
// 			this.eventTarget.once(key, callback, target);
// 		}
	
// 		public off(key: string, callback: (info?: ProgressInfo) => void, target: any): void {
// 			this.eventTarget.off(key, callback, target);
// 		}
	
// 		public targetOff(target: any): void {
// 			this.eventTarget.targetOff(target);
// 		}
	
// 		/**预加载资源 */
// 		public preloadByBundle(url,bundleName,assetType: typeof cc.Asset,onComplete?:Function) {
	
// 			let tmpBundle = cc.assetManager.getBundle(bundleName);
// 			if (tmpBundle) {
// 					tmpBundle.load(url, assetType,(err)=>{
// 						if(err){
// 							console.log("预加载本地报错,url:",url);
// 							return;
// 						}
// 						console.log(`本地已有资源,预加载${url}完成`);
// 						onComplete&&onComplete();
// 					});
// 			}else {
// 				let startTime = new Date().valueOf();
// 				cc.assetManager.loadBundle(bundleName, (err: Error, bundle: cc.AssetManager.Bundle) => {
// 					if (!err) {
// 							bundle.load(url, assetType,()=>{
// 								let endTime1 = new Date().valueOf();
// 								let preloadTime = endTime1- startTime;
// 								console.log(`预加载${url}完成,总耗时:${preloadTime}`);
// 								onComplete&&onComplete();
// 							});
// 					}
// 					else {
// 						onComplete&&onComplete();
// 						cc.log("preloadByBundle err", err);
// 					}
// 				});
// 			}
	
// 		}

// }
