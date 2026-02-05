const { ccclass, property } = cc._decorator;

@ccclass
export default class MonsterHp extends cc.Component {

    @property(cc.Sprite)
    hpImg: cc.Sprite = null;
    // onLoad () {}

    // 血条参数
    @property(cc.Integer)
    maxHealth: number = 1000;

    @property(cc.Integer)
    healthPerBar: number = 200;

    protected _endLess: boolean = false;

    public initBar(totalHP: number, spaceHP: number) {
        this.maxHealth = totalHP;
        this.healthPerBar = spaceHP;
        this.initHealthBar();

        if (totalHP <= 0) {
            this._endLess = true;
        }
    }

    // update (dt) {}
    /**
     * 
     * @param progress 0-1
     */
    public setHpProgress(hp: number) {
        // console.log("progress", progress);
        let progress = hp / this.maxHealth;
        this.hpImg.fillRange = progress;
    }

    protected initHealthBar() {
        this.setHpProgress(this.maxHealth);
    }

    public reuse() {
    }
}
