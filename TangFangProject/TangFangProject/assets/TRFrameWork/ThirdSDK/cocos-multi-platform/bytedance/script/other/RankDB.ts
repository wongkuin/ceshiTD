import { RankInterface } from "../../../AdInterface";

/**消息类型 */
enum MessageType {
    LoginSuccess,
    Commit,
}

export default class RankDB implements RankInterface {




    private env: BDAPI = window["tt"];
    private _isLogin = false;

    init(): void {
        if (this._isLogin) return;

        this.env.login({
            force: true,
            success: (res) => {

                this.env.getUserInfo({
                    withCredentials: false,
                    success: (res) => {
                        let userInfo = Object.assign({}, res.userInfo);
                        this.env.getOpenDataContext().postMessage({
                            event: "login",
                            params: userInfo
                        });

                        this._isLogin = true;
                    },

                    fail: (res) => {
                        console.error("login error ", res);
                    }
                });

            },
            fail: (res) => {
                console.error(res);
            }
        });


    }

    commit(id: string, score: number, params: object = {}, groupId: string = "userGroup"): void {
        if (!this._isLogin) return;

        this.env.setUserGroup({ groupId: groupId });
        this.env.getOpenDataContext().postMessage({
            score: score,
            id: id,
            event: "commit",
            params: params
        });

    }

    emit(event: string, params?: object): void {
        this.env.getOpenDataContext().postMessage({
            event: event,
            params: params
        });
    }

}
