import { UpdateInterface } from "../../../AdInterface";

export default class UpdateBD implements UpdateInterface {

    private static env = window["tt"];
    private updateManager: UpdateManagerDB = null;
    checkForUpdate(): void {
        if (!this.updateManager) this.updateManager = UpdateBD.env.getUpdateManager();

        this.updateManager.onUpdateReady(() => {
            UpdateBD.env.showModal({
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

            UpdateBD.env.showToast({
                title: "新版本下载失败，请稍后再试",
                icon: "none",
            });

        });

    }
}