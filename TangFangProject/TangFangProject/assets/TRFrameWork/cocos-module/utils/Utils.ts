//常用工具类

import ConfigMgr from "../../../Script/config/ConfigMgr";
import { DrawSubData, DrawMainData } from "../../../Script/config/DataDef";
import GameUserData from "../../../Script/Data/GameUserData";

import Random from "./Random";

export default class Utils {

	/**
	 * 获取当前毫秒级时间
	 * @returns 
	 */
	public static getNowMilliTime() {
		return Date.now();
	}

	public static getNowSecondTime() {
		return Math.floor(this.getNowMilliTime() / 1000);
	}

	/***
	 * 判断同一天
	 * day1 时间戳
	 * day2 时间戳
	 */
	public static isSameDay(day1: number, day2: number): boolean {
		let date1 = new Date(day1);
		let date2 = new Date(day2);

		return (
			date1.getFullYear() === date2.getFullYear() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getDate() === date2.getDate()
		);
	}

	public formatDateToYYYYMMDD(time: number): string {
		const date = new Date(time);
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始计数，所以需要+1
		const day = date.getDate().toString().padStart(2, '0');
		return `${year}${month}${day}`;
	}

	/**
	 * @param timeNum 秒
	 * @param needT 展示小时
	 * @param needM 展示分钟
	 * @param needS 展示秒
	 * return 返回 hh:mm:ss 格式 如 3600秒返回 01:00:00
	 * */
	static getTimeFormatClock(timeNum: number, needT: boolean = true, needM: boolean = true, needS: boolean = true): string {
		const m = 60 * 1;
		const t = 60 * m;
		let str = '';
		if (needT) {
			//时
			let strT = Math.floor(timeNum / t);
			if (strT > 0) {
				str += `${String(strT).padStart(2, '0')}:`;
			} else {
				str += `00:`;
			}
		}
		if (needM) {
			//分
			let strM = Math.floor(timeNum % t / m);
			str += `${String(strM).padStart(2, '0')}`;
		}
		//秒
		if (needS) {
			str += `:${String(timeNum % m).padStart(2, '0')}`;
		}
		return str;

	}
	/**
 * 将秒数转换为 "x天y时z分j秒" 的格式
 * @param seconds 总秒数
 * @returns 格式化后的时间字符串
 */
	static formatSecondsToDHMS(seconds: number): string {
		if (seconds < 0) {
			throw new Error("秒数不能为负数");
		}

		// 定义时间常量
		const minute = 60;
		const hour = 60 * minute;
		const day = 24 * hour;

		// 计算各个时间单位
		const days = Math.floor(seconds / day);
		const hours = Math.floor((seconds % day) / hour);
		const minutes = Math.floor((seconds % hour) / minute);
		const remainingSeconds = seconds % minute;

		// 构建结果字符串
		let result = "";

		if (days > 0) {
			result += `${days}天`;
		}

		if (hours > 0 || days > 0) {
			// 如果有天数，即使小时为0也显示
			result += `${hours}时`;
		}

		if (minutes > 0 || hours > 0 || days > 0) {
			// 如果有天数或小时，即使分钟为0也显示
			result += `${minutes}分`;
		}

		// 总是显示秒数
		result += `${remainingSeconds}秒`;

		return result;
	}

	/**
	 * 求圆周上等分点的坐标
	 * @param r 半径
	 * @param ox 圆心坐标
	 * @param oy 
	 * @param count 等分个数
	 */
	public static getPoint(r: number, ox: number, oy: number, count: number): Array<cc.Vec2> {
		let point = [];
		let radians = (Math.PI / 180) * Math.round(360 / count);//弧度
		for (let i = 0; i < count; i++) {
			let x = ox + r * Math.sin(radians * i);
			let y = oy + r * Math.cos(radians * i);
			point.push(new cc.Vec2(x, y));
		}
		return point;
	}
	/**获取两点距离 */
	public static vt2distance(x1: number, y1: number, x2: number, y2: number) {
		return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
	}

	public static searchStr(str: string, key: string): boolean {
		return (str.indexOf(key) >= 0);
	}

