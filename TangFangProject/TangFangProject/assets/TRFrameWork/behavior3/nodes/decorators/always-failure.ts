import type { BTContext } from "../../context";
import { BTNode, BTNodeDef, BTStatus } from "../../node";
import { BTTree } from "../../tree";

export class AlwaysFailure extends BTNode {
    override onTick(tree: BTTree<BTContext, unknown>): BTStatus {
        const isYield: boolean | undefined = tree.resume(this);
        const lastNodeStatus = tree.lastNodeStatus;
        if (typeof isYield === "boolean") {
            if (lastNodeStatus === "running") {
                this.error(`unexpected status error`);
            }
            return "failure";
        }
        const status = this.children[0].tick(tree);
        if (status === "running") {
            return tree.yield(this);
        }
        return "failure";
    }

    // static override get descriptor(): DeepReadonly<BTNodeDef> {
    //     return {
    //         name: "AlwaysFailure",
    //         type: "Decorator",
    //         children: 1,
    //         status: ["failure", "|running"],
    //         desc: "始终返回失败",
    //         doc: `
    //             + 只能有一个子节点，多个仅执行第一个
    //             + 当子节点返回 \`running\` 时，返回 \`running\`
    //             + 其它情况，不管子节点是否成功都返回 \`failure\`
    //         `,
    //     };
    // }

     static override get descriptor(): BTNodeDef {
        return {
            name: "AlwaysFailure",
            type: "Decorator",
            children: 1,
            status: ["failure", "|running"],
            desc: "始终返回失败",
            doc: `
                + 只能有一个子节点，多个仅执行第一个
                + 当子节点返回 \`running\` 时，返回 \`running\`
                + 其它情况，不管子节点是否成功都返回 \`failure\`
            `,
        };
    }
}
