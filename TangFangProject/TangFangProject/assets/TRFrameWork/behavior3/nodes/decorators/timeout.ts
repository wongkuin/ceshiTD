import type { BTContext } from "../../context";
import { BTNode, BTNodeDef, BTStatus } from "../../node";
import { BTStack } from "../../stack";
import { BTTree } from "../../tree";

interface NodeYield {
    stack: BTStack;
    expired: number;
}

export class Timeout extends BTNode {
    declare args: { readonly time?: number };

    override onTick(tree: BTTree<BTContext, unknown>): BTStatus {
        const { stack, context } = tree;
        const level = stack.length;
        let last: NodeYield | undefined = tree.resume(this);
        let status: BTStatus = "failure";
        if (last === undefined) {
            status = this.children[0].tick(tree);
        } else if (context.time >= last.expired) {
            last.stack.clear();
            return "failure";
        } else {
            last.stack.move(stack, 0, last.stack.length);
            while (stack.length > level) {
                const child = stack.top()!;
                status = child.tick(tree);
                if (status === "running") {
                    break;
                }
            }
        }

        if (status === "running") {
            if (last === undefined) {
                const time = this._checkOneof(0, this.args.time, 0);
                last = {
                    stack: new BTStack(tree),
                    expired: context.time + time,
                };
            }
            stack.move(last.stack, level, stack.length - level);
            return tree.yield(this, last);
        } else {
            return status;
        }
    }

    static override get descriptor(): BTNodeDef {
        return {
            name: "Timeout",
            type: "Decorator",
            children: 1,
            status: ["|success", "|running", "failure"],
            desc: "超时",
            input: ["超时时间?"],
            args: [
                {
                    name: "time",
                    type: "float?",
                    desc: "超时时间",
                    oneof: "超时时间",
                },
            ],
            doc: `
                + 只能有一个子节点，多个仅执行第一个
                + 当子节点执行超时或返回 \`failure\` 时，返回 \`failure\`
                + 其余情况返回子节点的执行状态
            `,
        };
    }
}
