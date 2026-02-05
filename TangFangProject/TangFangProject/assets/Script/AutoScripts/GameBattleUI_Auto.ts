
import ButtonPlus from "./../../TRFrameWork/Common/Components/ButtonPlus"

const { ccclass, property } = cc._decorator;
@ccclass
export default class GameBattleUI_Auto extends cc.Component {
	@property(cc.Node)
	top: cc.Node = null;
	@property(ButtonPlus)
	btn_pause: ButtonPlus = null;
	@property(cc.Label)
	txt_stt: cc.Label = null;
	@property(ButtonPlus)
	btn_allDrop: ButtonPlus = null;
	@property(cc.Node)
	icon_coin: cc.Node = null;
	@property(cc.Label)
	txt_coin: cc.Label = null;
	@property(ButtonPlus)
	btn_speedx2: ButtonPlus = null;
	@property(cc.Node)
	waveProgress: cc.Node = null;
	@property(cc.Label)
	txt_wave_his: cc.Label = null;
	@property(cc.Label)
	txt_physical_energy: cc.Label = null;
	@property(cc.Label)
	txt_physical_recover: cc.Label = null;
	@property(cc.Label)
	txt_title: cc.Label = null;
	@property(cc.Node)
	waveTips: cc.Node = null;
	@property(cc.Node)
	topLeft: cc.Node = null;
	@property(cc.Node)
	right: cc.Node = null;
	@property(cc.Node)
	bottom: cc.Node = null;
	@property(ButtonPlus)
	btn_Skill: ButtonPlus = null;
	@property(cc.Node)
	skillDjsNode: cc.Node = null;
	@property(ButtonPlus)
	btn_full_hp: ButtonPlus = null;
	@property(cc.Node)
	shopMain: cc.Node = null;
	@property(cc.Node)
	wapen_list: cc.Node = null;
	@property(ButtonPlus)
	btn_videoCoin: ButtonPlus = null;
	@property(cc.Label)
	txt_video_add: cc.Label = null;
	@property(cc.Node)
	DelUI: cc.Node = null;
	@property(ButtonPlus)
	btn_fight: ButtonPlus = null;
	@property(ButtonPlus)
	btn_getAll: ButtonPlus = null;
	@property(cc.RichText)
	txt_getAllTips: cc.RichText = null;
	@property(ButtonPlus)
	btn_draw: ButtonPlus = null;
	@property(cc.Label)
	txt_draw_price: cc.Label = null;
	@property(cc.Node)
	icon_coinNew: cc.Node = null;
	@property(cc.Label)
	txt_coinNew: cc.Label = null;
	@property(cc.Node)
	centerRoot: cc.Node = null;
	@property(cc.Node)
	bossImg: cc.Node = null;
	@property(cc.Node)
	moveRoot: cc.Node = null;
	@property(cc.Node)
	moveLine: cc.Node = null;
	@property(cc.Node)
	guideLayer: cc.Node = null;
	@property(cc.Layout)
	layout_monster: cc.Layout = null;
	@property(cc.Prefab)
	mstInfo: cc.Prefab = null;
	@property(ButtonPlus)
	btn_arrow: ButtonPlus = null;
	@property(cc.Layout)
	layout_mstInfo: cc.Layout = null;
	@property(cc.Label)
	showLab: cc.Label = null;
}