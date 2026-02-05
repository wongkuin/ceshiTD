

const { ccclass, property } = cc._decorator;

@ccclass
export default class StarLv extends cc.Component {

    @property([cc.SpriteFrame])
    starFrames: cc.SpriteFrame[] = []

    @property([cc.Sprite])
    star: cc.Sprite[] = []


    start() {
    }

    setStarLv(lv: number) {
        if (lv < 0) {
            // lv = 0;
            for (const element of this.star) {
                element.node.active = false;
            }
            return;
        }
        this.setLVIdx(lv, Math.floor(lv / 3))
    }

    protected setLVIdx(lv: number, idx: number) {
        for (const element of this.star) {
            element.node.active = true;
        }

        lv = lv % 3;
        if ((idx == this.starFrames.length - 1 && lv > 0) || idx >= this.starFrames.length) {
            idx = this.starFrames.length - 1;
            lv = 0;
        }

        if (lv == 1) {
            this.star[0].spriteFrame = this.starFrames[idx + 1]
            this.star[1].spriteFrame = this.starFrames[idx]
            this.star[2].spriteFrame = this.starFrames[idx]

        } else if (lv == 2) {
            this.star[0].spriteFrame = this.starFrames[idx + 1]
            this.star[1].spriteFrame = this.starFrames[idx + 1]
            this.star[2].spriteFrame = this.starFrames[idx]
        } else if (lv == 0) {
            this.star[0].spriteFrame = this.starFrames[idx]
            this.star[1].spriteFrame = this.starFrames[idx]
            this.star[2].spriteFrame = this.starFrames[idx]
        } else {
            this.star[0].spriteFrame = this.starFrames[0]
            this.star[1].spriteFrame = this.starFrames[0]
            this.star[2].spriteFrame = this.starFrames[0]
        }
    }

    // update (dt) {}
}