	/**
	 * 遍历所有元素查找节点,适用于不知道节点层级的时候
	 */
	public static findChild(name: string, root: cc.Node): cc.Node {
		if (!root) return null;
		for (let i = 0; i < root.childrenCount; i++) {
			if (root.children[i].name == name) return root.children[i];
		}

		for (let i = 0; i < root.childrenCount; i++) {
			const node = this.findChild(name, root.children[i]);
			if (node) return node;
		}

		return null;
	}

	public static getCenterVec2(a: cc.Vec2, b: cc.Vec2): cc.Vec2 {
		let vect = cc.v2();
		cc.Vec2.add(vect, a, b);
		vect.mulSelf(0.5);
		return vect;
	}

	private static shakeTween: cc.Tween;
	public static shake(node: cc.Node, delay: number = 0.1, times: number = 1, amplitude: number = 5) {
		if (node.getNumberOfRunningActions() != 0) return;
		if (this.shakeTween) this.shakeTween.stop();
		this.shakeTween = cc.tween(node)
			.repeat(times,
				cc.tween()
					.by(delay, { x: amplitude, y: amplitude })
					.by(delay, { x: amplitude, y: -amplitude })
					.by(delay, { x: -amplitude, y: -amplitude })
					.by(delay, { x: -amplitude, y: amplitude })
					.by(delay, { x: 0, y: 0 })
			)
			.start();
	}

	public static fadeIn(node: cc.Node, duration: number = 0.2) {
		node.opacity = 0;
		node.runAction(cc.fadeIn(duration));
	}

	public static getXdistance(pos1: cc.Vec2 | cc.Vec3, pos2: cc.Vec2 | cc.Vec3): number {
		return Math.abs(pos1.x - pos2.x);
	}

	public static isNewDay(timestamp: number): boolean {
		if (timestamp == null) timestamp = 0;
		let date = new Date(timestamp);
		let curDate = new Date();
		cc.log(date.getFullYear(), date.getMonth(), date.getDate());
		if (date.getFullYear() < curDate.getFullYear() || date.getMonth() < curDate.getMonth() || date.getDate() < curDate.getDate()) return true;
		return false;
	}

	//将目标角度转换成0到360
	public static transAngle(angle: number): number {
		return (360 + Math.floor(angle) % 360) % 360;
	}

	public static updateNumberAnim(originNum: number, objNum: number, lbl: cc.Label, duration: number = 1, callFunc?: Function, caller?: any) {
		let obj = { num: 0 };
		let callback = () => {
			if (callFunc) callFunc.call(caller);
		};
		obj.num = originNum;
		lbl.string = obj.num.toString();
		cc.tween(obj)
			.to(duration, { num: objNum }, {
				progress: (start, end, current, t) => {
					if (!lbl || !lbl.isValid) return;
					lbl.string = Math.ceil(start + (end - start) * t).toString();
					return start + (end - start) * t;
				}
			})
			.call(callback)
			.start();
	}

	public static isRemoteUrl(url: string): boolean {
		return url.indexOf("http://") == 0 || url.indexOf("https://") == 0;
	}

	//处理超大数的单位转换
	protected static readonly units: Array<string> = [
		"", "K", "M", "B", "T", "aa", "ab", "ac", "ad", "ae", "af", "ag", "ah", "ai", "aj", "ak", "al", "am", "an"
	];
	public static processNumFormat(num: number): string {
		let bit = 0;
		let numStr = Math.floor(num).toString();
		if (numStr.indexOf('e') >= 0) {
			numStr = numStr.substr(numStr.indexOf('e') + 2);
			bit = Number(numStr) + 1;
		}
		else {
			bit = numStr.length;
		}

		if (bit < 5) return this.fixNum(num, 2);

		let unitIndex = Math.floor((bit - 1) / 3);
		num = num / Math.pow(1000, unitIndex);
		// console.log("processNumFormat", num);
		return this.fixNum(num, 2) + (this.units[unitIndex] != null ? this.units[unitIndex] : this.units[this.units.length - 1]);
	}

