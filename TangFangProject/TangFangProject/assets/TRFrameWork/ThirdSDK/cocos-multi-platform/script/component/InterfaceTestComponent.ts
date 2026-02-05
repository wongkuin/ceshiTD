import PlatformMgr from "../../PlatformManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class InterfaceTestComponent extends cc.Component {

    onClickStartRecord()
    {
        PlatformMgr.instance.startRecord();
    }

    onClickStopRecord()
    {
        PlatformMgr.instance.stopRecord();
    }

    onClickShare()
    {
        PlatformMgr.instance.shareVideo();
    }

}
