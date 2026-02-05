import { LoginInterface } from "../../AdInterface";
import { BaiduAPI } from "../InterfaceBaidu";

export default class LoginBaidu implements LoginInterface {

    private env: BaiduAPI = window["swan"];

    private _isLogin = false;
    public isLogin(): boolean {
        return this._isLogin;
    }

    login(action: (data: any) => void): void {
        this.env?.login({
            success: (data) => {
                this._isLogin = true;
                if (action) action(data);
            },

            fail: (data) => {
                console.error("login error ", data);
                if (action) action(null);
            }

        });

    }

    getUserInfo(action: (userInfo: any) => void): void {
        throw new Error("Method not implemented.");
    }

    loginReturnCode(action: (data: any) => void): void {
        this.env?.login({
            success: (data) => {
                let codeInfo = Object.assign({}, { "code": data.code });
                if (action) action(codeInfo);
            },

            fail: (data) => {
                console.error("login error ", data);
                if (action) action(null);
            }
        });
    }
}