	//根据传入的bit保留多少位小数且不用0填充
	/**
	 * @deprecated 已弃用，请使用NumberUtils.fixNum
	 */
	public static fixNum(num: number, bit: number): string {
		let floatNums = this.getNumFloatBit(num);
		// console.log(bit, floatNums, num.toFixed(2));
		if (bit < floatNums) {
			let t = Math.pow(10, bit);
			num = Math.floor(num * t) / t;
			return num.toString();
		}
		return num.toString();
	}

	//获取小数位个数
	/**
	 * @deprecated 已弃用，请使用NumberUtils.getFloatBit
	 */
	public static getNumFloatBit(num: number): number {
		let bit = 0;
		let floatNums = num.toString().split('.')[1];
		if (floatNums) bit = floatNums.length;
		return bit;
	}

	public static pauseAllAnims() {
		let anims: Array<cc.Animation> = cc.director.getScene().getComponentsInChildren(cc.Animation);
		anims.forEach((anim) => {
			anim.pause();
		});
	}

	public static resumeAllAnims() {
		let anims: Array<cc.Animation> = cc.director.getScene().getComponentsInChildren(cc.Animation);
		anims.forEach((anim) => {
			anim.resume();
		});
	}

	//仅适用于凸多边形
	public static sortPolygonPoints(points: Array<cc.Vec2>) {
		if (!points || points.length == 0) return;

		let center = cc.v2();
		let x = 0;
		let y = 0;
		for (let i = 0; i < points.length; i++) {
			x += points[i].x;
			y += points[i].y;
		}
		center.x = Math.floor(x / points.length);
		center.y = Math.floor(y / points.length);
		for (let i = 0; i < points.length - 1; i++) {
			for (let j = 0; j < points.length - i - 1; j++) {
				if (this.polyComparePoints(points[j], points[j + 1], center)) {
					let tmp = points[j];
					points[j] = points[j + 1];
					points[j + 1] = tmp;
				}
			}
		}
	}

	private static polyComparePoints(p1: cc.Vec2, p2: cc.Vec2, center: cc.Vec2) {
		if (p1.x >= 0 && p2.x < 0) return true;
		else if (p1.x == 0 && p2.x == 0) return p1.y > p2.y;

		let det = (p1.x - center.x) * (p2.y - center.y) - (p2.x - center.x) * (p1.y - center.y);
		if (det < 0) return true;
		if (det > 0) return false;

		let d1 = (p1.x - center.x) * (p1.x - center.x) + (p1.y - center.y) * (p1.y - center.y);
		let d2 = (p2.x - center.x) * (p2.x - center.x) + (p2.y - center.y) * (p2.y - center.y);
		return d1 > d2;
	}

	public static deepCopy<T extends {}, U>(target: T, source: U): T & U {
		return Object.assign(target, source);
	}

	public static lookAt(node: cc.Node, direction: cc.Vec2, fixedAngle: number = 0) {
		if (direction.equals(cc.Vec2.ZERO)) return;
		let angle = cc.v2(direction).signAngle(cc.v2(1, 0));
		node.angle = -cc.misc.radiansToDegrees(angle) + fixedAngle;
	}

	//判断线段相交及返回交点
	public static interectionPoint(A: cc.Vec2, B: cc.Vec2, C: cc.Vec2, D: cc.Vec2, interPoint?: cc.Vec2): boolean {
		let area_abc = (A.x - C.x) * (B.y - C.y) - (A.y - C.y) * (B.x - C.x);
		let area_abd = (A.x - D.x) * (B.y - D.y) - (A.y - D.y) * (B.x - D.x);
		if (area_abc * area_abd >= 0) return false;

		let area_cda = (C.x - A.x) * (D.y - A.y) - (C.y - A.y) * (D.x - A.x);
		let area_cdb = area_cda + area_abc - area_abd;
		if (area_cda * area_cdb >= 0) return false;

		if (interPoint) {
			let t = area_cda / (area_abd - area_abc);
			let dx = t * (B.x - A.x);
			let dy = t * (B.y - A.y);
			interPoint.x = dx + A.x;
			interPoint.y = dy + A.y;
		}
		return true;
	}

