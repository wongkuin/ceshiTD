import { LoginInterface } from "../../AdInterface";

export default class LoginSec implements LoginInterface {
    private _isLogin = true;

    public isLogin(): boolean {
        return this._isLogin;
    }

    login(action: (rData: any) => void): void {

    }

    getUserInfo(action: (rData: any) => void): void {
        
    }

    loginReturnCode(action: (data: any) => void): void {
        
    }
}
