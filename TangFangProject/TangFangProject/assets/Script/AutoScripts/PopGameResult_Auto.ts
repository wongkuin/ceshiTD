
import ButtonPlus from "./../../TRFrameWork/Common/Components/ButtonPlus"

const {ccclass, property} = cc._decorator;
@ccclass
export default class PopGameResult_Auto extends cc.Component {
	@property(cc.Node)
	win: cc.Node = null;
	@property(cc.Node)
	failed: cc.Node = null;
	@property(cc.RichText)
	txt_tips: cc.RichText = null;
	@property(cc.Node)
	common: cc.Node = null;
	@property(cc.Label)
	txt_complete: cc.Label = null;
	@property(cc.Label)
	txt_MyHurt: cc.Label = null;
	@property(cc.Label)
	txt_tReward: cc.Label = null;
	@property(cc.Node)
	bounsRoot: cc.Node = null;
	@property(ButtonPlus)
	btn_failClose: ButtonPlus = null;
	@property(ButtonPlus)
	btn_failClosex2: ButtonPlus = null;
	@property(cc.Node)
	relive: cc.Node = null;
	@property(ButtonPlus)
	btn_giveup: ButtonPlus = null;
	@property(ButtonPlus)
	btn_relive: ButtonPlus = null;
	@property(cc.RichText)
	txt_reliveTips: cc.RichText = null;
 
}