	/** 判断两矩形是否相交 */
	public static rectIntersectsRect(node1: cc.Node, node2: cc.Node): boolean {
		let collider1 = node1.getComponent(cc.BoxCollider);
		let collider2 = node2.getComponent(cc.BoxCollider);
		let world1;
		let world2;
		node1.getWorldMatrix(world1);
		node2.getWorldMatrix(world2);
		let aabb1 = collider1.world.aabb;
		let aabb2 = collider2.world.aabb;
		let rect1;
		let rect2;
		aabb1.transformMat4(rect1, world1);
		aabb2.transformMat4(rect2, world2);

		let isIntersect = rect1.intersects(rect2);
		return isIntersect;
	}

	public static isCircleRectangleIntersect(circleX: number, circleY: number, circleRadius: number, rectX: number, rectY: number, rectWidth: number, rectHeight: number): boolean {
		// 计算圆心到矩形的最近点的距离
		const dx = Math.max(Math.abs(circleX - rectX) - rectWidth / 2, 0);
		const dy = Math.max(Math.abs(circleY - rectY) - rectHeight / 2, 0);

		// 如果距离小于圆的半径，则相交
		return (dx * dx + dy * dy) < (circleRadius * circleRadius);
	}


	//模拟碰撞推挤效果
	public static CollisionRejection(node: cc.Node, target: cc.Node, fix: number = 0.1, specifyFixedNode?: cc.Node) {
		let rect = node.getBoundingBoxToWorld();
		let targetRect = target.getBoundingBoxToWorld();

		if (specifyFixedNode) node = specifyFixedNode;

		if (rect.xMin <= targetRect.xMax && rect.xMax >= targetRect.xMax) {
			node.x += fix;
		}
		else if (rect.xMax >= targetRect.xMin && rect.xMin <= targetRect.xMin) {
			node.x -= fix;
		}

		if (rect.yMin <= targetRect.yMax && rect.yMax >= targetRect.yMax) {
			node.y += fix;
		}
		else if (rect.yMax >= targetRect.yMin && rect.yMin <= targetRect.yMin) {
			node.y -= fix;
		}
	}

	public static vecToAngle(vec: cc.Vec2): number {
		if (vec.equals(cc.Vec2.ZERO)) return;
		let radian = cc.v2(vec).signAngle(cc.v2(1, 0));//求方向向量和单位向量之间的弧度
		let degree = - cc.misc.radiansToDegrees(radian);//弧度转成角度

		return degree;
	}

	/**
	 * 设置parent, 相对坐标不变
	 * @param node 
	 * @param parent 
	 */
	public static setParent(node: cc.Node, parent: cc.Node): void {
		const pos = node.parent.convertToWorldSpaceAR(node.getPosition());
		node.parent = parent;
		node.setPosition(node.parent.convertToNodeSpaceAR(pos));
	}

	public static setTargetPosition(obj: cc.Node, target: cc.Node, pos: cc.Vec2) {
		let tPos = target.parent.convertToWorldSpaceAR(pos);
		tPos = obj.parent.convertToNodeSpaceAR(tPos);
		obj.setPosition(tPos);
	}

	public static accAdd(arg1: number, arg2: number) {
		var r1, r2, m;
		try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
		try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
		m = Math.pow(10, Math.max(r1, r2))
		return (arg1 * m + arg2 * m) / m
	}

	public static reverseVec(vec: cc.Vec2) {
		if (!vec) return;
		return cc.v2(-vec.x, -vec.y);
	}

	public static rotateDirection(points: Array<cc.Vec2>) {
		if (!points || points.length < 3) return 1;

		let clockwise = 0;
		let anticlockwise = 0;
		for (let i = 0; i < points.length - 2; i++) {
			let t = this.area(points[i], points[i + 1], points[i + 2]);
			if (t == 1)
				clockwise++;
			else if (t == -1)
				anticlockwise++;
		}
		return clockwise >= anticlockwise ? -1 : 1;
	}

