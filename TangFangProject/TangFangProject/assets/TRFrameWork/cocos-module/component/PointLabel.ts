
const { ccclass, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class PointLabel extends cc.Component {

    onLoad() {
        this.node["_objFlags"] |= (cc.Object["Flags"].LockedInEditor | cc.Object["Flags"].HideInHierarchy);
    }
}
