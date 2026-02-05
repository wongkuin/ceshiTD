import { LoginInterface } from "../../../AdInterface";

export default class LoginBD implements LoginInterface {
    private env: BDAPI = window["tt"];

    private _isLogin = false;
    private _code: string = "";
    private _anonymousCode: string = "";

    public isLogin(): boolean {
        return this._isLogin;
    }

    login(action: (rData: any) => void): void {
        this.env.login({
            force: true,
            success: (data) => {
                this._isLogin = true;
                this._code = data.code;
                this._anonymousCode = data.anonymousCode;
                let codeInfo = Object.assign({}, { login_type: "douyin", "code": data.code, "anonymousCode": data.anonymousCode || "" });
                if (action) action(codeInfo);
            },
            fail: (data) => {
                console.error("login error ", data);
                if (action) action({});
            }

        });

    }

    getUserInfo(action: (rData: any) => void): void {
        this.env.getUserInfo({
            withCredentials: false,
            success: (res) => {
                let userInfo = Object.assign({}, res.userInfo);
                //TODO:用户ID自定义生成
                userInfo.id = Date.now();
                if (action) action(userInfo);
            },

            fail: (res) => {
                console.error("login error ", res);
                if (action) action(null);
            }
        });
    }

    loginReturnCode(action: (data: any) => void): void {
        let self = this;
        if (this.isLogin()) {
            action && action({ "code": self._code, "anonymousCode": self._anonymousCode });
        } else {

            this.login(() => {
                if (self.isLogin()) {
                    action && action({ "code": self._code, "anonymousCode": self._anonymousCode });
                } else {
                    action && action(null);
                }

            });
        }

        // this.env.login({
        //     force: true,
        //     success: (data) => {
        //         let codeInfo = Object.assign({}, { "code": data.code, "anonymousCode": data.anonymousCode });
        //         if (action) action(codeInfo);
        //     },

        //     fail: (data) => {
        //         console.error("login error ", data);
        //         if (action) action(null);
        //     }
        // });
    }
}