	private static area(a: cc.Vec2, b: cc.Vec2, c: cc.Vec2) {
		let triangle_area = a.x * b.y - a.y * b.x + a.y * c.x - a.x * c.y + b.x * c.y - c.x * b.y;
		if (triangle_area < 0) return -1;
		else if (triangle_area > 0) return 1;
		return 0;
	}


	public static vector2ToAngle(vec: cc.Vec2) {
		const bulletAngle = Math.atan2(vec.y, vec.x);
		// 更新炮弹角度
		return cc.misc.radiansToDegrees(bulletAngle);
	}


	/**向量转角度向上90度为参考 */
	// public static vectorsToDegress(dirVec: cc.Vec2) {
	// 	let comVec = cc.v2(0, 1);    // 水平向右的对比向量
	// 	let radian = dirVec.signAngle(comVec);    // 求方向向量与对比向量间的弧度
	// 	let degree = cc.misc.radiansToDegrees(radian);    // 将弧度转换为角度
	// 	return degree;
	// }

	// /**向量转角度向下90度为参考 */
	// public static vectorsToDegress2(dirVec: cc.Vec2) {
	// 	let comVec = cc.v2(0, -1);    // 水平向右的对比向量
	// 	let radian = dirVec.signAngle(comVec);    // 求方向向量与对比向量间的弧度
	// 	let degree = cc.misc.radiansToDegrees(radian);    // 将弧度转换为角度
	// 	return degree;
	// }

	/**角度转方向向量,欧拉角 */
	public static DegressToVector(deg: number) {
		let comVec = cc.v2(0, 1);    // 水平向右的对比向量

		let vector = cc.v2(1 * Math.cos(deg), 1 * Math.sin(deg));    // 求方向向量与对比向量间的弧度

		return comVec;
	}


	/** 弧度制转换为角度值 */
	public static getAngle(radian: number): number {
		return 180 * radian / Math.PI;
	}

	/** 角度值转换为弧度制 */
	public static getRadian(angle: number): number {
		return angle / 180 * Math.PI;
	}

	/** 求一个向量的反射向量3d */
	public static reflect(inVec: cc.Vec3, N: cc.Vec3) {
		return inVec.sub((N.mul(2 * cc.Vec3.dot(inVec, N))));
	}

	public static reflect_v2(inVec: cc.Vec2, N: cc.Vec2) {
		return inVec.sub(N.mul(2 * cc.Vec2.dot(inVec, N)));
	}

	public static convertAngle(moveDir: cc.Vec2 | cc.Vec3, changeAngle: number): cc.Vec2 {
		/**改变的弧度 */
		let radia = cc.misc.degreesToRadians(changeAngle);
		let v2 = cc.v2();
		v2.x = moveDir.x * Math.cos(radia) - moveDir.y * Math.sin(radia);
		v2.y = moveDir.x * Math.sin(radia) + moveDir.y * Math.cos(radia);
		v2.normalizeSelf();
		return v2;
	}

	/**
	 * 从区间里取值 [最小值,最大值]
	 * */
	static getRandNumberOfArrayTwo(array: number[], isfloor: boolean = false) {
		if (array.length != 2 || array[0] > array[1]) {
			if (array.length == 1) return array[0]
			console.error('#40 data_control 错误的区间', array);
			return NaN;
		}
		if (array[0] == array[1]) return array[0]
		let num = array[0] + Math.random() * (array[1] - array[0])
		if (isfloor) num = Math.floor(num)
		return num;
	}
	/**
	 *  在传入的对象组中随机出一个固定长度的不重复的对象组
	 * @param array 对象组
	 * @param length 目标长度
	 * @param quitIndex 排除位置
	 * @returns 
	 */
	static getRandomObjOfArray<T>(array: T[], length = 1, quitIndex: number = -1): T[] {
		let resutlList: T[] = [];
		if (!array || array.length == 0) return resutlList;
		let tempList = array.concat();
		if (quitIndex != -1) tempList.splice(quitIndex, 1)
		while (1) {
			let index = Math.floor(Math.random() * tempList.length);
			resutlList.push(tempList[index]);
			tempList.splice(index, 1);
			if (resutlList.length >= length) break;
		}
		return resutlList;
	}
	/**
	 * 通过一组权重获取数组获取随机下标
	 * @param weights 权重数组
	 */
	public static getRandDataOfWeightObjectList<T extends IWeightObject>(objList: T[]): { data: T, pos: number } {
		//
		let weights: number[] = [];
		objList.forEach(obj => {
			weights.push(obj.weight);
		});
		const i = this.getRandIPosByWeights(weights);
		return { pos: i, data: objList[i] };
	}

