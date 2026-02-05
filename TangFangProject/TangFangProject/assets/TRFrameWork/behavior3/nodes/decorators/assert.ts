import type { BTContext } from "../../context";
import { BTNode, BTNodeDef, BTStatus } from "../../node";
import { BTTree } from "../../tree";

export class Assert extends BTNode {
    declare args: { readonly message: string };

    override onTick(tree: BTTree<BTContext, unknown>): BTStatus {
        const args = this.args;
        const isYield: boolean | undefined = tree.resume(this);
        const lastNodeStatus = tree.lastNodeStatus;
        if (typeof isYield === "boolean") {
            if (lastNodeStatus === "running") {
                this.error(`unexpected status error`);
            }

            if (lastNodeStatus === "success") {
                return "success";
            } else {
                this.error(args.message);
            }
        }

        const status = this.children[0].tick(tree);
        if (status === "success") {
            return "success";
        } else if (status === "running") {
            return tree.yield(this);
        } else {
            this.error(args.message);
        }

        return "success";
    }

    static override get descriptor(): BTNodeDef {
        return {
            name: "Assert",
            type: "Decorator",
            children: 1,
            status: ["success"],
            desc: "断言",
            args: [
                {
                    name: "message",
                    type: "string",
                    desc: "消息",
                },
            ],
            doc: `
                + 只能有一个子节点，多个仅执行第一个
                + 当子节点返回 \`failure\` 时，抛出异常
                + 其余情况返回子节点的执行状态
            `,
        };
    }
}
