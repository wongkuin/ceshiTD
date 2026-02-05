
import ButtonPlus from "./../../TRFrameWork/Common/Components/ButtonPlus"

const {ccclass, property} = cc._decorator;
@ccclass
export default class UISceneMain_Auto extends cc.Component {
	@property(cc.Node)
	top: cc.Node = null;
	@property(ButtonPlus)
	jinbi: ButtonPlus = null;
	@property(ButtonPlus)
	linshi: ButtonPlus = null;
	@property(ButtonPlus)
	breakthrough: ButtonPlus = null;
	@property(ButtonPlus)
	adTicket: ButtonPlus = null;
	@property(ButtonPlus)
	btn_Store: ButtonPlus = null;
	@property(ButtonPlus)
	btn_talent: ButtonPlus = null;
	@property(ButtonPlus)
	btn_pass: ButtonPlus = null;
	@property(ButtonPlus)
	btn_equip: ButtonPlus = null;
	@property(ButtonPlus)
	btn_relic: ButtonPlus = null;
 
}