	/**
	 * 通过一组权重获取数组获取随机下标
	 * @param weights 权重数组
	 */
	public static getRandIPosByWeights(weights: number[]): number {
		//
		const weightSum = this.sum(weights);
		let randSum = Math.random() * weightSum;
		//
		for (let i = 0; i < weights.length; i++) {
			randSum -= weights[i];
			if (randSum <= 0) {
				return i;
			}
		}
		console.error('#114 data_control 不可能的错误', weights);
		return NaN;
	}

	/**
	 * 求和
	 * */
	static sum(array: number[]) {
		let sumValue = 0;
		for (let num of array) {
			sumValue += num;
		}
		return sumValue;
	}


	/**
	* sprite or laber 置灰&还原
	*/
	public static setSpGray(sprite: cc.Sprite | cc.Label, isGray: boolean) {
		//内建材质
		let material: cc.Material = null
		if (isGray) {
			material = cc.Material.getBuiltinMaterial('2d-gray-sprite')
		} else {
			material = cc.Material.getBuiltinMaterial('2d-sprite')
		}
		sprite.setMaterial(0, material);
	}

	/**节点包括节点下所有sprite、lab全部置灰和还原 */
	public static setAllChildrenSpGray(nodeRoot: cc.Node, isGray: boolean) {
		var mRoot = nodeRoot;
		if (mRoot == null) {
			return null;
		}
		var childNum = mRoot.childrenCount;
		var tChildList = mRoot.children;
		let lab = mRoot.getComponent(cc.Label);
		let sp = mRoot.getComponent(cc.Sprite);
		if (lab) {
			this.setSpGray(lab, isGray);
		}

		if (sp) {
			this.setSpGray(sp, isGray);
		}

		for (let index = 0; index < childNum; index++) {
			let tRootNode = tChildList[index];
			if (tRootNode) {
				this.setAllChildrenSpGray(tRootNode, isGray);

			}
		}
	}


	/**
   * 
   * @param name 目标子节点名字
   * @param NodeRoot 父节点
   * @returns 父节点下第一个name名字的节点,层级高的会优先,没找到返回null
   */
	public static getWidget(name: string, NodeRoot: cc.Node): cc.Node {
		var mRoot = NodeRoot;
		var mName = name;

		if (mRoot == null) {
			return null;
		}
		var childNum = mRoot.childrenCount;
		var tChildList = mRoot.children;
		if (mRoot.name === mName) {
			return mRoot;
		} else {
			for (let index = 0; index < childNum; index++) {
				let tRootNode = tChildList[index];
				if (tRootNode) {
					var target = this.getWidget(mName, tRootNode);
					if (target) {
						return target;
					}
				}
			}
			return null;
		}
	}


	/**
	* 通用的点击时间监听函数
	* @param buttonNode //button的node
	* @param target
	* @param callBack
	*/
	public static addClickEvent(buttonNode: any, callBack: any, target: any, cdtime: number = 500, notFastClick: boolean = true) {

		//避免重复注册执行多次回调
		buttonNode.off('click');
		buttonNode.on('click', function (touchMsg) {
			//    let scene =  cc.director.getScene();
			//   //子游戏不需要点击音效,先做区别判断;
			//    if(scene.name!="Chatai"&&scene.name!="AB"){
			//         SoundPreloadMgr.getInsteance().playSound("anniu");
			//    } 

			if (notFastClick !== false) {
				let time = cdtime
				if (buttonNode.ETime) {
					if ((new Date()).valueOf() - buttonNode.ETime < time) {
						return true;
					} else {
						buttonNode.ETime = (new Date()).valueOf()
						callBack.call(target, buttonNode, touchMsg)
					}
				} else {
					buttonNode.ETime = (new Date()).valueOf()
					callBack.call(target, buttonNode, touchMsg)
				}
			} else {
				callBack.call(target, buttonNode, touchMsg)
			}
		}, target);
	}
	/**
	 * 按钮停止播放通用音效
	 */
	public static stopCommonBtnSound(node: cc.Node) {
		let btnNode: any = node;
		btnNode.stopBtnSound = true;
	}

