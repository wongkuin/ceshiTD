import { GroupInterface, LoginInterface } from "../../../AdInterface";

export default class GroupBD implements GroupInterface {


    private env: BDAPI = window["tt"];
    private login: LoginInterface;

    constructor(login: LoginInterface) {
        this.login = login;
    }

    public get isSupport(): boolean {
        if (!this.env.joinGroup) return false;
        const info = this.env.getSystemInfoSync(true);
        console.log("appName ", info.appName);
        return info.appName == "Douyin" || info.appName == "douyin_lite";
    }

    joinGroup(id: string, complete?: (ret: boolean) => void): void {

        if (!this.env.joinGroup) return;

        const action = () => {

            this.env.joinGroup({
                groupid: id,
                success: () => {
                    if (complete) complete(true);
                },
                fail: ret => {
                    console.log("加入群聊失败", ret.errMsg);
                    if (complete) complete(false);
                }
            });
        };

        if (this.login.isLogin()) action();
        else this.login.login(action);
    }
}
