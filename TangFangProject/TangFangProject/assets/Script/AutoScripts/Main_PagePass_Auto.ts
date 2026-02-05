
import ButtonPlus from "./../../TRFrameWork/Common/Components/ButtonPlus"

const {ccclass, property} = cc._decorator;
@ccclass
export default class Main_PagePass_Auto extends cc.Component {
	@property(cc.Node)
	charRoot: cc.Node = null;
	@property(ButtonPlus)
	btn_start: ButtonPlus = null;
	@property(ButtonPlus)
	btn_passAward: ButtonPlus = null;
	@property(ButtonPlus)
	btn_Boss: ButtonPlus = null;
	@property(ButtonPlus)
	btn_WorldBoss: ButtonPlus = null;
	@property(ButtonPlus)
	btn_TeamBoss: ButtonPlus = null;
	@property(ButtonPlus)
	btn_luckDraw: ButtonPlus = null;
	@property(ButtonPlus)
	btn_setting: ButtonPlus = null;
	@property(ButtonPlus)
	btn_7day: ButtonPlus = null;
	@property(ButtonPlus)
	btn_outline: ButtonPlus = null;
	@property(ButtonPlus)
	btn_DivineWeapon: ButtonPlus = null;
 
}