	// 格式化时间
	public static formatDateToYYYYMMDD(date: Date): string {
		const year = date.getFullYear().toString();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		return `${year}${month}${day}`;
	}
	// 读表获取抽奖结果
	// static getDataList(type, num): {itemID:number,num:number}[] {
	// 	let list: {itemID:number,num:number}[] = []
	// 	for (let i = 0; i < num; i++) {
	// 		let data = this.calcReward(type);
	// 		list.push({ itemID: data.itemId, num: data.itemValue });
	// 	}
	// 	return list;
	// }

	// /**一份奖励 */
	// static calcReward(id, func?: Function): DrawSubData {
	// 	let mainData = ConfigMgr.getInstance().getAll(DrawMainData).filter((data) => {
	// 		return data.mainDrawID == id;
	// 	})

	// 	let weightList = this.getWeightList(mainData);
	// 	let lotteryId = Utils.getRandDataOfWeightObjectList(weightList);
	// 	let subDrawID = ConfigMgr.getInstance().getById(lotteryId.data.id, DrawMainData).subDrawID;
	// 	let curChapterId = GameUserData.getInstance().curChapterId;
	// 	let SubData = ConfigMgr.getInstance().getAll(DrawSubData).filter((data) => {
	// 		//let itemId= data.itemId;
	// 		//let itemData = ConfigMgr.getInstance().getById(itemId,ItemsData);
	// 		// let isGet = true;
	// 		// if(itemData.type==1&&!GameFruitData.getInstance().getFruitById(itemData.value1)){
	// 		// 	isGet = false;
	// 		// }
	// 		// if (func) {
	// 		// 	return func(data)&&isGet;
	// 		// } else {
	// 			return (data.subDrawID == subDrawID);
	// 	//	return (data.subDrawID == subDrawID && curChapterId >= data.chapterMin && curChapterId <= data.chapterMax);
	// 	})
	// 	let rewardId = Utils.getRandDataOfWeightObjectList(this.getWeightSubList(SubData)).data.id;
	// 	let rewardData = ConfigMgr.getInstance().getById(rewardId, DrawSubData);
	// 	return rewardData;

	// }

	// private static getWeightList(list: DrawMainData[]): Array<{ id: number, weight: number }> {
	// 	var arr = [];
	// 	for (var i: number = 0; i < list.length; i++) {
	// 		var obj = { id: list[i].id, weight: list[i].weight };
	// 		arr.push(obj);
	// 	}
	// 	return arr;
	// }


	// private static getWeightSubList(list: DrawSubData[]): Array<{ id: number, weight: number }> {
	// 	var arr = [];
	// 	for (var i: number = 0; i < list.length; i++) {
	// 		var obj = { id: list[i].id, weight: list[i].weight };
	// 		arr.push(obj);
	// 	}
	// 	return arr;
	// }

	/**
	 * 在圆环内随机生成点
	 * @param innerRadius 内圆半径
	 * @param outerRadius 外圆半径
	 * @param startAngle 起始角度（度）
	 * @param endAngle 结束角度（度）
	 * @returns 随机点的坐标
	*/
	public static generateUniformPointInRing(innerRadius: number, outerRadius: number, startAngle: number = 45, endAngle: number = 90): cc.Vec2 {

		const startRad = cc.misc.degreesToRadians(startAngle);
		const endRad = cc.misc.degreesToRadians(endAngle);

		// 使用均匀分布的角度
		const randomAngle = Math.random() * (endRad - startRad) + startRad;

		// 使用平方根确保面积均匀分布
		const randomRadius = Math.sqrt(
			Math.random() * (outerRadius * outerRadius - innerRadius * innerRadius) + innerRadius * innerRadius
		);

		return cc.v2(
			randomRadius * Math.cos(randomAngle),
			randomRadius * Math.sin(randomAngle)
		);
	}

