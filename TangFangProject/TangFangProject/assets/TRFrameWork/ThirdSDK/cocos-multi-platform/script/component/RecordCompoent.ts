import PlatformMgr from "../../PlatformManager";
import TipWarningComponent from "./TipWarningComponent";

enum RecordState
{
    Free,
    Recording,
    Pause,
}

const { ccclass, property, menu, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.Button)
@menu("UI/RecordCompoent")
export default class RecordCompoent extends cc.Component {

    @property
    autoTimeOut: number = 20;

    @property(cc.Node)
    startNode: cc.Node = null;

    @property(cc.Node)
    recordingNode: cc.Node = null;

    private state: RecordState = RecordState.Free;

    protected start() {
        this.record();
        this.scheduleOnce(this.autoStopRecord, this.autoTimeOut);
        this.node.on('click', () => {
            this.record();
        });
    }
    private startTime = 0;
    public record()
    {
        let state = PlatformMgr.instance.getRecordState();
        if (state != RecordState.Recording) {
            PlatformMgr.instance.startRecord();
            this.startTime = Date.now();
        } else {
            let t = Date.now();
            if((t - this.startTime)/1000 < this.autoTimeOut){
                TipWarningComponent.instance?.showTip("录屏时间小于15秒，将导致分享失败哦!");
                return
            } else {
                TipWarningComponent.instance?.showTip("游戏结束时，可分享此录频");
            }
            PlatformMgr.instance.stopRecord();
        }
        this.unschedule(this.autoStopRecord);
    }

    protected update(dt: number): void {
        let state = PlatformMgr.instance.getRecordState();
        if (state == this.state) return;
        this.state = state;
        cc.log("state", this.state);

        if (this.startNode)
            this.startNode.active = state == RecordState.Free;

        if (this.recordingNode)
            this.recordingNode.active = state == RecordState.Recording;
    }

    protected onDestroy(): void {
        PlatformMgr.instance.stopRecord();
    }

    private autoStopRecord()
    {
        PlatformMgr.instance.stopRecord();
    }

}
