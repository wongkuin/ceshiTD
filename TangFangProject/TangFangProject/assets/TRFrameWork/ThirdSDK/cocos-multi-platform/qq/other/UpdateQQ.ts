export default class UpdateQQ implements UpdateInterface {

    private env: QQAPI = window["qq"];
    private updateManager: UpdateManagerQQ = null;
    checkForUpdate(): void {
        if (!this.updateManager) this.updateManager = this.env.getUpdateManager();

        this.updateManager.onUpdateReady(() => {
            this.env.showModal({
                title: "更新提示",
                content: "新版本已经准备好，是否重启小程序？",
                success: (res) => {
                    if (res.confirm) {
                        this.updateManager.applyUpdate();
                    }
                },
            });
        });

        this.updateManager.onUpdateFailed((err) => {

            console.log("版本下载失败原因", err);

            this.env.showToast({
                title: "新版本下载失败，请稍后再试",
                icon: "none",
            });

        });

    }
}