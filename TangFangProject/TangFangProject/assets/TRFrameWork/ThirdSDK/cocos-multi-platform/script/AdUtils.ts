
export default class AdUtils {

    public static pauseAllAnims()
    {
        let anims = cc.director.getScene().getComponentsInChildren(cc.Animation);
		anims.forEach((anim)=>{
			anim.pause();
		});
    }

    public static resumeAllAnims()
    {
        let anims = cc.director.getScene().getComponentsInChildren(cc.Animation);
		anims.forEach((anim)=>{
			anim.resume();
		});
    }
}
