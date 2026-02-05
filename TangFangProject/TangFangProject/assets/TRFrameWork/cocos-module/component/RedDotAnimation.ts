//可拖拽sprite frame组件

const { ccclass, property, menu, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.Sprite)
@menu("UI/RedDotAni")
export default class RedDotAni extends cc.Component {

	protected onLoad(): void {
		cc.Tween.stopAllByTarget(this.node);
		let scale = this.node.scale;
		cc.tween(this.node)
		.to(0.8, { scale: scale * 1.06 })
		.to(0.8, { scale: scale * 0.96 })
		.union()
		.repeatForever()
		.start()
	}
}
