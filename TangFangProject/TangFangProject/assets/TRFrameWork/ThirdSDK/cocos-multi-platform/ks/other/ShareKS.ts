
class Options implements RecorderPublishOptionsKS
{
    callback: (ret: RecorderErrKs) => void;

    /**
     * 分享文案模板id
     */
    mouldId: string;

    /**
     * 待发布的视频片段 videoID 或 videoID 数组。如果不传该字段，则默认发布最后一次 start，stop 之间生成的视频数据。若录屏失败则不会生成videoID，发布录屏会失败
     */
    video: number | number[];

    /**
     * 发布录屏携带字段信息，支持格式为格式为aaa=bbb&ccc=ddd。通过发布的视频打开游戏可以通过ks.getLaunchOptionsSync的query字段获取，此时获取的是一个object
     */
    query: string;
}

enum RecordState
{
    Free,
    Recording,
    Pause,
}

export default class ShareKS implements ShareInterface {

    private videoId: number;
    private recorder: GameRecorderManagerKS;
    private env: KSAPI = window["ks"];
    private state: RecordState = RecordState.Free;
    private recordTime: number = 0;

    constructor()
    {
        this.recorder = this.env.getGameRecorder();
        // this.recorder?.onError((ret)=>{ this.onError(ret); });
        this.recorder.on("start", ()=>{
            this.recordTime = new Date().getTime();
            console.log("录屏开始...");
        });

        this.recorder.on("stop", (res)=>{
            if (res && res.videoID) this.videoId = res.videoID;
            this.recordTime = new Date().getTime() - this.recordTime;
            this.state = RecordState.Free;
            console.log("录屏结束", res?.videoID, this.recordTime);
        });

        this.recorder.on("error", (res)=>{
            this.state = RecordState.Free;
            console.log("录屏错误");
        });

        this.recorder.on("abort", ()=>{
            this.state = RecordState.Free;
            console.log("录屏中断");
        });
    }

    
 
    
    public startRecord()
    {
        if (this.state != RecordState.Free) return;
        this.state = RecordState.Recording;
        this.recorder?.start();
    }

    public stopRecord()
    {
        if (this.state != RecordState.Recording) return;
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

    public shareRecordVideo(success?: Function, fail?: Function, caller?: any)
    {
        // if (this.recordTime < 15000)
        // {
        //     OpenBD.showTipAlert("分享失败", "录屏失败：录屏时长低于 15 秒");
        //     return;
        // }
        // this.shareVideo(this.videoPath, success, fail, caller);
        let option = new Options();
        option.video = this.videoId;
        this.recorder?.publishVideo(option);
    }

    public shareTemplate(templateId: string, action?: (result: boolean) => void): void {
        
    }
    
    public shareVideo(path: string, success?: Function, fail?: Function, caller?: any)
    {
        // let option = new Options();
        // option.channel = "video";
        // option.extra = { videoPath: path, withVideoId: true, hashtag_list: [OpenBD.gameName] };
        // option.success = ()=>{
        //     OpenBD.showTipAlert("分享成功", "视频分享成功");
        //     success?.call(caller);
        // };
        // option.fail = (err)=>{
        //     fail?.call(caller, err);
        // };
        // this.env.shareAppMessage(option);
    }

    public canShare(): boolean
    {
        return this.videoId != null;
    }

    public getRecordState(): number {
        return this.state;
    }
    
    public getRecordTime(): number {
        return -1;
    }
}
