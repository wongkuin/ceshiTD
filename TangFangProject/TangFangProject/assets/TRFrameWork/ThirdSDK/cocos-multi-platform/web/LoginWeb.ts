import { UserKeyType } from "../../../../Script/Data/UserKeyType";
import { LoginInterface } from "../AdInterface";

export default class LoginWeb implements LoginInterface {


    private _isLogin = false;
    private _code: string = "";
    private _anonymousCode: string = "";

    public isLogin(): boolean {
        return this._isLogin;
    }

    login(action: (data: any) => void): void {

        let userInfo = Object.assign({}, { login_type: "guest"});

        //TODO:用户ID自定义生成
        this._isLogin = true;
        this._code = 'testCode';
        this._anonymousCode = 'testAnonymousCode';

        if (action) action(userInfo);
        this._isLogin = true;

    }

    loginReturnCode(action: (data: any) => void): void {
        let self = this;
        action && action({ "code": self._code, "anonymousCode": self._anonymousCode });

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


    getUserInfo(action: (userInfo: any) => void): void {
        console.log("getUserInfo");
    }
}
