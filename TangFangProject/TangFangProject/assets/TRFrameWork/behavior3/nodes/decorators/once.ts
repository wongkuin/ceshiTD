import { Blackboard } from "../../blackboard";
import type { BTContext } from "../../context";
import { BTNode, BTNodeData, BTNodeDef, BTStatus } from "../../node";
import { BTTree } from "../../tree";

export class Once extends BTNode {
    private _onceKey!: string;

    constructor(context: BTContext, cfg: BTNodeData) {
        super(context, cfg);

        this._onceKey = Blackboard.makePrivateVar(this, "ONCE");
    }

    override onTick(tree: BTTree<BTContext, unknown>): BTStatus {
        const onceKey = this._onceKey;
        if (tree.blackboard.get(onceKey) === true) {
            return "failure";
        }

        const isYield: boolean | undefined = tree.resume(this);
        if (typeof isYield === "boolean") {
            if (tree.lastNodeStatus === "running") {
                this.error(`unexpected status error`);
            }
            tree.blackboard.set(onceKey, true);
            return "success";
        }

        const status = this.children[0].tick(tree);
        if (status === "running") {
            return tree.yield(this);
        }
        tree.blackboard.set(onceKey, true);
        return "success";
    }

    static override get descriptor(): BTNodeDef {
        return {
            name: "Once",
            type: "Decorator",
            children: 1,
            status: ["success", "failure", "|running"],
            desc: "只执行一次",
            doc: `
                + 只能有一个子节点，多个仅执行第一个
                + 第一次执行完全部子节点时返回 \`success\`，之后永远返回 \`failure\``,
        };
    }
}
