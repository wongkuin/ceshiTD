import { FollowInterface } from "../../../AdInterface";

export default class FollowBD implements FollowInterface {
    private env: BDAPI = window["tt"];

    canUseFollow(): boolean {
        const data = this.env.getSystemInfoSync(true);
        const appName = data.appName.toLowerCase();
        return appName == "douyin_lite" || appName == "douyin";
    }


    follow(complete: (followed: boolean) => void) {
        this.env?.openAwemeUserProfile({
            success: (res) => {
                if (complete) complete(true);
            },
            fail: (res) => {
                console.error("follow ", res);
                if (complete) complete(false);
            }
        });
    }

}
