import type { BTContext } from "../../context";
import { BTNode, BTNodeDef, BTStatus } from "../../node";
import { BTTree } from "../../tree";

// 只返回成功，用来满足一些特殊节点的结构要求
export class JustSuccess extends BTNode {
    override onTick(tree: BTTree<BTContext, unknown>): BTStatus {
        return "success";
    }

    static override get descriptor(): BTNodeDef {
        return {
            name: "JustSuccess",
            type: "Action",
            children: 0,
            status: ["success"],
            desc: "什么都不干，只返回成功",
        };
    }
}
