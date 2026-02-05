import { ShareInterface } from "../../../AdInterface";
import OpenBD from "./OpenBD";

class Options implements ShareParamBD
{
    channel: string;

    templateId: string;

    desc: string;

    title: string;

    imageUrl: string;

    query: string;

    extra: any;

    success: Function;

    fail: Function;

    complete: Function;
}

enum RecordState
{
    Free,
    Recording,
    Pause,
}

export default class ShareBD implements ShareInterface {

    public videoPath: string;

    private recorder: GameRecorderManagerBD;
    private env: BDAPI = window["tt"];
    private state: RecordState = RecordState.Free;
    private recordTime: number = 0;

    constructor()
    {
        this.recorder = this.env.getGameRecorderManager();
        this.recorder?.onError((ret)=>{ this.onError(ret); });
    }
   
    public startRecord(call?:()=>void)
    {
        if (this.state != RecordState.Free) return;

        this.state = RecordState.Recording;
        this.recorder?.onStart(()=>{
            console.log("录屏开始...");
            this.recordTime = new Date().getTime();
        });
        this.recorder?.onStop((ret)=>{
            if (ret) this.videoPath = ret.videoPath;
            this.recordTime = new Date().getTime() - this.recordTime;
            this.state = RecordState.Free;
            console.log("录屏完成", this.videoPath, this.recordTime);
            if(call)call();
        });
        this.recorder?.start({duration: 300});
    }

    public stopRecord()
    {
        if (this.state != RecordState.Recording) return;

        this.recorder?.onStop((ret)=>{
            if (ret) this.videoPath = ret.videoPath;
            this.recordTime = new Date().getTime() - this.recordTime;
            console.log("录屏完成", this.videoPath, this.recordTime);
        });
        this.state = RecordState.Free;
        this.recorder?.stop();
    }

    public pauseRecord()
    {
        if (this.state != RecordState.Recording) return;
        this.state = RecordState.Pause;
        this.recorder?.pause();
    }

    public resumeRecord()
    {
        if (this.state != RecordState.Pause) return;
        this.state = RecordState.Recording;
        this.recorder?.resume();
    }

    public shareRecordVideo(success?: Function, fail?: Function)
    {
        if (this.recordTime < 15000)
        {
            OpenBD.showTipAlert("分享失败", "录屏失败：录屏时长低于 15 秒");
            return;
        }
        this.shareVideo(this.videoPath, success, fail);
    }

    public shareVideo(path: string, success?: Function, fail?: Function)
    {
        let option = new Options();
        option.channel = "video";
        option.extra = { videoPath: path, withVideoId: true, hashtag_list: [OpenBD.gameName] };
        option.success = ()=>{
            OpenBD.showTipAlert("分享成功", "视频分享成功");
            if(success)success();
        };
        option.fail = (err)=>{
            if(fail)fail();
        };
        this.env.shareAppMessage(option);
    }

    public shareTemplate(templateId: string,action?: (result: boolean) => void ): void {
        let option = new Options();
        option.templateId = templateId;
        option.success = ()=>{
            if(action)action(true);
        };
        option.fail = (err)=>{
            if(action)action(false);
        }
        this.env.shareAppMessage(option);
    }
    
    public canShare(): boolean
    {
        return this.videoPath != null && this.videoPath != "";
    }

    getRecordState(): number {
        return this.state;
    }

    public getRecordTime():number{
        if(this.state == RecordState.Recording) return Date.now()- this.recordTime;
        return -1;
    }

    private onError(para: {errMsg: string})
    {
        console.log("录屏错误: ", para?.errMsg);
    }

}
