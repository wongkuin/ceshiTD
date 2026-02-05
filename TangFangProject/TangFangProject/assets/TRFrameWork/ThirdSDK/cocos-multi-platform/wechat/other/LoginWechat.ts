import { LoginInterface } from "../../AdInterface";

var wx = window["wx"];
export default class LoginWechat implements LoginInterface {


    private _isLogin = false;
    private _code: string = "";
    private _anonymousCode: string = "";

    private env: any = window["wx"];
    public isLogin(): boolean {
        return this._isLogin;
    }

    login(action: (data: any) => void): void {

        // //TODO:用户ID自定义生成
        // this._isLogin = true;
        // this._code = 'testCode';
        // this._anonymousCode = 'testAnonymousCode';
        // if (action) action({});
        // this._isLogin = true;

        this.env.login({
            force: true,
            success: (data) => {
                this._isLogin = true;
                console.log("login success ", data);
                let codeInfo = Object.assign({}, { login_type: "wechat", "code": data.code, "anonymousCode": data.anonymousCode || "" });
                if (action) action(codeInfo);
            },

            fail: (data) => {
                console.error("login error ", data);
                if (action) action(null);
            }
        });
        console.log("login ", this.env);

        // this.initPrivacyHandler();

    }

    getUserInfo(action: (userInfo: any) => void): void {
        // this.env.getUserInfo
        // let userInfo = Object.assign({}, { "name": "testName", "avatar": "testAvatar" });
        // if (action) action(userInfo);

        // this.env.getUserInfo({
        //     withCredentials: true,
        //     success: (data) => {
        //         console.log("getUserInfo success ", data);
        //         // let userInfo = Object.assign({}, { "name": data.userInfo.nickName, "avatar": data.userInfo.avatarUrl });
        //         // if (action) action(userInfo);
        //     },

        //     fail: (data) => {
        //         console.error("getUserInfo error ", data);
        //         if (action) action(null);
        //     }
        // })

        let self = this;
        this.env.getSetting({
            success: function (res) {
                if (res.authSetting['scope.userInfo']) {
                    // 已授权
                } else {
                    // 未授权
                    self.env.authorize({
                        scope: 'scope.userInfo',
                        success: function () {
                            // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
                            // wx.startRecord()
                            console.log("userInfo success");
                        },
                        fail: function (err) {
                            console.error(err);
                        }
                    })
                }
            },
            fail: function (err) {
                console.error(err);
            }
        });
        // "authorize:fail please go to mp open official popup or use wx.onNeedPrivacyAuthorization to announce your privacy"
        this.initPrivacyHandler();
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


    isPrivacyAuthorized = false;
    // 初始化隐私授权处理
    initPrivacyHandler() {
        // 监听隐私授权需求
        wx.onNeedPrivacyAuthorization((resolve) => {
            console.log('需要用户同意隐私协议', resolve);
            // this.showPrivacyAgreement(resolve);
        });

        let self = this;
        // 检查隐私授权状态
        wx.getPrivacySetting({
            success: (res) => {
                console.log('隐私设置:', res);
                this.isPrivacyAuthorized = res.needAuthorization === false;

                if (!this.isPrivacyAuthorized) {
                    self.showPrivacyAgreement(null);
                }
            },
            fail: (err) => {
                console.error('获取隐私设置失败:', err);
            }
        });
    }

    // 显示隐私协议弹窗
    showPrivacyAgreement(resolveCallback) {
        wx.showModal({
            title: '用户隐私保护指引',
            content: '请阅读并同意《用户隐私保护指引》以继续使用游戏功能',
            confirmText: '同意',
            cancelText: '拒绝',
            success: (res) => {
                if (res.confirm) {
                    // 用户同意
                    wx.requirePrivacyAuthorize({
                        success: () => {
                            console.log('隐私授权成功');
                            this.isPrivacyAuthorized = true;
                            if (resolveCallback) resolveCallback();
                            this.onPrivacyAuthorized();
                        },
                        fail: (err) => {
                            console.error('隐私授权失败:', err);
                        }
                    });
                } else {
                    // 用户拒绝
                    console.log('用户拒绝隐私协议');
                    this.onPrivacyRejected();
                }
            }
        });
    }

    onPrivacyAuthorized() {
        console.log('隐私授权完成，可以正常获取用户信息');
        // 这里可以继续你的游戏逻辑
        this.getUserInfoSafely();
    }

    onPrivacyRejected() {
        wx.showToast({
            title: '需要同意隐私协议才能使用完整功能',
            icon: 'none'
        });
    }

    // 安全地获取用户信息（在隐私授权后）
    getUserInfoSafely() {
        if (!this.isPrivacyAuthorized) {
            console.warn('隐私未授权，无法获取用户信息');
            return;
        }

        this.env.getUserInfo({
            withCredentials: true,
            success: (data) => {
                console.log("getUserInfo success ", data);
                // let userInfo = Object.assign({}, { "name": data.userInfo.nickName, "avatar": data.userInfo.avatarUrl });
                // if (action) action(userInfo);
            },

            fail: (data) => {
                console.error("getUserInfo error ", data);
            }
        })

        // 使用子域方式获取用户信息
        // this.getUserInfoViaSubdomain();
    }

    // 通过子域获取用户信息
    getUserInfoViaSubdomain() {
        const openDataContext = wx.getOpenDataContext();

        // 监听子域返回的消息
        wx.onMessage((data) => {
            if (data.type === 'userInfoResponse') {
                console.log('从子域获取的用户信息:', data.userInfo);
                this.handleUserInfo(data.userInfo);
            }
        });

        // 发送消息到子域请求用户信息
        openDataContext.postMessage({
            type: 'getUserInfo'
        });
    }

    handleUserInfo(userInfo) {
        // 处理获取到的用户信息
        console.log('用户信息:', userInfo);

        // 更新游戏UI等
        this.updateUserDisplay(userInfo);
    }

    updateUserDisplay(userInfo) {
        // 更新用户信息显示
        if (userInfo.avatarUrl) {
            const avatar = wx.createImage();
            avatar.src = userInfo.avatarUrl;
            avatar.onload = () => {
                // 绘制头像
                console.log('头像加载完成');
            };
        }
    }
}
