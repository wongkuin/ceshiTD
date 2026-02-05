import type { BTContext } from "../../context";
import { BTNode, BTNodeDef, BTStatus } from "../../node";
import { BTStack } from "../../stack";
import { BTTree } from "../../tree";

const EMPTY_STACK: BTStack = new BTStack(null!);

export class Parallel extends BTNode {
    override onTick(tree: BTTree<BTContext, unknown>): BTStatus {
        const last: BTStack[] = tree.resume(this) ?? [];
        const stack = tree.stack;
        const level = stack.length;
        const children = this.children;
        let count = 0;

        for (let i = 0; i < children.length; i++) {
            let childStack = last[i];
            let status: BTStatus | undefined;
            if (childStack === undefined) {
                status = children[i].tick(tree);
            } else if (childStack.length > 0) {
                childStack.move(stack, 0, childStack.length);
                while (stack.length > level) {
                    status = stack.top()!.tick(tree);
                    if (status === "running") {
                        break;
                    }
                }
            } else {
                status = "success";
            }

            if (status === "running") {
                if (childStack === undefined) {
                    childStack = new BTStack(tree);
                }
                stack.move(childStack, level, stack.length - level);
            } else {
                count++;
                childStack = EMPTY_STACK;
            }

            last[i] = childStack;
        }

        if (count === children.length) {
            return "success";
        } else {
            return tree.yield(this, last);
        }
    }

    static override get descriptor(): BTNodeDef {
        return {
            name: "Parallel",
            type: "Composite",
            status: ["success", "|running"],
            children: -1,
            desc: "并行执行",
            doc: `
                + 并行执行所有子节点
                + 当有子节点返回 \`running\` 时，返回 \`running\` 状态
                + 执行完所有子节点后，返回 \`success\``,
        };
    }
}
