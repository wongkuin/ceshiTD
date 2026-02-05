import type { BTContext } from "../../context";
import { BTNode, BTNodeDef, BTStatus } from "../../node";
import { BTTree } from "../../tree";

export class Now extends BTNode {
    override onTick(tree: BTTree<BTContext, unknown>): BTStatus {
        this.output.push(tree.context.time);
        return "success";
    }

    static override get descriptor(): BTNodeDef {
        return {
            name: "Now",
            type: "Action",
            children: 0,
            status: ["success"],
            desc: "获取当前时间",
            output: ["当前时间"],
        };
    }
}