	/**
	 * 
	 * @param lab 	目标Label组件
	 * @param text  显示的文本
	 * @param duration  总持续时间（秒）
	 * @param dropHeight  下落高度
	 * @param bounceHeight  弹跳高度
	 * @param bounceDuration  弹跳持续时间
	 * @param staggerDelay  每个字之间的延迟
	 * @param useRandomDrop 是否使用随机下落
	 * @param randomRange 随机范围
	 */
	public static showLabEffect(targetLabel: cc.Label, text: string, duration: number = 2,
		dropHeight: number = 80, bounceHeight: number = 0, bounceDuration: number = 0,
		staggerDelay: number = 0.05, useRandomDrop: boolean = false, randomRange: number = 50) {
		if (!targetLabel || !text || !text.length) return;
		let _originalPosition: cc.Vec3 = new cc.Vec3();
		let _charNodes: cc.Node[] = [];
		let _isPlaying: boolean = false;
		_originalPosition = targetLabel.node.position.clone();

		for (const charNode of _charNodes) {
			charNode.destroy();
		}
		_charNodes = [];

		// 隐藏原始文本
		targetLabel.string = '';
		targetLabel.node.active = false;

		// 创建每个字符的节点
		const chars = text.split('');
		const parent = targetLabel.node.parent;
		const labelPos = targetLabel.node.position;
		const labelWidth = targetLabel.node.width || 0;

		// 计算总宽度和起始位置
		const totalWidth = chars.length * targetLabel.fontSize; // 假设每个字宽40
		const startX = labelPos.x - totalWidth / 2;

		for (let i = 0; i < chars.length; i++) {
			// 创建字符节点
			const charNode = new cc.Node(`char_${i}`);
			// charNode.layer = this.targetLabel.node.layer;

			// 添加Label组件
			const charLabel = charNode.addComponent(cc.Label);
			charLabel.string = chars[i];
			charLabel.fontSize = targetLabel.fontSize;
			charLabel.node.color = targetLabel.node.color;
			charLabel.lineHeight = targetLabel.lineHeight;

			// 设置位置（隐藏在上方）
			const xPos = startX + i * (targetLabel.fontSize - 2);
			const startY = labelPos.y + dropHeight;

			charNode.setPosition(xPos, startY);
			charNode.setScale(1, 1);
			charNode.active = false;

			// 添加到场景
			if (parent) {
				parent.addChild(charNode);
			}

			_charNodes.push(charNode);
		}

		// 开始下落动画
		const finalY = targetLabel.node.position.y;
		for (let i = 0; i < _charNodes.length; i++) {
			const charNode = _charNodes[i];
			charNode.active = true;
			// 计算最终位置
			let finalX = charNode.position.x;
			if (useRandomDrop) {
				finalX += (Math.random() - 0.5) * randomRange;
			}

			// 下落动画
			cc.tween(charNode)
				.delay(i * staggerDelay)  // 每个字延迟出现
				.to(0.5, {
					position: cc.v3(finalX, finalY + bounceHeight, 0)
				},{
						easing: 'quadIn'  // 先快后慢
				})
				// .to(bounceDuration, {
				// 	position: cc.v3(finalX, finalY, 0)
				// })//, {
				// easing: 'bounceOut'  // 弹跳效果
				// }
				.call(() => {
					// 最后一个字完成后触发回调
					if (i === _charNodes.length - 1) {
						// 延迟显示原始文本
						setTimeout(() => {
							for (const charNode of _charNodes) {
								charNode.destroy();
							}
							_charNodes = [];

							targetLabel.string = text;
							targetLabel.node.active = true;

							// 可选：添加一个缩放效果
							cc.tween(targetLabel.node)
								.set({ scale: 1.2 })
								.to(0.2, { scale: 1 })
								.start();
						}, 600);
					}
				})
				.start();
		}
	}
}



export interface IWeightObject {
	weight: number;
}