//可拖拽sprite frame组件

const { ccclass, property, menu, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.Sprite)
@menu("UI/SpriteFrame")
export default class SpriteFrame extends cc.Component {

	private _sprite: cc.Sprite;
	public get sprite(): cc.Sprite {
		if (!this._sprite) this._sprite = this.getComponent(cc.Sprite);
		return this._sprite;
	}

	@property([cc.SpriteFrame])
	frames: Array<cc.SpriteFrame> = [];

	public setFrame(spName: string) {
		let frame = this.frames.find((t) => { return t.name == spName });
		if (frame) {
			this.node.getComponent(cc.Sprite).spriteFrame = frame;
		}
	}

	public setFrameByIndex(index: number) {
		if (index >= this.frames.length) index = this.frames.length - 1;
		if (index < 0) return;
		this.node.getComponent(cc.Sprite).spriteFrame = this.frames[index];
	}

	public updateSize()
	{
		this.node.width = this.node.getComponent(cc.Sprite).spriteFrame.getRect().width;
		this.node.height = this.node.getComponent(cc.Sprite).spriteFrame.getRect().height;
	}


	public get frameIndex(): number {
		return this.frames.indexOf(this.sprite.spriteFrame);
	}
}
