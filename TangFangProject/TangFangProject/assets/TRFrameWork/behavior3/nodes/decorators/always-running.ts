import type { BTContext } from "../../context";
import { BTNode, BTNodeDef, BTStatus } from "../../node";
import { BTTree } from "../../tree";

export class AlwaysRunning extends BTNode {
    override onTick(tree: BTTree<BTContext, unknown>): BTStatus {
        this.children[0].tick(tree);
        return "running";
    }

    static override get descriptor(): BTNodeDef {
        return {
            name: "AlwaysRunning",
            type: "Decorator",
            children: 1,
            status: ["running"],
            desc: "始终返回运行中状态",
            doc: `
                + 只能有一个子节点，多个仅执行第一个
                + 始终返回 \`running\`
            `,
        };
    }
}
