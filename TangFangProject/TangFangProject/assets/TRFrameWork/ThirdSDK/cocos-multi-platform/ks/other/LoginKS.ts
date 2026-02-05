import { LoginInterface } from "../../AdInterface";

export default class LoginKS implements LoginInterface {

    private env: KSAPI = window["ks"];

    private _isLogin = false;
    public isLogin(): boolean {
        return this._isLogin;
    }

    login(action: (data: any) => void): void {

        this.env?.login({
            force: true,
            success: (data) => {
                this.env.getUserInfo({
                    withCredentials: false,
                    success: (res) => {
                        let userInfo = Object.assign({}, res.userInfo);
                        //TODO:用户ID自定义生成
                        userInfo.id = Date.now();
                        this._isLogin = true;
                        if (action) action(userInfo);
                    },

                    fail: (res) => {
                        console.error("login error ", res);
                        if (action) action(null);
                    }
                });


            },

            fail: (data) => {
                console.error("login error ", data);
                if (action) action(null);
            }

        });

    }

    loginReturnCode(action: (data: any) => void): void {
        this.env?.login({
            force: true,
            success: (data) => {
                let codeInfo = Object.assign({}, { "code": data.code, "anonymousCode": data.anonymousCode });
                if (action) action(codeInfo);
            },

            fail: (data) => {
                console.error("login error ", data);
                if (action) action(null);
            }
        });
    }

    getUserInfo(action: (userInfo: any) => void): void {
    }
}
